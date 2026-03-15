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
            <div className="pz-footer-socials" aria-label="Social links">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg
                  fill="#000000"
                  width="50"
                  height="50"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M22.3,8.4c-0.8,0-1.4,0.6-1.4,1.4c0,0.8,0.6,1.4,1.4,1.4c0.8,0,1.4-0.6,1.4-1.4C23.7,9,23.1,8.4,22.3,8.4z" />
                  <path d="M16,10.2c-3.3,0-5.9,2.7-5.9,5.9s2.7,5.9,5.9,5.9s5.9-2.7,5.9-5.9S19.3,10.2,16,10.2z M16,19.9c-2.1,0-3.8-1.7-3.8-3.8 c0-2.1,1.7-3.8,3.8-3.8c2.1,0,3.8,1.7,3.8,3.8C19.8,18.2,18.1,19.9,16,19.9z" />
                  <path d="M20.8,4h-9.5C7.2,4,4,7.2,4,11.2v9.5c0,4,3.2,7.2,7.2,7.2h9.5c4,0,7.2-3.2,7.2-7.2v-9.5C28,7.2,24.8,4,20.8,4z M25.7,20.8 c0,2.7-2.2,5-5,5h-9.5c-2.7,0-5-2.2-5-5v-9.5c0-2.7,2.2-5,5-5h9.5c2.7,0,5,2.2,5,5V20.8z" />
                </svg>
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20 1C21.6569 1 23 2.34315 23 4V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H20ZM20 3C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H15V13.9999H17.0762C17.5066 13.9999 17.8887 13.7245 18.0249 13.3161L18.4679 11.9871C18.6298 11.5014 18.2683 10.9999 17.7564 10.9999H15V8.99992C15 8.49992 15.5 7.99992 16 7.99992H18C18.5523 7.99992 19 7.5522 19 6.99992V6.31393C19 5.99091 18.7937 5.7013 18.4813 5.61887C17.1705 5.27295 16 5.27295 16 5.27295C13.5 5.27295 12 6.99992 12 8.49992V10.9999H10C9.44772 10.9999 9 11.4476 9 11.9999V12.9999C9 13.5522 9.44771 13.9999 10 13.9999H12V21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H20Z"
                    fill="#0F0F0F"
                  />
                </svg>
              </a>
            </div>
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

        <section className="pz-footer-map" aria-label="Store location">
          <h4 className="pz-footer-heading">Visit Us</h4>
          <iframe
            className="pz-map-embed"
            src={PIXEL_ZONES_MAP_EMBED_URL}
            title="Pixel Zones location map"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

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

const INSTAGRAM_URL = 'https://www.instagram.com/pixel.zones/';
const FACEBOOK_URL = 'https://www.facebook.com/people/Pixel-Zones/61556339013618/';
const PIXEL_ZONES_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.4893739188915!2d35.51732977606102!3d33.87704827322348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f170dd933444d%3A0xad92da460ee50e1d!2sPixel%20Zones!5e0!3m2!1sen!2slb!4v1773604137545!5m2!1sen!2slb';

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 * @property {Record<string, boolean>} [menuCollectionAvailability]
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
