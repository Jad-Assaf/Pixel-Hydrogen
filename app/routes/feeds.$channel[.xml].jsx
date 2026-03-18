import {CANONICAL_ORIGIN, canonicalUrl} from '~/lib/canonical';

const SUPPORTED_CHANNELS = new Set(['google', 'meta']);
const FEED_PAGE_SIZE = 250;

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const channel = (params.channel || '').toLowerCase();
  if (!SUPPORTED_CHANNELS.has(channel)) {
    throw new Response('Feed not found', {status: 404});
  }

  const products = await fetchAllFeedProducts(context.storefront);
  const body = buildFeedXml({channel, products});

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `max-age=${60 * 60}, stale-while-revalidate=${60 * 60 * 24}`,
    },
  });
}

/**
 * @param {Storefront} storefront
 */
async function fetchAllFeedProducts(storefront) {
  /** @type {Array<FeedProduct>} */
  const products = [];
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const {products: page} = await storefront.query(FEED_PRODUCTS_QUERY, {
      variables: {
        first: FEED_PAGE_SIZE,
        after,
      },
      cache: storefront.CacheLong(),
    });

    const nodes = page?.nodes || [];
    products.push(...nodes);

    hasNextPage = Boolean(page?.pageInfo?.hasNextPage);
    after = page?.pageInfo?.endCursor || null;

    if (!hasNextPage || !after) break;
  }

  return products;
}

function buildFeedXml({channel, products}) {
  const title =
    channel === 'google'
      ? 'Pixel Zones Google Shopping Feed'
      : 'Pixel Zones Meta Catalog Feed';
  const description =
    channel === 'google'
      ? 'Product feed for Google Merchant Center'
      : 'Product feed for Meta Catalog';

  const itemsXml = products
    .map((product) => buildFeedItemXml(product))
    .filter(Boolean)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${CANONICAL_ORIGIN}</link>
    <description>${escapeXml(description)}</description>
${itemsXml}
  </channel>
</rss>`;
}

/**
 * @param {FeedProduct} product
 */
function buildFeedItemXml(product) {
  const variant = product.selectedOrFirstAvailableVariant;
  if (!variant?.price?.amount || !variant?.price?.currencyCode || !product?.handle) {
    return '';
  }

  const productId = parseResourceId(product.id) || product.handle;
  const variantId = parseResourceId(variant.id) || variant.sku || `${productId}-default`;
  const itemId = variant.sku || `${productId}-${variantId}`;
  const link = canonicalUrl(`/products/${product.handle}`);
  const image = variant.image?.url || product.featuredImage?.url || '';
  const availability = variant.availableForSale ? 'in stock' : 'out of stock';
  const description = compactWhitespace(
    product.seo?.description || product.description || '',
  );
  const brand = product.vendor || 'Pixel Zones';
  const price = formatFeedPrice(variant.price.amount, variant.price.currencyCode);
  const salePrice =
    variant.compareAtPrice?.amount &&
    Number(variant.compareAtPrice.amount) > Number(variant.price.amount)
      ? formatFeedPrice(variant.price.amount, variant.price.currencyCode)
      : null;

  return `    <item>
      <g:id>${escapeXml(itemId)}</g:id>
      <title>${escapeXml(product.title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(link)}</link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${escapeXml(price)}</g:price>
${salePrice ? `      <g:sale_price>${escapeXml(salePrice)}</g:sale_price>` : ''}
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:item_group_id>${escapeXml(String(productId))}</g:item_group_id>
${variant.sku ? `      <g:mpn>${escapeXml(variant.sku)}</g:mpn>` : ''}
    </item>`;
}

function parseResourceId(gid) {
  if (!gid) return '';
  const parts = gid.split('/');
  return parts[parts.length - 1] || '';
}

function formatFeedPrice(amount, currencyCode) {
  const numeric = Number(amount);
  const formatted = Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00';
  return `${formatted} ${currencyCode}`;
}

function compactWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const FEED_PRODUCTS_QUERY = `#graphql
  query FeedProducts(
    $first: Int!
    $after: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after, sortKey: UPDATED_AT) {
      nodes {
        id
        handle
        title
        description
        vendor
        featuredImage {
          url
          altText
        }
        seo {
          description
        }
        selectedOrFirstAvailableVariant(
          selectedOptions: []
          ignoreUnknownOptions: true
          caseInsensitiveMatch: true
        ) {
          id
          sku
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/** @typedef {import('./+types/feeds.$channel[.xml]').Route} Route */
/** @typedef {import('@shopify/hydrogen').Storefront} Storefront */
/**
 * @typedef {import('storefrontapi.generated').FeedProductsQuery['products']['nodes'][number]} FeedProduct
 */
