import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment
 *     | HomeProduct;
 *   loading?: 'eager' | 'lazy';
 *   showAddToCart?: boolean;
 * }}
 */
export function ProductItem({product, loading, showAddToCart = false}) {
  const variantUrl = useVariantUrl(product.handle);
  const selectedVariant = product.selectedOrFirstAvailableVariant || null;
  const variantSwatches = useMemo(() => {
    const variants = product?.variants?.nodes || [];
    const seen = new Set();
    const unique = [];

    variants.forEach((variant) => {
      const imageUrl = variant?.image?.url;
      if (!variant?.id || !imageUrl) return;

      const imageKey = variant.image.id || imageUrl;
      if (seen.has(imageKey)) return;
      seen.add(imageKey);
      unique.push(variant);
    });

    return unique;
  }, [product?.variants?.nodes]);
  const initialVariantId = useMemo(() => {
    if (selectedVariant?.id && variantSwatches.some((variant) => variant.id === selectedVariant.id)) {
      return selectedVariant.id;
    }

    return variantSwatches[0]?.id || selectedVariant?.id || null;
  }, [selectedVariant?.id, variantSwatches]);
  const [activeVariantId, setActiveVariantId] = useState(initialVariantId);

  useEffect(() => {
    setActiveVariantId(initialVariantId);
  }, [initialVariantId, product.id]);

  const activeVariant = useMemo(() => {
    if (!activeVariantId) return selectedVariant;

    return (
      variantSwatches.find((variant) => variant.id === activeVariantId) ||
      selectedVariant
    );
  }, [activeVariantId, selectedVariant, variantSwatches]);
  const displayVariant = activeVariant || selectedVariant;
  const displayImage = displayVariant?.image || product.featuredImage;
  const imageUrl = displayImage?.url ? withImageWidth(displayImage.url, 300) : null;
  const displayPrice =
    displayVariant?.price || product.priceRange?.minVariantPrice || null;
  const cartVariant = displayVariant || selectedVariant;
  const {open} = useAside();

  return (
    <article className="pz-product-card" key={product.id}>
      <Link className="pz-product-card-link" prefetch="intent" to={variantUrl}>
        <div className="pz-product-media">
          {imageUrl ? (
            <img
              alt={displayImage.altText || product.title}
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
            <span>{(product.vendor || 'TECH').toUpperCase()}</span>
          </div>
          <h3>{product.title}</h3>
        </div>
      </Link>

      <div className="pz-product-card-footer">
        <div className="pz-product-variant-slot">
          {variantSwatches.length > 1 ? (
            <div className="pz-product-variant-swatches" aria-label="Variant images">
              {variantSwatches.map((variant) => {
                const swatchImage = variant.image;
                if (!swatchImage?.url) return null;

                return (
                  <button
                    type="button"
                    key={variant.id}
                    className={`pz-product-variant-swatch${
                      variant.id === displayVariant?.id ? ' is-active' : ''
                    }`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setActiveVariantId(variant.id);
                    }}
                    aria-label={variant.title || product.title}
                    title={variant.title || product.title}
                  >
                    <img
                      src={withImageWidth(swatchImage.url, 80)}
                      alt={swatchImage.altText || variant.title || product.title}
                      loading="lazy"
                      width={24}
                      height={24}
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <div className="pz-product-price-row">
          <strong>
            {displayPrice ? (
              <Money data={displayPrice} />
            ) : (
              'N/A'
            )}
          </strong>
        </div>
      </div>

      {showAddToCart && cartVariant?.id ? (
        <AddToCartButton
          disabled={!cartVariant.availableForSale}
          onClick={() => open('cart')}
          lines={[
            {
              merchandiseId: cartVariant.id,
              quantity: 1,
              selectedVariant: cartVariant,
            },
          ]}
          className="pz-card-cart-btn"
        >
          {cartVariant.availableForSale ? '+' : '×'}
        </AddToCartButton>
      ) : null}
    </article>
  );
}

function withImageWidth(url, width) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
/** @typedef {import('storefrontapi.generated').HomeProductCardFragment} HomeProduct */
