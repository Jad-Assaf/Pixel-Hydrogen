import {Link, useNavigate} from 'react-router';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({productOptions, selectedVariant}) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div className="pz-product-form">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;
        const isColorOption = /color/i.test(option.name || '');

        return (
          <div className="pz-option-group" key={option.name}>
            <h5>{option.name}</h5>
            <div className="pz-option-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                  firstSelectableVariant,
                } = value;
                const optionImage = isColorOption
                  ? firstSelectableVariant?.image
                  : null;
                const optionImageUrl = optionImage?.url
                  ? withImageWidth(optionImage.url, 90)
                  : null;
                const optionImageAlt = optionImage?.altText || name;

                const className = `pz-option-button${
                  selected ? ' is-selected' : ''
                }${available ? '' : ' is-unavailable'}`;

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={className}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch
                        swatch={swatch}
                        name={name}
                        imageUrl={optionImageUrl}
                        imageAlt={optionImageAlt}
                        isColorOption={isColorOption}
                      />
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    className={className}
                    key={option.name + name}
                    disabled={!exists}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch
                      swatch={swatch}
                      name={name}
                      imageUrl={optionImageUrl}
                      imageAlt={optionImageAlt}
                      isColorOption={isColorOption}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          open('cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
        className="pz-btn pz-btn-primary pz-product-cart-btn"
      >
        {selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 *   imageUrl?: string | null;
 *   imageAlt?: string;
 *   isColorOption?: boolean;
 * }}
 */
function ProductOptionSwatch({
  swatch,
  name,
  imageUrl,
  imageAlt,
  isColorOption = false,
}) {
  if (!isColorOption) return <span>{name}</span>;

  const image = swatch?.image?.previewImage?.url || imageUrl;
  const color = swatch?.color || '#f8fafc';

  return (
    <span className="pz-option-swatch-wrap is-color">
      <span
        aria-label={name}
        className="pz-option-swatch"
        style={{
          backgroundColor: image ? 'transparent' : color,
        }}
      >
        {image ? (
          <img src={image} alt={imageAlt || name} />
        ) : (
          <span className="pz-option-swatch-fallback" aria-hidden="true">
            {name.slice(0, 1)}
          </span>
        )}
      </span>
      <span className="pz-option-swatch-name">{name}</span>
    </span>
  );
}

function withImageWidth(url, width) {
  if (!url || !width) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
