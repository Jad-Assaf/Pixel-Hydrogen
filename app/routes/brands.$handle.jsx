import {Analytics} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {
  formatBrandCollectionHandle,
  getBrandByHandle,
} from '~/lib/brands';

const BRAND_PRODUCTS_PAGE_SIZE = 100;

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data, params}) => {
  const brandName = data?.brand?.name || params?.handle || 'Brand';
  const description =
    data?.brand?.summary ||
    `Explore curated products and a custom landing page for ${brandName}.`;

  return [
    {title: `Pixel Zones | ${brandName}`},
    {name: 'description', content: description},
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context, params}) {
  const brand = getBrandByHandle(params.handle);

  if (!brand) {
    throw new Response(`Brand ${params.handle} not found`, {status: 404});
  }

  const {storefront} = context;
  const collection = await loadBrandCollection(storefront, brand);

  return {
    brand,
    collection,
    products: collection?.products?.nodes || [],
  };
}

export default function BrandRoute() {
  const {brand, collection, products} = useLoaderData();
  const collectionPath = collection?.handle
    ? `/collections/${collection.handle}`
    : `/search?q=${encodeURIComponent(brand.name)}`;
  const primaryActionLabel = collection ? `Shop ${brand.name}` : `Search ${brand.name}`;
  const style = getBrandThemeVars(brand);

  return (
    <div
      className={`pz-brand-page pz-brand-page--${brand.layout} pz-brand-family--${brand.family}`}
      style={style}
    >
      <div className="pz-shell">
        <nav className="pz-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" prefetch="intent">
            Home
          </Link>
          <span>/</span>
          <Link to="/brands" prefetch="intent">
            Brands
          </Link>
          <span>/</span>
          <span>{brand.name}</span>
        </nav>
      </div>

      <header className="pz-brand-hero">
        <div className="pz-shell pz-brand-hero-shell">
          <div className="pz-brand-hero-copy">
            <p className="pz-brand-eyebrow">{brand.eyebrow}</p>
            <h1>{brand.name}</h1>
            <p className="pz-brand-headline">{brand.headline}</p>
            <p className="pz-brand-summary">{brand.summary}</p>

            <div className="pz-brand-actions">
              <Link to={collectionPath} prefetch="intent" className="pz-brand-cta">
                {primaryActionLabel}
              </Link>
              <Link
                to="/brands"
                prefetch="intent"
                className="pz-brand-cta pz-brand-cta--ghost"
              >
                Browse all brands
              </Link>
            </div>

            <div className="pz-brand-chip-row" aria-label="Brand traits">
              {brand.notes.map((note) => (
                <span key={note} className="pz-brand-chip">
                  {note}
                </span>
              ))}
            </div>
          </div>

          <div className="pz-brand-stage" aria-hidden="true">
            <div className="pz-brand-stage-panel">
              <div className="pz-brand-stage-grid" />
              <div className="pz-brand-stage-logo">
                <img src={brand.logo} alt="" loading="eager" />
              </div>
            </div>

            <div className="pz-brand-stage-stack">
              {brand.focusAreas.map((area) => (
                <article key={area.title} className="pz-brand-stage-card">
                  <strong>{area.title}</strong>
                  <p>{area.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="pz-brand-section pz-brand-products pz-brand-products-only">
        <div className="pz-shell">
          {products.length ? (
            <div className="pz-card-grid">
              {products.map((product, index) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  showAddToCart
                />
              ))}
            </div>
          ) : (
            <div className="pz-brand-empty">
              <h3>Collection is being curated.</h3>
              <p>
                Products will appear here as soon as the Shopify collection is
                populated.
              </p>
              <Link to={`/search?q=${encodeURIComponent(brand.name)}`} prefetch="intent">
                Search {brand.name} products
              </Link>
            </div>
          )}
        </div>
      </section>

      {collection?.id ? (
        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      ) : null}
    </div>
  );
}

async function loadBrandCollection(storefront, brand) {
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
    after = connection?.pageInfo?.hasNextPage ? connection.pageInfo.endCursor : null;
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
    const normalized = typeof handle === 'string' ? handle.trim().toLowerCase() : '';
    if (!normalized) return false;
    return candidates.findIndex((candidate) => {
      const value =
        typeof candidate === 'string' ? candidate.trim().toLowerCase() : '';
      return value === normalized;
    }) === index;
  });
}

function mergeProducts(currentProducts, nextProducts) {
  const seen = new Set();
  return [...(currentProducts || []), ...(nextProducts || [])].filter((product) => {
    if (!product?.id || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

function getBrandThemeVars(brand) {
  return {
    '--brand-accent': brand.palette.accent,
    '--brand-accent-soft': brand.palette.accentSoft,
    '--brand-ink': brand.palette.ink,
    '--brand-surface': brand.palette.surface,
    '--brand-card': brand.palette.card,
    '--brand-glow': brand.palette.glow,
    '--brand-mesh-a': brand.palette.meshA,
    '--brand-mesh-b': brand.palette.meshB,
  };
}

const BRAND_COLLECTION_QUERY = `#graphql
  fragment BrandCollectionMoney on MoneyV2 {
    amount
    currencyCode
  }

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
        ...BrandCollectionMoney
      }
      maxVariantPrice {
        ...BrandCollectionMoney
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
        ...BrandCollectionMoney
      }
      compareAtPrice {
        ...BrandCollectionMoney
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
          ...BrandCollectionMoney
        }
        compareAtPrice {
          ...BrandCollectionMoney
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

/** @typedef {import('./+types/brands.$handle').Route} Route */
