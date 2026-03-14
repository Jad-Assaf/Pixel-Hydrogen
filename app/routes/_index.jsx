import {useRef} from 'react';
import {Link, useLoaderData} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import ankerLogo from '~/assets/anker-logo.webp';
import appleLogo from '~/assets/apple-logo.webp';
import asusLogo from '~/assets/asus-logo.webp';
import beatsLogo from '~/assets/beats-logo.webp';
import hpLogo from '~/assets/hp-logo.webp';
import lenovoLogo from '~/assets/lenovo-logo.webp';
import msiLogo from '~/assets/msi-logo.webp';
import samsungLogo from '~/assets/samsung-logo.webp';

const HEADER_MENU_HANDLE = 'new-main-menu';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Pixel Zones | Home'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  const {storefront} = context;

  const [homeData, menuData] = await Promise.all([
    storefront.query(HOME_QUERY),
    storefront.query(HOME_MENU_QUERY, {
      cache: storefront.CacheLong(),
      variables: {menuHandle: HEADER_MENU_HANDLE},
    }),
  ]);

  const mainMenuCollections = getMainMenuCollections(menuData?.menu?.items);
  let menuCollections = [];

  if (mainMenuCollections.length) {
    const ids = mainMenuCollections
      .map((item) => item.resourceId)
      .filter(Boolean);
    const handles = mainMenuCollections
      .map((item) => item.handle)
      .map((handle) => (typeof handle === 'string' ? handle.toLowerCase() : handle))
      .filter(Boolean);

    let collectionsById = [];
    let collectionsByHandle = [];

    if (ids.length) {
      const {nodes} = await storefront.query(MENU_COLLECTION_ROWS_QUERY, {
        cache: storefront.CacheLong(),
        variables: {ids},
      });
      collectionsById = nodes || [];
    }

    if (handles.length) {
      const handleResults = await Promise.all(
        handles.map((handle) =>
          storefront
            .query(COLLECTION_ROW_BY_HANDLE_QUERY, {
              cache: storefront.CacheLong(),
              variables: {handle},
            })
            .catch(() => null),
        ),
      );

      collectionsByHandle = handleResults
        .map((result) => result?.collection)
        .filter(Boolean);
    }

    menuCollections = buildCollectionRows(mainMenuCollections, [
      ...collectionsById,
      ...collectionsByHandle,
    ]);
  }

  return {
    products: homeData?.products?.nodes || [],
    menuCollections,
  };
}

