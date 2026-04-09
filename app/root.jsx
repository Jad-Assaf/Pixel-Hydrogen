import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import favicon from '~/assets/mini-logo.webp';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from './components/PageLayout';

const MAIN_MENU_HANDLE = 'new-main-menu';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/webp', href: favicon},
  ];
}

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
    metaPixelId:
      env.PUBLIC_META_PIXEL_ID || env.PUBLIC_FACEBOOK_PIXEL_ID || '',
    googlePixelId:
      env.PUBLIC_GOOGLE_PIXEL_ID ||
      env.PUBLIC_GA_MEASUREMENT_ID ||
      env.PUBLIC_GOOGLE_TAG_ID ||
      '',
    googleMerchantVerification:
      env.PUBLIC_GOOGLE_MERCHANT_CENTER_VERIFICATION ||
      env.PUBLIC_GOOGLE_SITE_VERIFICATION ||
      '',
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: MAIN_MENU_HANDLE,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  const {
    collectionIds,
    collectionHandles,
  } = getMenuCollectionReferences(header?.menu?.items || []);
  let menuCollectionAvailability = {};
  let menuCollectionMedia = {};

  if (collectionIds.length) {
    const {nodes} = await storefront.query(MENU_COLLECTIONS_QUERY, {
      variables: {ids: collectionIds},
    });

    menuCollectionAvailability = (nodes || []).reduce((acc, node) => {
      if (node?.__typename === 'Collection') {
        const hasProducts = Boolean(node.products?.nodes?.length);
        acc[node.id] = hasProducts;
        acc[`id:${node.id}`] = hasProducts;
        if (node.handle) {
          acc[`handle:${node.handle.toLowerCase()}`] = hasProducts;
        }
      }
      return acc;
    }, {});

    menuCollectionMedia = (nodes || []).reduce((acc, node) => {
      if (node?.__typename !== 'Collection') return acc;

      const image = pickCollectionMenuImage(node);
      if (!image?.url) return acc;

      if (node.id) {
        acc[node.id] = image;
        acc[`id:${node.id}`] = image;
      }
      if (node.handle) {
        acc[`handle:${node.handle.toLowerCase()}`] = image;
      }

      return acc;
    }, {});
  }

  if (collectionHandles.length) {
    const handleResults = await Promise.all(
      collectionHandles.map((handle) =>
        storefront
          .query(MENU_COLLECTION_BY_HANDLE_QUERY, {
            variables: {handle},
          })
          .catch(() => null),
      ),
    );

    handleResults.forEach((result, index) => {
      const requestedHandle = collectionHandles[index];
      const collection = result?.collection;
      const resolvedHandle = (collection?.handle || requestedHandle || '').toLowerCase();
      if (!resolvedHandle) return;
      const hasProducts = Boolean(collection?.products?.nodes?.length);
      menuCollectionAvailability[`handle:${resolvedHandle}`] = hasProducts;
      if (collection?.id) {
        menuCollectionAvailability[collection.id] = hasProducts;
        menuCollectionAvailability[`id:${collection.id}`] = hasProducts;
      }

      const image = pickCollectionMenuImage(collection);
      if (image?.url) {
        menuCollectionMedia[`handle:${resolvedHandle}`] = image;
        if (collection?.id) {
          menuCollectionMedia[collection.id] = image;
          menuCollectionMedia[`id:${collection.id}`] = image;
        }
      }
    });
  }

  return {header, menuCollectionAvailability, menuCollectionMedia};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: MAIN_MENU_HANDLE,
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();
  /** @type {RootLoader | undefined} */
  const data = useRouteLoaderData('root');
  const metaPixelId = data?.metaPixelId || '';
  const googlePixelId = data?.googlePixelId || '';
  const googleMerchantVerification = data?.googleMerchantVerification || '';
  const serializedMetaPixelId = JSON.stringify(metaPixelId);
  const serializedGooglePixelId = JSON.stringify(googlePixelId);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
        {googleMerchantVerification ? (
          <meta
            name="google-site-verification"
            content={googleMerchantVerification}
          />
        ) : null}
        {googlePixelId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${googlePixelId}`}
            />
            <script
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', ${serializedGooglePixelId});`,
              }}
            />
          </>
        ) : null}
        {metaPixelId ? (
          <>
            <script
              async
              src="https://connect.facebook.net/en_US/fbevents.js"
            />
            <script
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: `window.fbq=window.fbq||function(){window.fbq.callMethod?window.fbq.callMethod.apply(window.fbq,arguments):window.fbq.queue.push(arguments)};if(!window._fbq)window._fbq=window.fbq;window.fbq.push=window.fbq;window.fbq.loaded=true;window.fbq.version='2.0';window.fbq.queue=window.fbq.queue||[];window.fbq('init', ${serializedMetaPixelId});window.fbq('track', 'PageView');`,
              }}
            />
          </>
        ) : null}
      </head>
      <body>
        {metaPixelId ? (
          <noscript>
            <img
              height="1"
              width="1"
              style={{display: 'none'}}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        ) : null}
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function getMenuCollectionReferences(items) {
  const ids = new Set();
  const handles = new Set();
  const stack = [...(items || [])];

  while (stack.length) {
    const item = stack.pop();
    if (!item) continue;
    if (item.type === 'COLLECTION' && item.resourceId) {
      ids.add(item.resourceId);
    }
    const handle = getCollectionHandleFromMenuUrl(item.url);
    if (handle) {
      handles.add(handle.toLowerCase());
    }
    if (item.items?.length) {
      stack.push(...item.items);
    }
  }

  return {
    collectionIds: Array.from(ids),
    collectionHandles: Array.from(handles),
  };
}

function getCollectionHandleFromMenuUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url, 'https://example.com');
    const match = parsed.pathname.match(/\/collections\/([^/]+)/i);
    if (!match?.[1]) return null;
    const handle = decodeURIComponent(match[1]);
    if (!handle || handle.toLowerCase() === 'all') return null;
    return handle;
  } catch {
    return null;
  }
}

function pickCollectionMenuImage(collection) {
  const candidates = [
    collection?.image,
    collection?.latestProduct?.nodes?.[0]?.featuredImage,
  ];

  return candidates.find((image) => image?.url) || null;
}

const MENU_COLLECTIONS_QUERY = `#graphql
  query MenuCollections($ids: [ID!]!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      __typename
      ... on Collection {
        id
        handle
        image {
          url
          altText
          width
          height
        }
        latestProduct: products(first: 1, sortKey: CREATED, reverse: true) {
          nodes {
            featuredImage {
              url
              altText
              width
              height
            }
          }
        }
        products(first: 1) {
          nodes {
            id
          }
        }
      }
    }
  }
`;

const MENU_COLLECTION_BY_HANDLE_QUERY = `#graphql
  query MenuCollectionByHandle(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      image {
        url
        altText
        width
        height
      }
      latestProduct: products(first: 1, sortKey: CREATED, reverse: true) {
        nodes {
          featuredImage {
            url
            altText
            width
            height
          }
        }
      }
      products(first: 1) {
        nodes {
          id
        }
      }
    }
  }
`;

export default function App() {
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('./+types/root').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
