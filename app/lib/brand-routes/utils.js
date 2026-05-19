export const BRAND_BANNER_IMAGE_WIDTH = 1600;
export const BRAND_BANNER_IMAGE_HEIGHT = 520;

export function getVariantLabel(variant) {
  const colorOption = (variant?.selectedOptions || []).find((option) =>
    /colou?r/i.test(option?.name || ''),
  );

  if (colorOption?.value) return colorOption.value;
  if (variant?.title && variant.title !== 'Default Title') return variant.title;
  return 'Variant';
}

function getColorOptionValue(variant) {
  return (
    (variant?.selectedOptions || []).find((option) =>
      /colou?r/i.test(option?.name || ''),
    )?.value || null
  );
}

export function getProductCardEntries(product, splitVariantsBy = 'color') {
  const variants = (product?.variants?.nodes || []).filter(
    (variant) => variant?.id,
  );
  const fallbackVariant =
    product?.selectedOrFirstAvailableVariant || variants[0] || null;

  if (splitVariantsBy !== 'color') {
    return fallbackVariant ? [fallbackVariant] : [];
  }

  const seenColors = new Set();
  const colorVariants = variants.filter((variant) => {
    const colorValue = getColorOptionValue(variant);
    if (!colorValue) return false;
    const colorKey = colorValue.toLowerCase();
    if (seenColors.has(colorKey)) return false;
    seenColors.add(colorKey);
    return true;
  });

  if (colorVariants.length) {
    return colorVariants;
  }

  return fallbackVariant ? [fallbackVariant] : [];
}

export function mergeProducts(currentProducts, nextProducts) {
  const seen = new Set();
  return [...(currentProducts || []), ...(nextProducts || [])].filter(
    (product) => {
      if (!product?.id || seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    },
  );
}

export function getBrandThemeVars(brand) {
  return {
    '--brand-accent': brand.palette.accent,
    '--brand-accent-soft': brand.palette.accentSoft,
    '--brand-ink': brand.palette.ink,
    '--brand-surface': brand.palette.surface,
    '--brand-card': brand.palette.card,
    '--brand-glow': brand.palette.glow,
    '--brand-mesh-a': brand.palette.meshA,
    '--brand-mesh-b': brand.palette.meshB,
  };
}

export function withImageWidth(url, width) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}
