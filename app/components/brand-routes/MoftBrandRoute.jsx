import {Analytics} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {BrandVariantCard} from '~/components/brand-routes/BrandVariantCard';
import {
  BRAND_BANNER_IMAGE_HEIGHT,
  BRAND_BANNER_IMAGE_WIDTH,
  getBrandThemeVars,
  getProductCardEntries,
} from '~/lib/brand-routes/utils';

export const MOFT_SECTIONS = [
  {
    id: 'iphone-covers',
    headline: 'MOFT iPhone covers',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_3_2026_09_54_18_PM.png?v=1780514682',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_3_2026_09_54_25_PM.png?v=1780514682',
    productHandles: [
      'moft-frame-case-movas\u2122-for-iphone-17-pro-pro-max-soothing-mist-x-sunrise',
      'moft-frame-case-movas\u2122-for-iphone-17-pro-pro-max-misty-cove-x-cement',
    ],
    searchQueries: [
      'vendor:MOFT tag:"iphone covers"',
      'vendor:Moft tag:"iphone covers"',
    ],
  },
  {
    id: 'apple-watch-bands',
    headline: 'MOFT Apple Watch bands',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_3_2026_10_02_51_PM_1.png?v=1780514697',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_3_2026_10_02_51_PM_2.png?v=1780514697',
    searchQueries: [
      'vendor:MOFT tag:"apple watch bands"',
      'vendor:Moft tag:"apple watch bands"',
    ],
  },
  {
    id: 'snap-field-wallet',
    headline: 'MOFT Snap Field Wallet',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_3_2026_10_06_05_PM_1.png?v=1780514710',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_3_2026_10_06_06_PM_2.png?v=1780514710',
    searchQueries: [
      'vendor:MOFT title:"Snap Field Wallet"',
      'vendor:Moft title:"Snap Field Wallet"',
    ],
  },
  {
    id: 'snap-on',
    headline: 'MOFT Snap-on',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_3_2026_10_10_01_PM_1.png?v=1780514750',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_3_2026_10_10_01_PM_2.png?v=1780514751',
    searchQueries: ['vendor:MOFT title:Snap-on', 'vendor:Moft title:Snap-on'],
  },
  {
    id: 'adhesive',
    headline: 'MOFT adhesive',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_4_2026_09_14_59_PM_1.png?v=1780596914',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_4_2026_09_14_59_PM_2.png?v=1780596914',
    searchQueries: ['vendor:MOFT title:adhesive', 'vendor:Moft title:adhesive'],
  },
  {
    id: 'tripod-stand',
    headline: 'MOFT tripod stand',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_4_2026_09_17_24_PM_1.png?v=1780597056',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_4_2026_09_17_25_PM_2.png?v=1780597057',
    searchQueries: [
      'vendor:MOFT title:"tripod stand"',
      'vendor:Moft title:"tripod stand"',
    ],
  },
  {
    id: 'lanyard',
    headline: 'MOFT lanyard',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_4_2026_09_35_50_PM_1.png?v=1780598160',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_4_2026_09_35_50_PM_2.png?v=1780598161',
    searchQueries: ['vendor:MOFT title:lanyard', 'vendor:Moft title:lanyard'],
  },
];

export function MoftBrandRoute({brand, collection, sections}) {
  const style = getBrandThemeVars(brand);

  return (
    <div
      className={`pz-brand-page pz-brand-page--moft pz-brand-family--${brand.family}`}
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

      {sections.map((section, sectionIndex) => {
        const sectionVariants = (section.products || []).flatMap((product) =>
          getProductCardEntries(product, 'color').map((variant) => ({
            product,
            variant,
          })),
        );
        const hasProductFeed =
          section.productHandles?.length || section.searchQueries?.length;

        return (
          <section key={section.id} className="pz-brand-feature-block">
            <section className="pz-brand-banner-section">
              <div className="pz-shell">
                <div className="pz-brand-banner-card pz-moft-banner-card">
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
                    <div className="pz-brand-banner-copy pz-moft-banner-copy">
                      {section.bannerEyebrow ? (
                        <p>{section.bannerEyebrow}</p>
                      ) : null}
                      {section.bannerHeadline ? (
                        <h1>{section.bannerHeadline}</h1>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            {hasProductFeed ? (
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
                          loading={index < 4 ? 'eager' : 'lazy'}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="pz-brand-empty">
                      <h3>MOFT products are being prepared.</h3>
                      <p>
                        Products will appear here as soon as matching MOFT items
                        are available.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            ) : null}
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
