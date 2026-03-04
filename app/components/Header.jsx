import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {Await, NavLink, useLocation} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import fullLogo from '~/assets/full-logo.avif';
import miniLogo from '~/assets/mini-logo.webp';

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
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [isCondensed, setIsCondensed] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setIsBrowseOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const collapseThreshold = 34;
    const expandThreshold = 12;

    const onScroll = () => {
      const top = window.scrollY;
      setIsCondensed((prev) => {
        if (prev) {
          return top > expandThreshold;
        }
        return top > collapseThreshold;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!isBrowseOpen) return;

    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setIsBrowseOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isBrowseOpen]);

  useEffect(() => {
    if (!isBrowseOpen) return;

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setIsBrowseOpen(false);
      }
    };

    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('keydown', onEscape);
    };
  }, [isBrowseOpen]);

  return (
    <header
      ref={headerRef}
      className={`pz-header${isCondensed ? ' is-condensed' : ''}`}
    >
      <div className="pz-shell pz-header-bar">
        <div className="pz-header-left">
          <HeaderMenuMobileToggle />
          <NavLink to="/" prefetch="intent" className="pz-logo" end>
            <img
              src={fullLogo}
              alt={shop?.name || 'Pixel Zones'}
              className="pz-logo-full"
              loading="eager"
            />
            <img
              src={miniLogo}
              alt=""
              aria-hidden="true"
              className="pz-logo-mini"
              loading="eager"
            />
          </NavLink>
          <button
            type="button"
            className={`pz-browse-link${isBrowseOpen ? ' is-active' : ''}`}
            onClick={() => setIsBrowseOpen((open) => !open)}
            aria-expanded={isBrowseOpen}
            aria-controls="pz-desktop-menu"
          >
            Browse Shop
          </button>
        </div>

        <div className="pz-header-right">
          <NavLink
            to="/search"
            prefetch="intent"
            className="pz-header-link"
            aria-label="Search"
          >
            <span className="pz-header-link-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16.1 16.1 21 21" />
              </svg>
            </span>
            <span className="pz-header-link-text">Search</span>
          </NavLink>
          <AccountLink isLoggedIn={isLoggedIn} />
          <CartToggle cart={cart} />
        </div>
      </div>

      <div
        id="pz-desktop-menu"
        className={`pz-header-nav-row${isBrowseOpen ? ' is-open' : ''}`}
      >
        <DesktopBrowseMenu
          menu={menu}
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          menuCollectionAvailability={menuCollectionAvailability}
          isOpen={isBrowseOpen}
          onClose={() => setIsBrowseOpen(false)}
          onNavigate={() => setIsBrowseOpen(false)}
        />
      </div>
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 *   menuCollectionAvailability?: HeaderProps['menuCollectionAvailability'];
 *   isOpen: boolean;
 *   onClose: () => void;
 *   onNavigate?: () => void;
 * }}
 */
function DesktopBrowseMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
  menuCollectionAvailability,
  isOpen,
  onClose,
  onNavigate,
}) {
  const items = useMemo(
    () =>
      filterMenuItems(
        (menu || FALLBACK_HEADER_MENU).items,
        menuCollectionAvailability,
      ),
    [menu, menuCollectionAvailability],
  );
  const [activePath, setActivePath] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    setActivePath(getDefaultMenuPath(items));
  }, [isOpen, items]);

  const columns = useMemo(
    () => deriveMenuColumns(items, activePath),
    [items, activePath],
  );
  const visibleColumns = columns.slice(0, 3);

  const firstColumn = visibleColumns[0] || null;
  const activeRootItem = firstColumn
    ? firstColumn.items.find((entry) => entry.id === firstColumn.activeItemId) || null
    : null;
  const activeRootLink = activeRootItem
    ? normalizeMenuUrl(activeRootItem.url, primaryDomainUrl, publicStoreDomain)
    : null;

  return (
    <div className="pz-desktop-menu-panel" role="dialog" aria-label="Browse shop">
      <section className="pz-desktop-menu-intro">
        <button type="button" className="pz-desktop-menu-close" onClick={onClose}>
          <span aria-hidden="true">×</span>
          <span>Close</span>
        </button>

        <p className="pz-desktop-menu-kicker">Browse Shop</p>
        <h3>
          About {activeRootItem?.title || 'Our Collections'}
        </h3>
        <div className="pz-desktop-menu-callout">
          {activeRootLink?.external ? (
            <a
              href={activeRootLink.url}
              onClick={onNavigate}
              rel="noopener noreferrer"
              target="_blank"
              className="pz-desktop-menu-callout-link"
            >
              See all {activeRootItem?.title || 'collections'}
              <span aria-hidden="true">›</span>
            </a>
          ) : activeRootLink ? (
            <NavLink
              to={activeRootLink.url}
              prefetch="intent"
              onClick={onNavigate}
              className="pz-desktop-menu-callout-link"
            >
              See all {activeRootItem?.title || 'collections'}
              <span aria-hidden="true">›</span>
            </NavLink>
          ) : (
            <span className="pz-desktop-menu-callout-link is-disabled">
              See all collections
            </span>
          )}
        </div>
      </section>

      {visibleColumns.map((column) => (
        <section className="pz-desktop-menu-column" key={`column-${column.level}`}>
          <p className="pz-desktop-menu-column-title">{column.title}</p>
          <ul className="pz-desktop-menu-list">
            {column.items.map((item) => {
              const normalized = normalizeMenuUrl(
                item.url,
                primaryDomainUrl,
                publicStoreDomain,
              );
              const hasChildren = Boolean(item.items?.length);
              const isActiveColumnItem = column.activeItemId === item.id;

              if (hasChildren) {
                return (
                  <li key={item.id} className="pz-desktop-menu-item">
                    <button
                      type="button"
                      className={`pz-desktop-menu-link pz-desktop-menu-trigger${
                        isActiveColumnItem ? ' is-active' : ''
                      }`}
                      onClick={() => {
                        setActivePath((prev) => [...prev.slice(0, column.level), item.id]);
                      }}
                    >
                      <span>{item.title}</span>
                      <span aria-hidden="true">›</span>
                    </button>
                  </li>
                );
              }

              if (!normalized) {
                return (
                  <li key={item.id} className="pz-desktop-menu-item">
                    <span className="pz-desktop-menu-link is-disabled">{item.title}</span>
                  </li>
                );
              }

              if (normalized.external) {
                return (
                  <li key={item.id} className="pz-desktop-menu-item">
                    <a
                      href={normalized.url}
                      onClick={onNavigate}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="pz-desktop-menu-link"
                    >
                      {item.title}
                    </a>
                  </li>
                );
              }

              return (
                <li key={item.id} className="pz-desktop-menu-item">
                  <NavLink
                    className={({isActive}) =>
                      `pz-desktop-menu-link${
                        isActive ? ' is-route-active' : ''
                      }`
                    }
                    end={normalized.url === '/'}
                    onClick={onNavigate}
                    prefetch="intent"
                    to={normalized.url}
                  >
                    {item.title}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 *   menuCollectionAvailability?: HeaderProps['menuCollectionAvailability'];
 *   onNavigate?: () => void;
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  menuCollectionAvailability,
  onNavigate,
}) {
  const className = `pz-header-menu pz-header-menu-${viewport}`;
  const {close} = useAside();
  const items = filterMenuItems(
    (menu || FALLBACK_HEADER_MENU).items,
    menuCollectionAvailability,
  );

  return (
    <nav className={className} role="navigation">
      <ul className="pz-nav-list">
        {viewport === 'mobile' ? (
          <li className="pz-nav-item">
            <NavLink
              className="pz-nav-link"
              end
              onClick={() => {
                close();
                onNavigate?.();
              }}
              prefetch="intent"
              to="/"
            >
              Home
            </NavLink>
          </li>
        ) : null}

        {items.map((item) =>
          viewport === 'mobile' ? (
            <MobileMenuItem
              key={item.id}
              item={item}
              close={close}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
              onNavigate={onNavigate}
            />
          ) : (
            <HeaderMenuItem
              key={item.id}
              item={item}
              close={close}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
              onNavigate={onNavigate}
            />
          ),
        )}
      </ul>
    </nav>
  );
}

/**
 * @param {{
 *   item: HeaderMenuItem;
 *   close: () => void;
 *   primaryDomainUrl: string;
 *   publicStoreDomain: string;
 *   onNavigate?: () => void;
 * }}
 */
function HeaderMenuItem({
  item,
  close,
  primaryDomainUrl,
  publicStoreDomain,
  onNavigate,
}) {
  const normalized = normalizeMenuUrl(item.url, primaryDomainUrl, publicStoreDomain);

  if (!normalized) {
    return null;
  }

  if (normalized.external) {
    return (
      <li className="pz-nav-item">
        <a
          href={normalized.url}
          onClick={() => {
            close();
            onNavigate?.();
          }}
          rel="noopener noreferrer"
          target="_blank"
          className="pz-nav-link"
        >
          {item.title}
        </a>
      </li>
    );
  }

  return (
    <li className="pz-nav-item">
      <NavLink
        className={({isActive}) =>
          `pz-nav-link${isActive ? ' is-active' : ''}`
        }
        end={normalized.url === '/'}
        onClick={() => {
          close();
          onNavigate?.();
        }}
        prefetch="intent"
        to={normalized.url}
      >
        {item.title}
      </NavLink>
    </li>
  );
}

/**
 * @param {{
 *   item: HeaderMenuItem;
 *   close: () => void;
 *   primaryDomainUrl: string;
 *   publicStoreDomain: string;
 *   onNavigate?: () => void;
 * }}
 */
function MobileMenuItem({
  item,
  close,
  primaryDomainUrl,
  publicStoreDomain,
  onNavigate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const normalized = normalizeMenuUrl(item.url, primaryDomainUrl, publicStoreDomain);
  const children = item.items || [];

  if (!children.length) {
    return (
      <HeaderMenuItem
        item={item}
        close={close}
        primaryDomainUrl={primaryDomainUrl}
        publicStoreDomain={publicStoreDomain}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <li className={`pz-nav-item pz-nav-item-parent${isOpen ? ' is-open' : ''}`}>
      <button
        type="button"
        className="pz-nav-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{item.title}</span>
        <span aria-hidden="true">{isOpen ? '-' : '+'}</span>
      </button>

      {normalized ? (
        <MobileMenuViewAllLink
          item={item}
          normalized={normalized}
          close={close}
          onNavigate={onNavigate}
        />
      ) : null}

      {isOpen ? (
        <ul className="pz-nav-sublist">
          {children.map((child) => (
            <MobileMenuItem
              key={child.id}
              item={child}
              close={close}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * @param {{
 *   item: HeaderMenuItem;
 *   normalized: {url: string; external: boolean};
 *   close: () => void;
 *   onNavigate?: () => void;
 * }}
 */
function MobileMenuViewAllLink({item, normalized, close, onNavigate}) {
  const label = `View all ${item.title}`;

  if (normalized.external) {
    return (
      <a
        href={normalized.url}
        onClick={() => {
          close();
          onNavigate?.();
        }}
        rel="noopener noreferrer"
        target="_blank"
        className="pz-nav-sublink pz-nav-sublink-viewall"
      >
        {label}
      </a>
    );
  }

  return (
    <NavLink
      className="pz-nav-sublink pz-nav-sublink-viewall"
      onClick={() => {
        close();
        onNavigate?.();
      }}
      prefetch="intent"
      to={normalized.url}
    >
      {label}
    </NavLink>
  );
}

function getDefaultMenuPath(items) {
  const path = [];
  let levelItems = Array.isArray(items) ? items : [];

  for (let level = 0; level < 6 && levelItems.length; level += 1) {
    const selectedItem =
      levelItems.find((entry) => entry.items?.length) || levelItems[0];

    if (!selectedItem) break;
    path.push(selectedItem.id);

    if (!selectedItem.items?.length) break;
    levelItems = selectedItem.items;
  }

  return path;
}

function deriveMenuColumns(items, activePath) {
  const columns = [];
  let levelItems = Array.isArray(items) ? items : [];
  let parentTitle = 'Main Menu';

  for (let level = 0; level < 6 && levelItems.length; level += 1) {
    const selectedItem =
      levelItems.find((entry) => entry.id === activePath[level]) ||
      levelItems.find((entry) => entry.items?.length) ||
      levelItems[0];

    columns.push({
      level,
      title: level === 0 ? 'Main Menu' : parentTitle,
      items: levelItems,
      activeItemId: selectedItem?.id || null,
    });

    if (!selectedItem?.items?.length) break;

    parentTitle = selectedItem.title;
    levelItems = selectedItem.items;
  }

  return columns;
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      type="button"
      className="pz-mobile-menu-toggle"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      <span />
      <span />
      <span />
    </button>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        {(cartData) => {
          return <CartBadge count={cartData?.totalQuantity ?? 0} />;
        }}
      </Await>
    </Suspense>
  );
}

/**
 * @param {{isLoggedIn: HeaderProps['isLoggedIn']}}
 */
function AccountLink({isLoggedIn}) {
  return (
    <NavLink
      className="pz-header-link"
      prefetch="intent"
      to="/account"
      aria-label="Account"
    >
      <span className="pz-header-link-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
      </span>
      <span className="pz-header-link-text">
        <Suspense fallback="Account">
          <Await resolve={isLoggedIn} errorElement="Account">
            {(signedIn) => (signedIn ? 'Account' : 'Log in')}
          </Await>
        </Suspense>
      </span>
    </NavLink>
  );
}

function CartIcon() {
  return (
    <span className="pz-cart-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M6 6h15l-1.8 7.5H8.2L6.9 8.2H4" />
        <circle cx="9.5" cy="18.5" r="1.2" />
        <circle cx="17.2" cy="18.5" r="1.2" />
      </svg>
    </span>
  );
}

function CartLabel() {
  return (
    <span className="pz-cart-label">Cart</span>
  );
}

function CartCount({badgeCount}) {
  return (
    <span className="pz-cart-count">{badgeCount}</span>
  );
}

function CartButton({badgeCount, onClick}) {
  return (
    <button
      type="button"
      className="pz-cart-button"
      onClick={onClick}
      aria-label={`Cart with ${badgeCount} items`}
    >
      <CartIcon />
      <CartLabel />
      <CartCount badgeCount={badgeCount} />
    </button>
  );
}

function onCartViewed({open, publish, cart, prevCart, shop}) {
  open('cart');
  publish('cart_viewed', {
    cart,
    prevCart,
    shop,
    url: typeof window !== 'undefined' ? window.location.href : '',
  });
}

function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const optimisticCart = useOptimisticCart(cart);
  const badgeCount = count ?? optimisticCart?.totalQuantity ?? 0;

  return (
    <CartButton
      badgeCount={badgeCount}
      onClick={() => onCartViewed({open, publish, cart, prevCart, shop})}
    />
  );
}

function filterMenuItems(items, availabilityMap = {}) {
  if (!Array.isArray(items)) return [];

  return items.reduce((acc, item) => {
    if (!item) return acc;

    const collectionHandle = getCollectionHandleFromMenuUrl(item.url);
    const isUnavailableById =
      item.type === 'COLLECTION' &&
      item.resourceId &&
      (availabilityMap[item.resourceId] === false ||
        availabilityMap[`id:${item.resourceId}`] === false);
    const isUnavailableByHandle =
      collectionHandle &&
      availabilityMap[`handle:${collectionHandle.toLowerCase()}`] === false;

    if (isUnavailableById || isUnavailableByHandle) {
      return acc;
    }

    const children = filterMenuItems(item.items, availabilityMap);
    if (!item.url && children.length === 0) {
      return acc;
    }

    acc.push({...item, items: children});
    return acc;
  }, []);
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

function normalizeMenuUrl(url, primaryDomainUrl, publicStoreDomain) {
  if (!url) return null;

  try {
    const normalizedPublicStoreDomain = publicStoreDomain
      ? publicStoreDomain.replace(/^https?:\/\//, '')
      : '';

    const primaryDomain = primaryDomainUrl ? new URL(primaryDomainUrl) : null;
    const parsed = new URL(url, primaryDomainUrl || 'https://example.com');

    const internalHosts = new Set(
      [
        primaryDomain?.host,
        normalizedPublicStoreDomain,
        normalizedPublicStoreDomain ? `${normalizedPublicStoreDomain}.myshopify.com` : null,
      ].filter(Boolean),
    );

    const isInternal =
      internalHosts.has(parsed.host) ||
      (!/^https?:/.test(url) && url.startsWith('/'));

    if (isInternal) {
      return {url: `${parsed.pathname}${parsed.search}${parsed.hash}`, external: false};
    }

    return {url: parsed.toString(), external: true};
  } catch {
    return {url, external: /^https?:/.test(url)};
  }
}

const FALLBACK_HEADER_MENU = {
  items: [
    {id: 'home', title: 'Home', url: '/', type: 'HTTP', items: []},
    {id: 'shop', title: 'Shop', url: '/shop', type: 'HTTP', items: []},
    {id: 'collections', title: 'Collections', url: '/collections', type: 'HTTP', items: []},
    {id: 'contact', title: 'Search', url: '/search', type: 'HTTP', items: []},
  ],
};

/** @typedef {'desktop' | 'mobile'} Viewport */

/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {Promise<CartApiQueryFragment | null>} cart
 * @property {string} publicStoreDomain
 * @property {Record<string, boolean>} [menuCollectionAvailability]
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
