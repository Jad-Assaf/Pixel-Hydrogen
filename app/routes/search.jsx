import {Link, redirect, useLoaderData} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {SearchForm} from '~/components/SearchForm';
import {SearchResults} from '~/components/SearchResults';
import {getEmptyPredictiveSearchResult} from '~/lib/search';
import {getCorrectedSearchTerm, normalizeSearchTerm} from '~/lib/searchDictionary';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Pixel Zones | Search'}];
};

const PRODUCTS_PER_PAGE = 30;
const INITIAL_PREFETCH_PAGES = 4;
const PREFETCH_PRODUCT_COUNT = PRODUCTS_PER_PAGE * INITIAL_PREFETCH_PAGES;
const MAX_CONNECTION_FETCH = 250;
const MIN_STRONG_SEARCH_PRODUCTS = 3;

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');
  const searchPromise = isPredictive
    ? predictiveSearch({request, context})
    : regularSearch({request, context});

  searchPromise.catch((error) => {
    console.error(error);
    return {term: '', result: null, error: error.message};
  });

  return await searchPromise;
}

/**
 * Renders the /search route
 */
export default function SearchPage() {
  /** @type {LoaderReturnData} */
  const {type, term, searchTerm, result, error, searchCorrection} =
    useLoaderData();
  const resultTerm = searchTerm || term;
  if (type === 'predictive') return null;

  return (
    <div className="pz-search-page">
      <nav className="pz-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/" prefetch="intent">
          Home
        </Link>
        <span>/</span>
        <span>Search</span>
      </nav>

      <div className="pz-search-head">
        <h1>Search</h1>
        <p>Find products and articles across Pixel Zones.</p>
      </div>

      <SearchForm className="pz-search-form">
        {({inputRef}) => (
          <>
            <input
              defaultValue={term}
              name="q"
              placeholder="Search products, brands, and more..."
              ref={inputRef}
              type="search"
            />
            <button type="submit">Search</button>
          </>
        )}
      </SearchForm>

      {error ? <p className="pz-search-error">{error}</p> : null}
      {searchCorrection?.correctedTerm ? (
        <p className="pz-search-correction">
          Showing results for <strong>{searchCorrection.correctedTerm}</strong>
          <span> instead of {searchCorrection.originalTerm}</span>
        </p>
      ) : null}

      {!term || !result?.total ? (
        <SearchResults.Empty />
      ) : (
        <SearchResults result={result} term={resultTerm}>
          {({articles, products, term}) => (
            <div>
              <SearchResults.Products products={products} term={term} />
              <SearchResults.Articles articles={articles} term={term} />
            </div>
          )}
        </SearchResults>
      )}
      <Analytics.SearchView data={{searchTerm: resultTerm, searchResults: result}} />
    </div>
  );
}

/**
 * Regular search query and fragments
 * (adjust as needed)
 */
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
    variants(first: 12) {
      nodes {
        id
        title
        availableForSale
        image {
          url
          altText
          width
          height
        }
        selectedOptions {
          name
          value
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
  }
`;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $language: LanguageCode
    $productsFirst: Int!
    $productsAfter: String
    $term: String!
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: 12,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    products: search(
      first: $productsFirst,
      after: $productsAfter,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: SHOW,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
`;

export const SEARCH_PRODUCTS_PAGE_QUERY = `#graphql
  query SearchProductsPage(
    $country: CountryCode
    $language: LanguageCode
    $productsFirst: Int!
    $productsAfter: String
    $term: String!
  ) @inContext(country: $country, language: $language) {
    products: search(
      first: $productsFirst,
      after: $productsAfter,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: SHOW,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
`;

/**
 * Regular search fetcher
 * @param {Pick<
 *   Route.LoaderArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<RegularSearchReturn>}
 */
async function regularSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '');
  const requestedPage = getRequestedPage(url.searchParams.get('page'));
  const normalizedTerm = normalizeSearchTerm(term);
  const primarySearch = await runRegularSearch({
    storefront,
    term,
    requestedPage,
    url,
  });

  if (!normalizedTerm || hasStrongProductResults(primarySearch.items)) {
    return buildRegularSearchReturn({
      term,
      searchTerm: term,
      searchResult: primarySearch,
      searchCorrection: null,
    });
  }

  const correctedTerm = await getCorrectedSearchTerm({
    storefront,
    term: normalizedTerm,
  });

  if (!correctedTerm || correctedTerm === normalizedTerm) {
    return buildRegularSearchReturn({
      term,
      searchTerm: term,
      searchResult: primarySearch,
      searchCorrection: null,
    });
  }

  const correctedSearch = await runRegularSearch({
    storefront,
    term: correctedTerm,
    requestedPage,
    url,
  });

  if (!hasBetterSearchResults(correctedSearch.items, primarySearch.items)) {
    return buildRegularSearchReturn({
      term,
      searchTerm: term,
      searchResult: primarySearch,
      searchCorrection: null,
    });
  }

  return buildRegularSearchReturn({
    term,
    searchTerm: correctedTerm,
    searchResult: correctedSearch,
    searchCorrection: {
      originalTerm: term,
      correctedTerm,
    },
  });
}

