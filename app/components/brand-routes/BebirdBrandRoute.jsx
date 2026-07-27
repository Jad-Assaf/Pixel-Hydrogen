import {Analytics} from '@shopify/hydrogen';
import {useState} from 'react';
import {Link} from 'react-router';
import awardsImage from '~/assets/10_ae56715c-d54b-43b2-ba43-a64209c8feb5 (9).webp';
import {AddToCartButton} from '~/components/AddToCartButton';
import {AskForPriceLink} from '~/components/AskForPriceLink';
import {useAside} from '~/components/Aside';
import {PlusIcon} from '~/components/Icons';
import {ProductPrice} from '~/components/ProductPrice';
import {isZeroPrice} from '~/lib/pricing';

export const BEBIRD_PRODUCT_HANDLES = [
  'bebird-earsight-ultra-2k-smart-visual-ear-cleaner',
  'bebird-earsight-plus-smart-visual-ear-cleaner-blue-white',
];

const BEBIRD_HERO_VIDEO =
  'https://bebird.com/cdn/shop/videos/c/vp/67e61707564c4fe7b0c38f944d683eb6/67e61707564c4fe7b0c38f944d683eb6.HD-720p-1.6Mbps-57149734.mp4?v=0';
const BEBIRD_HERO_POSTER =
  'https://bebird.com/cdn/shop/files/preview_images/67e61707564c4fe7b0c38f944d683eb6.thumbnail.0000000000_800x.jpg?v=1757475863';

const PRODUCT_STORIES = {
  'bebird-earsight-plus-smart-visual-ear-cleaner-blue-white': {
    number: '02',
    kicker: 'Everyday clarity',
    statement: 'See the routine. Guide every movement.',
    accent: 'coral',
    preferredOption: {name: 'Color', value: 'Blue'},
    fallbackDescription:
      'A compact visual ear cleaner that brings a live view and steady control to everyday care.',
  },
  'bebird-earsight-ultra-2k-smart-visual-ear-cleaner': {
    number: '01',
    kicker: 'Sharper detail',
    statement: 'A closer look, with 2K precision.',
    accent: 'ink',
    fallbackDescription:
      'High-resolution visual guidance and a considered tool set for a more precise ear-care routine.',
  },
};

export function BebirdBrandRoute({products}) {
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
            className="pz-bebird-hero-video"
            autoPlay
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
          <a className="pz-bebird-scroll-cue" href="#earsight-ultra">
            Discover
            <span aria-hidden="true" />
          </a>
        </div>
      </section>

      {firstProduct ? (
        <BebirdProductStory
          product={firstProduct}
          story={PRODUCT_STORIES[firstProduct.handle]}
          sectionId="earsight-ultra"
          imageLoading="eager"
        />
      ) : (
        <BebirdMissingProduct
          name="EarSight Ultra"
          sectionId="earsight-ultra"
        />
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

      {secondProduct ? (
        <BebirdProductStory
          product={secondProduct}
          story={PRODUCT_STORIES[secondProduct.handle]}
          sectionId="earsight-plus"
          imageLoading="lazy"
        />
      ) : (
        <BebirdMissingProduct name="EarSight Plus" sectionId="earsight-plus" />
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
  const variant = getStoryVariant(product, story);
  const images = product.images?.nodes || [];
  const description = getShortDescription(
    product.description,
    story.fallbackDescription,
  );
  const productUrl = getProductUrl(product.handle, story.preferredOption);
  const shouldAskForPrice = isZeroPrice(variant?.price);
  const {open} = useAside();

  return (
    <section
      id={sectionId}
      className={`pz-bebird-product pz-bebird-product--${story.accent}`}
    >
      <div className="pz-bebird-product-intro">
        <span className="pz-bebird-product-number">{story.number}</span>
        <div>
          <p>{story.kicker}</p>
          <h2>{story.statement}</h2>
        </div>
      </div>

      <div className="pz-bebird-product-layout">
        <BebirdProductGallery
          images={images}
          productTitle={product.title}
          productUrl={productUrl}
          imageLoading={imageLoading}
        />

        <div className="pz-bebird-product-copy">
          <p className="pz-bebird-product-vendor">Bebird / EarSight</p>
          <h3>{product.title}</h3>
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
  productUrl,
  imageLoading,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] || images[0];

  if (!selectedImage) {
    return <div className="pz-bebird-gallery pz-bebird-gallery--empty" />;
  }

  return (
    <div className="pz-bebird-gallery">
      <Link
        className="pz-bebird-gallery-main"
        to={productUrl}
        prefetch="intent"
        aria-label={`View ${productTitle}`}
      >
        <img
          key={selectedImage.id}
          src={withImageWidth(selectedImage.url, 1400)}
          alt={selectedImage.altText || productTitle}
          width={selectedImage.width || 1200}
          height={selectedImage.height || 1200}
          loading={imageLoading}
        />
      </Link>

      {images.length > 1 ? (
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
                src={withImageWidth(image.url, 240)}
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

function BebirdMissingProduct({name, sectionId}) {
  return (
    <section id={sectionId} className="pz-bebird-product pz-bebird-missing">
      <span>Coming into focus</span>
      <h2>{name}</h2>
    </section>
  );
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
