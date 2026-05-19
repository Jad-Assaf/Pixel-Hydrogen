import {Analytics} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ProductPrice} from '~/components/ProductPrice';
import {useAside} from '~/components/Aside';
import {useVariantUrl} from '~/lib/variants';
import {BrandVariantCard} from '~/components/brand-routes/BrandVariantCard';
import {
  BRAND_BANNER_IMAGE_HEIGHT,
  BRAND_BANNER_IMAGE_WIDTH,
  getBrandThemeVars,
  getProductCardEntries,
  getVariantLabel,
  withImageWidth,
} from '~/lib/brand-routes/utils';

export const BLACK_SHARK_SECTIONS = [
  {
    id: 'bsg1-gaming-tablet',
    headline: 'Black Shark BSG1 gaming tablet',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-gaming-tab-desk.jpg?v=1778528358',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-gaming-tab-mob.jpg?v=1778528355',
    productHandles: ['black-shark-gaming-tablet-12gb-ram-512gb-storage'],
  },
  {
    id: 'fan-coolers',
    headline: 'Black Shark fan coolers',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-cooler.jpg?v=1778528358',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-cooler-mob.jpg?v=1778528356',
    productHandles: [
      'black-shark-phone-cooler-5-pro',
      'black-shark-funcooler-5-magnetic-phone-cooler',
      'black-shark-funcooler-5-neo-phone-cooler',
    ],
  },
  {
    id: 'lifestyle-tablets',
    headline: 'Black Shark lifestyle tablets',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-pad-desk.jpg?v=1778528609',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-pad-mob.jpg?v=1778528608',
    productHandles: [
      'black-shark-pad-se-6gb-ram-128gb-storage',
      'black-shark-pad-7-6gb-ram-128gb-storage',
    ],
  },
  {
    id: 'smart-watches',
    headline: 'Black Shark smart watches',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-watch-desk.jpg?v=1778528358',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-watch-mob.jpg?v=1778528355',
    searchQueries: ['vendor:"Black Shark" tag:"Smart Watch"'],
  },
  {
    id: 'lifestyle-headphones',
    headline: 'Black Shark lifestyle headphones',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-ear-desk.jpg?v=1778528357',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-ear-mob.jpg?v=1778528355',
    searchQueries: ['vendor:"Black Shark" tag:audio'],
  },
  {
    id: 'gaming-gear',
    headline: 'Black Shark gaming gear',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/gs-gaming.jpg?v=1778528358',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/bs-gaming-mob.jpg?v=1778528355',
    searchQueries: [
      'vendor:"Black Shark" tag:"Gaming Keyboards"',
      'vendor:"Black Shark" tag:"Gaming Mouse"',
    ],
  },
];

export function BlackSharkBrandRoute({brand, collection, sections}) {
  const style = getBrandThemeVars(brand);

  return (
    <div
      className={`pz-brand-page pz-brand-page--${brand.layout} pz-brand-page--black-shark pz-brand-family--${brand.family}`}
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
        const isGamingTabletSection = section.id === 'bsg1-gaming-tablet';

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
                {sectionVariants.length ? (
                  isGamingTabletSection ? (
                    <div className="pz-black-shark-tablet-grid">
                      {sectionVariants.map(({product, variant}, index) => (
                        <BlackSharkTabletVariantCard
                          key={variant.id}
                          brand={brand}
                          product={product}
                          variant={variant}
                          loading={index < 2 ? 'eager' : 'lazy'}
                        />
                      ))}
                    </div>
                  ) : (
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
                  )
                ) : (
                  <div className="pz-brand-empty">
                    <h3>Products are being prepared.</h3>
                    <p>
                      This Black Shark section will appear as soon as matching
                      products are available.
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

function BlackSharkTabletVariantCard({brand, product, variant, loading}) {
  const variantUrl = useVariantUrl(
    product.handle,
    variant.selectedOptions || [],
  );
  const displayImage = variant.image || product.featuredImage;
  const imageUrl = displayImage?.url
    ? withImageWidth(displayImage.url, 900)
    : null;
  const label = getVariantLabel(variant);
  const {open} = useAside();

  return (
    <article className="pz-black-shark-tablet-card">
      <Link
        className="pz-black-shark-tablet-link"
        prefetch="intent"
        to={variantUrl}
      >
        <div className="pz-black-shark-tablet-media">
          {imageUrl ? (
            <img
              alt={displayImage.altText || `${product.title} ${label}`}
              loading={loading}
              src={imageUrl}
              width={900}
              height={900}
            />
          ) : (
            <div className="pz-image-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="pz-black-shark-tablet-copy">
          <div className="pz-product-topline">
            <span>
              {(brand.name || product.vendor || 'TECH').toUpperCase()}
            </span>
          </div>
          <h3>{product.title}</h3>
          <p className="pz-brand-variant-label">{label}</p>
          <div className="pz-black-shark-tablet-specs" aria-label="Highlights">
            <span>12GB RAM</span>
            <span>512GB Storage</span>
            <span>Gaming Display</span>
          </div>
        </div>
      </Link>

      <div className="pz-black-shark-tablet-actions">
        <div className="pz-product-price-row">
          {variant.price ? (
            <ProductPrice
              price={variant.price}
              compareAtPrice={variant.compareAtPrice || null}
            />
          ) : (
            <span className="pz-product-price-unavailable">N/A</span>
          )}
        </div>

        {variant.id ? (
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
            className="pz-black-shark-tablet-cart"
          >
            {variant.availableForSale ? 'Add to cart' : 'Unavailable'}
          </AddToCartButton>
        ) : null}
      </div>
    </article>
  );
}
