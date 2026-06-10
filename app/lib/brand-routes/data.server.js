import {formatBrandCollectionHandle} from '~/lib/brands';
import {mergeProducts} from '~/lib/brand-routes/utils';

const BRAND_PRODUCTS_PAGE_SIZE = 100;

export async function loadBrandProducts(storefront, handles) {
  const uniqueHandles = [...new Set((handles || []).filter(Boolean))];
  const results = await Promise.all(
    uniqueHandles.map((handle) =>
      storefront
        .query(BRAND_FEATURED_PRODUCT_QUERY, {
          cache: storefront.CacheShort(),
          variables: {handle},
        })
        .catch(() => null),
    ),
  );

  return results.map((result) => result?.product).filter(Boolean);
}

export async function loadConfiguredBrandSections(storefront, sections) {
  const loadedSections = await Promise.all(
    sections.map(async (section) => {
      const [handleProducts, searchProducts] = await Promise.all([
        section.productHandles?.length
          ? loadBrandProducts(storefront, section.productHandles)
          : Promise.resolve([]),
        section.searchQueries?.length
          ? loadBrandSearchProducts(storefront, section.searchQueries)
          : Promise.resolve([]),
      ]);

      return {
        ...section,
        products: mergeProducts(handleProducts, searchProducts),
      };
    }),
  );

  return loadedSections;
}

export async function loadBrandSearchProducts(storefront, queries) {
  const results = await Promise.all(
    (queries || []).filter(Boolean).map(async (query) => {
      let after = null;
      let products = [];

      do {
        const result = await storefront
          .query(BRAND_SEARCH_PRODUCTS_QUERY, {
            cache: storefront.CacheShort(),
            variables: {
              query,
              first: BRAND_PRODUCTS_PAGE_SIZE,
              after,
            },
          })
          .catch(() => null);

        const connection = result?.products;
        products = mergeProducts(products, connection?.nodes || []);
        after = connection?.pageInfo?.hasNextPage
          ? connection.pageInfo.endCursor
          : null;
      } while (after);

      return products;
    }),
  );

  return mergeProducts([], results.flat());
}

export async function loadBrandCollection(storefront, brand) {
  for (const handle of getBrandCollectionHandleCandidates(brand)) {
    const collection = await fetchCollectionByHandle(storefront, handle);
    if (collection) return collection;
  }

  return null;
}

async function fetchCollectionByHandle(storefront, handle) {
  let after = null;
  let collectionData = null;
  let products = [];

  do {
    const result = await storefront
      .query(BRAND_COLLECTION_QUERY, {
        cache: storefront.CacheShort(),
        variables: {
          handle,
          first: BRAND_PRODUCTS_PAGE_SIZE,
          after,
        },
      })
      .catch(() => null);

    if (!result?.collection) {
      return null;
    }

    const collection = result.collection;
    const connection = collection.products;

    if (!collectionData) {
      collectionData = {
        id: collection.id,
        handle: collection.handle,
        title: collection.title,
        description: collection.description,
        image: collection.image,
      };
    }

    products = mergeProducts(products, connection?.nodes || []);
    after = connection?.pageInfo?.hasNextPage
      ? connection.pageInfo.endCursor
      : null;
  } while (after);

  return {
    ...collectionData,
    products: {
      nodes: products,
    },
  };
}

function getBrandCollectionHandleCandidates(brand) {
  const candidates = [
    brand.collectionHandle,
    formatBrandCollectionHandle(brand.handle),
    `${brand.handle}-products`,
    brand.handle,
  ];

  return candidates.filter((handle, index) => {
    const normalized =
      typeof handle === 'string' ? handle.trim().toLowerCase() : '';
    if (!normalized) return false;
    return (
      candidates.findIndex((candidate) => {
        const value =
          typeof candidate === 'string' ? candidate.trim().toLowerCase() : '';
        return value === normalized;
      }) === index
    );
  });
}

const MONEY_FRAGMENT = `#graphql
  fragment BrandMoney on MoneyV2 {
    amount
    currencyCode
  }
`;

const PRODUCT_VARIANT_CARD_FRAGMENT = `#graphql
  fragment BrandVariantProduct on Product {
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
        ...BrandMoney
      }
      maxVariantPrice {
        ...BrandMoney
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
        ...BrandMoney
      }
      compareAtPrice {
        ...BrandMoney
      }
    }
    variants(first: 250) {
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
          ...BrandMoney
        }
        compareAtPrice {
          ...BrandMoney
        }
      }
    }
  }
`;

const BRAND_SEARCH_PRODUCTS_QUERY = `#graphql
  ${MONEY_FRAGMENT}
  ${PRODUCT_VARIANT_CARD_FRAGMENT}

  query BrandSearchProducts(
    $country: CountryCode
    $language: LanguageCode
    $query: String!
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    products: search(
      query: $query,
      first: $first,
      after: $after,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: SHOW
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...on Product {
          ...BrandVariantProduct
        }
      }
    }
  }
`;

const BRAND_FEATURED_PRODUCT_QUERY = `#graphql
  ${MONEY_FRAGMENT}
  ${PRODUCT_VARIANT_CARD_FRAGMENT}

  query BrandFeaturedProduct(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...BrandVariantProduct
    }
  }
`;

const BRAND_COLLECTION_QUERY = `#graphql
  ${MONEY_FRAGMENT}

  fragment BrandCollectionProduct on Product {
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
        ...BrandMoney
      }
      maxVariantPrice {
        ...BrandMoney
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
        ...BrandMoney
      }
      compareAtPrice {
        ...BrandMoney
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
          ...BrandMoney
        }
        compareAtPrice {
          ...BrandMoney
        }
      }
    }
  }

  query BrandCollection(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        id
        altText
        url
        width
        height
      }
      products(first: $first, after: $after, sortKey: BEST_SELLING) {
        nodes {
          ...BrandCollectionProduct
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
