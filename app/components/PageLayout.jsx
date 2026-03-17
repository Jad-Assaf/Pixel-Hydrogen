import {Await, Link} from 'react-router';
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
  menuCollectionMedia,
  publicStoreDomain,
}) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <MobileMenuAside
        header={header}
        publicStoreDomain={publicStoreDomain}
        menuCollectionAvailability={menuCollectionAvailability}
        menuCollectionMedia={menuCollectionMedia}
      />
      <div className="pz-site">
        {header ? (
          <Header
            header={header}
            cart={cart}
            isLoggedIn={isLoggedIn}
            menuCollectionAvailability={menuCollectionAvailability}
            menuCollectionMedia={menuCollectionMedia}
            publicStoreDomain={publicStoreDomain}
          />
        ) : null}
        <main className="pz-main">{children}</main>
        <Footer
          footer={footer}
          header={header}
          menuCollectionAvailability={menuCollectionAvailability}
          publicStoreDomain={publicStoreDomain}
        />
        <MobileBottomNav />
      </div>
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
 *   menuCollectionMedia?: PageLayoutProps['menuCollectionMedia'];
 * }}
 */
function MobileMenuAside({
  header,
  publicStoreDomain,
  menuCollectionAvailability,
  menuCollectionMedia,
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
          menuCollectionMedia={menuCollectionMedia}
        />
      </Aside>
    )
  );
}

function MobileBottomNav() {
  return (
    <nav className="mbn" role="navigation" aria-label="Mobile bottom navigation">
      <div className="mbn__inner">
        <Link className="mbn__link" to="/" prefetch="intent" aria-label="Home">
          <svg className="mbn__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 10v10h14V10" />
            <path d="M9 20v-6h6v6" />
          </svg>
        </Link>

        <Link className="mbn__link" to="/account" prefetch="intent" aria-label="Account">
          <svg className="mbn__icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
          </svg>
        </Link>

        <Link className="mbn__link" to="/cart" prefetch="intent" aria-label="Cart">
          <svg className="mbn__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6h15l-1.5 9H8.5L7 3H3" />
            <circle cx="9.5" cy="20.5" r="1.5" />
            <circle cx="17.5" cy="20.5" r="1.5" />
          </svg>
        </Link>

        <a
          className="mbn__link"
          href="https://wa.me/96181539339"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M24 2.5A21.52 21.52 0 0 0 5.15 34.36L2.5 45.5l11.14-2.65A21.5 21.5 0 1 0 24 2.5zm0 40.9a19.2 19.2 0 0 1-9.24-2.39l-.66-.37-6.55 1.56 1.56-6.56-.36-.65A19.18 19.18 0 1 1 24 43.4zm10.69-8.56a1.05 1.05 0 0 0 1-1v-5.86a1.05 1.05 0 0 0-1-1 10.4 10.4 0 0 1-3.91-.66c-.98-.34-1.46-.34-2.44.66l-2 2.05a18.6 18.6 0 0 1-4.79-3.52 18.6 18.6 0 0 1-3.52-4.79l2.05-2.05a1.93 1.93 0 0 0 .66-2.44 10.4 10.4 0 0 1-.66-3.91 1 1 0 0 0-1-1h-5.86a1.07 1.07 0 0 0-1 1 23.6 23.6 0 0 0 6.84 15.64 23.68 23.68 0 0 0 15.64 6.84z" />
          </svg>
        </a>
      </div>
    </nav>
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {Record<string, boolean>} [menuCollectionAvailability]
 * @property {Record<string, CollectionMenuImage>} [menuCollectionMedia]
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/**
 * @typedef {{
 *   url?: string;
 *   altText?: string | null;
 *   width?: number | null;
 *   height?: number | null;
 * }} CollectionMenuImage
 */
