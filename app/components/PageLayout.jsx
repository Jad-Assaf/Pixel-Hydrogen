import {Await, Link} from 'react-router';
import {Suspense} from 'react';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {WishlistCheckedIcon} from '~/components/Icons';
import {useWishlist} from '~/hooks/useWishlist';

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
        <DesktopWishlistButton />
        <DesktopWhatsAppButton />
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
  const {count} = useWishlist();

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

        <Link
          className="mbn__link"
          to="/wishlist"
          prefetch="intent"
          aria-label="Wishlist"
        >
          <span className="mbn__icon-wrap">
            <WishlistCheckedIcon className="mbn__icon mbn__icon--wishlist" />
            {count > 0 ? (
              <span className="mbn__badge" aria-hidden="true">
                {count > 99 ? '99+' : count}
              </span>
            ) : null}
          </span>
        </Link>

        <a
          className="mbn__link"
          href="https://wa.me/96181539339"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
        >
          <svg
            className="mbn__icon mbn__icon--whatsapp"
            fill="#000000"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <g>
              <path d="M11.42 9.49c-.19-.09-1.1-.54-1.27-.61s-.29-.09-.42.1-.48.6-.59.73-.21.14-.4 0a5.13 5.13 0 0 1-1.49-.92 5.25 5.25 0 0 1-1-1.29c-.11-.18 0-.28.08-.38s.18-.21.28-.32a1.39 1.39 0 0 0 .18-.31.38.38 0 0 0 0-.33c0-.09-.42-1-.58-1.37s-.3-.32-.41-.32h-.4a.72.72 0 0 0-.5.23 2.1 2.1 0 0 0-.65 1.55A3.59 3.59 0 0 0 5 8.2 8.32 8.32 0 0 0 8.19 11c.44.19.78.3 1.05.39a2.53 2.53 0 0 0 1.17.07 1.93 1.93 0 0 0 1.26-.88 1.67 1.67 0 0 0 .11-.88c-.05-.07-.17-.12-.36-.21z" />
              <path d="M13.29 2.68A7.36 7.36 0 0 0 8 .5a7.44 7.44 0 0 0-6.41 11.15l-1 3.85 3.94-1a7.4 7.4 0 0 0 3.55.9H8a7.44 7.44 0 0 0 5.29-12.72zM8 14.12a6.12 6.12 0 0 1-3.15-.87l-.22-.13-2.34.61.62-2.28-.14-.23a6.18 6.18 0 0 1 9.6-7.65 6.12 6.12 0 0 1 1.81 4.37A6.19 6.19 0 0 1 8 14.12z" />
            </g>
          </svg>
        </a>
      </div>
    </nav>
  );
}

function DesktopWishlistButton() {
  return (
    <Link
      className="pz-desktop-wishlist"
      to="/wishlist"
      prefetch="intent"
      aria-label="Open wishlist"
    >
      <WishlistCheckedIcon className="pz-desktop-wishlist-icon" />
    </Link>
  );
}

function DesktopWhatsAppButton() {
  return (
    <a
      className="pz-desktop-whatsapp"
      href="https://wa.me/96181539339"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <svg
        className="pz-desktop-whatsapp-icon"
        fill="#000000"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        <g>
          <path d="M11.42 9.49c-.19-.09-1.1-.54-1.27-.61s-.29-.09-.42.1-.48.6-.59.73-.21.14-.4 0a5.13 5.13 0 0 1-1.49-.92 5.25 5.25 0 0 1-1-1.29c-.11-.18 0-.28.08-.38s.18-.21.28-.32a1.39 1.39 0 0 0 .18-.31.38.38 0 0 0 0-.33c0-.09-.42-1-.58-1.37s-.3-.32-.41-.32h-.4a.72.72 0 0 0-.5.23 2.1 2.1 0 0 0-.65 1.55A3.59 3.59 0 0 0 5 8.2 8.32 8.32 0 0 0 8.19 11c.44.19.78.3 1.05.39a2.53 2.53 0 0 0 1.17.07 1.93 1.93 0 0 0 1.26-.88 1.67 1.67 0 0 0 .11-.88c-.05-.07-.17-.12-.36-.21z" />
          <path d="M13.29 2.68A7.36 7.36 0 0 0 8 .5a7.44 7.44 0 0 0-6.41 11.15l-1 3.85 3.94-1a7.4 7.4 0 0 0 3.55.9H8a7.44 7.44 0 0 0 5.29-12.72zM8 14.12a6.12 6.12 0 0 1-3.15-.87l-.22-.13-2.34.61.62-2.28-.14-.23a6.18 6.18 0 0 1 9.6-7.65 6.12 6.12 0 0 1 1.81 4.37A6.19 6.19 0 0 1 8 14.12z" />
        </g>
      </svg>
    </a>
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
