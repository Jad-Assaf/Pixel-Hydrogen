import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useLocation,
} from 'react-router';
import {Analytics, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
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
  const paginationVariables = getPaginationVariables(request, {pageBy: 16});

  if (!handle) {
    throw redirect('/collections');
  }

  const [collectionResult, menuResultPrimary] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        ...paginationVariables,
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

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    menuCollectionCards,
    selectedFilterValues,
    selectedSortValue: selectedSort.value,
  };
}

export default function CollectionRoute() {
  /** @type {LoaderReturnData} */
  const {collection, menuCollectionCards, selectedFilterValues, selectedSortValue} =
    useLoaderData();
  const location = useLocation();
  const visibleFilters = (collection.products?.filters || []).filter(
    (filter) => !/availability/i.test(filter.label || filter.id || ''),
  );

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
        <PaginatedResourceSection
          connection={collection.products}
          resourcesClassName="pz-shop-grid"
        >
          {({node: product, index}) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 6 ? 'eager' : 'lazy'}
              showAddToCart
            />
          )}
        </PaginatedResourceSection>
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
  params.delete('cursor');
  params.delete('direction');

  return `${location.pathname}?${params.toString()}`;
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
