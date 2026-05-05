export function getNumericShopifyId(gidOrId) {
  if (!gidOrId) return null;

  const value = String(gidOrId).trim();
  if (!value) return null;

  if (!value.includes('/')) {
    return value;
  }

  const numericId = value.split('/').pop();
  return numericId ? numericId.trim() || null : null;
}

export function getMetaContentIdFromVariant(variant) {
  if (!variant?.id) return null;
  return getNumericShopifyId(variant.id);
}
