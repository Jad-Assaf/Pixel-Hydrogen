export const CALL_FOR_PRICE_LABEL = 'Call for price';
export const ASK_FOR_PRICE_LABEL = CALL_FOR_PRICE_LABEL;
export const WHATSAPP_NUMBER = '96181539339';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const PRODUCT_URL_ORIGIN = 'https://pixelzones.com';

export function isZeroPrice(price) {
  const amount = Number.parseFloat(price?.amount || '');
  return Number.isFinite(amount) && amount === 0;
}

export function getAskForPriceUrl(productHandle) {
  const handle = String(productHandle || '').trim();
  const productUrl = handle
    ? `${PRODUCT_URL_ORIGIN}/products/${encodeURIComponent(handle)}`
    : PRODUCT_URL_ORIGIN;
  const message = `I need this product's price:\n${productUrl}`;
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
