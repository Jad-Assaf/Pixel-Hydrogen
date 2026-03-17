import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router';
import {useEffect, useMemo, useState} from 'react';
import {Analytics} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {ArrowIcon} from '~/components/Icons';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Pixel Zones | ${data?.collection?.title ?? 'Collection'}`}];
};

const SORT_OPTIONS = [
  {value: 'new-to-old', label: 'New to Old', sortKey: 'CREATED', reverse: true},
  {value: 'old-to-new', label: 'Old to New', sortKey: 'CREATED', reverse: false},
  {value: 'price-asc', label: 'Price: Low to High', sortKey: 'PRICE', reverse: false},
  {value: 'price-desc', label: 'Price: High to Low', sortKey: 'PRICE', reverse: true},
];
const PRODUCTS_PER_PAGE = 30;
const INITIAL_PREFETCH_PAGES = 4;
const PREFETCH_PRODUCT_COUNT = PRODUCTS_PER_PAGE * INITIAL_PREFETCH_PAGES;
const MAX_CONNECTION_FETCH = 250;
const EMPTY_PRODUCTS = [];

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const parsedFilterEntries = url.searchParams
    .getAll('filter')
    .map(normalizeFilterParam)
    .filter(Boolean);
  const selectedFilterValues = parsedFilterEntries.map(
    ({serialized}) => serialized,
  );
  const selectedFilters = parsedFilterEntries.map(({input}) => input);

  const sortParam = url.searchParams.get('sort') || 'new-to-old';
  const selectedSort =
    SORT_OPTIONS.find((option) => option.value === sortParam) || SORT_OPTIONS[0];
  const requestedPage = getRequestedPage(url.searchParams.get('page'));
  const requestedProductCount = Math.max(
    PREFETCH_PRODUCT_COUNT,
    requestedPage * PRODUCTS_PER_PAGE,
  );
  const initialBatchSize = Math.min(MAX_CONNECTION_FETCH, requestedProductCount);

  if (!handle) {
    throw redirect('/collections');
  }

  const [collectionResult, menuResultPrimary] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        first: initialBatchSize,
        filters: selectedFilters,
        sortKey: selectedSort.sortKey,
        reverse: selectedSort.reverse,
      },
    }),
    storefront
      .query(COLLECTION_MENU_QUERY, {
        cache: storefront.CacheLong(),
        variables: {menuHandle: handle},
      })
      .catch(() => ({menu: null})),
  ]);

  const {collection} = collectionResult;

  let menuResult = menuResultPrimary;
  if (!menuResult?.menu && !handle.startsWith('/')) {
    menuResult = await storefront
      .query(COLLECTION_MENU_QUERY, {
        cache: storefront.CacheLong(),
        variables: {menuHandle: `/${handle}`},
      })
      .catch(() => ({menu: null}));
  }

  const menuCollectionItems = getMenuCollectionItems(menuResult?.menu?.items || []);
  let menuCollectionCards = [];

  if (menuCollectionItems.length) {
    const ids = menuCollectionItems
      .map((item) => item.resourceId)
      .filter(Boolean);
    const handles = menuCollectionItems
      .map((item) => item.handle)
      .filter(Boolean)
      .map((value) => value.toLowerCase());

    let collectionsById = [];
    let collectionsByHandle = [];

    if (ids.length) {
      const {nodes} = await storefront.query(MENU_COLLECTIONS_QUERY, {
        cache: storefront.CacheLong(),
        variables: {ids},
      });
      collectionsById = nodes || [];
    }

    if (handles.length) {
      const handleResults = await Promise.all(
        handles.map((menuHandle) =>
          storefront
            .query(MENU_COLLECTION_BY_HANDLE_QUERY, {
              cache: storefront.CacheLong(),
              variables: {handle: menuHandle},
            })
            .catch(() => null),
        ),
      );

      collectionsByHandle = handleResults
        .map((result) => result?.collection)
        .filter(Boolean);
    }

    menuCollectionCards = buildMenuCollectionCards(menuCollectionItems, [
      ...collectionsById,
      ...collectionsByHandle,
    ]);
  }

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  const fetchedProducts = [...(collection.products?.nodes || [])];
  let hasMorePages = Boolean(collection.products?.pageInfo?.hasNextPage);
  let endCursor = collection.products?.pageInfo?.endCursor || null;

  while (hasMorePages && fetchedProducts.length < requestedProductCount) {
    const remaining = requestedProductCount - fetchedProducts.length;
    const nextBatchSize = Math.min(
      MAX_CONNECTION_FETCH,
      Math.max(PRODUCTS_PER_PAGE, remaining),
    );

    const {collection: nextCollectionPage} = await storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        first: nextBatchSize,
        endCursor,
        filters: selectedFilters,
        sortKey: selectedSort.sortKey,
        reverse: selectedSort.reverse,
      },
    });

    const nextNodes = nextCollectionPage?.products?.nodes || [];
    if (!nextNodes.length) {
      hasMorePages = false;
      break;
    }

    fetchedProducts.push(...nextNodes);

    const nextPageInfo = nextCollectionPage?.products?.pageInfo;
    hasMorePages = Boolean(nextPageInfo?.hasNextPage);
    endCursor = nextPageInfo?.endCursor || endCursor;
  }

  const loadedPageCount = Math.max(
    1,
    Math.ceil(fetchedProducts.length / PRODUCTS_PER_PAGE),
  );
  const totalPages = hasMorePages ? loadedPageCount + 1 : loadedPageCount;
  const currentPage = Math.min(requestedPage, totalPages);
  const hasNextPage = currentPage < totalPages;
  const paginatedCollection = {
    ...collection,
    products: {
      ...collection.products,
      nodes: fetchedProducts,
    },
  };

  if (currentPage !== requestedPage) {
    const params = new URLSearchParams(url.searchParams);
    if (currentPage > 1) {
      params.set('page', String(currentPage));
    } else {
      params.delete('page');
    }

    throw redirect(buildPathWithParams(url.pathname, params));
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection: paginatedCollection,
    menuCollectionCards,
    pagination: {
      currentPage,
      totalPages,
      hasNextPage,
      hasPreviousPage: currentPage > 1,
      hasMorePages,
    },
    selectedFilterValues,
    selectedSortValue: selectedSort.value,
  };
}

export default function CollectionRoute() {
  /** @type {LoaderReturnData} */
  const {
    collection,
    menuCollectionCards,
    pagination,
    selectedFilterValues,
    selectedSortValue,
  } = useLoaderData();
  const location = useLocation();
  const navigate = useNavigate();
  const products = collection.products?.nodes || EMPTY_PRODUCTS;
  const [currentPage, setCurrentPage] = useState(pagination.currentPage);
  const paginationStateKey = `${collection.id}:${selectedSortValue}:${selectedFilterValues.join('|')}`;
  const loadedPageCount = Math.max(
    1,
    Math.ceil(products.length / PRODUCTS_PER_PAGE),
  );
  const maxReachablePage = pagination.hasMorePages
    ? loadedPageCount + 1
    : loadedPageCount;
  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return products.slice(start, start + PRODUCTS_PER_PAGE);
  }, [products, currentPage]);
  const visibleFilters = (collection.products?.filters || []).filter(
    (filter) => !/availability/i.test(filter.label || filter.id || ''),
  );

  useEffect(() => {
    setCurrentPage(pagination.currentPage);
  }, [pagination.currentPage, paginationStateKey]);

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < maxReachablePage;

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), maxReachablePage);
    if (nextPage === currentPage) return;

    const params = new URLSearchParams(location.search);
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    } else {
      params.delete('page');
    }
    params.delete('cursor');
    params.delete('direction');
    const target = buildPathWithParams(location.pathname, params);

    if (nextPage > loadedPageCount && pagination.hasMorePages) {
      if (typeof window !== 'undefined') {
        window.scrollTo({top: 0, behavior: 'auto'});
      }
      navigate(target);
      return;
    }

    setCurrentPage(nextPage);

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', target);
      window.scrollTo({top: 0, behavior: 'auto'});
    }
  };

  return (
    <div className="pz-shop-page">
      <nav className="pz-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/" prefetch="intent">
          Home
        </Link>
        <span>/</span>
        <Link to="/collections" prefetch="intent">
          Collections
        </Link>
        <span>/</span>
        <span>{collection.title}</span>
      </nav>

      <div className="pz-shop-head">
        <div>
          <h1>{collection.title}</h1>
          {collection.description ? (
            <p className="collection-description">{collection.description}</p>
          ) : null}
        </div>
      </div>

      {menuCollectionCards.length ? (
        <section className="pz-collection-menu-strip" aria-label="Browse collections">
          <div className="pz-collection-menu-carousel">
            {menuCollectionCards.map((menuCollection) => (
              <Link
                key={menuCollection.id}
                to={`/collections/${menuCollection.handle}`}
                prefetch="intent"
                className={`pz-collection-card pz-collection-menu-card${
                  menuCollection.handle.toLowerCase() === collection.handle.toLowerCase()
                    ? ' is-active'
                    : ''
                }`}
              >
                <div className="pz-collection-card-image">
                  {menuCollection.image?.url ? (
                    <img
                      src={withImageWidth(menuCollection.image.url, 600)}
                      alt={menuCollection.image.altText || menuCollection.title}
                      loading="lazy"
                      width={menuCollection.image.width || 600}
                      height={menuCollection.image.height || 600}
                    />
                  ) : (
                    <div className="pz-image-placeholder" aria-hidden="true" />
                  )}
                </div>
                <div className="pz-collection-card-copy">
                  <p>{menuCollection.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section
        className="pz-collection-controls"
        aria-label="Collection filters and sorting"
      >
        <Form method="get" className="pz-collection-sort-form pz-collection-sort-form--inline">
          {selectedFilterValues.map((value) => (
            <input key={value} type="hidden" name="filter" value={value} />
          ))}
          <label htmlFor="pz-collection-sort">Sort</label>
          <select
            id="pz-collection-sort"
            name="sort"
            defaultValue={selectedSortValue}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Form>

        {visibleFilters.map((filter) => (
          <section key={filter.id} className="pz-inline-filter">
            <h3>{filter.label}</h3>
            <div className="pz-filter-group">
              {(filter.values || []).slice(0, 24).map((value) => {
                const valueInput = serializeFilterInput(value.input);
                const isActive = selectedFilterValues.includes(valueInput);
                const target = buildFilterUrl({
                  location,
                  sort: selectedSortValue,
                  selectedFilterValues,
                  valueInput,
                  isActive,
                });

                return (
                  <Link
                    key={value.id}
                    to={target}
                    prefetch="intent"
                    className={`pz-filter-value${isActive ? ' is-active' : ''}`}
                  >
                    <span>{value.label}</span>
                    <small>{value.count}</small>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {selectedFilterValues.length ? (
          <Link
            to={`${location.pathname}?sort=${selectedSortValue}`}
            className="pz-reset-filters pz-reset-filters--inline"
            prefetch="intent"
          >
            Clear Filters
          </Link>
        ) : null}
      </section>

      <section className="pz-shop-products">
        <div className="pz-shop-grid">
          {visibleProducts.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 6 && currentPage === 1 ? 'eager' : 'lazy'}
              showAddToCart
            />
          ))}
        </div>

        {pagination.totalPages > 1 ? (
          <nav className="pagination pz-page-pagination" aria-label="Products pagination">
            {hasPreviousPage ? (
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                className="pagination-link pz-pagination-direction"
              >
                <ArrowIcon direction="left" />
                <span className="sr-only">Previous</span>
              </button>
            ) : (
              <span className="pagination-link is-disabled pz-pagination-direction">
                <ArrowIcon direction="left" />
                <span className="sr-only">Previous</span>
              </span>
            )}

            <div className="pagination-pages">
              {Array.from({length: maxReachablePage}, (_, index) => {
                const page = index + 1;
                const isActive = page === currentPage;

                return (
                  <button
                    type="button"
                    key={page}
                    className={`pagination-link${isActive ? ' is-active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {hasNextPage ? (
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                className="pagination-link pz-pagination-direction"
              >
                <ArrowIcon direction="right" />
                <span className="sr-only">Next</span>
              </button>
            ) : (
              <span className="pagination-link is-disabled pz-pagination-direction">
                <ArrowIcon direction="right" />
                <span className="sr-only">Next</span>
              </span>
            )}
          </nav>
        ) : null}
      </section>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

