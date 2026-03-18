import {getSitemapIndex} from '@shopify/hydrogen';

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context: {storefront}}) {
  const response = await getSitemapIndex({
    storefront,
    request,
  });
  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);
  response.headers.set('Content-Type', 'application/xml; charset=utf-8');
  return response;
}

/** @typedef {import('./+types/[sitemap.xml]').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
