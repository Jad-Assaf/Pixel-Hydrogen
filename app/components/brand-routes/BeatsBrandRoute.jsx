import {BrandVariantCard} from '~/components/brand-routes/BrandVariantCard';
import {
  BRAND_BANNER_IMAGE_HEIGHT,
  BRAND_BANNER_IMAGE_WIDTH,
  getBrandThemeVars,
  getProductCardEntries,
} from '~/lib/brand-routes/utils';

export const BEATS_SECTIONS = [
  {
    id: 'powerbeats-pro-2',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/1x-1.webp?v=1778178367',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/power.jpg?v=1778219364',
    eyebrow: 'Powerbeats Pro 2',
    headline: 'Built for athletes.',
    splitVariantsBy: 'color',
    productHandles: [
      'beats-powerbeats-pro-2-high-performance-earbuds',
      'beats-powerbeats-pro-2-nike-edition',
    ],
  },
  {
    id: 'beats-headphones',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/beats-heaphones.jpg?v=1778320522',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/beats-headphones-mob.jpg?v=1778320596',
    headline: 'Lifestyle Headphones',
    splitVariantsBy: 'color',
    productHandles: [
      'beats-solo-4-on-ear-wireless-headphones',
      'beats-studio-pro-wireless-headphones',
      'beats-studio-3-wireless-noise-cancelling-over-ear-headphones-1',
    ],
  },
  {
    id: 'beats-pill',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/pill_935c77ab-afc8-40a2-bf18-1d641a432f1e.jpg?v=1778182694',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/pill-beats_af08eb8f-8231-4115-b603-0c79ab7a3a93.jpg?v=1778219855',
    headline: 'More Than Just A Speaker',
    copyTone: 'dark',
    splitVariantsBy: 'color',
    productHandles: [
      'beats-pill-wireless-bluetooth-speaker-powerful-portable-audio-24-hour-battery-ip67-water-dust-resistance',
    ],
  },
  {
    id: 'beats-buds',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/buds.jpg?v=1778182865',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ear-beats_80164eb2-d6e6-41bb-ba3b-0aa85a2e5d99.jpg?v=1778219855',
    headline: 'Power Your Workouts',
    copyTone: 'dark',
    splitVariantsBy: 'color',
    productHandles: [
      'beats-solo-buds-true-wireless-earbuds',
      'beats-solo-buds-festive-special-edition-true-wireless-earbuds',
      'beats-powerbeats-fit-wireless-fitness-earbuds-with-secure-fit',
      'beats-powerbeats-pro-2-nike-edition',
      'beats-studio-buds-plus-transparent',
    ],
  },
  {
    id: 'beats-cases',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/cases.jpg?v=1778183589',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/beats-cover_0210734e-f67f-41d8-9af0-1d8652086f07.jpg?v=1778219855',
    headline: 'Style and Durability',
    splitVariantsBy: 'none',
    showVariantLabel: false,
    productHandles: [
      'beats-iphone-17-rugged-case-with-magsafe-and-camera-control-sierra-orange',
      'beats-iphone-17-and-iphone-17-air-rugged-case-with-magsafe-alpine-gray',
      'beats-iphone-17-rugged-case-with-magsafe-and-camera-control-everest-black',
      'beats-iphone-17-rugged-case-with-magsafe-and-camera-control-rocky-blue',
      'beats-iphone-17-series-case-magsafe-and-camera-control-granite-gray',
      'beats-iphone-17-series-case-with-magsafe-and-camera-control-bedrock-blue',
      'beats-iphone-17-series-case-with-magsafe-and-camera-control-lime-stone',
      'beats-iphone-17-series-case-with-magsafe-and-camera-control-pebble-pink',
    ],
  },
];

export function BeatsBrandRoute({brand, products}) {
  const style = getBrandThemeVars(brand);
  const productsByHandle = new Map(
    (products || [])
      .filter((product) => product?.handle)
      .map((product) => [product.handle, product]),
  );

  return (
    <div className="pz-brand-page pz-brand-page--beats" style={style}>
      {BEATS_SECTIONS.map((section, sectionIndex) => {
        const sectionProducts = section.productHandles
          .map((handle) => productsByHandle.get(handle))
          .filter(Boolean);
        const sectionVariants = sectionProducts.flatMap((product) =>
          getProductCardEntries(product, section.splitVariantsBy).map(
            (variant) => ({
              product,
              variant,
            }),
          ),
        );

        return (
          <section key={section.id} className="pz-brand-feature-block">
            <section className="pz-brand-banner-section">
              <div className="pz-shell">
                <div className="pz-brand-banner-card">
                  <picture>
                    {section.mobileBannerUrl ? (
                      <source
                        media="(max-width: 767px)"
                        srcSet={section.mobileBannerUrl}
                      />
                    ) : null}
                    <img
                      src={section.bannerUrl}
                      alt={`${brand.name} featured banner`}
                      className="pz-brand-banner-image"
                      width={BRAND_BANNER_IMAGE_WIDTH}
                      height={BRAND_BANNER_IMAGE_HEIGHT}
                      loading={sectionIndex === 0 ? 'eager' : 'lazy'}
                    />
                  </picture>
                  {section.eyebrow || section.headline ? (
                    <div
                      className={`pz-brand-banner-copy${
                        section.copyTone === 'dark'
                          ? ' pz-brand-banner-copy--dark'
                          : ''
                      }${
                        section.copyPosition === 'bottom'
                          ? ' pz-brand-banner-copy--bottom'
                          : ''
                      }`}
                    >
                      {section.eyebrow ? <p>{section.eyebrow}</p> : null}
                      {section.headline ? <h1>{section.headline}</h1> : null}
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
                        showVariantLabel={section.showVariantLabel !== false}
                        loading={
                          sectionIndex === 0 && index < 4 ? 'eager' : 'lazy'
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="pz-brand-empty">
                    <h3>Variants are being prepared.</h3>
                    <p>Check back shortly for the available Beats colors.</p>
                  </div>
                )}
              </div>
            </section>
          </section>
        );
      })}
    </div>
  );
}
