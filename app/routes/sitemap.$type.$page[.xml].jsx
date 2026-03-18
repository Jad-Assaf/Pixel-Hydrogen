import {getSitemap} from '@shopify/hydrogen';

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, params, context: {storefront}}) {
  const upstream = await getSitemap({
    storefront,
    request,
    params,
    locales: ['EN-US', 'EN-CA', 'FR-CA'],
    getLink: ({type, baseUrl, handle, locale}) => {
      if (!locale) return `${baseUrl}/${type}/${handle}`;
      return `${baseUrl}/${locale}/${type}/${handle}`;
    },
  });
  const text = await upstream.text();
  const frequencyDecorated = withSitemapChangeFrequency(text);

  return new Response(frequencyDecorated, {
    status: upstream.status,
    headers: {
      'Cache-Control': `max-age=${60 * 60 * 24}`,
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

function withSitemapChangeFrequency(xml) {
  const normalized = String(xml || '').trim();
  if (!normalized.includes('<urlset')) return normalized;

  return normalized.replace(/<url>([\s\S]*?)<\/url>/g, (urlBlock) => {
    const locMatch = urlBlock.match(/<loc>([\s\S]*?)<\/loc>/i);
    if (!locMatch?.[1]) return urlBlock;

    const location = locMatch[1];
    const frequency = resolveChangeFrequency(location);
    const withoutExistingFrequency = urlBlock.replace(
      /\s*<changefreq>[\s\S]*?<\/changefreq>\s*/i,
      '\n',
    );

    return withoutExistingFrequency.replace(
      /<\/loc>/i,
      `</loc>\n    <changefreq>${frequency}</changefreq>`,
    );
  });
}

function resolveChangeFrequency(location) {
  try {
    const parsed = new URL(location);
    const pathname = parsed.pathname || '/';
    const normalizedPath = pathname.replace(/\/+$/, '') || '/';
    const isHome =
      normalizedPath === '/' || /^\/[a-z]{2}(?:-[a-z]{2})?$/i.test(normalizedPath);
    const isProduct = /\/products\//i.test(pathname);

    return isHome || isProduct ? 'daily' : 'weekly';
  } catch {
    return /\/products\//i.test(location) ? 'daily' : 'weekly';
  }
}

/** @typedef {import('./+types/sitemap.$type.$page[.xml]').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
