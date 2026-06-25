import {Analytics} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {BrandVariantCard} from '~/components/brand-routes/BrandVariantCard';
import {
  BRAND_BANNER_IMAGE_HEIGHT,
  BRAND_BANNER_IMAGE_WIDTH,
  getBrandThemeVars,
  getProductCardEntries,
} from '~/lib/brand-routes/utils';

export const TORRAS_SECTIONS = [
  {
    id: 'world-cup-limited-edition',
    headline: 'World Cup Limited Editions',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/torras-world-cup-desk.jpg?v=1779218764',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/IMG_7717_1.jpg?v=1779267721',
    productHandles: [
      'torras-torras-portuguese-football-federation-fpf-limited-edition-for-iphone-17-pro-iphone-17-pro-max-glory-slash',
      'torras-x-france-ostand-q3-air-football-limited-for-iphone-17-pro-iphone-17-pro-max-horizon',
      'torras-portuguese-football-federation-fpf-limited-edition-for-iphone-17-pro-iphone-17-pro-max',
      'torras-x-usa-ostand-q3-air-football-limited-for-iphone-17-pro-iphone-17-pro-max-starlight',
      'torras-x-germany-ostand-q3-air-football-limited-for-iphone-17-pro-iphone-17-pro-max-iron',
      'torras-x-argentina-ostand-q3-air-football-limited-for-iphone-17-pro-iphone-17-pro-max-pampas-eagle',
      'torras-portuguese-football-federation-fpf-limited-edition-for-iphone-16-pro-wave-of-passion',
      'torras-x-germany-ostand-q3-air-football-limited-for-iphone-16-max-iron',
    ],
  },
  {
    id: 'iphone-cases',
    headline: 'iPhone Cases',
    bannerEyebrow: 'iPhone 17 Series',
    bannerHeadline: 'Slim protection with a stand built in.',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/torras-iphone-cases-desk.jpg?v=1779218775',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/torras-iphone-case-mob.jpg?v=1779218776',
    productHandles: [
      'torras-ostand-q3-air-for-iphone-17-pro-iphone-17-pro-max-deep-blue',
      'torras-ostand-o3-air-classic-for-iphone-17-pro-max-island-blue',
      'torras-ostand-o3-air-for-iphone-17-pro-max-shadow-black',
      'torras-ostand-q3-silicone-for-iphone-17-pro-max-black',
      'torras-ostand-o3-air-classic-for-iphone-17-pro-max-violet-purple',
      'torras-ostand-q3-air-for-iphone-17-pro-iphone-17-pro-max-neon-pink',
      'torras-ostand-q3-air-for-iphone-17-pro-horizon-orange',
      'torras-ostand-q3-air-for-iphone-17-pro-iphone-17-pro-max-glacier-sprint',
      'torras-ostand-q3-air-for-iphone-17-pro-iphone-17-pro-max-shadow-black',
      'torras-ostand-q3-air-for-iphone-17-pro-iphone-17-pro-max',
      'torras-guardian-mag-for-iphone-17-pro-max',
      'torras-pstand-for-iphone-17-pro-max-with-built-in-kickstand',
      'torras-ostand-q3-air-for-iphone-17-case-with-360-magnetic-stand-shadow-black',
      'torras-ostand-q3-air-for-iphone-17-case-with-360-magnetic-stand-glacier-sprint',
      'torras-magnetic-slim-fit-for-iphone-17-case-ultra-thin-compatible-with-magsafe',
      'torras-diamond-mag-case-for-iphone-16-pro-max-clear',
      'torras-ostand-q3-air-for-iphone-16-pro-iphone-16-pro-max',
    ],
  },
  {
    id: 'samsung-cases',
    headline: 'Samsung Cases',
    bannerEyebrow: 'Galaxy S26 Ultra',
    bannerHeadline: 'Magnetic grip. Cleaner everyday defense.',
    copyTone: 'dark',
    copyPosition: 'bottom',
    copyColor: 'black',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/torras-samsung-case-desk.jpg?v=1779218789',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/torras-samsung-case-mob.jpg?v=1779218789',
    productHandles: [
      'torras-ostand-spin-q3-air-for-samsung-s26-ultra-glacier-sprint',
      'torras-guardian-mag-case-for-galaxy-s26-ultra-black',
      'torras-guardian-mag-case-for-galaxy-s26-ultra-clear',
      'torras-ostand-spin-q3-air-for-samsung-s26-ultra-violet-surge',
      'torras-ostand-spin-q3-air-for-samsung-s26-ultra-shadow-black',
      'torras-guardian-series-case-for-samsung-galaxy-s26-ultra',
    ],
  },
  {
    id: 'screen-protectors',
    headline: 'Screen Protectors',
    bannerEyebrow: 'Install Master',
    bannerHeadline: 'Clear protection with easier alignment.',
    copyTone: 'dark',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/torras-screen-desk.jpg?v=1779218801',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/torras-screen-mob.jpg?v=1779218802',
    productHandles: [
      'torras-install-master-iphone-17-pro-iphone-17-pro-max-screen-protector',
      'torras-install-master-screen-protector-for-samsung-s26-ultra',
    ],
  },
];

