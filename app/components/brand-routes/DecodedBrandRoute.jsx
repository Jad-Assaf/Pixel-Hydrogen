import {Analytics} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {BrandVariantCard} from '~/components/brand-routes/BrandVariantCard';
import {
  BRAND_BANNER_IMAGE_HEIGHT,
  BRAND_BANNER_IMAGE_WIDTH,
  getBrandThemeVars,
  getProductCardEntries,
} from '~/lib/brand-routes/utils';

const DECODED_PLACEHOLDER_DESKTOP =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1600" height="520" viewBox="0 0 1600 520"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop offset="0" stop-color="%23201814"/%3E%3Cstop offset=".54" stop-color="%238b5e3c"/%3E%3Cstop offset="1" stop-color="%23e8dacb"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="1600" height="520" fill="url(%23g)"/%3E%3Ccircle cx="1310" cy="110" r="250" fill="%23ffffff" opacity=".13"/%3E%3Ccircle cx="1210" cy="420" r="190" fill="%23000000" opacity=".12"/%3E%3Crect x="76" y="78" width="610" height="364" rx="34" fill="%23ffffff" opacity=".13"/%3E%3Crect x="112" y="116" width="320" height="32" rx="16" fill="%23ffffff" opacity=".34"/%3E%3Crect x="112" y="176" width="466" height="112" rx="20" fill="%23ffffff" opacity=".2"/%3E%3Crect x="112" y="328" width="238" height="30" rx="15" fill="%23ffffff" opacity=".28"/%3E%3C/svg%3E';
const DECODED_PLACEHOLDER_MOBILE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0" x2="1" y1="0" y2="1"%3E%3Cstop offset="0" stop-color="%23201814"/%3E%3Cstop offset=".58" stop-color="%238b5e3c"/%3E%3Cstop offset="1" stop-color="%23eadccb"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="900" height="1100" fill="url(%23g)"/%3E%3Ccircle cx="760" cy="180" r="220" fill="%23ffffff" opacity=".13"/%3E%3Ccircle cx="120" cy="930" r="180" fill="%23000000" opacity=".12"/%3E%3Crect x="66" y="92" width="650" height="490" rx="36" fill="%23ffffff" opacity=".13"/%3E%3Crect x="106" y="140" width="330" height="34" rx="17" fill="%23ffffff" opacity=".34"/%3E%3Crect x="106" y="214" width="480" height="156" rx="22" fill="%23ffffff" opacity=".2"/%3E%3Crect x="106" y="424" width="260" height="32" rx="16" fill="%23ffffff" opacity=".28"/%3E%3C/svg%3E';
const airpods3Desktop =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/airpods_3_desktop.png?v=1781198563';
const airpods3Mobile =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/airpods_3_mobile.png?v=1781198563';
const airpods4Desktop =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/airpods_4_desktop.png?v=1781198563';
const airpods4Mobile =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/airpods_4_mobile.png?v=1781198563';
const cardholdersDesktop =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/cardholders_desktop.png?v=1781198563';
const cardholdersMobile =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/cardholders_mobile.png?v=1781198564';
const decoded15Desktop =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/decoded_15_desktop.png?v=1781198564';
const decoded15Mobile =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/decoded_15_mobile.png?v=1781198564';
const decoded16Desktop =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/decoded_16_desktop.png?v=1781198564';
const decoded16Mobile =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/decoded_16_mobile.png?v=1781198563';
const decoded17Desktop =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/decoded_17_desktop.png?v=1781198564';
const decoded17Mobile =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/decoded_17_mobile.png?v=1781198564';
const watchBandsDesktop =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/watch_bands_desktop.png?v=1781198566';
const watchBandsMobile =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/watch_bands_mobile.png?v=1781198564';

