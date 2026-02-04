import {Await} from 'react-router';
import {Suspense} from 'react';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';

/**
 * @param {PageLayoutProps}
 */
export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  menuCollectionAvailability,
  publicStoreDomain,
}) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <MobileMenuAside
        header={header}
        publicStoreDomain={publicStoreDomain}
        menuCollectionAvailability={menuCollectionAvailability}
      />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          menuCollectionAvailability={menuCollectionAvailability}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main>{children}</main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

/**
 * @param {{cart: PageLayoutProps['cart']}}
 */
function CartAside({cart}) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

/**
 * @param {{
 *   header: PageLayoutProps['header'];
 *   publicStoreDomain: PageLayoutProps['publicStoreDomain'];
 *   menuCollectionAvailability?: PageLayoutProps['menuCollectionAvailability'];
 * }}
 */
function MobileMenuAside({
  header,
  publicStoreDomain,
  menuCollectionAvailability,
}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          menuCollectionAvailability={menuCollectionAvailability}
        />
      </Aside>
    )
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {Record<string, boolean>} [menuCollectionAvailability]
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
