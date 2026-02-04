import {Suspense} from 'react';
import {Await} from 'react-router';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header}) {
  const year = new Date().getFullYear();
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {() => (
          <footer className="footer">
            <p className="footer-copy">
              © {year} {header.shop.name}. All rights reserved.
            </p>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