function buildFilterUrl({
  location,
  sort,
  selectedFilterValues,
  valueInput,
  isActive,
}) {
  const params = new URLSearchParams(location.search);
  const nextValues = isActive
    ? selectedFilterValues.filter((value) => value !== valueInput)
    : [...selectedFilterValues, valueInput];

  params.delete('filter');
  nextValues.forEach((value) => {
    params.append('filter', value);
  });
  params.set('sort', sort);
  params.delete('page');
  params.delete('cursor');
  params.delete('direction');

  return buildPathWithParams(location.pathname, params);
}

function getRequestedPage(value) {
  const parsed = Number(value || 1);
  if (!Number.isInteger(parsed)) return 1;
  if (parsed < 1) return 1;
  return parsed;
}

function buildPathWithParams(pathname, params) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function parseJsonMaybe(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeFilterParam(rawValue) {
  const firstPass = parseJsonMaybe(rawValue);
  const candidate =
    typeof firstPass === 'string' ? parseJsonMaybe(firstPass) : firstPass;

  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return null;
  }

  return {
    input: candidate,
    serialized: JSON.stringify(candidate),
  };
}

function serializeFilterInput(input) {
  if (typeof input === 'string') {
    const normalized = normalizeFilterParam(input);
    return normalized ? normalized.serialized : input;
  }

  return JSON.stringify(input);
}

