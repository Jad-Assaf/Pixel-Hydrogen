import {Suspense} from 'react';
import {Await, Link} from 'react-router';

/**
 * @param {FooterProps}
 */
export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}) {
  return (
    <Suspense fallback={<footer className="pz-footer" />}>
      <Await resolve={footerPromise}>
        {() => (
          <FooterBody
            header={header}
            publicStoreDomain={publicStoreDomain}
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
 * }}
 */
function FooterBody({header, publicStoreDomain}) {
  const year = new Date().getFullYear();
  const shopName = header?.shop?.name || 'Pixel Zones';

  return (
    <footer className="pz-footer">
      <section className="pz-footer-map" aria-label="Store location">
        <a
          className="pz-footer-map-link"
          href={PIXEL_ZONES_MAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Pixel Zones location in Google Maps"
        >
          <img
            src={PIXEL_ZONES_MAP_IMAGE_URL}
            alt="Pixel Zones location map"
            loading="lazy"
            width="1200"
            height="675"
          />
          <div className="pz-footer-map-overlay" aria-hidden="true">
            <p className="pz-footer-map-kicker">
              <span className="pz-footer-map-pin">📍</span>
              <span>Our Showroom</span>
            </p>
            <h3>Pixel Zones</h3>
            <p className="pz-footer-map-address">
              Beirut, Adlieh, Sami Al Solh Avenue, Sequoia Building
            </p>
            <span className="pz-footer-map-cta">Open in google maps</span>
          </div>
        </a>
      </section>

      <div className="pz-shell">
        <div className="pz-footer-grid">
          <div>
            <Link to="/" className="pz-footer-brand" prefetch="intent">
              {shopName}
            </Link>
            <p className="pz-footer-copy-text">
              Premium electronics curated for modern living. Built for people
              who care about performance and design.
            </p>
            <div className="pz-footer-socials" aria-label="Social links">
              <a
                className="pz-social-icon pz-social-icon--instagram"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg
                  width="64px"
                  height="64px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {' '}
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M2 6C2 3.79086 3.79086 2 6 2H18C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18V6ZM6 4C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6ZM12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9ZM7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12ZM17.5 8C18.3284 8 19 7.32843 19 6.5C19 5.67157 18.3284 5 17.5 5C16.6716 5 16 5.67157 16 6.5C16 7.32843 16.6716 8 17.5 8Z"
                      fill="#000000"
                    ></path>{' '}
                  </g>
                </svg>
              </a>
              <a
                className="pz-social-icon pz-social-icon--facebook"
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg
                  fill="#000000"
                  width="64px"
                  height="64px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {' '}
                    <path d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9164 21.5878 18.0622 20.3855 19.6099 18.57C21.1576 16.7546 22.0054 14.4456 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z"></path>{' '}
                  </g>
                </svg>
              </a>
              <a
                className="pz-social-icon pz-social-icon--youtube"
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 -3 20 20"
                  fill="#000000"
                  aria-hidden="true"
                  focusable="false"
                >
                  <g
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      transform="translate(-300.000000, -7442.000000)"
                      fill="#000000"
                    >
                      <g transform="translate(56.000000, 160.000000)">
                        <path d="M251.988432,7291.58588 L251.988432,7285.97425 C253.980638,7286.91168 255.523602,7287.8172 257.348463,7288.79353 C255.843351,7289.62824 253.980638,7290.56468 251.988432,7291.58588 M263.090998,7283.18289 C262.747343,7282.73013 262.161634,7282.37809 261.538073,7282.26141 C259.705243,7281.91336 248.270974,7281.91237 246.439141,7282.26141 C245.939097,7282.35515 245.493839,7282.58153 245.111335,7282.93357 C243.49964,7284.42947 244.004664,7292.45151 244.393145,7293.75096 C244.556505,7294.31342 244.767679,7294.71931 245.033639,7294.98558 C245.376298,7295.33761 245.845463,7295.57995 246.384355,7295.68865 C247.893451,7296.0008 255.668037,7296.17532 261.506198,7295.73552 C262.044094,7295.64178 262.520231,7295.39147 262.895762,7295.02447 C264.385932,7293.53455 264.28433,7285.06174 263.090998,7283.18289" />
                      </g>
                    </g>
                  </g>
                </svg>
              </a>
            </div>
            <section className="pz-footer-company">
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
            </section>
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

const COMPANY_LINKS = [
  {id: 'privacy-policy', title: 'Privacy Policy', url: '/policies/privacy-policy'},
  {id: 'terms-of-service', title: 'Terms of Service', url: '/policies/terms-of-service'},
  {id: 'shipping-policy', title: 'Shipping', url: '/policies/shipping-policy'},
  {id: 'contact', title: 'Contact', url: '/pages/contact'},
];

const INSTAGRAM_URL = 'https://www.instagram.com/pixel.zones/';
const FACEBOOK_URL = 'https://www.facebook.com/people/Pixel-Zones/61556339013618/';
const YOUTUBE_URL = 'https://www.youtube.com/@pixelzones';
const PIXEL_ZONES_MAP_URL = 'https://maps.google.com/?q=Pixel+Zones,+Sami+Solh+Avenu,+Beirut';
const PIXEL_ZONES_MAP_IMAGE_URL =
  'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/use_the_color_202603192244.jpg?v=1773953210';

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
