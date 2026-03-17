import {Await, Link, useLoaderData} from 'react-router';
import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  Money,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {ArrowIcon, PlusIcon} from '~/components/Icons';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
/* eslint-disable react/no-unknown-property */

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [
    {title: `Pixel Zones | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const criticalData = await loadCriticalData(args);
  const deferredData = loadDeferredData(args, criticalData);

  return {...criticalData, ...deferredData};
}

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}, {product}) {
  const {storefront} = context;

  if (!product?.id) {
    return {};
  }

  const recommendedProducts = storefront
    .query(RECOMMENDED_PRODUCTS_QUERY, {
      variables: {productId: product.id},
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {recommendedProducts};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, recommendedProducts} = useLoaderData();
  const {open} = useAside();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const variantImage = selectedVariant?.image ?? null;
  const variantImageId = variantImage?.id || null;

  const images = useMemo(() => {
    const baseImages = product.images?.nodes ?? [];
    if (!variantImage) return baseImages;
    const exists = baseImages.some((image) => image.id === variantImage.id);
    return exists ? baseImages : [variantImage, ...baseImages];
  }, [product.images, variantImage]);
  const mainImageUrls = useMemo(
    () => images.map((image) => withImageWidth(image.url, 900)),
    [images],
  );
  const lightboxImageUrls = useMemo(
    () => images.map((image) => withImageWidth(image.url, 1600)),
    [images],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isAvailabilityVisible, setIsAvailabilityVisible] = useState(false);
  const [showMobileStickyCart, setShowMobileStickyCart] = useState(false);
  const [isStoreOpenNow, setIsStoreOpenNow] = useState(() => getBeirutStoreStatus());
  const relatedCarouselRef = useRef(null);
  const mainMediaRef = useRef(null);
  const mainTouchStartX = useRef(null);
  const lightboxTouchStartX = useRef(null);

  useEffect(() => {
    if (!variantImageId) return;

    const matchIndex = images.findIndex((image) => image.id === variantImageId);
    if (matchIndex >= 0) {
      setActiveIndex((current) => (current === matchIndex ? current : matchIndex));
    }
  }, [variantImageId, images]);

  useEffect(() => {
    if (activeIndex >= images.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (lightboxIndex >= images.length) {
      setLightboxIndex(0);
    }
  }, [lightboxIndex, images.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
        return;
      }

      if (event.key === 'ArrowRight' && images.length > 1) {
        setLightboxIndex((prev) => (prev + 1) % images.length);
      }

      if (event.key === 'ArrowLeft' && images.length > 1) {
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isLightboxOpen, images.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const preloaded = mainImageUrls.map((src) => {
      const image = new window.Image();
      image.decoding = 'async';
      image.src = src;
      return image;
    });
    const preloadedLightbox = lightboxImageUrls.map((src) => {
      const image = new window.Image();
      image.decoding = 'async';
      image.src = src;
      return image;
    });

    return () => {
      preloaded.forEach((image) => {
        image.src = '';
      });
      preloadedLightbox.forEach((image) => {
        image.src = '';
      });
    };
  }, [lightboxImageUrls, mainImageUrls]);

  useEffect(() => {
    const updateAvailability = () => {
      setIsStoreOpenNow(getBeirutStoreStatus());
    };

    updateAvailability();
    const interval = setInterval(updateAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isAvailabilityOpen) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAvailability();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isAvailabilityOpen]);

  useEffect(() => {
    if (!isAvailabilityVisible || isAvailabilityOpen) return;

    const timeoutId = setTimeout(() => {
      setIsAvailabilityVisible(false);
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [isAvailabilityOpen, isAvailabilityVisible]);

  useEffect(() => {
    const updateStickyCartState = () => {
      if (typeof window === 'undefined' || window.innerWidth > 600) {
        setShowMobileStickyCart(false);
        return;
      }

      const mainMedia = mainMediaRef.current;
      if (!mainMedia) {
        setShowMobileStickyCart(false);
        return;
      }

      const rect = mainMedia.getBoundingClientRect();
      setShowMobileStickyCart(rect.bottom <= 76);
    };

    updateStickyCartState();
    window.addEventListener('scroll', updateStickyCartState, {passive: true});
    window.addEventListener('resize', updateStickyCartState);

    return () => {
      window.removeEventListener('scroll', updateStickyCartState);
      window.removeEventListener('resize', updateStickyCartState);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.body.classList.toggle('pz-mobile-cart-active', showMobileStickyCart);

    return () => {
      document.body.classList.remove('pz-mobile-cart-active');
    };
  }, [showMobileStickyCart]);

  function scrollRelated(direction) {
    if (!relatedCarouselRef.current) return;

    const amount = relatedCarouselRef.current.clientWidth * 0.85;
    relatedCarouselRef.current.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;
  const showPreviousMainImage = () =>
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  const showNextMainImage = () =>
    setActiveIndex((prev) => (prev + 1) % images.length);
  const showPreviousLightboxImage = () =>
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  const showNextLightboxImage = () =>
    setLightboxIndex((prev) => (prev + 1) % images.length);

  const onMainTouchStart = (event) => {
    mainTouchStartX.current = event.changedTouches?.[0]?.clientX ?? null;
  };
  const onMainTouchEnd = (event) => {
    const startX = mainTouchStartX.current;
    if (startX == null || !hasMultipleImages) return;
    const endX = event.changedTouches?.[0]?.clientX ?? startX;
    const delta = endX - startX;
    mainTouchStartX.current = null;
    if (Math.abs(delta) < 36) return;
    if (delta > 0) {
      showPreviousMainImage();
      return;
    }
    showNextMainImage();
  };

  const onLightboxTouchStart = (event) => {
    lightboxTouchStartX.current = event.changedTouches?.[0]?.clientX ?? null;
  };
  const onLightboxTouchEnd = (event) => {
    const startX = lightboxTouchStartX.current;
    if (startX == null || !hasMultipleImages) return;
    const endX = event.changedTouches?.[0]?.clientX ?? startX;
    const delta = endX - startX;
    lightboxTouchStartX.current = null;
    if (Math.abs(delta) < 36) return;
    if (delta > 0) {
      showPreviousLightboxImage();
      return;
    }
    showNextLightboxImage();
  };

  const openLightbox = () => {
    setLightboxIndex(activeIndex);
    setIsLightboxOpen(true);
  };
  const openAvailability = () => {
    setIsAvailabilityVisible(true);
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => setIsAvailabilityOpen(true));
      return;
    }
    setIsAvailabilityOpen(true);
  };
  const closeAvailability = () => {
    setIsAvailabilityOpen(false);
  };

  return (
    <div className="pz-product-page">
      <nav className="pz-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/collections/new-arrivals" prefetch="intent">
          Shop
        </Link>
        <span>/</span>
        <Link to="/collections" prefetch="intent">
          Collections
        </Link>
        <span>/</span>
        <span>{product.title}</span>
      </nav>

      <div className="pz-product-layout">
        <section className="pz-product-gallery">
          <div className="pz-product-main-media" ref={mainMediaRef}>
            {hasImages ? (
              <button
                type="button"
                className="pz-product-main-media-stack pz-product-main-media-trigger"
                onClick={openLightbox}
                onTouchStart={onMainTouchStart}
                onTouchEnd={onMainTouchEnd}
                aria-label="Open product image gallery"
              >
                {images.map((image, index) => (
                  <img
                    key={image.id || image.url}
                    className={`pz-product-main-image${index === activeIndex ? ' is-active' : ''}`}
                    src={mainImageUrls[index]}
                    alt={image.altText || product.title}
                    width={900}
                    height={700}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    fetchpriority={index === activeIndex ? 'high' : 'auto'}
                  />
                ))}
              </button>
            ) : (
              <div className="pz-image-placeholder" aria-hidden="true" />
            )}

            {hasMultipleImages ? (
              <>
                <button
                  type="button"
                  className="pz-product-gallery-arrow is-prev"
                  onClick={showPreviousMainImage}
                  aria-label="Previous image"
                >
                  <ArrowIcon direction="left" />
                </button>
                <button
                  type="button"
                  className="pz-product-gallery-arrow is-next"
                  onClick={showNextMainImage}
                  aria-label="Next image"
                >
                  <ArrowIcon direction="right" />
                </button>
              </>
            ) : null}
          </div>

          {hasMultipleImages ? (
            <div className="pz-product-thumbs">
              <div className="pz-product-thumbs-track">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image.id || `${image.url}-${index}`}
                    className={index === activeIndex ? 'is-active' : ''}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={withImageWidth(image.url, 180)}
                      alt={image.altText || product.title}
                      width={120}
                      height={120}
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="pz-product-info">
          <h1>{product.title}</h1>

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />

          <div className="pz-product-price">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>

          <div className="pz-product-availability">
            {selectedVariant?.sku ? (
              <p>
                <span>SKU:</span> {selectedVariant.sku}
              </p>
            ) : null}
            <button
              type="button"
              className="pz-product-availability-toggle"
              onClick={openAvailability}
              aria-haspopup="dialog"
              aria-expanded={isAvailabilityOpen}
            >
              <span>Check availability</span>
              <PlusIcon className="pz-product-availability-toggle-icon" />
            </button>
          </div>

          <section
            className={`pz-product-description-accordion${
              isDescriptionOpen ? ' is-open' : ''
            }`}
          >
            <button
              type="button"
              className="pz-product-description-toggle"
              onClick={() => setIsDescriptionOpen((current) => !current)}
              aria-expanded={isDescriptionOpen}
              aria-controls="pz-product-description-panel"
            >
              <span>Description</span>
              <PlusIcon className="pz-product-description-toggle-icon" />
            </button>
            <div
              className="pz-product-description-collapse"
              id="pz-product-description-panel"
              aria-hidden={!isDescriptionOpen}
            >
              <div className="pz-product-description-box">
                {product.descriptionHtml ? (
                  <div
                    className="pz-product-description"
                    dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
                  />
                ) : (
                  <p className="pz-product-description">{product.description}</p>
                )}
              </div>
            </div>
          </section>
        </section>
      </div>

      <Suspense fallback={null}>
        <Await resolve={recommendedProducts}>
          {(data) => {
            const products = data?.productRecommendations || [];
            if (!products.length) return null;

            return (
              <section className="pz-product-section">
                <div className="pz-section-head">
                  <div>
                    <p className="pz-kicker">You may also like</p>
                    <h2>Related Products</h2>
                  </div>
                  <div className="pz-carousel-controls">
                    <button
                      type="button"
                      className="pz-carousel-btn"
                      onClick={() => scrollRelated('prev')}
                      aria-label="Previous related products"
                    >
                      <ArrowIcon direction="left" />
                      <span className="sr-only">Previous</span>
                    </button>
                    <button
                      type="button"
                      className="pz-carousel-btn"
                      onClick={() => scrollRelated('next')}
                      aria-label="Next related products"
                    >
                      <ArrowIcon direction="right" />
                      <span className="sr-only">Next</span>
                    </button>
                  </div>
                </div>

                <div
                  className="pz-product-carousel pz-related-carousel"
                  ref={relatedCarouselRef}
                >
                  {products.map((item) => (
                    <div
                      key={item.id}
                      className="pz-product-carousel-item pz-related-carousel-item"
                    >
                      <ProductItem product={item} />
                    </div>
                  ))}
                </div>
              </section>
            );
          }}
        </Await>
      </Suspense>

      {isLightboxOpen && hasImages ? (
        <div
          className="pz-image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Product image gallery"
        >
          <button
            type="button"
            className="pz-image-lightbox-backdrop"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close gallery"
          />
          <div className="pz-image-lightbox-panel">
            <button
              type="button"
              className="pz-image-lightbox-close"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close gallery"
            >
              ×
            </button>

            <div
              className="pz-image-lightbox-media"
              onTouchStart={onLightboxTouchStart}
              onTouchEnd={onLightboxTouchEnd}
            >
              {images.map((image, index) => (
                <img
                  key={`lightbox-${image.id || image.url}`}
                  className={`pz-image-lightbox-main-image${
                    index === lightboxIndex ? ' is-active' : ''
                  }`}
                  src={lightboxImageUrls[index]}
                  alt={image.altText || product.title}
                  width={1600}
                  height={1300}
                  loading={index === lightboxIndex ? 'eager' : 'lazy'}
                  fetchpriority={index === lightboxIndex ? 'high' : 'auto'}
                />
              ))}
            </div>

            {hasMultipleImages ? (
              <>
                <button
                  type="button"
                  className="pz-image-lightbox-arrow is-prev"
                  onClick={showPreviousLightboxImage}
                  aria-label="Previous image"
                >
                  <ArrowIcon direction="left" />
                </button>
                <button
                  type="button"
                  className="pz-image-lightbox-arrow is-next"
                  onClick={showNextLightboxImage}
                  aria-label="Next image"
                >
                  <ArrowIcon direction="right" />
                </button>
              </>
            ) : null}

            {hasMultipleImages ? (
              <div className="pz-image-lightbox-thumbs">
                <div className="pz-image-lightbox-thumbs-track">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={`lightbox-thumb-${image.id || image.url}`}
                      className={index === lightboxIndex ? 'is-active' : ''}
                      onClick={() => setLightboxIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={withImageWidth(image.url, 180)}
                        alt={image.altText || product.title}
                        width={90}
                        height={90}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isAvailabilityVisible ? (
        <div
          className={`pz-availability-overlay${isAvailabilityOpen ? ' is-open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pz-availability-title"
          aria-hidden={!isAvailabilityOpen}
        >
          <button
            type="button"
            className="pz-availability-overlay-backdrop"
            onClick={closeAvailability}
            aria-label="Close availability modal"
          />
          <div className="pz-availability-modal">
            <button
              type="button"
              className="pz-availability-close"
              onClick={closeAvailability}
              aria-label="Close availability modal"
            >
              ×
            </button>
            <h3 id="pz-availability-title">Check availability</h3>
            <p>Sami Solh Avenu</p>
            <p>Beirut</p>
            <p
              className={`pz-availability-status${
                isStoreOpenNow ? ' is-open' : ' is-closed'
              }`}
            >
              {isStoreOpenNow ? 'Open' : 'Showroom Closed'}
            </p>
          </div>
        </div>
      ) : null}

      <div
        className={`pz-product-mobile-cart-nav${showMobileStickyCart ? ' is-visible' : ''}`}
        aria-label="Product mobile add to cart"
      >
        {selectedVariant?.id ? (
          <AddToCartButton
            disabled={!selectedVariant.availableForSale}
            onClick={() => open('cart')}
            lines={[
              {
                merchandiseId: selectedVariant.id,
                quantity: 1,
                selectedVariant,
              },
            ]}
            className="pz-product-mobile-cart-btn"
          >
            <span className="pz-product-mobile-cart-label">
              {selectedVariant.availableForSale ? 'Add to Cart' : 'Sold out'}
            </span>
            <span className="pz-product-mobile-cart-price">
              {selectedVariant.price ? (
                <Money data={selectedVariant.price} />
              ) : (
                ''
              )}
            </span>
          </AddToCartButton>
        ) : null}
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price?.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

function withImageWidth(url, width) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}

function getBeirutStoreStatus(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Beirut',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || '0');
  const minute = Number(
    parts.find((part) => part.type === 'minute')?.value || '0',
  );
  const minutesSinceMidnight = hour * 60 + minute;

  return minutesSinceMidnight >= 10 * 60 && minutesSinceMidnight < 20 * 60;
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query RecommendedProducts($productId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
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
          amount
          currencyCode
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
          amount
          currencyCode
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
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/* eslint-enable react/no-unknown-property */
