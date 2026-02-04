import {Link, redirect, useLoaderData, useLocation} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

const PAGE_SIZE = 50;
const PAGES_PER_CHUNK = 4;

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: PAGE_SIZE * PAGES_PER_CHUNK,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedPage = Number(searchParams.get('page') || '1') || 1;
  const chunkCursor = searchParams.get('cursor');
  const chunkDirection = searchParams.get('direction');
  const nodes = collection.products?.nodes ?? [];
  const totalPages = Math.max(1, Math.ceil(nodes.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const visibleNodes = nodes.slice(startIndex, endIndex);
  const {hasNextPage, hasPreviousPage, endCursor, startCursor} =
    collection.products.pageInfo;

  const hasNextPageInChunk = currentPage < totalPages;
  const hasPreviousPageInChunk = currentPage > 1;

  function buildPageUrl(nextPage, cursor = chunkCursor, direction = chunkDirection) {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('page', String(nextPage));
    if (cursor && direction) {
      nextParams.set('cursor', cursor);
      nextParams.set('direction', direction);
    } else {
      nextParams.delete('cursor');
      nextParams.delete('direction');
    }
    return `${location.pathname}?${nextParams.toString()}`;
  }

  const nextUrl = hasNextPageInChunk
    ? buildPageUrl(currentPage + 1)
    : hasNextPage && endCursor
      ? buildPageUrl(1, endCursor, 'next')
      : null;

  const prevUrl = hasPreviousPageInChunk
    ? buildPageUrl(currentPage - 1)
    : hasPreviousPage && startCursor
      ? buildPageUrl(PAGES_PER_CHUNK, startCursor, 'previous')
      : null;

  return (
    <div className="collection">
      <div className="collection-header">
        <div>
          <p className="collection-eyebrow">Collection</p>
          <h1>{collection.title}</h1>
          {collection.description ? (
            <p className="collection-description">{collection.description}</p>
          ) : null}
        </div>
        <span className="collection-count">
          {collection.products?.nodes?.length ?? 0} items
        </span>
      </div>
      <div className="collection-products-grid">
        {visibleNodes.map((product, index) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 10 ? 'eager' : undefined}
          />
        ))}
      </div>
      <div className="pagination">
        {prevUrl ? (
          <Link className="pagination-link" to={prevUrl} prefetch="intent">
            Previous page
          </Link>
        ) : (
          <span className="pagination-link is-disabled">Previous page</span>
        )}
        <div className="pagination-pages" role="navigation" aria-label="Pages">
          {Array.from({length: totalPages}, (_, index) => {
            const pageNumber = index + 1;
            const isActive = pageNumber === currentPage;
            const pageUrl = buildPageUrl(pageNumber);

            return isActive ? (
              <span
                key={pageNumber}
                className="pagination-link is-active"
                aria-current="page"
              >
                {pageNumber}
              </span>
            ) : (
              <Link
                key={pageNumber}
                className="pagination-link"
                to={pageUrl}
                prefetch="intent"
              >
                {pageNumber}
              </Link>
            );
          })}
        </div>
        {nextUrl ? (
          <Link className="pagination-link" to={nextUrl} prefetch="intent">
            Next page
          </Link>
        ) : (
          <span className="pagination-link is-disabled">Next page</span>
        )}
      </div>
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

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
