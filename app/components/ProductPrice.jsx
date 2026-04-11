import {Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice}) {
  const showCompareAtPrice = hasCompareAtPrice(price, compareAtPrice);

  return (
    <div className={`product-price${showCompareAtPrice ? ' is-on-sale' : ''}`}>
      {price ? (
        <span className="product-price-current">
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}

      {showCompareAtPrice ? (
        <s className="product-price-compare">
          <Money data={compareAtPrice} />
        </s>
      ) : null}
    </div>
  );
}

export function hasCompareAtPrice(price, compareAtPrice) {
  const priceAmount = Number.parseFloat(price?.amount || '');
  const compareAtAmount = Number.parseFloat(compareAtPrice?.amount || '');

  return (
    Number.isFinite(priceAmount) &&
    Number.isFinite(compareAtAmount) &&
    compareAtAmount > priceAmount
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
