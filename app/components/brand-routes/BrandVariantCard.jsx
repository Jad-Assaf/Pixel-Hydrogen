import {Link} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {PlusIcon} from '~/components/Icons';
import {ProductPrice} from '~/components/ProductPrice';
import {useAside} from '~/components/Aside';
import {useVariantUrl} from '~/lib/variants';
import {
  getProductModelLabels,
  getVariantColorLabel,
  withImageWidth,
} from '~/lib/brand-routes/utils';
import {isZeroPrice} from '~/lib/pricing';

export function BrandVariantCard({
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
    ? withImageWidth(displayImage.url, 300)
    : null;
  const colorLabel = getVariantColorLabel(variant);
  const modelLabels = colorLabel ? [] : getProductModelLabels(product, variant);
  const shouldAskForPrice = isZeroPrice(variant.price);
  const {open} = useAside();

  return (
    <article className="pz-product-card pz-brand-variant-card">
      <Link className="pz-product-card-link" prefetch="intent" to={variantUrl}>
        <div className="pz-product-media">
          {imageUrl ? (
            <img
              alt={
                displayImage.altText ||
                `${product.title} ${colorLabel || ''}`.trim()
              }
              className="pz-product-image"
              loading={loading}
              src={imageUrl}
              width={300}
              height={300}
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
          {showVariantLabel && colorLabel ? (
            <p className="pz-brand-variant-label">{colorLabel}</p>
          ) : showVariantLabel && modelLabels.length ? (
            <ul className="pz-brand-variant-label pz-brand-variant-models">
              {modelLabels.map((model) => (
                <li key={model}>{model}</li>
              ))}
            </ul>
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
