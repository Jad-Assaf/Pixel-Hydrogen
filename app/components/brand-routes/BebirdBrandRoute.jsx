import {Analytics} from '@shopify/hydrogen';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Link} from 'react-router';
import awardsImage from '~/assets/10_ae56715c-d54b-43b2-ba43-a64209c8feb5 (9).webp';
import {AddToCartButton} from '~/components/AddToCartButton';
import {AskForPriceLink} from '~/components/AskForPriceLink';
import {useAside} from '~/components/Aside';
import {ArrowIcon, PlusIcon} from '~/components/Icons';
import {ProductPrice} from '~/components/ProductPrice';
import {isZeroPrice} from '~/lib/pricing';

export const BEBIRD_PRODUCT_HANDLES = [
  'bebird-earsight-plus-smart-visual-ear-cleaner-blue-white',
  'bebird-earsight-ultra-2k-smart-visual-ear-cleaner',
];

const BEBIRD_HERO_VIDEO =
  'https://bebird.com/cdn/shop/videos/c/vp/67e61707564c4fe7b0c38f944d683eb6/67e61707564c4fe7b0c38f944d683eb6.HD-720p-1.6Mbps-57149734.mp4?v=0';
const BEBIRD_HERO_POSTER =
  'https://bebird.com/cdn/shop/files/preview_images/67e61707564c4fe7b0c38f944d683eb6.thumbnail.0000000000_800x.jpg?v=1757475863';
const BEBIRD_AWARDS_VIDEO_ID = 'cJairfrdRb8';

const PRODUCT_STORIES = {
  'bebird-earsight-plus-smart-visual-ear-cleaner-blue-white': {
    number: '01',
    kicker: 'Everyday clarity',
    statement: 'See the routine. Guide every movement.',
    accent: 'coral',
    preferredOption: {name: 'Color', value: 'Blue'},
    fallbackDescription:
      'A compact visual ear cleaner that brings a live view and steady control to everyday care.',
  },
  'bebird-earsight-ultra-2k-smart-visual-ear-cleaner': {
    number: '02',
    kicker: 'Sharper detail',
    statement: 'A closer look, with 2K precision.',
    accent: 'ink',
    fallbackDescription:
      'High-resolution visual guidance and a considered tool set for a more precise ear-care routine.',
  },
};

export function BebirdBrandRoute({products}) {
  const heroVideoRef = useViewportAutoplayVideo();
  const visibleProducts = BEBIRD_PRODUCT_HANDLES.map((handle) =>
    products.find((product) => product.handle === handle),
  ).filter(Boolean);
  const firstProduct = visibleProducts[0] || null;
  const secondProduct = visibleProducts[1] || null;

  return (
    <main className="pz-bebird-page">
      <section className="pz-bebird-hero" aria-labelledby="bebird-title">
        <div className="pz-bebird-hero-media">
          <video
            ref={heroVideoRef}
            className="pz-bebird-hero-video"
            muted
            loop
            playsInline
            preload="metadata"
            poster={BEBIRD_HERO_POSTER}
          >
            <source src={BEBIRD_HERO_VIDEO} type="video/mp4" />
          </video>
        </div>
        <div className="pz-bebird-hero-copy">
          <p>Visual care / reimagined</p>
          <h1 id="bebird-title">bebird</h1>
          <span>Ear care you can see.</span>
          <a className="pz-bebird-scroll-cue" href="#earsight-plus">
            Discover
            <span aria-hidden="true" />
          </a>
        </div>
      </section>

      {firstProduct ? (
        <BebirdProductStory
          product={firstProduct}
          story={PRODUCT_STORIES[firstProduct.handle]}
          sectionId="earsight-plus"
          imageLoading="eager"
        />
      ) : (
        <BebirdMissingProduct name="EarSight Plus" sectionId="earsight-plus" />
      )}

      <section
        className="pz-bebird-awards"
        aria-labelledby="bebird-awards-title"
      >
        <div className="pz-bebird-awards-heading">
          <p>Recognized worldwide</p>
          <h2 id="bebird-awards-title">
            Designed to be seen.
            <br />
            Awarded for how it works.
          </h2>
        </div>
        <img
          src={awardsImage}
          alt="Bebird awards including CES Innovation Awards, TWICE Picks, Techlicious, iF Design, Red Dot and IDA"
          width="3200"
          height="883"
          loading="lazy"
        />
      </section>

      <BebirdAwardsVideo />

      {secondProduct ? (
        <BebirdProductStory
          product={secondProduct}
          story={PRODUCT_STORIES[secondProduct.handle]}
          sectionId="earsight-ultra"
          imageLoading="lazy"
        />
      ) : (
        <BebirdMissingProduct
          name="EarSight Ultra"
          sectionId="earsight-ultra"
        />
      )}

      {visibleProducts.length ? (
        <Analytics.ProductView
          data={{
            products: visibleProducts.map((product) => {
              const variant = getStoryVariant(
                product,
                PRODUCT_STORIES[product.handle],
              );

              return {
                id: product.id,
                title: product.title,
                price: variant?.price?.amount || '0',
                vendor: product.vendor,
                variantId: variant?.id || '',
                variantTitle: getVariantLabel(variant),
                quantity: 1,
              };
            }),
          }}
        />
      ) : null}
    </main>
  );
}