export default function Homepage() {
  /** @type {{products: HomeProduct[]; menuCollections: HomeCollectionRow[]}} */
  const data = useLoaderData();
  const products = data.products || [];
  const menuCollections = data.menuCollections || [];
  const visibleMenuCollections = menuCollections.filter(
    (collection) =>
      Array.isArray(collection?.products) && collection.products.length > 0,
  );
  const carouselRef = useRef(null);
  const carouselBrands = [
    ...BRANDS.map((brand) => ({...brand, copy: 'a'})),
    ...BRANDS.map((brand) => ({...brand, copy: 'b'})),
  ];

  function scrollProducts(direction) {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.clientWidth * 0.85;
    carouselRef.current.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  return (
    <div className="pz-home">
      <section className="pz-hero">
        <div className="pz-shell pz-hero-inner">
          <p className="pz-kicker">Next Generation Gear</p>
          <h1>
            Latest Tech
            <br />
            <span>Redefined.</span>
          </h1>
          <p>
            Experience high-performance devices curated for modern
            professionals. Powerful hardware, clean design, and everyday
            reliability.
          </p>
          <div className="pz-hero-actions">
            <Link
              to="/collections/new-arrivals"
              prefetch="intent"
              className="pz-btn pz-btn-primary"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      <section className="pz-brand-strip">
        <div className="pz-shell">
          <p>Brands</p>
          <div className="pz-brand-carousel" aria-label="Popular brands">
            <div className="pz-brand-track" role="list">
              {carouselBrands.map((brand) => (
                <Link
                  key={`${brand.copy}-${brand.handle}`}
                  to={`/collections/${brand.handle}`}
                  prefetch="intent"
                  className="pz-brand-logo-link"
                  role="listitem"
                  aria-label={`${brand.name} collection`}
                >
                  <img src={brand.logo} alt={brand.name} loading="lazy" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pz-home-section">
        <div className="pz-shell">
          <div className="pz-section-head">
            <div>
              <p className="pz-kicker">Curated Collection</p>
              <h2>New Arrivals</h2>
            </div>
            <div className="pz-carousel-controls">
              <button
                type="button"
                className="pz-carousel-btn"
                onClick={() => scrollProducts('prev')}
                aria-label="Previous products"
              >
                ‹
              </button>
              <button
                type="button"
                className="pz-carousel-btn"
                onClick={() => scrollProducts('next')}
                aria-label="Next products"
              >
                ›
              </button>
              <Link
                to="/collections/new-arrivals"
                prefetch="intent"
                className="pz-inline-link"
              >
                View All
              </Link>
            </div>
          </div>

          {products.length ? (
            <div className="pz-product-carousel" ref={carouselRef}>
              {products.map((product, index) => (
                <div className="pz-product-carousel-item" key={product.id}>
                  <ProductItem
                    product={product}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    showAddToCart
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="pz-empty">
              Add products to your store to populate this section.
            </p>
          )}
        </div>
      </section>

      <section className="pz-home-section pz-home-collections">
        <div className="pz-shell">
          <div className="pz-section-head">
            <div>
              <p className="pz-kicker">Shop by Collection</p>
              <h2>Main Collections</h2>
            </div>
            {/* <Link to="/collections" prefetch="intent" className="pz-inline-link">
              View All Collections
            </Link> */}
          </div>

          {visibleMenuCollections.length ? (
            <div className="pz-collection-card-row">
              {visibleMenuCollections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.handle}`}
                  prefetch="intent"
                  className="pz-collection-card"
                >
                  <div className="pz-collection-card-image">
                    {collection.image?.url ? (
                      <img
                        src={withImageWidth(collection.image.url, 600)}
                        alt={collection.image.altText || collection.title}
                        loading="lazy"
                        width={collection.image.width || 600}
                        height={collection.image.height || 600}
                      />
                    ) : (
                      <div
                        className="pz-image-placeholder"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="pz-collection-card-copy">
                    <p>{collection.title}</p>
                    <small>
                      {collection.products.length} product
                      {collection.products.length === 1 ? '' : 's'}
                    </small>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="pz-empty">
              Add collections to your main menu to populate this row.
            </p>
          )}
        </div>
      </section>

      {visibleMenuCollections.map((collection) => (
        <section
          className="pz-home-section pz-home-collection-products"
          key={`row-${collection.id}`}
        >
          <div className="pz-shell">
            <div className="pz-section-head">
              <div>
                <p className="pz-kicker">Collection Spotlight</p>
                <h2>{collection.title}</h2>
              </div>
              <Link
                to={`/collections/${collection.handle}`}
                prefetch="intent"
                className="pz-inline-link"
              >
                View Collection
              </Link>
            </div>

            {collection.products.length ? (
              <div className="pz-product-carousel pz-collection-product-carousel">
                {collection.products.map((product, index) => (
                  <div
                    className="pz-product-carousel-item"
                    key={`${collection.id}-${product.id}`}
                  >
                    <ProductItem
                      product={product}
                      loading={index < 3 ? 'eager' : 'lazy'}
                      showAddToCart
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="pz-empty">
                Add products to <strong>{collection.title}</strong> to fill this
                row.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function getMainMenuCollections(items) {
  const seen = new Set();

  return (items || [])
    .map((item) => {
      if (!item) return null;

      const handle = getCollectionHandleFromMenuUrl(item.url);
      const hasCollectionReference =
        (item.type === 'COLLECTION' && item.resourceId) || handle;

      if (!hasCollectionReference) return null;

      return {
        id: item.id,
        title: item.title,
        resourceId: item.resourceId || null,
        handle: handle ? handle.toLowerCase() : null,
      };
    })
    .filter(Boolean)
    .filter((item) => {
      const key = item.resourceId || item.handle;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function buildCollectionRows(menuItems, nodes) {
  const collectionNodes = (nodes || []).filter(
    (node) => node?.__typename === 'Collection',
  );
  const collectionById = new Map(collectionNodes.map((collection) => [collection.id, collection]));
  const collectionByHandle = new Map(
    collectionNodes
      .filter((collection) => collection?.handle)
      .map((collection) => [collection.handle.toLowerCase(), collection]),
  );

  return menuItems
    .map((item) => {
      const collection =
        (item.resourceId ? collectionById.get(item.resourceId) : null) ||
        (item.handle ? collectionByHandle.get(item.handle.toLowerCase()) : null);
      if (!collection?.handle) return null;

      return {
        id: collection.id,
        title: collection.title || item.title,
        handle: collection.handle,
        image: pickCollectionImage(collection),
        products: collection.products?.nodes || [],
      };
    })
    .filter(Boolean);
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
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...HomeProductCard
      }
    }
  }

  fragment HomeMoney on MoneyV2 {
    amount
    currencyCode
  }

  fragment HomeProductCard on Product {
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
        ...HomeMoney
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
        ...HomeMoney
      }
      compareAtPrice {
        ...HomeMoney
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
          ...HomeMoney
        }
      }
    }
  }
`;

const HOME_MENU_QUERY = `#graphql
  query HomeMenu(
    $country: CountryCode
    $language: LanguageCode
    $menuHandle: String!
  ) @inContext(country: $country, language: $language) {
    menu(handle: $menuHandle) {
      id
      items {
        id
        title
        type
        resourceId
        url
      }
    }
  }
`;

const MENU_COLLECTION_ROWS_QUERY = `#graphql
  query HomeMenuCollections(
    $country: CountryCode
    $language: LanguageCode
    $ids: [ID!]!
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      __typename
      ...HomeMenuCollectionNode
    }
  }

  fragment HomeMenuCollectionNode on Collection {
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
    products(first: 10, sortKey: BEST_SELLING) {
      nodes {
        ...HomeCollectionProductCard
      }
    }
  }

  fragment HomeCollectionMoney on MoneyV2 {
    amount
    currencyCode
  }

  fragment HomeCollectionProductCard on Product {
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
        ...HomeCollectionMoney
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
        ...HomeCollectionMoney
      }
      compareAtPrice {
        ...HomeCollectionMoney
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
          ...HomeCollectionMoney
        }
      }
    }
  }
`;

const COLLECTION_ROW_BY_HANDLE_QUERY = `#graphql
  query HomeCollectionRowByHandle(
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
      products(first: 10, sortKey: BEST_SELLING) {
        nodes {
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
              amount
              currencyCode
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
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
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
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

const BRANDS = [
  {name: 'Apple', handle: 'apple', logo: appleLogo},
  {name: 'HP', handle: 'hp', logo: hpLogo},
  {name: 'Lenovo', handle: 'lenovo', logo: lenovoLogo},
  {name: 'MSI', handle: 'msi', logo: msiLogo},
  {name: 'Samsung', handle: 'samsung', logo: samsungLogo},
  {name: 'Asus', handle: 'asus', logo: asusLogo},
  {name: 'Beats', handle: 'beats', logo: beatsLogo},
  {name: 'Anker', handle: 'anker', logo: ankerLogo},
];

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').HomeProductCardFragment} HomeProduct */
/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   handle: string;
 *   image: {
 *     url?: string;
 *     altText?: string | null;
 *     width?: number | null;
 *     height?: number | null;
 *   } | null;
 *   products: HomeProduct[];
 * }} HomeCollectionRow
 */