/**
 * @param {{
 *   storefront: Route.LoaderArgs['context']['storefront'];
 *   term: string;
 *   requestedPage: number;
 *   url: URL;
 * }}
 */
async function runRegularSearch({storefront, term, requestedPage, url}) {
  const requestedProductCount = Math.max(
    PREFETCH_PRODUCT_COUNT,
    requestedPage * PRODUCTS_PER_PAGE,
  );
  const initialBatchSize = Math.min(
    MAX_CONNECTION_FETCH,
    requestedProductCount,
  );

  // Search articles and products for the `q` term
  const {errors, ...items} = await storefront.query(SEARCH_QUERY, {
    variables: {term, productsFirst: initialBatchSize, productsAfter: null},
  });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  const fetchedProducts = [...(items.products?.nodes || [])];
  let hasMorePages = Boolean(items.products?.pageInfo?.hasNextPage);
  let productsCursor = items.products?.pageInfo?.endCursor || null;

  while (hasMorePages && fetchedProducts.length < requestedProductCount) {
    const remaining = requestedProductCount - fetchedProducts.length;
    const nextBatchSize = Math.min(
      MAX_CONNECTION_FETCH,
      Math.max(PRODUCTS_PER_PAGE, remaining),
    );

    const {products: nextProductsPage} = await storefront.query(
      SEARCH_PRODUCTS_PAGE_QUERY,
      {
        variables: {
          term,
          productsFirst: nextBatchSize,
          productsAfter: productsCursor,
        },
      },
    );

    const nextNodes = nextProductsPage?.nodes || [];
    if (!nextNodes.length) {
      hasMorePages = false;
      break;
    }

    fetchedProducts.push(...nextNodes);

    const nextPageInfo = nextProductsPage?.pageInfo;
    hasMorePages = Boolean(nextPageInfo?.hasNextPage);
    productsCursor = nextPageInfo?.endCursor || productsCursor;
  }

  const loadedPageCount = Math.max(
    1,
    Math.ceil(fetchedProducts.length / PRODUCTS_PER_PAGE),
  );
  const totalPages = hasMorePages ? loadedPageCount + 1 : loadedPageCount;
  const currentPage = Math.min(requestedPage, totalPages);
  const hasNextPage = currentPage < totalPages;

  if (currentPage !== requestedPage) {
    const params = new URLSearchParams(url.searchParams);
    if (currentPage > 1) {
      params.set('page', String(currentPage));
    } else {
      params.delete('page');
    }

    throw redirect(buildPathWithParams(url.pathname, params));
  }

  const normalizedItems = {
    ...items,
    products: {
      ...items.products,
      nodes: fetchedProducts,
      pagination: {
        currentPage,
        totalPages,
        hasNextPage,
        hasPreviousPage: currentPage > 1,
        hasMorePages,
      },
    },
  };

  const error = errors
    ? errors.map(({message}) => message).join(', ')
    : undefined;

  return {
    error,
    items: normalizedItems,
  };
}

