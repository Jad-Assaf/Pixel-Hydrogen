import {Analytics} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {BrandVariantCard} from '~/components/brand-routes/BrandVariantCard';
import {
  BRAND_BANNER_IMAGE_HEIGHT,
  BRAND_BANNER_IMAGE_WIDTH,
  getBrandThemeVars,
  getProductCardEntries,
} from '~/lib/brand-routes/utils';

export const HUAWEI_SECTIONS = [
  {
    id: 'wearables',
    label: 'Huawei wearables',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_28_2026_09_20_57_PM.png?v=1782670905',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_28_2026_09_20_55_PM.png?v=1782670906',
    searchQueries: [
      'vendor:Huawei title:WATCH',
      'vendor:HUAWEI title:WATCH',
      'vendor:Huawei title:Band',
      'vendor:HUAWEI title:Band',
    ],
  },
  {
    id: 'tablets',
    label: 'Huawei tablets',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_28_2026_09_20_52_PM.png?v=1782670893',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_28_2026_09_20_49_PM.png?v=1782670893',
    searchQueries: [
      'vendor:Huawei title:MatePad',
      'vendor:HUAWEI title:MatePad',
      'vendor:Huawei tag:Tablet',
      'vendor:HUAWEI tag:Tablet',
    ],
  },
  {
    id: 'audio',
    label: 'Huawei audio',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_28_2026_09_20_46_PM.png?v=1782670880',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/ChatGPT_Image_Jun_28_2026_09_20_43_PM.png?v=1782670880',
    searchQueries: [
      'vendor:Huawei title:FreeBuds',
      'vendor:HUAWEI title:FreeBuds',
      'vendor:Huawei title:FreeClip',
      'vendor:HUAWEI title:FreeClip',
      'vendor:Huawei title:FreeArc',
      'vendor:HUAWEI title:FreeArc',
    ],
  },
];

export function HuaweiBrandRoute({brand, collection, sections}) {
  const style = getBrandThemeVars(brand);

  return (
    <div
      className={`pz-brand-page pz-brand-page--huawei pz-brand-family--${brand.family}`}
      style={style}
    >
      <div className="pz-shell">
        <nav
          className="pz-breadcrumbs pz-huawei-route-head"
          aria-label="Breadcrumb"
        >
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

        return (
          <section key={section.id} className="pz-brand-feature-block">
            <section className="pz-brand-banner-section">
              <div className="pz-shell">
                <div className="pz-brand-banner-card pz-huawei-banner-card">
                  <picture>
                    {section.mobileBannerUrl ? (
                      <source
                        media="(max-width: 767px)"
                        srcSet={section.mobileBannerUrl}
                      />
                    ) : null}
                    <img
                      src={section.bannerUrl}
                      alt={`${section.label} banner`}
                      className="pz-brand-banner-image"
                      width={BRAND_BANNER_IMAGE_WIDTH}
                      height={BRAND_BANNER_IMAGE_HEIGHT}
                      loading={sectionIndex === 0 ? 'eager' : 'lazy'}
                    />
                  </picture>
                </div>
              </div>
            </section>

            <section className="pz-brand-section pz-brand-products-only">
              <div className="pz-shell">
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
                    <h3>{section.label} products are being curated.</h3>
                    <p>
                      Matching Huawei products will appear here as soon as they
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
