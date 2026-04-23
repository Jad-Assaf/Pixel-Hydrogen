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
import {hasCompareAtPrice, ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {
  ArrowIcon,
  PlusIcon,
  WishlistAddIcon,
  WishlistCheckedIcon,
} from '~/components/Icons';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {useWishlist} from '~/hooks/useWishlist';
import {StoreAssistantProductDropdown} from '~/components/StoreAssistantSection';
import {canonicalUrl} from '~/lib/canonical';
/* eslint-disable react/no-unknown-property */

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const product = data?.product;

  if (!product) {
    return [
      {title: 'Pixel Zones'},
      {property: 'og:site_name', content: 'Pixel Zones'},
      {property: 'og:type', content: 'website'},
      {property: 'og:title', content: 'Pixel Zones'},
      {name: 'twitter:card', content: 'summary'},
      {name: 'twitter:title', content: 'Pixel Zones'},
    ];
  }

  const seoTitle = product.seo?.title?.trim() || product.title || '';
  const title = seoTitle ? `Pixel Zones | ${seoTitle}` : 'Pixel Zones';
  const description = (product.seo?.description || product.description || '').trim();
  const url = canonicalUrl(`/products/${product.handle}`);
  const firstProductImage = product.images?.nodes?.[0] || null;
  const metaTags = [
    {title},
    {property: 'og:site_name', content: 'Pixel Zones'},
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: title},
    {property: 'og:url', content: url},
    {
      name: 'twitter:card',
      content: firstProductImage?.url ? 'summary_large_image' : 'summary',
    },
    {name: 'twitter:title', content: title},
    {tagName: 'link', rel: 'canonical', href: url},
  ];

  if (description) {
    metaTags.push(
      {name: 'description', content: description},
      {property: 'og:description', content: description},
      {name: 'twitter:description', content: description},
    );
  }

  if (firstProductImage?.url) {
    metaTags.push(
      {property: 'og:image', content: firstProductImage.url},
      {name: 'twitter:image', content: firstProductImage.url},
    );
  }

  if (firstProductImage?.altText) {
    metaTags.push(
      {property: 'og:image:alt', content: firstProductImage.altText},
      {name: 'twitter:image:alt', content: firstProductImage.altText},
    );
  }

  if (firstProductImage?.width) {
    metaTags.push({
      property: 'og:image:width',
      content: String(firstProductImage.width),
    });
  }

  if (firstProductImage?.height) {
    metaTags.push({
      property: 'og:image:height',
      content: String(firstProductImage.height),
    });
  }

  return metaTags;
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
  const {hasHandle, toggleHandle} = useWishlist();

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
  const [quantity, setQuantity] = useState(1);
  const relatedCarouselRef = useRef(null);
  const mainMediaRef = useRef(null);
  const mainTouchStartX = useRef(null);
  const lightboxTouchStartX = useRef(null);
  const isWishlisted = hasHandle(product.handle);
  const showMobileCompareAtPrice = hasCompareAtPrice(
    selectedVariant?.price,
    selectedVariant?.compareAtPrice,
  );

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

      setShowMobileStickyCart(window.scrollY >= 100);
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
            quantity={quantity}
          />

          <div className="pz-product-quantity-row pz-product-quantity-row--desktop">
            <span className="pz-product-quantity-label">Quantity:</span>
            <div className="pz-product-quantity-control">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                aria-label="Increase quantity"
                disabled={quantity >= 99}
              >
                +
              </button>
            </div>
          </div>

          <div className="pz-product-price">
            <div className="pz-product-price-line">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
                suffix="TTC"
              />
              <div className="pz-product-warranty-badge">1 year warranty</div>
            </div>
          </div>

          {product?.handle ? (
            <button
              type="button"
              className={`pz-product-page-wishlist-btn${
                isWishlisted ? ' is-active' : ''
              }`}
              onClick={() => toggleHandle(product.handle)}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
            >
              {isWishlisted ? (
                <WishlistCheckedIcon className="pz-product-page-wishlist-icon" />
              ) : (
                <WishlistAddIcon className="pz-product-page-wishlist-icon" />
              )}
              <span>{isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
            </button>
          ) : null}

          <div className="pz-product-availability">
            {product.vendor ? (
              <p>
                <span>Brand:</span> {product.vendor}
              </p>
            ) : null}
            {selectedVariant?.sku ? (
              <>
                <p>
                  <span>SKU:</span> {selectedVariant.sku}
                </p>
                <p className="pz-product-tax-note">Tax Included</p>
              </>
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
                  <p className="pz-product-description">
                    {product.description}
                  </p>
                )}
              </div>
            </div>
          </section>

          <StoreAssistantProductDropdown />

          <div className="pz-product-help-sections">
            <section
              className="pz-product-help-card"
              aria-label="How to check availability"
            >
              <div className="pz-product-help-title">
                <svg
                  className="pz-product-help-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z"
                    fill="currentColor"
                  />
                  <path
                    d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z"
                    fill="currentColor"
                  />
                </svg>
                <h3>How to Check Availability</h3>
              </div>
              <p className="pz-product-help-copy">
                Tap &quot;Check availability&quot; to confirm whether this item is
                in stock at our showroom or available exclusively online.
              </p>
            </section>

            <section className="pz-product-help-card" aria-label="How to order">
              <div className="pz-product-help-title">
                <svg
                  className="pz-product-help-icon"
                  viewBox="0 0 1024 1024"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M959.018 208.158c0.23-2.721 0.34-5.45 0.34-8.172 0-74.93-60.96-135.89-135.89-135.89-1.54 0-3.036 0.06-6.522 0.213l-611.757-0.043c-1.768-0.085-3.563-0.17-5.424-0.17-74.812 0-135.67 60.84-135.67 135.712l0.188 10.952h-0.306l0.391 594.972-0.162 20.382c0 74.03 60.22 134.25 134.24 134.25 1.668 0 7.007-0.239 7.1-0.239l608.934 0.085c2.985 0.357 6.216 0.468 9.55 0.468 35.815 0 69.514-13.954 94.879-39.302 25.373-25.34 39.344-58.987 39.344-94.794l-0.145-12.015h0.918l-0.008-606.41z m-757.655 693.82l-2.585-0.203c-42.524 0-76.146-34.863-76.537-79.309V332.671H900.79l0.46 485.186-0.885 2.865c-0.535 1.837-0.8 3.58-0.8 5.17 0 40.382-31.555 73.766-71.852 76.002l-10.816 0.621v-0.527l-615.533-0.01zM900.78 274.424H122.3l-0.375-65.934 0.85-2.924c0.52-1.82 0.782-3.63 0.782-5.247 0-42.236 34.727-76.665 78.179-76.809l0.45-0.068 618.177 0.018 2.662 0.203c42.329 0 76.767 34.439 76.767 76.768 0 1.326 0.196 2.687 0.655 4.532l0.332 0.884v68.577z"
                    fill="currentColor"
                  />
                  <path
                    d="M697.67 471.435c-7.882 0-15.314 3.078-20.918 8.682l-223.43 223.439L346.599 596.84c-5.544-5.603-12.95-8.69-20.842-8.69s-15.323 3.078-20.918 8.665c-5.578 5.518-8.674 12.9-8.7 20.79-0.017 7.908 3.07 15.357 8.69 20.994l127.55 127.558c5.57 5.56 13.01 8.622 20.943 8.622 7.925 0 15.364-3.06 20.934-8.63l244.247-244.247c5.578-5.511 8.674-12.883 8.7-20.783 0.017-7.942-3.079-15.408-8.682-20.986-5.552-5.612-12.958-8.698-20.85-8.698z"
                    fill="currentColor"
                  />
                </svg>
                <h3>How to order?</h3>
              </div>
              <ul className="pz-product-help-list">
                <li>Click on &quot;Add to Cart&quot;</li>
                <li>Click on &quot;Continue to Checkout&quot;</li>
                <li>Fill in information</li>
                <li>Click on Complete order</li>
                <li>
                  Ordering through the website will allow us to processes your
                  order faster and thus faster delivery.
                </li>
              </ul>
            </section>

            <section className="pz-product-help-card" aria-label="Delivery">
              <div className="pz-product-help-title">
                <svg
                  className="pz-product-help-icon"
                  viewBox="0 0 30 30"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M15.48 12c-.13.004-.255.058-.347.152l-2.638 2.63-1.625-1.62c-.455-.474-1.19.258-.715.712l1.983 1.978c.197.197.517.197.715 0l2.995-2.987c.33-.32.087-.865-.367-.865zM.5 16h3c.277 0 .5.223.5.5s-.223.5-.5.5h-3c-.277 0-.5-.223-.5-.5s.223-.5.5-.5zm0-4h3c.277 0 .5.223.5.5s-.223.5-.5.5h-3c-.277 0-.5-.223-.5-.5s.223-.5.5-.5zm0-4h3c.277 0 .5.223.5.5s-.223.5-.5.5h-3C.223 9 0 8.777 0 8.5S.223 8 .5 8zm24 11c-1.375 0-2.5 1.125-2.5 2.5s1.125 2.5 2.5 2.5 2.5-1.125 2.5-2.5-1.125-2.5-2.5-2.5zm0 1c.834 0 1.5.666 1.5 1.5s-.666 1.5-1.5 1.5-1.5-.666-1.5-1.5.666-1.5 1.5-1.5zm-13-1C10.125 19 9 20.125 9 21.5s1.125 2.5 2.5 2.5 2.5-1.125 2.5-2.5-1.125-2.5-2.5-2.5zm0 1c.834 0 1.5.666 1.5 1.5s-.666 1.5-1.5 1.5-1.5-.666-1.5-1.5.666-1.5 1.5-1.5zm-5-14C5.678 6 5 6.678 5 7.5v11c0 .822.678 1.5 1.5 1.5h2c.676.01.676-1.01 0-1h-2c-.286 0-.5-.214-.5-.5v-11c0-.286.214-.5.5-.5h13c.286 0 .5.214.5.5V19h-5.5c-.66 0-.648 1.01 0 1h7c.66 0 .654-1 0-1H21v-9h4.227L29 15.896V18.5c0 .286-.214.5-.5.5h-1c-.654 0-.654 1 0 1h1c.822 0 1.5-.678 1.5-1.5v-2.75c0-.095-.027-.19-.078-.27l-4-6.25c-.092-.143-.25-.23-.422-.23H21V7.5c0-.822-.678-1.5-1.5-1.5z"
                    fill="currentColor"
                  />
                </svg>
                <h3>Delivery</h3>
              </div>
              <ul className="pz-product-help-list">
                <li>
                  Order today and receive same-day delivery in Beirut, and
                  within 2-3 working days outside Beirut.
                </li>
                <li>Cash on delivery</li>
                <li>Delivery all over Lebanon</li>
                <li>Delivery will contact you ahead of time before delivery</li>
              </ul>
            </section>
          </div>
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
            <h3 id="pz-availability-title">Available at:</h3>
            <ul className="pz-availability-options">
              <li>
                <span
                  className={`pz-availability-dot${
                    isStoreOpenNow ? ' is-open' : ' is-closed'
                  }`}
                  aria-hidden="true"
                />
                <div className="pz-availability-option-text">
                  <p>
                    Sami Solh Avenu, Beirut, &nbsp;
                    <span
                      className={`pz-availability-status${
                        isStoreOpenNow ? ' is-open' : ' is-closed'
                      }`}
                    >
                      {isStoreOpenNow ? 'Open' : 'Closed'}
                    </span>
                  </p>
                </div>
              </li>
              <li>
                <span className="pz-availability-dot" aria-hidden="true" />
                <span>Available Online</span>
              </li>
            </ul>
          </div>
        </div>
      ) : null}

      <div
        className={`pz-product-mobile-cart-nav${showMobileStickyCart ? ' is-visible' : ''}`}
        aria-label="Product mobile add to cart"
      >
        <div className="pz-product-mobile-cart-inner">
          <div
            className="pz-product-mobile-quantity-control"
            role="group"
            aria-label="Select quantity"
          >
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span aria-live="polite">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.min(99, current + 1))}
              aria-label="Increase quantity"
              disabled={quantity >= 99}
            >
              +
            </button>
          </div>

          {selectedVariant?.id ? (
            <AddToCartButton
              disabled={!selectedVariant.availableForSale}
              onClick={() => open('cart')}
              lines={[
                {
                  merchandiseId: selectedVariant.id,
                  quantity,
                  selectedVariant,
                },
              ]}
              className="pz-product-mobile-cart-btn"
            >
              <span className="pz-product-mobile-cart-label">
                {selectedVariant.availableForSale ? 'Add to Cart' : 'Sold out'}
              </span>
              <span
                className={`pz-product-mobile-cart-price${
                  showMobileCompareAtPrice ? ' is-on-sale' : ''
                }`}
              >
                {selectedVariant.price ? (
                  <span className="pz-product-mobile-cart-current">
                    <Money data={selectedVariant.price} />
                    <span className="pz-product-mobile-cart-suffix">TTC</span>
                  </span>
                ) : (
                  ''
                )}
                {showMobileCompareAtPrice ? (
                  <s className="pz-product-mobile-cart-compare-at">
                    <Money data={selectedVariant.compareAtPrice} />
                  </s>
                ) : null}
              </span>
            </AddToCartButton>
          ) : null}
        </div>
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
              quantity,
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
        compareAtPrice {
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
          compareAtPrice {
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
