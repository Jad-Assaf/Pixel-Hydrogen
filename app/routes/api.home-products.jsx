const MAX_PRODUCTS_PER_REQUEST = 6;

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context, request}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const handle = url.searchParams.get('handle') || '';
  const mode = url.searchParams.get('mode') || '';
  const cursor = url.searchParams.get('cursor') || null;
  const requestedLimit = Number(
    url.searchParams.get('limit') || MAX_PRODUCTS_PER_REQUEST,
  );
  const limit = Math.max(1, Math.min(MAX_PRODUCTS_PER_REQUEST, requestedLimit));

  if (mode === 'latest') {
    const data = await storefront.query(HOME_PRODUCTS_QUERY, {
      cache: storefront.CacheNone(),
      variables: {
        first: limit,
        endCursor: cursor,
      },
    });

    return {
      products: data?.products?.nodes || [],
      pageInfo: normalizePageInfo(data?.products?.pageInfo),
    };
  }

  if (!handle) {
    throw new Response('Missing collection handle', {status: 400});
  }

  const data = await storefront.query(HOME_COLLECTION_PRODUCTS_QUERY, {
    variables: {
      handle,
      first: limit,
      endCursor: cursor,
    },
  });

  if (!data?.collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }

  return {
    products: data.collection.products?.nodes || [],
    pageInfo: normalizePageInfo(data.collection.products?.pageInfo),
  };
}

function normalizePageInfo(pageInfo) {
  return {
    hasNextPage: Boolean(pageInfo?.hasNextPage),
    endCursor: pageInfo?.endCursor || null,
  };
}

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment HomeRowMoney on MoneyV2 {
    amount
    currencyCode
  }

  fragment HomeRowProductCard on Product {
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
        ...HomeRowMoney
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
        ...HomeRowMoney
      }
      compareAtPrice {
        ...HomeRowMoney
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
          ...HomeRowMoney
        }
        compareAtPrice {
          ...HomeRowMoney
        }
      }
    }
  }
`;

const HOME_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}

  query HomeProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $endCursor, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...HomeRowProductCard
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const HOME_COLLECTION_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}

  query HomeCollectionProducts(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $first: Int!
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      products(
        first: $first
        after: $endCursor
        sortKey: BEST_SELLING
      ) {
        nodes {
          ...HomeRowProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

/** @typedef {import('./+types/api.home-products').Route} Route */
