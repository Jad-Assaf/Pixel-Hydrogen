import {getSitemap} from '@shopify/hydrogen';
import {canonicalizeRequest} from '~/lib/canonical';

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, params, context: {storefront}}) {
  const canonicalRequest = canonicalizeRequest(request);
  const response = await getSitemap({
    storefront,
    request: canonicalRequest,
    params,
    locales: ['EN-US', 'EN-CA', 'FR-CA'],
    getLink: ({type, baseUrl, handle, locale}) => {
      if (!locale) return `${baseUrl}/${type}/${handle}`;
      return `${baseUrl}/${locale}/${type}/${handle}`;
    },
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}

/** @typedef {import('./+types/sitemap.$type.$page[.xml]').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