export const DECODED_SECTIONS = [
  {
    id: 'iphone-17-series',
    headline: 'iPhone 17 Series',
    bannerEyebrow: 'iPhone 17 Series',
    bannerHeadline:
      'Leather, silicone, wallet and DropTec cases for the iPhone 17 family.',
    bannerUrl: decoded17Desktop,
    mobileBannerUrl: decoded17Mobile,
    modelPatterns: [
      /\biphone\s*17\s*pro\s*max\b/i,
      /\b17\s*pro\s*max\b/i,
      /\biphone\s*17\s*pro\b(?!\s*max)/i,
      /\b17\s*pro\b(?!\s*max)/i,
      /\biphone\s*(?:17\s*)?air\b/i,
      /\b17\s*air\b/i,
      /\biphone\s*17\b(?!\s*(?:pro|max|plus|air))/i,
      /\b17\b(?!\s*(?:pro|max|plus|air))/i,
    ],
    modelRankPatterns: [
      [/\b(?:iphone\s*)?17\s*pro\s*max\b/i],
      [/\b(?:iphone\s*)?17\s*pro\b(?!\s*max)/i],
      [/\biphone\s*(?:17\s*)?air\b/i, /\b17\s*air\b/i],
      [/\b(?:iphone\s*)?17\b(?!\s*(?:pro|max|plus|air))/i],
    ],
  },
  {
    id: 'iphone-16-series',
    headline: 'iPhone 16 Series',
    bannerEyebrow: 'iPhone 16 Series',
    bannerHeadline:
      'Leather, silicone and GRS protection for the iPhone 16 family.',
    bannerUrl: decoded16Desktop,
    mobileBannerUrl: decoded16Mobile,
    modelPatterns: [
      /\biphone\s*16\s*pro\s*max\b/i,
      /\b16\s*pro\s*max\b/i,
      /\biphone\s*16\s*pro\b(?!\s*max)/i,
      /\b16\s*pro\b(?!\s*max)/i,
      /\biphone\s*16\s*plus\b/i,
      /\b16\s*plus\b/i,
      /\biphone\s*16\b(?!\s*(?:pro|max|plus|e))/i,
      /\b16\b(?!\s*(?:pro|max|plus|e))/i,
    ],
    modelRankPatterns: [
      [/\b(?:iphone\s*)?16\s*pro\s*max\b/i],
      [/\b(?:iphone\s*)?16\s*pro\b(?!\s*max)/i],
      [/\b(?:iphone\s*)?16\s*plus\b/i],
      [/\b(?:iphone\s*)?16\b(?!\s*(?:pro|max|plus|e))/i],
    ],
  },
  {
    id: 'iphone-15-14-13-series',
    headline: 'iPhone 15/14/13 Series',
    bannerEyebrow: 'iPhone 15, 14 and 13',
    bannerHeadline:
      'Silicone and transparent Decoded cases for earlier iPhone generations.',
    bannerUrl: decoded15Desktop,
    mobileBannerUrl: decoded15Mobile,
    modelPatterns: [
      /\biphone\s*15\s*pro\s*max\b/i,
      /\b15\s*pro\s*max\b/i,
      /\biphone\s*15\s*pro\b(?!\s*max)/i,
      /\b15\s*pro\b(?!\s*max)/i,
      /\biphone\s*15\s*plus\b/i,
      /\b15\s*plus\b/i,
      /\biphone\s*15\b(?!\s*(?:pro|max|plus))/i,
      /\b15\b(?!\s*(?:pro|max|plus))/i,
      /\biphone\s*14\s*pro\s*max\b/i,
      /\b14\s*pro\s*max\b/i,
      /\biphone\s*14\s*pro\b(?!\s*max)/i,
      /\b14\s*pro\b(?!\s*max)/i,
      /\biphone\s*14\s*plus\b/i,
      /\b14\s*plus\b/i,
      /\biphone\s*14\b(?!\s*(?:pro|max|plus))/i,
      /\b14\b(?!\s*(?:pro|max|plus))/i,
      /\biphone\s*13\s*pro\s*max\b/i,
      /\b13\s*pro\s*max\b/i,
      /\biphone\s*13\s*pro\b(?!\s*max)/i,
      /\b13\s*pro\b(?!\s*max)/i,
      /\biphone\s*13\s*mini\b/i,
      /\b13\s*mini\b/i,
      /\biphone\s*13\b(?!\s*(?:pro|max|mini))/i,
      /\b13\b(?!\s*(?:pro|max|mini))/i,
    ],
    modelRankPatterns: [
      [/\b(?:iphone\s*)?15\s*pro\s*max\b/i],
      [/\b(?:iphone\s*)?15\s*pro\b(?!\s*max)/i],
      [/\b(?:iphone\s*)?15\s*plus\b/i],
      [/\b(?:iphone\s*)?15\b(?!\s*(?:pro|max|plus))/i],
      [/\b(?:iphone\s*)?14\s*pro\s*max\b/i],
      [/\b(?:iphone\s*)?14\s*pro\b(?!\s*max)/i],
      [/\b(?:iphone\s*)?14\s*plus\b/i],
      [/\b(?:iphone\s*)?14\b(?!\s*(?:pro|max|plus))/i],
      [/\b(?:iphone\s*)?13\s*pro\s*max\b/i],
      [/\b(?:iphone\s*)?13\s*pro\b(?!\s*max)/i],
      [/\b(?:iphone\s*)?13\s*mini\b/i],
      [/\b(?:iphone\s*)?13\b(?!\s*(?:pro|max|mini))/i],
    ],
  },
  {
    id: 'airpods-4-cases',
    headline: 'AirPods 4 Cases',
    bannerEyebrow: 'AirPods 4',
    bannerHeadline: 'Compact protection with a cleaner carry feel.',
    bannerUrl: airpods4Desktop,
    mobileBannerUrl: airpods4Mobile,
    productPatterns: [/\bairpods?\s*4\b/i],
  },
  {
    id: 'airpods-3-cases',
    headline: 'AirPods 3 Cases',
    bannerEyebrow: 'AirPods 3',
    bannerHeadline: 'Case protection for the newest Pro earbuds.',
    bannerUrl: airpods3Desktop,
    mobileBannerUrl: airpods3Mobile,
    productPatterns: [/\bairpods?\s*(?:pro\s*)?3\b/i],
  },
  {
    id: 'apple-watch-straps',
    headline: 'Apple Watch Straps',
    bannerEyebrow: 'Titanium and Ares Splice Band',
    bannerHeadline: 'Straps that sharpen the watch without adding bulk.',
    bannerUrl: watchBandsDesktop,
    mobileBannerUrl: watchBandsMobile,
    productPatterns: [/\btitanium\b/i, /\bares\s*splice\s*band\b/i],
  },
  {
    id: 'mag-card-holder',
    headline: 'Mag Card Holder',
    bannerEyebrow: 'Magnetic carry',
    bannerHeadline: 'Card holders for cleaner pocket setups.',
    bannerUrl: cardholdersDesktop,
    mobileBannerUrl: cardholdersMobile,
    productPatterns: [/\bmag\s*card\s*holder\b/i, /\bcard\s*holder\b/i],
  },
];

