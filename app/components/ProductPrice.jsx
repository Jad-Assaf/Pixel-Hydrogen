import {Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 *   suffix?: string;
 * }}
 */
export function ProductPrice({price, compareAtPrice, suffix = ''}) {
  const showCompareAtPrice = hasCompareAtPrice(price, compareAtPrice);
  const normalizedSuffix = String(suffix || '').trim();

  return (
    <div className={`product-price${showCompareAtPrice ? ' is-on-sale' : ''}`}>
      {price ? (
        <span className="product-price-current">
          <Money data={price} />
          {normalizedSuffix ? (
            <span className="product-price-suffix">{normalizedSuffix}</span>
          ) : null}
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