function BebirdProductStory({product, story, sectionId, imageLoading}) {
  const initialVariant = getStoryVariant(product, story);
  const productVariants = product.variants?.nodes;
  const productImages = product.images?.nodes;
  const variants = useMemo(() => productVariants || [], [productVariants]);
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialVariant?.id || null,
  );
  const variant =
    variants.find((item) => item.id === selectedVariantId) || initialVariant;
  const images = useMemo(
    () =>
      mergeProductImages(
        productImages || [],
        variants.map((item) => item.image),
      ),
    [productImages, variants],
  );
  const showVariantSelector =
    product.handle ===
      'bebird-earsight-plus-smart-visual-ear-cleaner-blue-white' &&
    variants.length > 1;
  const description = getShortDescription(
    product.description,
    story.fallbackDescription,
  );
  const productUrl = getProductUrl(
    product.handle,
    variant?.selectedOptions?.[0] || story.preferredOption,
  );
  const shouldAskForPrice = isZeroPrice(variant?.price);
  const {open} = useAside();

  return (
    <section
      id={sectionId}
      className={`pz-bebird-product pz-bebird-product--${story.accent}`}
    >
      <div className="pz-bebird-product-intro">
        <span className="pz-bebird-product-number">{story.number}</span>{' '}
        <p>{story.kicker}</p>
        <div>
          <h3>{story.statement}</h3>
        </div>
      </div>

      <div className="pz-bebird-product-layout">
        <BebirdProductGallery
          images={images}
          productTitle={product.title}
          imageLoading={imageLoading}
          requestedImageId={variant?.image?.id}
        />

        <div className="pz-bebird-product-copy">
          <p className="pz-bebird-product-vendor">Bebird / EarSight</p>
          <h3>{product.title}</h3>
          {showVariantSelector ? (
            <div
              className="pz-bebird-variants"
              aria-label={`${product.title} variants`}
            >
              <p>Choose a color</p>
              <div className="pz-bebird-variant-options">
                {variants.map((item) => (
                  <button
                    key={item.id}
                    className="pz-bebird-variant"
                    type="button"
                    aria-pressed={item.id === variant?.id}
                    data-available={item.availableForSale}
                    onClick={() => setSelectedVariantId(item.id)}
                  >
                    {item.image ? (
                      <img
                        src={withImageWidth(item.image.url, 160)}
                        alt=""
                        width={item.image.width || 160}
                        height={item.image.height || 160}
                        loading="lazy"
                      />
                    ) : null}
                    <span>{getVariantLabel(item)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <p className="pz-bebird-product-description">{description}</p>

          <div className="pz-bebird-product-details">
            <span>Live visual guidance</span>
            <span>App-connected care</span>
            <span>Designed for control</span>
          </div>

          <div className="pz-bebird-purchase">
            <ProductPrice
              price={variant?.price}
              compareAtPrice={variant?.compareAtPrice || null}
            />
            <div className="pz-bebird-actions">
              {!variant ? (
                <button
                  className="pz-bebird-primary-action"
                  type="button"
                  disabled
                >
                  Unavailable
                </button>
              ) : shouldAskForPrice ? (
                <AskForPriceLink
                  className="pz-bebird-primary-action"
                  productHandle={product.handle}
                />
              ) : (
                <AddToCartButton
                  className="pz-bebird-primary-action"
                  disabled={!variant?.availableForSale}
                  onClick={() => open('cart')}
                  lines={[
                    {
                      merchandiseId: variant.id,
                      quantity: 1,
                      selectedVariant: variant,
                    },
                  ]}
                >
                  <PlusIcon />
                  <span>
                    {variant?.availableForSale ? 'Add to cart' : 'Sold out'}
                  </span>
                </AddToCartButton>
              )}
              <Link
                className="pz-bebird-secondary-action"
                to={productUrl}
                prefetch="intent"
              >
                View product
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BebirdProductGallery({
  images,
  productTitle,
  imageLoading,
  requestedImageId,
}) {
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const requestedIndex = images.findIndex(
      (image) => image.id === requestedImageId,
    );
    return requestedIndex >= 0 ? requestedIndex : 0;
  });
  const touchStartX = useRef(null);
  const ignoreClick = useRef(false);
  const preloadedImages = useRef(new Set());
  const selectedImage = images[selectedIndex] || images[0];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!requestedImageId) return;
    const requestedIndex = images.findIndex(
      (image) => image.id === requestedImageId,
    );
    if (requestedIndex >= 0) setSelectedIndex(requestedIndex);
  }, [images, requestedImageId]);

  function preloadAdjacentImages() {
    if (!hasMultipleImages || typeof Image === 'undefined') return;

    const adjacentIndexes = [
      (selectedIndex - 1 + images.length) % images.length,
      (selectedIndex + 1) % images.length,
    ];

    adjacentIndexes.forEach((index) => {
      const url = withImageWidth(images[index].url, 1200);
      if (preloadedImages.current.has(url)) return;

      const image = new Image();
      image.src = url;
      preloadedImages.current.add(url);
    });
  }

  function showPreviousImage() {
    if (!hasMultipleImages) return;
    setSelectedIndex((index) => (index - 1 + images.length) % images.length);
  }

  function showNextImage() {
    if (!hasMultipleImages) return;
    setSelectedIndex((index) => (index + 1) % images.length);
  }

  function handleNavigationClick(direction) {
    if (ignoreClick.current) {
      ignoreClick.current = false;
      return;
    }

    if (direction === 'previous') {
      showPreviousImage();
    } else {
      showNextImage();
    }
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return;

    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 40) return;
    ignoreClick.current = true;

    if (distance < 0) {
      showNextImage();
    } else {
      showPreviousImage();
    }
  }

  if (!selectedImage) {
    return <div className="pz-bebird-gallery pz-bebird-gallery--empty" />;
  }

  return (
    <div className="pz-bebird-gallery">
      <div
        className="pz-bebird-gallery-main"
        role="group"
        aria-label={`${productTitle} image ${selectedIndex + 1} of ${
          images.length
        }`}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={selectedImage.id}
          src={withImageWidth(selectedImage.url, 1000)}
          srcSet={`${withImageWidth(selectedImage.url, 720)} 720w, ${withImageWidth(
            selectedImage.url,
            1000,
          )} 1000w, ${withImageWidth(selectedImage.url, 1400)} 1400w`}
          sizes="(max-width: 900px) calc(100vw - 30px), 68vw"
          alt={selectedImage.altText || productTitle}
          width={selectedImage.width || 1200}
          height={selectedImage.height || 1200}
          loading={imageLoading}
          fetchPriority={
            selectedIndex === 0 && imageLoading === 'eager' ? 'high' : 'auto'
          }
          onLoad={preloadAdjacentImages}
        />
        {hasMultipleImages ? (
          <>
            <button
              className="pz-bebird-gallery-arrow pz-bebird-gallery-arrow--previous"
              type="button"
              aria-label="Show previous image"
              onClick={() => handleNavigationClick('previous')}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              className="pz-bebird-gallery-arrow pz-bebird-gallery-arrow--next"
              type="button"
              aria-label="Show next image"
              onClick={() => handleNavigationClick('next')}
            >
              <ArrowIcon direction="right" />
            </button>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div
          className="pz-bebird-gallery-thumbnails"
          aria-label={`${productTitle} images`}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              className="pz-bebird-gallery-thumbnail"
              type="button"
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-pressed={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={withImageWidth(image.url, 180)}
                alt=""
                width={image.width || 240}
                height={image.height || 240}
                loading={index < 4 ? imageLoading : 'lazy'}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BebirdAwardsVideo() {
  const iframeRef = useRef(null);
  const shouldPlay = useRef(false);

  const sendYouTubeCommand = useCallback((command) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: 'command',
        func: command,
        args: [],
      }),
      'https://www.youtube.com',
    );
  }, []);

  const syncPlayback = useCallback(() => {
    sendYouTubeCommand('mute');
    sendYouTubeCommand(shouldPlay.current ? 'playVideo' : 'pauseVideo');
  }, [sendYouTubeCommand]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        shouldPlay.current =
          entry.isIntersecting && entry.intersectionRatio >= 0.35;
        syncPlayback();
      },
      {threshold: [0, 0.35, 0.75]},
    );

    observer.observe(iframe);
    return () => observer.disconnect();
  }, [syncPlayback]);

  return (
    <section
      className="pz-bebird-awards-video"
      aria-label="Bebird at the NAACP Image Awards"
    >
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${BEBIRD_AWARDS_VIDEO_ID}?enablejsapi=1&playsinline=1&controls=1&rel=0&autoplay=0&mute=1`}
        title="Bebird Shines at the 56th NAACP Image Awards"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={syncPlayback}
      />
    </section>
  );
}

function BebirdMissingProduct({name, sectionId}) {
  return (
    <section id={sectionId} className="pz-bebird-product pz-bebird-missing">
      <span>Coming into focus</span>
      <h2>{name}</h2>
    </section>
  );
}

function useViewportAutoplayVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      {threshold: [0, 0.35, 0.75]},
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  return videoRef;
}

function getStoryVariant(product, story) {
  const variants = product.variants?.nodes || [];
  const preferred = story?.preferredOption
    ? variants.find((variant) =>
        variant.selectedOptions?.some(
          (option) =>
            option.name.toLowerCase() ===
              story.preferredOption.name.toLowerCase() &&
            option.value.toLowerCase() ===
              story.preferredOption.value.toLowerCase(),
        ),
      )
    : null;

  return preferred || product.selectedOrFirstAvailableVariant || variants[0];
}

function getVariantLabel(variant) {
  return (
    variant?.selectedOptions
      ?.map((option) => option.value)
      .filter((value) => value !== 'Default Title')
      .join(' / ') || 'Default'
  );
}

function mergeProductImages(productImages, variantImages) {
  const imagesById = new Map();

  [...productImages, ...variantImages.filter(Boolean)].forEach((image) => {
    imagesById.set(image.id, image);
  });

  return [...imagesById.values()];
}

function getProductUrl(handle, preferredOption) {
  const path = `/products/${handle}`;
  if (!preferredOption) return path;

  return `${path}?${encodeURIComponent(preferredOption.name)}=${encodeURIComponent(
    preferredOption.value,
  )}`;
}

function getShortDescription(description, fallback) {
  const normalized = String(description || fallback || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (normalized.length <= 230) return normalized;
  return `${normalized.slice(0, 227).trimEnd()}...`;
}

function withImageWidth(url, width) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}
