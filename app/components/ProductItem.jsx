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
  const image = product.featuredImage;
  const imageUrl = image?.url ? withImageWidth(image.url, 200) : null;
  const selectedVariant = product.selectedOrFirstAvailableVariant;
  const {open} = useAside();

  return (
    <article className="pz-product-card" key={product.id}>
      <Link className="pz-product-card-link" prefetch="intent" to={variantUrl}>
        <div className="pz-product-media">
          {imageUrl ? (
            <img
              alt={image.altText || product.title}
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
          <div className="pz-product-price-row">
            <strong>
              {product.priceRange?.minVariantPrice ? (
                <Money data={product.priceRange.minVariantPrice} />
              ) : selectedVariant?.price ? (
                <Money data={selectedVariant.price} />
              ) : (
                'N/A'
              )}
            </strong>
          </div>
        </div>
      </Link>

      {showAddToCart && selectedVariant?.id ? (
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
          className="pz-card-cart-btn"
        >
          {selectedVariant.availableForSale ? '+' : '×'}
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
