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
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 *   showAddToCart?: boolean;
 * }}
 */
export function ProductItem({product, loading, showAddToCart = false}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const selectedVariant = product.selectedOrFirstAvailableVariant;
  const {open} = useAside();
  const imageUrl = image?.url ? withImageWidth(image.url, 300) : null;
  return (
    <div className="product-item" key={product.id}>
      <Link className="product-item-link" prefetch="intent" to={variantUrl}>
        {imageUrl && (
          <img
            alt={image.altText || product.title}
            className="product-item-image"
            loading={loading}
            src={imageUrl}
            width={300}
            height={300}
          />
        )}
        <h5 className="product-item-title">{product.title}</h5>
        <small>
          <Money data={product.priceRange.minVariantPrice} />
        </small>
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
          className="product-add-button"
        >
          {selectedVariant.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
      ) : null}
    </div>
  );
}

function withImageWidth(url, width) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
