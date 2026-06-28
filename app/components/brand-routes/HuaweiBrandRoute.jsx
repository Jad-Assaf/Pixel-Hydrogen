import {Analytics} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {BrandVariantCard} from '~/components/brand-routes/BrandVariantCard';
import {
  getBrandThemeVars,
  getProductCardEntries,
  withImageWidth,
} from '~/lib/brand-routes/utils';

export const HUAWEI_SECTIONS = [
  {
    id: 'wearables',
    eyebrow: 'Wearable',
    headline: 'Health data in a cleaner daily rhythm.',
    searchQueries: [
      'vendor:Huawei title:WATCH',
      'vendor:HUAWEI title:WATCH',
      'vendor:Huawei title:Band',
      'vendor:HUAWEI title:Band',
    ],
  },
  {
    id: 'tablets',
    eyebrow: 'Tablet',
    headline: 'Paper-like screens for work, notes, and downtime.',
    searchQueries: [
      'vendor:Huawei title:MatePad',
      'vendor:HUAWEI title:MatePad',
      'vendor:Huawei tag:Tablet',
      'vendor:HUAWEI tag:Tablet',
    ],
  },
  {
    id: 'phones',
    eyebrow: 'Smartphone',
    headline: 'Premium mobile hardware with camera-first polish.',
    searchQueries: [
      'vendor:Huawei title:Mate',
      'vendor:HUAWEI title:Mate',
      'vendor:Huawei title:nova',
      'vendor:HUAWEI title:nova',
      'vendor:Huawei title:Pura',
      'vendor:HUAWEI title:Pura',
    ],
  },
  {
    id: 'audio',
    eyebrow: 'Audio',
    headline: 'Wireless listening built for movement and calls.',
    searchQueries: [
      'vendor:Huawei title:FreeBuds',
      'vendor:HUAWEI title:FreeBuds',
      'vendor:Huawei title:FreeClip',
      'vendor:HUAWEI title:FreeClip',
      'vendor:Huawei title:FreeArc',
      'vendor:HUAWEI title:FreeArc',
    ],
  },
  {
    id: 'pc-connected-home',
    eyebrow: 'PC and router',
    headline: 'Laptops and network gear for the wider setup.',
    searchQueries: [
      'vendor:Huawei title:MateBook',
      'vendor:HUAWEI title:MateBook',
      'vendor:Huawei title:Router',
      'vendor:HUAWEI title:Router',
    ],
  },
];

const HUAWEI_PILLARS = [
  'Smartphone',
  'Wearable',
  'PC',
  'Tablet',
  'Audio',
  'Router',
];

export function HuaweiBrandRoute({brand, collection, sections}) {
  const style = getBrandThemeVars(brand);
  const heroVariants = getHeroVariants(sections, collection?.products?.nodes);

  return (
    <div
      className={`pz-brand-page pz-brand-page--huawei pz-brand-family--${brand.family}`}
      style={style}
    >
      <div className="pz-shell">
        <nav className="pz-breadcrumbs pz-huawei-route-head" aria-label="Breadcrumb">
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

      <header className="pz-huawei-hero">
        <div className="pz-shell pz-huawei-hero-shell">
          <div className="pz-huawei-hero-copy">
            <img src={brand.logo} alt="" className="pz-huawei-hero-logo" />
            <p className="pz-brand-eyebrow">Huawei ecosystem</p>
            <h1>Designed around the full day.</h1>
            <p>
              A cleaner route for Huawei phones, wearables, MatePad tablets,
              MateBook devices, audio, and connected-home gear.
            </p>
          </div>

          <div className="pz-huawei-stage" aria-label="Featured Huawei products">
            {heroVariants.length ? (
              heroVariants.map(({product, variant}, index) => {
                const displayImage = variant.image || product.featuredImage;
                const imageUrl = displayImage?.url
                  ? withImageWidth(displayImage.url, 700)
                  : null;

                return (
                  <Link
                    key={variant.id}
                    to={`/products/${product.handle}`}
                    prefetch="intent"
                    className={`pz-huawei-device pz-huawei-device--${index + 1}`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={displayImage.altText || product.title}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        width={700}
                        height={700}
                      />
                    ) : null}
                    <span>{product.title}</span>
                  </Link>
                );
              })
            ) : (
              <div className="pz-huawei-logo-stage" aria-hidden="true">
                <img src={brand.logo} alt="" loading="eager" />
              </div>
            )}
          </div>
        </div>

        <div className="pz-shell">
          <div className="pz-huawei-pillar-row" aria-label="Huawei categories">
            {HUAWEI_PILLARS.map((pillar) => (
              <span key={pillar}>{pillar}</span>
            ))}
          </div>
        </div>
      </header>

      {sections.map((section, sectionIndex) => {
        const sectionVariants = (section.products || []).flatMap((product) =>
          getProductCardEntries(product, 'color').map((variant) => ({
            product,
            variant,
          })),
        );

        return (
          <section
            key={section.id}
            className="pz-brand-section pz-huawei-section"
          >
            <div className="pz-shell">
              <div className="pz-huawei-section-head">
                <p>{section.eyebrow}</p>
                <h2>{section.headline}</h2>
              </div>

              {sectionVariants.length ? (
                <div className="pz-card-grid pz-brand-variant-grid pz-huawei-grid">
                  {sectionVariants.map(({product, variant}, index) => (
                    <BrandVariantCard
                      key={variant.id}
                      brand={brand}
                      product={product}
                      variant={variant}
                      loading={
                        sectionIndex === 0 && index < 4 ? 'eager' : 'lazy'
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="pz-brand-empty pz-huawei-empty">
                  <h3>{section.eyebrow} products are being curated.</h3>
                  <p>
                    Matching Huawei products will appear here as soon as they
                    are available.
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })}

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

function getHeroVariants(sections, collectionProducts) {
  const sectionProducts = (sections || []).flatMap(
    (section) => section.products || [],
  );
  const products = sectionProducts.length ? sectionProducts : collectionProducts || [];

  return products
    .flatMap((product) =>
      getProductCardEntries(product, 'color')
        .slice(0, 1)
        .map((variant) => ({product, variant})),
    )
    .slice(0, 3);
}
