import {Await, Link, useLoaderData} from 'react-router';
import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const relatedCarouselRef = useRef(null);

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
    if (!isLightboxOpen) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLightboxOpen(false);
        return;
      }

      if (event.key === 'ArrowRight' && images.length > 1) {
        setActiveIndex((prev) => (prev + 1) % images.length);
      }

      if (event.key === 'ArrowLeft' && images.length > 1) {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
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

    return () => {
      preloaded.forEach((image) => {
        image.src = '';
      });
    };
  }, [mainImageUrls]);

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
  const showPreviousImage = () =>
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  const showNextImage = () =>
    setActiveIndex((prev) => (prev + 1) % images.length);

  return (
    <div className="pz-product-page">
      <nav className="pz-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/shop" prefetch="intent">
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
          <div className="pz-product-main-media">
            {hasImages ? (
              <button
                type="button"
                className="pz-product-main-media-stack pz-product-main-media-trigger"
                onClick={() => setIsLightboxOpen(true)}
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
                    fetchPriority={index === activeIndex ? 'high' : 'auto'}
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
                  onClick={showPreviousImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="pz-product-gallery-arrow is-next"
                  onClick={showNextImage}
                  aria-label="Next image"
                >
                  ›
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

          <div className="pz-product-price">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />

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
                      ‹
                    </button>
                    <button
                      type="button"
                      className="pz-carousel-btn"
                      onClick={() => scrollRelated('next')}
                      aria-label="Next related products"
                    >
                      ›
                    </button>
                  </div>
                </div>

                <div className="pz-product-carousel pz-related-carousel" ref={relatedCarouselRef}>
                  {products.map((item) => (
                    <div key={item.id} className="pz-product-carousel-item pz-related-carousel-item">
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

            <div className="pz-image-lightbox-media">
              <img
                src={lightboxImageUrls[activeIndex]}
                alt={images[activeIndex]?.altText || product.title}
                width={1600}
                height={1300}
              />
            </div>

            {hasMultipleImages ? (
              <>
                <button
                  type="button"
                  className="pz-image-lightbox-arrow is-prev"
                  onClick={showPreviousImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="pz-image-lightbox-arrow is-next"
                  onClick={showNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

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