/**
 * @param {{
 *   term: string;
 *   searchTerm: string;
 *   searchResult: {error?: string; items: Record<string, {nodes?: unknown[]}>};
 *   searchCorrection: null | {originalTerm: string; correctedTerm: string};
 * }}
 */
function buildRegularSearchReturn({
  term,
  searchTerm,
  searchResult,
  searchCorrection,
}) {
  const total = getSearchItemsTotal(searchResult.items);

  return {
    type: 'regular',
    term,
    searchTerm,
    error: searchResult.error,
    searchCorrection,
    result: {total, items: searchResult.items},
  };
}

/**
 * @param {Record<string, {nodes?: unknown[]}>} items
 */
function getSearchItemsTotal(items) {
  return Object.values(items).reduce(
    (acc, item) => acc + (item?.nodes?.length || 0),
    0,
  );
}

/**
 * @param {Record<string, {nodes?: unknown[]}>} items
 */
function hasStrongProductResults(items) {
  return (items.products?.nodes?.length || 0) >= MIN_STRONG_SEARCH_PRODUCTS;
}

/**
 * @param {Record<string, {nodes?: unknown[]}>} candidate
 * @param {Record<string, {nodes?: unknown[]}>} original
 */
function hasBetterSearchResults(candidate, original) {
  const candidateProducts = candidate.products?.nodes?.length || 0;
  const originalProducts = original.products?.nodes?.length || 0;

  if (candidateProducts >= MIN_STRONG_SEARCH_PRODUCTS) return true;
  return candidateProducts > originalProducts;
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

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
`;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
`;

const PREDICTIVE_PRODUCTS_ONLY_QUERY = `#graphql
  query PredictiveProductsOnly(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $term: String!
  ) @inContext(country: $country, language: $language) {
    products: search(
      query: $term,
      first: $limit,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: SHOW
    ) {
      nodes {
        ...on Product {
          ...PredictiveProduct
        }
      }
    }
  }
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
`;

/**
 * Predictive search fetcher
 * @param {Pick<
 *   Route.ActionArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<PredictiveSearchReturn>}
 */
async function predictiveSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const requestedLimit = Number(url.searchParams.get('limit') || 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(requestedLimit, 20))
    : 10;
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  if (limit > 10) {
    const {products, errors} = await storefront.query(
      PREDICTIVE_PRODUCTS_ONLY_QUERY,
      {
        variables: {term, limit},
      },
    );

    if (errors) {
      throw new Error(
        `Shopify API errors: ${errors.map(({message}) => message).join(', ')}`,
      );
    }

    const items = {
      articles: [],
      collections: [],
      pages: [],
      products: products?.nodes || [],
      queries: [],
    };

    return {type, term, result: {items, total: items.products.length}};
  }

  // Predictively search articles, products, and query suggestions
  const {predictiveSearch: items, errors} = await storefront.query(
    PREDICTIVE_SEARCH_QUERY,
    {
      variables: {
        // customize search options as needed
        limit,
        limitScope: 'EACH',
        term,
        types: ['ARTICLE', 'PRODUCT', 'QUERY'],
      },
    },
  );

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors.map(({message}) => message).join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  const normalizedItems = {
    articles: items?.articles || [],
    collections: [],
    pages: [],
    products: items?.products || [],
    queries: items?.queries || [],
  };

  const total = Object.values(normalizedItems).reduce(
    (acc, item) => acc + item.length,
    0,
  );

  return {type, term, result: {items: normalizedItems, total}};
}

/** @typedef {import('./+types/search').Route} Route */
/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
/** @typedef {import('~/lib/search').PredictiveSearchReturn} PredictiveSearchReturn */
/** @typedef {import('storefrontapi.generated').RegularSearchQuery} RegularSearchQuery */
/** @typedef {import('storefrontapi.generated').PredictiveSearchQuery} PredictiveSearchQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
