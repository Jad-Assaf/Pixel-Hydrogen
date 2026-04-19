export const CHECKOUT_STAMP_ACTION = 'CustomCheckoutStamp';
export const CART_FORM_INPUT_NAME = 'cartFormInput';
export const SHOPIFY_CART_TOKEN_ATTRIBUTE_KEY = 'shopify-cart-token';

const SHOPIFY_CART_TOKEN_NOTE_PREFIX = `${SHOPIFY_CART_TOKEN_ATTRIBUTE_KEY}:`;

export function buildCheckoutStampFormInput({redirectTo, attributes = []} = {}) {
  return {
    action: CHECKOUT_STAMP_ACTION,
    inputs: {
      redirectTo,
      attributes: normalizeAttributeInputs(attributes),
    },
  };
}

export function submitCheckoutStamp({redirectTo, attributes = []} = {}) {
  if (typeof document === 'undefined' || !redirectTo) return false;

  const form = document.createElement('form');
  form.method = 'post';
  form.action = '/cart';
  form.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = CART_FORM_INPUT_NAME;
  input.value = JSON.stringify(
    buildCheckoutStampFormInput({redirectTo, attributes}),
  );

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();

  return true;
}

export function extractShopifyCartToken(cartId) {
  const rawId = String(cartId || '');
  if (!rawId) return '';

  const lastSegment = rawId.split('/').pop() || '';
  return lastSegment.split('?')[0] || '';
}

export function mergeCheckoutStampNote(note, cartId) {
  const cartToken = extractShopifyCartToken(cartId);
  const currentNote = String(note || '');
  if (!cartToken) return currentNote;

  const nextTokenLine = `${SHOPIFY_CART_TOKEN_NOTE_PREFIX}${cartToken}`;
  const nextLines = currentNote
    .split(/\r?\n/)
    .filter(
      (line) =>
        !line.trim().toLowerCase().startsWith(SHOPIFY_CART_TOKEN_NOTE_PREFIX),
    );

  nextLines.push(nextTokenLine);

  return nextLines.filter(Boolean).join('\n');
}

export function mergeCheckoutStampAttributes(
  existingAttributes = [],
  extraAttributes = [],
  cartId,
) {
  const mergedAttributes = new Map();
  const cartToken = extractShopifyCartToken(cartId);

  normalizeAttributeInputs(existingAttributes).forEach(({key, value}) => {
    mergedAttributes.set(key, value);
  });

  normalizeAttributeInputs(extraAttributes).forEach(({key, value}) => {
    mergedAttributes.set(key, value);
  });

  if (cartToken) {
    mergedAttributes.set(SHOPIFY_CART_TOKEN_ATTRIBUTE_KEY, cartToken);
  }

  return Array.from(mergedAttributes.entries()).map(([key, value]) => ({
    key,
    value,
  }));
}

export function normalizeAttributeInputs(attributes) {
  if (!Array.isArray(attributes)) return [];

  return attributes
    .map((attribute) => ({
      key: String(attribute?.key || '').trim(),
      value: String(attribute?.value || '').trim(),
    }))
    .filter((attribute) => attribute.key && attribute.value);
}