export function TorrasBrandRoute({brand, collection, sections}) {
  const style = getBrandThemeVars(brand);

  return (
    <div
      className={`pz-brand-page pz-brand-page--torras pz-brand-family--${brand.family}`}
      style={style}
    >
      <div className="pz-shell">
        <div className="pz-torras-route-head">
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
      </div>

      {sections.map((section, sectionIndex) => {
        const sectionVariants = (section.products || []).flatMap((product) =>
          getProductCardEntries(product, 'color').map((variant) => ({
            product,
            variant,
          })),
        );

        return (
          <section key={section.id} className="pz-brand-feature-block">
            <section className="pz-brand-banner-section">
              <div className="pz-shell">
                <div className="pz-brand-banner-card pz-torras-banner-card">
                  <picture>
                    {section.mobileBannerUrl ? (
                      <source
                        media="(max-width: 767px)"
                        srcSet={section.mobileBannerUrl}
                      />
                    ) : null}
                    <img
                      src={section.bannerUrl}
                      alt={`${section.headline} banner`}
                      className="pz-brand-banner-image"
                      width={BRAND_BANNER_IMAGE_WIDTH}
                      height={BRAND_BANNER_IMAGE_HEIGHT}
                      loading={sectionIndex === 0 ? 'eager' : 'lazy'}
                    />
                  </picture>
                  {section.bannerEyebrow || section.bannerHeadline ? (
                    <div
                      className={`pz-brand-banner-copy pz-torras-banner-copy${
                        section.copyTone === 'dark'
                          ? ' pz-brand-banner-copy--dark'
                          : ''
                      }${
                        section.copyPosition === 'bottom'
                          ? ' pz-brand-banner-copy--bottom'
                          : ''
                      }${
                        section.copyColor === 'black'
                          ? ' pz-torras-banner-copy--black-text'
                          : ''
                      }`}
                    >
                      <div
                        className="pz-torras-banner-backdrop"
                        aria-hidden="true"
                      />
                      <div className="pz-torras-banner-text">
                        {section.bannerEyebrow ? (
                          <p>{section.bannerEyebrow}</p>
                        ) : null}
                        {section.bannerHeadline ? (
                          <h1>{section.bannerHeadline}</h1>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="pz-brand-section pz-brand-products-only">
              <div className="pz-shell">
                {sectionVariants.length ? (
                  <div className="pz-card-grid pz-brand-variant-grid">
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
                  <div className="pz-brand-empty">
                    <h3>{section.headline} products are being prepared.</h3>
                    <p>
                      Matching Torras products will appear here as soon as they
                      are available.
                    </p>
                  </div>
                )}
              </div>
            </section>
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
