import {Await, Link, useLoaderData} from 'react-router';
import {Suspense, useEffect, useMemo, useState} from 'react';
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
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

const RECENTLY_VIEWED_KEY = 'recently_viewed_products';
const RECENTLY_VIEWED_MAX = 12;

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args, criticalData);

  return {...criticalData, ...deferredData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
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
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
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

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const baseImages = product.images?.nodes ?? [];
  const variantImage = selectedVariant?.image ?? null;
  const images = useMemo(() => {
    if (!variantImage) return baseImages;
    const exists = baseImages.some((image) => image.id === variantImage.id);
    return exists ? baseImages : [variantImage, ...baseImages];
  }, [baseImages, variantImage?.id]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [pendingIndex, setPendingIndex] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [loadThumbnails, setLoadThumbnails] = useState(false);
  const [loadedImages, setLoadedImages] = useState(() => new Set());
  const activeImage = images[displayIndex] || null;
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    if (variantImage) {
      const matchIndex = images.findIndex((image) => image.id === variantImage.id);
      if (matchIndex >= 0) {
        setActiveIndex(matchIndex);
        setDisplayIndex(matchIndex);
        setPendingIndex(null);
        setPhase('idle');
        return;
      }
    }
    if (images.length && displayIndex >= images.length) {
      setActiveIndex(0);
      setDisplayIndex(0);
    }
  }, [variantImage?.id, images]);

  useEffect(() => {
    const timer = setTimeout(() => setLoadThumbnails(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!images.length) return;
    const targetUrls = images
      .map((image) => (image?.url ? withImageWidth(image.url, 800) : null))
      .filter(Boolean);
    const allLoaded = targetUrls.every((url) => loadedImages.has(url));
    if (allLoaded) return;
    const timer = setTimeout(() => {
      images.forEach((image) => {
        if (!image?.url) return;
        const url = withImageWidth(image.url, 800);
        if (loadedImages.has(url)) return;
        preloadImage(url);
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [images, loadedImages]);

  useEffect(() => {
    if (pendingIndex === null) return;
    if (pendingIndex === displayIndex) {
      setPendingIndex(null);
      return;
    }
    const target = images[pendingIndex];
    if (!target) return;
    const url = withImageWidth(target.url, 800);
    if (!loadedImages.has(url)) return;
    setPhase('fade-out');
    const fadeOutTimer = setTimeout(() => {
      setDisplayIndex(pendingIndex);
      setPhase('fade-in');
      const fadeInTimer = setTimeout(() => {
        setPhase('idle');
        setPendingIndex(null);
      }, 200);
      return () => clearTimeout(fadeInTimer);
    }, 200);
    return () => clearTimeout(fadeOutTimer);
  }, [pendingIndex, displayIndex, loadedImages, images]);

  function markLoaded(url) {
    if (!url) return;
    setLoadedImages((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }

  function preloadImage(url) {
    if (!url) return;
    const preloader = new Image();
    preloader.onload = () => markLoaded(url);
    preloader.src = url;
  }

  function switchTo(index) {
    if (!images.length || index === activeIndex) return;
    const target = images[index];
    const targetUrl = target?.url ? withImageWidth(target.url, 800) : null;
    if (targetUrl && !loadedImages.has(targetUrl)) {
      preloadImage(targetUrl);
    }
    setActiveIndex(index);
    setPendingIndex(index);
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const imageForCache = variantImage || images[0] || null;
    const entry = {
      handle: product.handle,
      title: product.title,
      imageUrl: imageForCache?.url || null,
      imageAlt: imageForCache?.altText || product.title,
      price: selectedVariant?.price?.amount || null,
      currencyCode: selectedVariant?.price?.currencyCode || null,
    };

    try {
      const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]';
      const stored = JSON.parse(raw);
      const filtered = Array.isArray(stored)
        ? stored.filter((item) => item?.handle !== product.handle)
        : [];
      const next = [entry, ...filtered].slice(0, RECENTLY_VIEWED_MAX);
      window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
      setRecentlyViewed(next.filter((item) => item.handle !== product.handle));
    } catch (error) {
      console.error(error);
    }
  }, [product.handle, product.title, selectedVariant?.id, variantImage?.id, images]);

  return (
    <div className="product-page">
      <div className="product">
        <div className="product-media">
          {activeImage ? (
            <div className={`product-main-image is-${phase}`}>
              <button
                type="button"
                className="product-image-nav product-image-prev"
                onClick={() =>
                  switchTo(images.length ? (activeIndex - 1 + images.length) % images.length : 0)
                }
                aria-label="Previous image"
              >
                ‹
              </button>
              <img
                src={withImageWidth(activeImage.url, 800)}
                alt={activeImage.altText || product.title}
                width={800}
                onLoad={(event) => markLoaded(event.currentTarget.src)}
              />
              <button
                type="button"
                className="product-image-nav product-image-next"
                onClick={() =>
                  switchTo(images.length ? (activeIndex + 1) % images.length : 0)
                }
                aria-label="Next image"
              >
                ›
              </button>
            </div>
          ) : null}
          {images.length > 1 && loadThumbnails ? (
            <div className="product-thumbnails">
              {images.map((image, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    type="button"
                    key={image.id}
                    className={`product-thumb${
                      isActive ? ' is-active' : ''
                    }`}
                    onClick={() => switchTo(index)}
                    aria-label={`View ${product.title}`}
                  >
                    <img
                      src={withImageWidth(image.url, 160)}
                      alt={image.altText || product.title}
                      width={80}
                      height={80}
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <div className="product-main">
          <h1>{title}</h1>
          <ProductPrice
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <br />
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
          <br />
          <br />
          <p>
            <strong>Description</strong>
          </p>
          <br />
          <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
          <br />
        </div>
      </div>

      <Suspense fallback={null}>
        <Await resolve={recommendedProducts}>
          {(data) => {
            const products = data?.productRecommendations || [];
            if (!products.length) return null;
            return (
              <section className="product-section">
                <h2>Related products</h2>
                <div className="section-row">
                  {products.map((item) => (
                    <ProductItem key={item.id} product={item} />
                  ))}
                </div>
              </section>
            );
          }}
        </Await>
      </Suspense>

      {recentlyViewed.length ? (
        <section className="product-section">
          <h2>Recently viewed</h2>
          <div className="section-row">
            {recentlyViewed.map((item) => (
              <Link
                key={item.handle}
                className="recently-viewed-card"
                to={`/products/${item.handle}`}
                prefetch="intent"
              >
                {item.imageUrl ? (
                  <img
                    src={withImageWidth(item.imageUrl, 300)}
                    alt={item.imageAlt || item.title}
                    width={300}
                    height={300}
                  />
                ) : null}
                <h5>{item.title}</h5>
                {item.price && item.currencyCode ? (
                  <small>
                    {item.price} {item.currencyCode}
                  </small>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
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
    }
  }
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
