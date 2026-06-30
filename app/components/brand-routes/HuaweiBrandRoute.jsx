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

export const HUAWEI_SECTIONS = [
  {
    id: 'watch-fit-5-pro',
    label: 'Huawei Watch Fit 5 Pro',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/fit_5_pro_desk.png?v=1782797789',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/fit_5_pro_mob.png?v=1782797779',
    titleIncludes: ['watch fit 5 pro'],
    searchQueries: [
      'vendor:Huawei title:Watch title:Fit title:5 title:Pro',
      'vendor:HUAWEI title:Watch title:Fit title:5 title:Pro',
    ],
  },
  {
    id: 'watch-fit-4-pro',
    label: 'Huawei Watch Fit 4 Pro',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/fit_4_pro_desk.png?v=1782797766',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/fit_4_pro_mob.png?v=1782797756',
    titleIncludes: ['fit 4 pro'],
    searchQueries: [
      'vendor:Huawei title:Fit title:4 title:Pro',
      'vendor:HUAWEI title:Fit title:4 title:Pro',
    ],
  },
  {
    id: 'band-11-pro',
    label: 'Huawei Band 11 Pro',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/band_11_pro_desk.png?v=1782797743',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/band_11_pro_mob.png?v=1782797729',
    titleIncludes: ['band 11 pro'],
    searchQueries: [
      'vendor:Huawei title:Band title:11 title:Pro',
      'vendor:HUAWEI title:Band title:11 title:Pro',
    ],
  },
  {
    id: 'band-11',
    label: 'Huawei Band 11',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/band_11_desk.png?v=1782797715',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/band_11_mob.png?v=1782797703',
    titleIncludes: ['band 11'],
    titleExcludes: ['pro'],
    distinguishBand11Versions: true,
    searchQueries: [
      'vendor:Huawei title:Band title:11',
      'vendor:HUAWEI title:Band title:11',
    ],
  },
  {
    id: 'tablets',
    label: 'Huawei MatePad',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/matepad_desk.png?v=1782797678',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/matepad_mob.png?v=1782797691',
    titleIncludes: ['matepad'],
    titleExcludes: ['m-pencil'],
    searchQueries: [
      'vendor:Huawei title:MatePad',
      'vendor:HUAWEI title:MatePad',
      'vendor:Huawei tag:Tablet',
      'vendor:HUAWEI tag:Tablet',
    ],
  },
  {
    id: 'earbuds',
    label: 'Huawei earbuds',
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
        const sectionProducts = (section.products || []).filter((product) =>
          productMatchesSectionTitle(product, section),
        );
        const sectionVariants = sectionProducts.flatMap((product) =>
          getProductCardEntries(product, 'color').map((variant) => ({
            product,
            variant,
          })),
        );
        const isTabletSection = section.id === 'tablets';
        const isBandVersionSection = section.distinguishBand11Versions;

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
                {sectionVariants.length && isBandVersionSection ? (
                  <HuaweiBandVersionGroups
                    brand={brand}
                    sectionIndex={sectionIndex}
                    sectionVariants={sectionVariants}
                  />
                ) : sectionVariants.length ? (
                  <div
                    className={
                      isTabletSection
                        ? 'pz-huawei-tablet-grid'
                        : 'pz-card-grid pz-brand-variant-grid pz-huawei-grid'
                    }
                  >
                    {sectionVariants.map(({product, variant}, index) =>
                      isTabletSection ? (
                        <HuaweiTabletVariantCard
                          key={variant.id}
                          brand={brand}
                          product={product}
                          variant={variant}
                          loading={index < 2 ? 'eager' : 'lazy'}
                          pills={['MatePad', 'Productivity', 'Portable']}
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

function HuaweiBandVersionGroups({brand, sectionIndex, sectionVariants}) {
  const regularVariants = sectionVariants.filter(
    ({product}) => !isAluminumAlloyProduct(product),
  );
  const alloyVariants = sectionVariants.filter(({product}) =>
    isAluminumAlloyProduct(product),
  );
  const groups = [
    {
      id: 'regular',
      title: 'Regular version',
      variants: regularVariants,
    },
    {
      id: 'alloy',
      title: 'Aluminum Alloy version',
      variants: alloyVariants,
    },
  ].filter((group) => group.variants.length);

  return (
    <div className="pz-huawei-version-groups">
      {groups.map((group) => (
        <div key={group.id} className="pz-huawei-version-group">
          <div className="pz-huawei-version-label">
            <h3>{group.title}</h3>
          </div>
          <div className="pz-huawei-tablet-grid">
            {group.variants.map(({product, variant}, index) => (
              <HuaweiTabletVariantCard
                key={variant.id}
                brand={brand}
                product={product}
                variant={variant}
                loading={sectionIndex === 0 && index < 4 ? 'eager' : 'lazy'}
                pills={['Band 11', group.title, 'Wearable']}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function HuaweiTabletVariantCard({brand, product, variant, loading, pills}) {
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
    <article className="pz-huawei-tablet-card">
      <Link className="pz-huawei-tablet-link" prefetch="intent" to={variantUrl}>
        <div className="pz-huawei-tablet-media">
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

        <div className="pz-huawei-tablet-copy">
          <div className="pz-product-topline">
            <span>
              {(brand.name || product.vendor || 'HUAWEI').toUpperCase()}
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
          {pills?.length ? (
            <div className="pz-huawei-tablet-pills" aria-label="Highlights">
              {pills.map((pill) => (
                <span key={pill}>{pill}</span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="pz-huawei-tablet-actions">
        <div className="pz-huawei-tablet-price">
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
            className="pz-huawei-tablet-cart"
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

function isAluminumAlloyProduct(product) {
  const title = (product?.title || '').toLowerCase();
  return (
    title.includes('aloy') ||
    title.includes('alloy') ||
    title.includes('aluminum')
  );
}

function productMatchesSectionTitle(product, section) {
  const title = (product?.title || '').toLowerCase();
  const includes = section.titleIncludes || [];
  const excludes = section.titleExcludes || [];
  const containsAny = section.titleContainsAny || [];

  if (includes.some((term) => !title.includes(term))) return false;
  if (excludes.some((term) => title.includes(term))) return false;
  if (containsAny.length && !containsAny.some((term) => title.includes(term))) {
    return false;
  }

  return true;
}
