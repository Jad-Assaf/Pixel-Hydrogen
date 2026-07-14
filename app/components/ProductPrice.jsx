import {Money} from '@shopify/hydrogen';
import {ASK_FOR_PRICE_LABEL, isZeroPrice} from '~/lib/pricing';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 *   suffix?: string;
 * }}
 */
export function ProductPrice({price, compareAtPrice, suffix = ''}) {
  const shouldAskForPrice = isZeroPrice(price);
  const showCompareAtPrice =
    !shouldAskForPrice && hasCompareAtPrice(price, compareAtPrice);
  const normalizedSuffix = String(suffix || '').trim();

  return (
    <div className={`product-price${showCompareAtPrice ? ' is-on-sale' : ''}`}>
      {shouldAskForPrice ? (
        <span className="product-price-current product-price-current--ask">
          {ASK_FOR_PRICE_LABEL}
        </span>
      ) : price ? (
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

/**
 * Compact catalog-price renderer for search results and other inline layouts.
 * @param {{price?: MoneyV2 | null; className?: string}} props
 */
export function ProductMoney({price, className}) {
  if (isZeroPrice(price)) {
    return <span className={className}>{ASK_FOR_PRICE_LABEL}</span>;
  }

  return price ? <Money className={className} data={price} /> : null;
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
