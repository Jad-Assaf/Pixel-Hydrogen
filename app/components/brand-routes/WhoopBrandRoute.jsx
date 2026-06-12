import {Analytics} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {BrandVariantCard} from '~/components/brand-routes/BrandVariantCard';
import {PlusIcon} from '~/components/Icons';
import {ProductPrice} from '~/components/ProductPrice';
import {
  BRAND_BANNER_IMAGE_HEIGHT,
  BRAND_BANNER_IMAGE_WIDTH,
  getBrandThemeVars,
  getProductCardEntries,
  getProductModelLabels,
  getVariantColorLabel,
  withImageWidth,
} from '~/lib/brand-routes/utils';
import {isZeroPrice} from '~/lib/pricing';
import {useVariantUrl} from '~/lib/variants';

export const WHOOP_SECTIONS = [
  {
    id: 'mg-and-life',
    headline: 'WHOOP Life MG and 5.0',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/WHOOP_Desktop.png?v=1781297568',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/WHOOP_Mobile.png?v=1781297545',
    productHandles: [
      'whoop-life-mg-advanced-health-and-fitness-tracker-mg',
      'whoop-5-0-peak-advanced-health-tracking-wearable',
    ],
  },
  {
    id: 'mg-straps',
    headline: 'WHOOP MG Straps',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/WHOOP_MG_Straps_Desktop.png?v=1781297592',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/WHOOP_MG_Straps_Mobile.png?v=1781297640',
    searchQueries: [
      'vendor:WHOOP title:MG title:Strap',
      'vendor:WHOOP title:MG title:Band',
      'vendor:Whoop title:MG title:Strap',
      'vendor:Whoop title:MG title:Band',
    ],
    productPatternGroups: [
      [/\blife\s*mg\b/i, /\bmg\b/i],
      [/\bstrap\b/i, /\bband\b/i],
    ],
  },
  {
    id: '5-straps',
    headline: 'WHOOP 5.0 Straps',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/WHOOP_5.0_Straps_Desktop.png?v=1781297691',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/WHOOP_5.0_Straps_Mobile.png?v=1781297676',
    searchQueries: [
      'vendor:WHOOP title:"5.0" title:Strap',
      'vendor:WHOOP title:"5.0" title:Band',
      'vendor:Whoop title:"5.0" title:Strap',
      'vendor:Whoop title:"5.0" title:Band',
    ],
    productPatternGroups: [[/\b5\.?0\b/i], [/\bstrap\b/i, /\bband\b/i]],
  },
];

export function WhoopBrandRoute({brand, collection, sections}) {
  const style = getBrandThemeVars(brand);

  return (
    <div
      className={`pz-brand-page pz-brand-page--whoop pz-brand-family--${brand.family}`}
      style={style}
    >
      <div className="pz-shell">
        <nav
          className="pz-breadcrumbs pz-whoop-route-head"
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
        const sectionProducts = filterWhoopSectionProducts(
          section.products || [],
          section,
        );
        const sectionVariants = sectionProducts.flatMap((product) =>
          getProductCardEntries(product, 'color').map((variant) => ({
            product,
            variant,
          })),
        );
        const isDeviceSection = section.id === 'mg-and-life';

        return (
          <section key={section.id} className="pz-brand-feature-block">
            <section className="pz-brand-banner-section">
              <div className="pz-shell">
                <div className="pz-brand-banner-card pz-whoop-banner-card">
                  <picture>
                    <source
                      media="(max-width: 767px)"
                      srcSet={section.mobileBannerUrl}
                    />
                    <img
                      src={section.bannerUrl}
                      alt={`${section.headline} banner`}
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
                <div className="pz-decoded-section-head">
                  <h2>{section.headline}</h2>
                </div>

                {sectionVariants.length ? (
                  <div
                    className={
                      isDeviceSection
                        ? 'pz-whoop-device-grid'
                        : 'pz-card-grid pz-brand-variant-grid'
                    }
                  >
                    {sectionVariants.map(({product, variant}, index) =>
                      isDeviceSection ? (
                        <WhoopDeviceVariantCard
                          key={variant.id}
                          brand={brand}
                          product={product}
                          variant={variant}
                          loading={index < 2 ? 'eager' : 'lazy'}
                        />
                      ) : (
                        <BrandVariantCard
                          key={variant.id}
                          brand={brand}
                          product={product}
                          variant={variant}
                          loading={
                            sectionIndex === 0 && index < 4 ? 'eager' : 'lazy'
                          }
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <div className="pz-brand-empty">
                    <h3>{section.headline} products are being prepared.</h3>
                    <p>
                      Matching WHOOP products will appear here as soon as they
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

function WhoopDeviceVariantCard({brand, product, variant, loading}) {
  const variantUrl = useVariantUrl(
    product.handle,
    variant.selectedOptions || [],
  );
  const displayImage = variant.image || product.featuredImage;
  const imageUrl = displayImage?.url
    ? withImageWidth(displayImage.url, 520)
    : null;
  const colorLabel = getVariantColorLabel(variant);
  const modelLabels = colorLabel ? [] : getProductModelLabels(product, variant);
  const shouldAskForPrice = isZeroPrice(variant.price);
  const {open} = useAside();

  return (
    <article className="pz-whoop-device-card">
      <Link className="pz-whoop-device-link" prefetch="intent" to={variantUrl}>
        <div className="pz-whoop-device-media">
          {imageUrl ? (
            <img
              alt={
                displayImage.altText ||
                `${product.title} ${colorLabel || ''}`.trim()
              }
              loading={loading}
              src={imageUrl}
              width={520}
              height={520}
            />
          ) : (
            <div className="pz-image-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="pz-whoop-device-copy">
          <div className="pz-product-topline">
            <span>
              {(brand.name || product.vendor || 'WHOOP').toUpperCase()}
            </span>
          </div>
          <h3>{product.title}</h3>
          {colorLabel ? (
            <p className="pz-brand-variant-label">{colorLabel}</p>
          ) : modelLabels.length ? (
            <ul className="pz-brand-variant-label pz-brand-variant-models">
              {modelLabels.map((model) => (
                <li key={model}>{model}</li>
              ))}
            </ul>
          ) : null}
          <div className="pz-whoop-device-pills" aria-label="Highlights">
            <span>Health tracking</span>
            <span>Recovery insights</span>
            <span>24/7 wear</span>
          </div>
        </div>
      </Link>

      <div className="pz-whoop-device-actions">
        <div className="pz-whoop-device-price">
          {variant.price ? (
            <ProductPrice
              price={variant.price}
              compareAtPrice={variant.compareAtPrice || null}
            />
          ) : (
            <span className="pz-product-price-unavailable">N/A</span>
          )}
        </div>

        {!shouldAskForPrice && variant.id ? (
          <AddToCartButton
            disabled={!variant.availableForSale}
            onClick={() => open('cart')}
            lines={[
              {
                merchandiseId: variant.id,
                quantity: 1,
                selectedVariant: variant,
              },
            ]}
            className="pz-whoop-device-cart"
          >
            {variant.availableForSale ? (
              <>
                <PlusIcon className="pz-card-cart-icon" />
                <span>Add</span>
              </>
            ) : (
              'Sold out'
            )}
          </AddToCartButton>
        ) : null}
      </div>
    </article>
  );
}

function filterWhoopSectionProducts(products, section) {
  if (!section.productPatternGroups?.length) return products;

  return products.filter((product) => {
    const text = `${product?.title || ''} ${product?.vendor || ''}`;
    return section.productPatternGroups.every((patterns) =>
      patterns.some((pattern) => pattern.test(text)),
    );
  });
}