function getMenuCollectionItems(items) {
  const results = [];

  const visit = (item) => {
    if (!item) return;

    const handle = getCollectionHandleFromMenuUrl(item.url);
    if (handle) {
      results.push({
        id: item.id,
        title: item.title,
        resourceId: item.resourceId || null,
        handle: handle.toLowerCase(),
      });
    }

    if (item.items?.length) {
      item.items.forEach(visit);
    }
  };

  (items || []).forEach(visit);

  return dedupeMenuCollectionItems(results);
}

function dedupeMenuCollectionItems(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = item.resourceId || `handle:${item.handle}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildMenuCollectionCards(menuItems, nodes) {
  const collectionNodes = (nodes || []).filter(
    (node) => node?.__typename === 'Collection' || node?.handle,
  );
  const collectionById = new Map(
    collectionNodes
      .filter((node) => node?.id)
      .map((collection) => [collection.id, collection]),
  );
  const collectionByHandle = new Map(
    collectionNodes
      .filter((collection) => collection?.handle)
      .map((collection) => [collection.handle.toLowerCase(), collection]),
  );

  return menuItems
    .map((item) => {
      const collection =
        (item.resourceId ? collectionById.get(item.resourceId) : null) ||
        collectionByHandle.get(item.handle.toLowerCase());

      if (!collection?.handle) return null;
      if (!collectionHasProducts(collection)) return null;

      return {
        id: collection.id || item.id || collection.handle,
        title: collection.title || item.title,
        handle: collection.handle,
        image: pickCollectionImage(collection),
      };
    })
    .filter(Boolean);
}

function collectionHasProducts(collection) {
  return Boolean(
    collection?.products?.nodes?.length || collection?.latestProduct?.nodes?.length,
  );
}

function pickCollectionImage(collection) {
  const candidates = [
    collection?.image,
    collection?.latestProduct?.nodes?.[0]?.featuredImage,
    collection?.products?.nodes?.[0]?.featuredImage,
  ];

  return candidates.find((image) => image?.url) || null;
}

function getCollectionHandleFromMenuUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url, 'https://example.com');
    const match = parsed.pathname.match(/\/collections\/([^/]+)/i);
    if (!match?.[1]) return null;
    const handle = decodeURIComponent(match[1]);
    if (!handle || handle.toLowerCase() === 'all') return null;
    return handle;
  } catch {
    return null;
  }
}

function withImageWidth(url, width) {
  if (!url || !width) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}

const COLLECTION_QUERY = `#graphql
  fragment MoneyCollectionProduct on MoneyV2 {
    amount
    currencyCode
  }

  fragment CollectionProduct on Product {
    id
    handle
    title
    vendor
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionProduct
      }
      maxVariantPrice {
        ...MoneyCollectionProduct
      }
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      image {
        id
        altText
        url
        width
        height
      }
      selectedOptions {
        name
        value
      }
      price {
        ...MoneyCollectionProduct
      }
      compareAtPrice {
        ...MoneyCollectionProduct
      }
    }
    variants(first: 12) {
      nodes {
        id
        title
        availableForSale
        image {
          id
          altText
          url
          width
          height
        }
        selectedOptions {
          name
          value
        }
        price {
          ...MoneyCollectionProduct
        }
      }
    }
  }

  query Collection(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        nodes {
          ...CollectionProduct
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

const COLLECTION_MENU_QUERY = `#graphql
  fragment CollectionMenuItemFields on MenuItem {
    id
    resourceId
    title
    type
    url
  }

  fragment CollectionMenuItemLevel4 on MenuItem {
    ...CollectionMenuItemFields
  }

  fragment CollectionMenuItemLevel3 on MenuItem {
    ...CollectionMenuItemFields
    items {
      ...CollectionMenuItemLevel4
    }
  }

  fragment CollectionMenuItemLevel2 on MenuItem {
    ...CollectionMenuItemFields
    items {
      ...CollectionMenuItemLevel3
    }
  }

  fragment CollectionMenuItemLevel1 on MenuItem {
    ...CollectionMenuItemFields
    items {
      ...CollectionMenuItemLevel2
    }
  }

  query CollectionMenu(
    $country: CountryCode
    $language: LanguageCode
    $menuHandle: String!
  ) @inContext(country: $country, language: $language) {
    menu(handle: $menuHandle) {
      id
      items {
        ...CollectionMenuItemLevel1
      }
    }
  }
`;

const MENU_COLLECTIONS_QUERY = `#graphql
  query CollectionMenuCollections(
    $country: CountryCode
    $language: LanguageCode
    $ids: [ID!]!
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      __typename
      ...CollectionMenuCollectionNode
    }
  }

  fragment CollectionMenuCollectionNode on Collection {
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    latestProduct: products(first: 1, sortKey: CREATED, reverse: true) {
      nodes {
        featuredImage {
          url
          altText
          width
          height
        }
      }
    }
    products(first: 1) {
      nodes {
        featuredImage {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

const MENU_COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionMenuCollectionByHandle(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      __typename
      id
      title
      handle
      image {
        url
        altText
        width
        height
      }
      latestProduct: products(first: 1, sortKey: CREATED, reverse: true) {
        nodes {
          featuredImage {
            url
            altText
            width
            height
          }
        }
      }
      products(first: 1) {
        nodes {
          featuredImage {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