export const DECODED_PRODUCT_SEARCH_QUERIES = ['vendor:Decoded'];

export function DecodedBrandRoute({brand, collection, products}) {
  const style = getBrandThemeVars(brand);
  const decodedProducts = products || [];

  return (
    <div
      className={`pz-brand-page pz-brand-page--decoded pz-brand-family--${brand.family}`}
      style={style}
    >
      <div className="pz-shell">
        <nav
          className="pz-breadcrumbs pz-decoded-route-head"
          aria-label="Breadcrumb"
        >
          <Link to="/" prefetch="intent">
            Home
          </Link>
          <span>/</span>
          <Link to="/brands" prefetch="intent">
            Brands
          </Link>
          <span>/</span>
          <span>{brand.name}</span>
        </nav>
      </div>

      {DECODED_SECTIONS.map((section, sectionIndex) => {
        const sectionVariants = getDecodedSectionEntries(
          decodedProducts,
          section,
        );

        if (!sectionVariants.length) return null;

        return (
          <section key={section.id} className="pz-brand-feature-block">
            <section className="pz-brand-banner-section">
              <div className="pz-shell">
                <div className="pz-brand-banner-card pz-decoded-banner-card">
                  <picture>
                    <source
                      media="(max-width: 767px)"
                      srcSet={
                        section.mobileBannerUrl || DECODED_PLACEHOLDER_MOBILE
                      }
                    />
                    <img
                      src={section.bannerUrl || DECODED_PLACEHOLDER_DESKTOP}
                      alt={`${section.headline} banner`}
                      className="pz-brand-banner-image"
                      width={BRAND_BANNER_IMAGE_WIDTH}
                      height={BRAND_BANNER_IMAGE_HEIGHT}
                      loading={sectionIndex === 0 ? 'eager' : 'lazy'}
                    />
                  </picture>
                </div>
              </div>
            </section>

            <section className="pz-brand-section pz-brand-products-only">
              <div className="pz-shell">
                <div className="pz-decoded-section-head">
                  <h2>{section.headline}</h2>
                </div>

                <div className="pz-card-grid pz-brand-variant-grid">
                  {sectionVariants.map(({product, variant}, index) => (
                    <BrandVariantCard
                      key={variant.id}
                      brand={brand}
                      product={product}
                      variant={variant}
                      loading={
                        sectionIndex === 0 && index < 4 ? 'eager' : 'lazy'
                      }
                    />
                  ))}
                </div>
              </div>
            </section>
          </section>
        );
      })}

      {collection?.id ? (
        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      ) : null}
    </div>
  );
}

