import {Form, Link, redirect, useLoaderData, useLocation} from 'react-router';
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

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      ...paginationVariables,
      filters: selectedFilters,
      sortKey: selectedSort.sortKey,
      reverse: selectedSort.reverse,
    },
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    selectedFilterValues,
    selectedSortValue: selectedSort.value,
  };
}

export default function CollectionRoute() {
  /** @type {LoaderReturnData} */
  const {collection, selectedFilterValues, selectedSortValue} = useLoaderData();
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

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
