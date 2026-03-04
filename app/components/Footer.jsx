import {Suspense} from 'react';
import {Await, Link} from 'react-router';

/**
 * @param {FooterProps}
 */
export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
  menuCollectionAvailability,
}) {
  return (
    <Suspense fallback={<footer className="pz-footer" />}>
      <Await resolve={footerPromise}>
        {() => (
          <FooterBody
            header={header}
            publicStoreDomain={publicStoreDomain}
            menuCollectionAvailability={menuCollectionAvailability}
          />
        )}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{
 *   header: FooterProps['header'];
 *   publicStoreDomain: string;
 *   menuCollectionAvailability?: FooterProps['menuCollectionAvailability'];
 * }}
 */
function FooterBody({header, publicStoreDomain, menuCollectionAvailability}) {
  const year = new Date().getFullYear();
  const shopName = header?.shop?.name || 'Pixel Zones';
  const shopLinks = getMenuCollectionLinks(
    header?.menu?.items || [],
    menuCollectionAvailability,
  );

  return (
    <footer className="pz-footer">
      <div className="pz-shell">
        <div className="pz-footer-grid">
          <div>
            <Link to="/" className="pz-footer-brand" prefetch="intent">
              {shopName}
            </Link>
            <p className="pz-footer-copy-text">
              Premium electronics curated for modern living. Built for people who
              care about performance and design.
            </p>
          </div>

          <div>
            <h4 className="pz-footer-heading">Shop</h4>
            <ul className="pz-footer-links">
              {(shopLinks.length ? shopLinks : FALLBACK_LINKS).map((item) => (
                <FooterLink
                  key={item.id || item.url || item.title}
                  item={item}
                  publicStoreDomain={publicStoreDomain}
                />
              ))}
            </ul>
          </div>

          <div>
            <h4 className="pz-footer-heading">Company</h4>
            <ul className="pz-footer-links">
              {COMPANY_LINKS.map((item) => (
                <FooterLink
                  key={item.id || item.url || item.title}
                  item={item}
                  publicStoreDomain={publicStoreDomain}
                />
              ))}
            </ul>
          </div>
        </div>

        <div className="pz-footer-bottom">
          <p>
            © {year} {shopName}. All rights reserved.
          </p>
          <div className="pz-footer-bottom-links">
            <Link to="/policies" prefetch="intent">
              Policies
            </Link>
            <Link to="/search" prefetch="intent">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({item, publicStoreDomain}) {
  const normalized = normalizeMenuUrl(item.url, publicStoreDomain);
  if (!normalized) return null;

  if (normalized.external) {
    return (
      <li>
        <a href={normalized.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link to={normalized.url} prefetch="intent">
        {item.title}
      </Link>
    </li>
  );
}

function normalizeMenuUrl(url, publicStoreDomain) {
  if (!url) return null;

  try {
    const domain = publicStoreDomain
      ? publicStoreDomain.replace(/^https?:\/\//, '')
      : '';
    const parsed = new URL(url, 'https://example.com');

    if (
      parsed.host === 'example.com' ||
      parsed.host === domain ||
      parsed.host === `${domain}.myshopify.com`
    ) {
      return {url: `${parsed.pathname}${parsed.search}${parsed.hash}`, external: false};
    }

    return {url: parsed.toString(), external: true};
  } catch {
    return {url, external: /^https?:/.test(url)};
  }
}

function getMenuCollectionLinks(items, availabilityMap = {}) {
  const seen = new Set();

  return (items || [])
    .filter(
      (item) => {
        const handle = getCollectionHandleFromMenuUrl(item?.url);
        if (!(item?.type === 'COLLECTION' || handle) || !item?.url) {
          return false;
        }

        const unavailableById =
          item.resourceId &&
          (availabilityMap[item.resourceId] === false ||
            availabilityMap[`id:${item.resourceId}`] === false);
        const unavailableByHandle =
          handle && availabilityMap[`handle:${handle.toLowerCase()}`] === false;

        return !unavailableById && !unavailableByHandle;
      },
    )
    .filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
    }));
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

const FALLBACK_LINKS = [
  {id: 'shop-all', title: 'All products', url: '/shop'},
  {id: 'collections', title: 'Collections', url: '/collections'},
  {id: 'search', title: 'Search', url: '/search'},
];

const COMPANY_LINKS = [
  {id: 'privacy-policy', title: 'Privacy Policy', url: '/policies/privacy-policy'},
  {id: 'terms-of-service', title: 'Terms of Service', url: '/policies/terms-of-service'},
  {id: 'shipping-policy', title: 'Shipping', url: '/policies/shipping-policy'},
  {id: 'contact', title: 'Contact', url: '/pages/contact'},
];

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 * @property {Record<string, boolean>} [menuCollectionAvailability]
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
