import {useLoaderData} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.page.title ?? ''}`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request, params}) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();
  const handle = page?.handle?.toLowerCase() || '';
  const isContactPage = handle === 'contact';
  const pageClassName = [
    'page',
    'pz-static-page',
    'pz-cms-page',
    isContactPage ? 'pz-contact-page' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={pageClassName} data-handle={handle || undefined}>
      <header className="pz-static-page-header">
        <h1>{page.title}</h1>
      </header>
      <main
        className="pz-static-page-content"
        dangerouslySetInnerHTML={{__html: page.body}}
      />
      {isContactPage ? (
        <section className="pz-contact-map-block" aria-label="Store location">
          <h2>Visit Us</h2>
          <iframe
            className="pz-map-embed"
            src={PIXEL_ZONES_MAP_EMBED_URL}
            title="Pixel Zones location map"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      ) : null}
    </article>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

const PIXEL_ZONES_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.4893739188915!2d35.51732977606102!3d33.87704827322348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f170dd933444d%3A0xad92da460ee50e1d!2sPixel%20Zones!5e0!3m2!1sen!2slb!4v1773604137545!5m2!1sen!2slb';

/** @typedef {import('./+types/pages.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
