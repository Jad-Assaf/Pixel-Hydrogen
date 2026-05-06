import {Analytics} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {
  BRANDS,
  formatBrandCollectionHandle,
  getBrandByHandle,
} from '~/lib/brands';

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
  let collection = null;

  for (const handle of getBrandCollectionHandleCandidates(brand)) {
    const result = await storefront
      .query(BRAND_COLLECTION_QUERY, {
        cache: storefront.CacheShort(),
        variables: {handle},
      })
      .catch(() => null);

    if (result?.collection) {
      collection = result.collection;
      break;
    }
  }

  return {
    brand,
    brands: BRANDS,
    collection,
    products: collection?.products?.nodes || [],
  };
}

export default function BrandRoute() {
  const {brand, brands, collection, products} = useLoaderData();
  const collectionPath = collection?.handle
    ? `/collections/${collection.handle}`
    : `/search?q=${encodeURIComponent(brand.name)}`;
  const primaryActionLabel = collection ? `Shop ${brand.name}` : `Search ${brand.name}`;
  const relatedBrands = brands
    .filter(
      (candidate) =>
        candidate.family === brand.family && candidate.handle !== brand.handle,
    )
    .slice(0, 3);
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

      {renderSections({brand, collection, products, relatedBrands, collectionPath})}

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

function renderSections({brand, collection, products, relatedBrands, collectionPath}) {
  const sections = {
    manifesto: (
      <BrandManifestoSection
        key="manifesto"
        brand={brand}
        collection={collection}
      />
    ),
    signals: <BrandSignalsSection key="signals" brand={brand} />,
    focus: <BrandFocusSection key="focus" brand={brand} />,
    products: (
      <BrandProductsSection
        key="products"
        brand={brand}
        collection={collection}
        products={products}
        collectionPath={collectionPath}
      />
    ),
    related: (
      <BrandRelatedSection
        key="related"
        brand={brand}
        relatedBrands={relatedBrands}
      />
    ),
  };

  switch (brand.layout) {
    case 'technical':
      return [sections.signals, sections.products, sections.focus, sections.related];
    case 'arena':
      return [sections.focus, sections.signals, sections.products, sections.related];
    case 'orbital':
      return [sections.products, sections.manifesto, sections.focus, sections.related];
    case 'pulse':
      return [sections.manifesto, sections.products, sections.signals, sections.related];
    case 'studio':
      return [sections.manifesto, sections.focus, sections.products, sections.related];
    case 'stack':
      return [sections.signals, sections.focus, sections.products, sections.related];
    case 'gallery':
      return [sections.focus, sections.manifesto, sections.products, sections.related];
    case 'editorial':
    default:
      return [sections.manifesto, sections.focus, sections.products, sections.related];
  }
}

function BrandManifestoSection({brand, collection}) {
  return (
    <section className="pz-brand-section pz-brand-manifesto">
      <div className="pz-shell pz-brand-manifesto-shell">
        <div className="pz-brand-section-head">
          <p className="pz-kicker">{brand.familyLabel}</p>
          <h2>{brand.name}, framed around how people actually use it.</h2>
        </div>
        <div className="pz-brand-manifesto-grid">
          <article className="pz-brand-manifesto-card">
            <h3>Brand point of view</h3>
            <p>{brand.summary}</p>
          </article>
          <article className="pz-brand-manifesto-card">
            <h3>Collection lens</h3>
            <p>{collection?.description || brand.productLead}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function BrandSignalsSection({brand}) {
  return (
    <section className="pz-brand-section pz-brand-signals">
      <div className="pz-shell">
        <div className="pz-brand-section-head">
          <p className="pz-kicker">Signature Traits</p>
          <h2>What defines the {brand.name} feel.</h2>
        </div>
        <div className="pz-brand-signal-grid">
          {brand.notes.map((note, index) => (
            <article key={note} className="pz-brand-signal-card">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{note}</strong>
              <p>{brand.focusAreas[index]?.copy || brand.productLead}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandFocusSection({brand}) {
  return (
    <section className="pz-brand-section pz-brand-focus">
      <div className="pz-shell">
        <div className="pz-brand-section-head">
          <p className="pz-kicker">Built For</p>
          <h2>Three ways to read the {brand.name} collection.</h2>
        </div>
        <div className="pz-brand-focus-grid">
          {brand.focusAreas.map((area) => (
            <article key={area.title} className="pz-brand-focus-card">
              <h3>{area.title}</h3>
              <p>{area.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandProductsSection({brand, collection, products, collectionPath}) {
  return (
    <section className="pz-brand-section pz-brand-products">
      <div className="pz-shell">
        <div className="pz-brand-section-head pz-brand-section-head--with-link">
          <div>
            <p className="pz-kicker">Shop the Collection</p>
            <h2>{collection?.title || `${brand.name} picks`}</h2>
          </div>
          <Link to={collectionPath} prefetch="intent" className="pz-brand-inline-link">
            View full collection
          </Link>
        </div>

        {products.length ? (
          <div className="pz-card-grid">
            {products.slice(0, 8).map((product, index) => (
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
              The custom brand page is live already. Product selection will appear here as
              soon as the Shopify collection is populated.
            </p>
            <Link to={`/search?q=${encodeURIComponent(brand.name)}`} prefetch="intent">
              Search {brand.name} products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function BrandRelatedSection({brand, relatedBrands}) {
  return (
    <section className="pz-brand-section pz-brand-related">
      <div className="pz-shell">
        <div className="pz-brand-section-head">
          <p className="pz-kicker">Stay in the lane</p>
          <h2>More from the {brand.familyLabel.toLowerCase()} world.</h2>
        </div>

        {relatedBrands.length ? (
          <div className="pz-brand-related-grid">
            {relatedBrands.map((relatedBrand) => (
              <Link
                key={relatedBrand.handle}
                to={relatedBrand.route}
                prefetch="intent"
                className="pz-brand-related-card"
                style={getBrandThemeVars(relatedBrand)}
              >
                <div className="pz-brand-related-logo">
                  <img src={relatedBrand.logo} alt={relatedBrand.name} loading="lazy" />
                </div>
                <div className="pz-brand-related-copy">
                  <h3>{relatedBrand.name}</h3>
                  <p>{relatedBrand.headline}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="pz-brand-empty">
            <h3>No adjacent brands yet.</h3>
            <p>This route still connects directly to the full brand directory.</p>
            <Link to="/brands" prefetch="intent">
              Explore all brands
            </Link>
          </div>
        )}
      </div>
    </section>
  );
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
      products(first: 8, sortKey: BEST_SELLING) {
        nodes {
          ...BrandCollectionProduct
        }
      }
    }
  }
`;

/** @typedef {import('./+types/brands.$handle').Route} Route */
