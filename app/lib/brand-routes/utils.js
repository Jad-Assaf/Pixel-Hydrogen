export const BRAND_BANNER_IMAGE_WIDTH = 1600;
export const BRAND_BANNER_IMAGE_HEIGHT = 520;

export function getVariantLabel(variant) {
  const colorOption = getVariantColorOption(variant);

  if (colorOption?.value) return colorOption.value;
  if (variant?.title && variant.title !== 'Default Title') return variant.title;
  return 'Variant';
}

export function getVariantColorLabel(variant) {
  return getVariantColorOption(variant)?.value || null;
}

export function getProductModelLabels(product, variant) {
  const variants = (product?.variants?.nodes || []).filter((node) => node?.id);
  const modelOptionName = getModelOptionName(
    variants.length ? variants : variant ? [variant] : [],
  );

  if (modelOptionName) {
    return uniqueLabels(
      variants
        .map((node) =>
          (node.selectedOptions || []).find(
            (option) => option?.name === modelOptionName,
          ),
        )
        .map((option) => option?.value)
        .filter(isDisplayableVariantLabel),
    );
  }

  if (
    !getVariantColorOption(variant) &&
    isDisplayableVariantLabel(variant?.title)
  ) {
    return [variant.title];
  }

  return [];
}

function getVariantColorOption(variant) {
  return (variant?.selectedOptions || []).find((option) =>
    /colou?r/i.test(option?.name || ''),
  );
}

function getModelOptionName(variants) {
  const optionNames = uniqueLabels(
    variants.flatMap((variant) =>
      (variant?.selectedOptions || []).map((option) => option?.name),
    ),
  );

  return (
    optionNames.find((name) => /model|device|compatib|series/i.test(name)) ||
    optionNames.find((name) => !/colou?r|title/i.test(name)) ||
    null
  );
}

function isDisplayableVariantLabel(value) {
  return Boolean(value && value !== 'Default Title' && value !== 'Title');
}

function uniqueLabels(labels) {
  const seen = new Set();
  return (labels || []).filter((label) => {
    const value = typeof label === 'string' ? label.trim() : '';
    const key = value.toLowerCase();
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getColorOptionValue(variant) {
  return getVariantColorOption(variant)?.value || null;
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
