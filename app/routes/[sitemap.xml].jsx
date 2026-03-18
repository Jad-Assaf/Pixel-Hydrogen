import {getSitemapIndex} from '@shopify/hydrogen';
import {canonicalizeRequest} from '~/lib/canonical';

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context: {storefront}}) {
  const canonicalRequest = canonicalizeRequest(request);
  const response = await getSitemapIndex({
    storefront,
    request: canonicalRequest,
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}

/** @typedef {import('./+types/[sitemap.xml]').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
