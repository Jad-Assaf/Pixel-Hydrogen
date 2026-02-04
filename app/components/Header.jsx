import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

/**
 * @param {HeaderProps}
 */
export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
  menuCollectionAvailability,
}) {
  const {shop, menu} = header;
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (event) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    document.body.classList.add('no-scroll');
    return () => document.removeEventListener('keydown', handler);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
  }

  return (
    <header className={`header${searchOpen ? ' search-open' : ''}`}>
      {searchOpen && (
        <div className="search-overlay">
          <div
            className="search-overlay-hit"
            onClick={closeSearch}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                closeSearch();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close search"
          />
        </div>
      )}
      <div className="header-top">
        <div className="header-top-left">
          <HeaderMenuMobileToggle />
          <SearchToggle onToggle={() => setSearchOpen((open) => !open)} />
        </div>
        <NavLink
          prefetch="intent"
          to="/"
          style={activeLinkStyle}
          end
          className="header-logo"
        >
          <strong>{shop.name}</strong>
        </NavLink>
        <div className="header-top-right">
          <AccountLink isLoggedIn={isLoggedIn} />
          <CartToggle cart={cart} />
        </div>
      </div>
      {searchOpen && (
        <div className="header-search-flyout">
          <SearchFormPredictive
            className="search-bar"
            onClose={closeSearch}
            autoComplete="off"
          >
            {({fetchResults, goToSearch, inputRef}) => (
              <>
                <input
                  name="q"
                  onChange={fetchResults}
                  onFocus={fetchResults}
                  placeholder="Search products, collections, pages..."
                  ref={inputRef}
                  type="search"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button type="button" onClick={goToSearch}>
                  Search
                </button>
              </>
            )}
          </SearchFormPredictive>

          <SearchResultsPredictive onClose={closeSearch}>
            {({items, total, term, state, closeSearch}) => {
              const {articles, collections, pages, products, queries} = items;

              if (state === 'loading' && term.current) {
                return (
                  <div className="search-results-panel">Loading...</div>
                );
              }

              if (!total) {
                if (!term.current) return null;
                return (
                  <div className="search-results-panel">
                    <SearchResultsPredictive.Empty term={term} />
                  </div>
                );
              }

              return (
                <div className="search-results-panel">
                  <SearchResultsPredictive.Products
                    products={products}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Collections
                    collections={collections}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Pages
                    pages={pages}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Articles
                    articles={articles}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  {term.current && total ? (
                    <NavLink
                      className="search-all-results"
                      onClick={closeSearch}
                      to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                    >
                      View all results for <q>{term.current}</q> →
                    </NavLink>
                  ) : null}
                </div>
              );
            }}
          </SearchResultsPredictive>
        </div>
      )}
      <div className="header-bottom">
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          menuCollectionAvailability={menuCollectionAvailability}
        />
      </div>
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 *   menuCollectionAvailability?: HeaderProps['menuCollectionAvailability'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  menuCollectionAvailability,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();
  const items = (menu || FALLBACK_HEADER_MENU).items;
  const filteredItems = filterMenuItems(items, menuCollectionAvailability);
  const isMobile = viewport === 'mobile';

  return (
    <nav className={className} role="navigation">
      <ul className="nav-list">
        {viewport === 'mobile' && (
          <li className="nav-item">
            <NavLink
              className="header-menu-item"
              end
              onClick={close}
              prefetch="intent"
              style={activeLinkStyle}
              to="/"
            >
              Home
            </NavLink>
          </li>
        )}
        {filteredItems.map((item) =>
          isMobile ? (
            <HeaderMenuItemMobile
              key={item.id}
              item={item}
              close={close}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
            />
          ) : (
            <HeaderMenuItem
              key={item.id}
              item={item}
              close={close}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
            />
          ),
        )}
      </ul>
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function AccountLink({isLoggedIn}) {
  return (
    <NavLink
      className="icon-button"
      prefetch="intent"
      to="/account"
      style={activeLinkStyle}
    >
      <SignInIcon />
      <Suspense fallback={<span className="sr-only">Sign in</span>}>
        <Await resolve={isLoggedIn} errorElement="Sign in">
          {(isLoggedIn) => (
            <span className="sr-only">
              {isLoggedIn ? 'Account' : 'Sign in'}
            </span>
          )}
        </Await>
      </Suspense>
    </NavLink>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle({onToggle}) {
  return (
    <button className="reset icon-button" onClick={onToggle}>
      <SearchIcon />
      <span className="sr-only">Search</span>
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const label =
    count === null ? 'Cart' : `Cart, ${count} ${count === 1 ? 'item' : 'items'}`;

  return (
    <a
      aria-label={label}
      className="icon-button cart-button"
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <CartIcon />
      <span className="sr-only">Cart</span>
      {count === null ? null : (
        <span aria-hidden="true" className="cart-count">
          {count}
        </span>
      )}
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function HeaderMenuItem({
  item,
  close,
  primaryDomainUrl,
  publicStoreDomain,
}) {
  const [isClosed, setIsClosed] = useState(false);
  const children = (item?.items ?? []).filter((child) =>
    Boolean(child?.url || child?.items?.length),
  );
  const hasChildren = children.length > 0;
  const hasUrl = Boolean(item?.url);

  if (!hasUrl && !hasChildren) return null;

  const url = resolveMenuUrl(item.url, publicStoreDomain, primaryDomainUrl);

  return (
    <li
      className={`nav-item ${hasChildren ? 'has-children' : ''}${
        isClosed ? ' is-closed' : ''
      }`}
      onMouseLeave={() => setIsClosed(false)}
      onClickCapture={() => setIsClosed(true)}
    >
      {hasUrl ? (
        <NavLink
          className="header-menu-item"
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to={url}
        >
          {item.title}
        </NavLink>
      ) : (
        <span className="header-menu-item">{item.title}</span>
      )}
      {hasChildren ? (
        <div className="nav-dropdown">
          <div className="nav-dropdown-inner">
            {children.map((child) => {
              const childHasChildren = child.items?.length;
              if (!child.url && !childHasChildren) return null;
              const childUrl = resolveMenuUrl(
                child.url,
                publicStoreDomain,
                primaryDomainUrl,
              );

              return (
                <div className="nav-dropdown-group" key={child.id}>
                  {child.url ? (
                    <NavLink
                      className="nav-dropdown-title"
                      end
                      onClick={close}
                      prefetch="intent"
                      to={childUrl}
                    >
                      {child.title}
                    </NavLink>
                  ) : (
                    <span className="nav-dropdown-title">{child.title}</span>
                  )}
                  {child.items?.length ? (
                    <div className="nav-dropdown-links">
                      {child.items.map((grandchild) => {
                        if (!grandchild.url) return null;
                        const grandchildUrl = resolveMenuUrl(
                          grandchild.url,
                          publicStoreDomain,
                          primaryDomainUrl,
                        );

                        return (
                          <NavLink
                            className="nav-dropdown-link"
                            end
                            key={grandchild.id}
                            onClick={close}
                            prefetch="intent"
                            to={grandchildUrl}
                          >
                            {grandchild.title}
                          </NavLink>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </li>
  );
}

function HeaderMenuItemMobile({
  item,
  close,
  primaryDomainUrl,
  publicStoreDomain,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const children = (item?.items ?? []).filter(Boolean);
  const hasChildren = children.length > 0;
  const hasUrl = Boolean(item?.url);

  if (!hasUrl && !hasChildren) return null;

  const url = resolveMenuUrl(item.url, publicStoreDomain, primaryDomainUrl);

  return (
    <li className={`mobile-menu-item ${isOpen ? 'is-open' : ''}`}>
      {hasChildren ? (
        <button
          className="header-menu-item mobile-toggle"
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {item.title}
        </button>
      ) : (
        <NavLink
          className="header-menu-item"
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to={url}
        >
          {item.title}
        </NavLink>
      )}
      {hasChildren ? (
        <ul className="mobile-submenu">
          {children.map((child) => (
            <HeaderMenuItemMobile
              key={child.id}
              item={child}
              close={close}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function resolveMenuUrl(url, publicStoreDomain, primaryDomainUrl) {
  if (!url) return '';
  return url.includes('myshopify.com') ||
    url.includes(publicStoreDomain) ||
    url.includes(primaryDomainUrl)
    ? new URL(url).pathname
    : url;
}

function filterMenuItems(items, menuCollectionAvailability) {
  if (!items?.length) return [];

  return items.reduce((acc, item) => {
    if (!item) return acc;

    const filteredChildren = filterMenuItems(
      item.items,
      menuCollectionAvailability,
    );
    const isCollection = item.type === 'COLLECTION' && item.resourceId;
    const collectionHasProducts = isCollection
      ? menuCollectionAvailability?.[item.resourceId]
      : true;

    if (isCollection && collectionHasProducts === false) {
      return acc;
    }

    const hasUrl = Boolean(item.url);
    if (!hasUrl && filteredChildren.length === 0) {
      return acc;
    }

    acc.push({...item, items: filteredChildren});
    return acc;
  }, []);
}

function SearchIcon() {
  return (
    <svg
      className="header-icon"
      width="64px"
      height="64px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <g clipPath="url(#clip0_15_152)">
          <rect width="24" height="24" fill="white"></rect>
          <circle
            cx="10.5"
            cy="10.5"
            r="6.5"
            stroke="#000000"
            strokeLinejoin="round"
          ></circle>
          <path
            d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z"
            fill="#000000"
          ></path>
        </g>
        <defs>
          <clipPath id="clip0_15_152">
            <rect width="24" height="24" fill="white"></rect>
          </clipPath>
        </defs>
      </g>
    </svg>
  );
}

function SignInIcon() {
  return (
    <svg
      className="header-icon"
      width="64px"
      height="64px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
          stroke="#000000"
          strokeWidth="0.8160000000000001"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      className="header-icon"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M15.75 11.8h-3.16l-.77 11.6a5 5 0 0 0 4.99 5.34h7.38a5 5 0 0 0 4.99-5.33L28.4 11.8zm0 1h-2.22l-.71 10.67a4 4 0 0 0 3.99 4.27h7.38a4 4 0 0 0 4-4.27l-.72-10.67h-2.22v.63a4.75 4.75 0 1 1-9.5 0zm8.5 0h-7.5v.63a3.75 3.75 0 1 0 7.5 0z"
      ></path>
    </svg>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {Record<string, boolean>} [menuCollectionAvailability]
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