function getDecodedSectionEntries(products, section) {
  if (section.modelPatterns?.length) {
    return dedupeDecodedPhoneEntriesByColor(
      sortDecodedSectionEntries(
        (products || []).flatMap((product) =>
          getDecodedProductVariants(product)
            .filter((variant) =>
              decodedVariantMatchesSection(product, variant, section),
            )
            .map((variant) => ({product, variant})),
        ),
        section,
      ),
    );
  }

  return dedupeVariantEntries(
    (products || [])
      .filter((product) => decodedProductMatchesSection(product, section))
      .flatMap((product) =>
        getProductCardEntries(product, 'color').map((variant) => ({
          product,
          variant,
        })),
      ),
  );
}

function sortDecodedSectionEntries(entries, section) {
  if (!section.modelRankPatterns?.length) return entries;

  return [...entries].sort((a, b) => {
    const rankA = getDecodedSectionEntryRank(a, section);
    const rankB = getDecodedSectionEntryRank(b, section);
    if (rankA !== rankB) return rankA - rankB;

    return `${a.product?.title || ''} ${a.variant?.title || ''}`.localeCompare(
      `${b.product?.title || ''} ${b.variant?.title || ''}`,
    );
  });
}

function getDecodedSectionEntryRank(entry, section) {
  const text = normalizeDecodedText(
    `${getDecodedVariantText(entry.variant)} ${getDecodedProductText(
      entry.product,
    )}`,
  );
  const rank = section.modelRankPatterns.findIndex((patterns) =>
    patterns.some((pattern) => pattern.test(text)),
  );

  return rank === -1 ? section.modelRankPatterns.length : rank;
}

function getDecodedProductVariants(product) {
  const variants = (product?.variants?.nodes || []).filter(
    (variant) => variant?.id,
  );
  const fallbackVariant =
    product?.selectedOrFirstAvailableVariant || variants[0] || null;

  return variants.length ? variants : fallbackVariant ? [fallbackVariant] : [];
}

function decodedVariantMatchesSection(product, variant, section) {
  const variantText = getDecodedVariantText(variant);
  const productText = getDecodedProductText(product);
  const matchingText = containsAnyDecodedModel(variantText)
    ? variantText
    : `${variantText} ${productText}`;

  return section.modelPatterns.some((pattern) => pattern.test(matchingText));
}

function decodedProductMatchesSection(product, section) {
  const productText = getDecodedProductText(product);
  return section.productPatterns.some((pattern) => pattern.test(productText));
}

function containsAnyDecodedModel(text) {
  return DECODED_SECTIONS.some((section) =>
    (section.modelPatterns || []).some((pattern) => pattern.test(text)),
  );
}

function getDecodedVariantText(variant) {
  const optionText = (variant?.selectedOptions || [])
    .map((option) => `${option?.name || ''} ${option?.value || ''}`)
    .join(' ');

  return normalizeDecodedText(`${variant?.title || ''} ${optionText}`);
}

function getDecodedProductText(product) {
  return normalizeDecodedText(
    `${product?.title || ''} ${product?.vendor || ''}`,
  );
}

function normalizeDecodedText(text) {
  return String(text || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeVariantEntries(entries) {
  const seen = new Set();
  return entries.filter(({product, variant}) => {
    const key = `${product?.id || product?.handle}:${variant?.id}`;
    if (!variant?.id || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeDecodedPhoneEntriesByColor(entries) {
  const seen = new Set();
  return entries.filter(({product, variant}) => {
    const key = `${product?.id || product?.handle}:${getDecodedVariantColorKey(
      variant,
    )}`;
    if (!variant?.id || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getDecodedVariantColorKey(variant) {
  const colorValue = (variant?.selectedOptions || []).find((option) =>
    /colou?r/i.test(option?.name || ''),
  )?.value;

  return colorValue ? colorValue.toLowerCase() : 'default';
}
