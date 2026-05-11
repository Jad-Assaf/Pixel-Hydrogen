import {Analytics} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {PlusIcon} from '~/components/Icons';
import {ProductItem} from '~/components/ProductItem';
import {ProductPrice} from '~/components/ProductPrice';
import {useAside} from '~/components/Aside';
import {useVariantUrl} from '~/lib/variants';
import {formatBrandCollectionHandle, getBrandByHandle} from '~/lib/brands';
import brandRouteStyles from '~/styles/brands-handle.css?url';

const BRAND_PRODUCTS_PAGE_SIZE = 100;
const BEATS_SECTIONS = [
  {
    id: 'powerbeats-pro-2',
    bannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/1x-1.webp?v=1778178367',
    mobileBannerUrl:
      'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/power.jpg?v=1778219364',
    eyebrow: 'Powerbeats Pro 2',
    headline: 'Built for athletes.',
    splitVariantsBy: 'color',
    productHandles: ['beats-powerbeats-pro-2-high-performance-earbuds'],
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
const BLACK_SHARK_SECTIONS = [
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

export function links() {
  return [{rel: 'stylesheet', href: brandRouteStyles}];
}

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

  if (brand.handle === 'beats') {
    const beatsProducts = await loadBrandProducts(
      storefront,
      BEATS_SECTIONS.flatMap((section) => section.productHandles),
    );

    return {
      brand,
      beatsProducts,
    };
  }

  if (brand.handle === 'black-shark') {
    const blackSharkSections = await loadBlackSharkSections(storefront);
    const collection = await loadBrandCollection(storefront, brand);

    return {
      brand,
      collection,
      blackSharkSections,
    };
  }

  const collection = await loadBrandCollection(storefront, brand);

  return {
    brand,
    collection,
    products: collection?.products?.nodes || [],
  };
}

export default function BrandRoute() {
  const data = useLoaderData();

  if (data.brand.handle === 'beats') {
    return <BeatsBrandRoute brand={data.brand} products={data.beatsProducts} />;
  }

  if (data.brand.handle === 'black-shark') {
    return (
      <BlackSharkBrandRoute
        brand={data.brand}
        collection={data.collection}
        sections={data.blackSharkSections || []}
      />
    );
  }

  return (
    <GenericBrandRoute
      brand={data.brand}
      collection={data.collection}
      products={data.products || []}
    />
  );
}

function BlackSharkBrandRoute({brand, collection, sections}) {
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

      <header className="pz-brand-hero">
        <div className="pz-shell pz-brand-hero-shell">
          <div className="pz-brand-hero-copy">
            <p className="pz-brand-eyebrow">{brand.eyebrow}</p>
            <h1>{brand.name}</h1>
            <p className="pz-brand-headline">{brand.headline}</p>
            <p className="pz-brand-summary">{brand.summary}</p>
          </div>

          <div className="pz-brand-stage" aria-hidden="true">
            <div className="pz-brand-stage-panel">
              <div className="pz-brand-stage-grid" />
              <div className="pz-brand-stage-logo">
                <img src={brand.logo} alt="" loading="eager" />
              </div>
            </div>
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
                        <BeatsVariantCard
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

function BeatsBrandRoute({brand, products}) {
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
                      <BeatsVariantCard
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

function BeatsVariantCard({
  brand,
  product,
  variant,
  loading,
  showVariantLabel = true,
}) {
  const variantUrl = useVariantUrl(
    product.handle,
    variant.selectedOptions || [],
  );
  const displayImage = variant.image || product.featuredImage;
  const imageUrl = displayImage?.url
    ? withImageWidth(displayImage.url, 600)
    : null;
  const label = getVariantLabel(variant);
  const {open} = useAside();

  return (
    <article className="pz-product-card pz-brand-variant-card">
      <Link className="pz-product-card-link" prefetch="intent" to={variantUrl}>
        <div className="pz-product-media">
          {imageUrl ? (
            <img
              alt={displayImage.altText || `${product.title} ${label}`}
              className="pz-product-image"
              loading={loading}
              src={imageUrl}
              width={500}
              height={500}
            />
          ) : (
            <div className="pz-image-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="pz-product-meta">
          <div className="pz-product-topline">
            <span>
              {(brand.name || product.vendor || 'TECH').toUpperCase()}
            </span>
          </div>
          <h3>{product.title}</h3>
          {showVariantLabel ? (
            <p className="pz-brand-variant-label">{label}</p>
          ) : null}
        </div>
      </Link>

      <div className="pz-product-card-footer">
        <div className="pz-product-variant-slot" />
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
          className="pz-card-cart-btn"
        >
          {variant.availableForSale ? (
            <PlusIcon className="pz-card-cart-icon" />
          ) : (
            '×'
          )}
        </AddToCartButton>
      ) : null}
    </article>
  );
}

function GenericBrandRoute({brand, collection, products}) {
  const collectionPath = collection?.handle
    ? `/collections/${collection.handle}`
    : `/search?q=${encodeURIComponent(brand.name)}`;
  const primaryActionLabel = collection
    ? `Shop ${brand.name}`
    : `Search ${brand.name}`;
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
              <Link
                to={collectionPath}
                prefetch="intent"
                className="pz-brand-cta"
              >
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
              {products.map((productItem, index) => (
                <ProductItem
                  key={productItem.id}
                  product={productItem}
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
              <Link
                to={`/search?q=${encodeURIComponent(brand.name)}`}
                prefetch="intent"
              >
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

async function loadBrandProducts(storefront, handles) {
  const uniqueHandles = [...new Set((handles || []).filter(Boolean))];
  const results = await Promise.all(
    uniqueHandles.map((handle) =>
      storefront
        .query(BRAND_FEATURED_PRODUCT_QUERY, {
          cache: storefront.CacheShort(),
          variables: {handle},
        })
        .catch(() => null),
    ),
  );

  return results.map((result) => result?.product).filter(Boolean);
}

async function loadBlackSharkSections(storefront) {
  const loadedSections = await Promise.all(
    BLACK_SHARK_SECTIONS.map(async (section) => {
      const [handleProducts, searchProducts] = await Promise.all([
        section.productHandles?.length
          ? loadBrandProducts(storefront, section.productHandles)
          : Promise.resolve([]),
        section.searchQueries?.length
          ? loadBrandSearchProducts(storefront, section.searchQueries)
          : Promise.resolve([]),
      ]);

      return {
        ...section,
        products: mergeProducts(handleProducts, searchProducts),
      };
    }),
  );

  return loadedSections;
}

async function loadBrandSearchProducts(storefront, queries) {
  const results = await Promise.all(
    (queries || []).filter(Boolean).map((query) =>
      storefront
        .query(BRAND_SEARCH_PRODUCTS_QUERY, {
          cache: storefront.CacheShort(),
          variables: {
            query,
            first: 24,
          },
        })
        .catch(() => null),
    ),
  );

  return mergeProducts(
    [],
    results.flatMap((result) => result?.products?.nodes || []),
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
    after = connection?.pageInfo?.hasNextPage
      ? connection.pageInfo.endCursor
      : null;
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
    const normalized =
      typeof handle === 'string' ? handle.trim().toLowerCase() : '';
    if (!normalized) return false;
    return (
      candidates.findIndex((candidate) => {
        const value =
          typeof candidate === 'string' ? candidate.trim().toLowerCase() : '';
        return value === normalized;
      }) === index
    );
  });
}

function getVariantLabel(variant) {
  const colorOption = (variant?.selectedOptions || []).find((option) =>
    /colou?r/i.test(option?.name || ''),
  );

  if (colorOption?.value) return colorOption.value;
  if (variant?.title && variant.title !== 'Default Title') return variant.title;
  return 'Variant';
}

function getColorOptionValue(variant) {
  return (
    (variant?.selectedOptions || []).find((option) =>
      /colou?r/i.test(option?.name || ''),
    )?.value || null
  );
}

function getProductCardEntries(product, splitVariantsBy = 'color') {
  const variants = (product?.variants?.nodes || []).filter(
    (variant) => variant?.id,
  );
  const fallbackVariant =
    product?.selectedOrFirstAvailableVariant || variants[0] || null;

  if (splitVariantsBy !== 'color') {
    return fallbackVariant ? [fallbackVariant] : [];
  }

  const seenColors = new Set();
  const colorVariants = variants.filter((variant) => {
    const colorValue = getColorOptionValue(variant);
    if (!colorValue) return false;
    const colorKey = colorValue.toLowerCase();
    if (seenColors.has(colorKey)) return false;
    seenColors.add(colorKey);
    return true;
  });

  if (colorVariants.length) {
    return colorVariants;
  }

  return fallbackVariant ? [fallbackVariant] : [];
}

function mergeProducts(currentProducts, nextProducts) {
  const seen = new Set();
  return [...(currentProducts || []), ...(nextProducts || [])].filter(
    (product) => {
      if (!product?.id || seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    },
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

function withImageWidth(url, width) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}

const MONEY_FRAGMENT = `#graphql
  fragment BrandMoney on MoneyV2 {
    amount
    currencyCode
  }
`;

const PRODUCT_VARIANT_CARD_FRAGMENT = `#graphql
  fragment BrandVariantProduct on Product {
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
        ...BrandMoney
      }
      maxVariantPrice {
        ...BrandMoney
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
        ...BrandMoney
      }
      compareAtPrice {
        ...BrandMoney
      }
    }
    variants(first: 50) {
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
          ...BrandMoney
        }
        compareAtPrice {
          ...BrandMoney
        }
      }
    }
  }
`;

const BRAND_SEARCH_PRODUCTS_QUERY = `#graphql
  ${MONEY_FRAGMENT}
  ${PRODUCT_VARIANT_CARD_FRAGMENT}

  query BrandSearchProducts(
    $country: CountryCode
    $language: LanguageCode
    $query: String!
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    products: search(
      query: $query,
      first: $first,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE
    ) {
      nodes {
        ...on Product {
          ...BrandVariantProduct
        }
      }
    }
  }
`;

const BRAND_FEATURED_PRODUCT_QUERY = `#graphql
  ${MONEY_FRAGMENT}
  ${PRODUCT_VARIANT_CARD_FRAGMENT}

  query BrandFeaturedProduct(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...BrandVariantProduct
    }
  }
`;

const BRAND_COLLECTION_QUERY = `#graphql
  ${MONEY_FRAGMENT}

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
        ...BrandMoney
      }
      maxVariantPrice {
        ...BrandMoney
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
        ...BrandMoney
      }
      compareAtPrice {
        ...BrandMoney
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
          ...BrandMoney
        }
        compareAtPrice {
          ...BrandMoney
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
