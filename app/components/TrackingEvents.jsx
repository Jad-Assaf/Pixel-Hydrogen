import {useEffect} from 'react';
import {AnalyticsEvent, useAnalytics} from '@shopify/hydrogen';
import {
  CHECKOUT_STARTED_EVENT,
  SEARCH_SUBMITTED_EVENT,
  persistWetrackedAttribution,
} from '~/lib/tracking';

const TRACKING_INTEGRATION_NAME = 'Pixel_Zones_Tracking_Events';

let didRegisterTrackingEvents = false;
let lastPageViewUrl = '';
let lastCheckoutEventAt = 0;
let lastSearchEvent = {term: '', timestamp: 0};

export function TrackingEvents() {
  const {register, subscribe} = useAnalytics();

  useEffect(() => {
    if (didRegisterTrackingEvents) return;

    didRegisterTrackingEvents = true;
    const {ready} = register(TRACKING_INTEGRATION_NAME);

    subscribe(AnalyticsEvent.PAGE_VIEWED, trackPageViewed);
    subscribe(AnalyticsEvent.PRODUCT_ADD_TO_CART, trackProductAddedToCart);
    subscribe(SEARCH_SUBMITTED_EVENT, trackSearchSubmitted);
    subscribe(AnalyticsEvent.SEARCH_VIEWED, trackSearchViewed);
    subscribe(CHECKOUT_STARTED_EVENT, trackCheckoutStarted);

    ready();
  }, [register, subscribe]);

  return null;
}

function trackPageViewed(payload = {}) {
  const url = getPayloadUrl(payload);
  if (!url || url === lastPageViewUrl) return;
  lastPageViewUrl = url;
  persistWetrackedAttribution();
  const pagePath = getPagePath(url);
  const pageTitle = getDocumentTitle();
  const contentCategory = getContentCategory(pagePath);

  sendGtag('event', 'page_view', {
    page_location: url,
    page_path: pagePath,
    page_title: pageTitle,
  });
  sendFbq('track', 'PageView');
  pushDataLayer('page_view', {
    page_location: url,
    page_path: pagePath,
    page_title: pageTitle,
  });
  dispatchWetrackedEvent('page_viewed', {url});

  sendGtag('event', 'view_content', {
    content_type: contentCategory,
    page_location: url,
    page_path: pagePath,
    page_title: pageTitle,
  });
  sendFbq('track', 'ViewContent', {
    content_category: contentCategory,
    content_ids: pagePath ? [pagePath] : undefined,
    content_name: pageTitle,
    content_type: contentCategory,
  });
  pushDataLayer('view_content', {
    content_category: contentCategory,
    content_type: contentCategory,
    page_location: url,
    page_path: pagePath,
    page_title: pageTitle,
  });
  dispatchWetrackedEvent('view_content', {
    contentCategory,
    contentType: contentCategory,
    pagePath,
    pageTitle,
    url,
  });
}

function trackProductAddedToCart(payload = {}) {
  const item = cartLineToItem(payload.currentLine, getAddedQuantity(payload));
  if (!item) return;

  const value = roundCurrencyValue(item.price * item.quantity);
  const currency = getLineCurrency(payload.currentLine) || getCartCurrency(payload.cart);

  sendGtag('event', 'add_to_cart', {
    currency,
    value,
    items: [item],
  });
  sendFbq('track', 'AddToCart', {
    content_ids: [item.item_id].filter(Boolean),
    content_name: item.item_name,
    content_type: 'product',
    contents: [
      {
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price,
      },
    ].filter((content) => content.id),
    currency,
    value,
  });
  pushDataLayer('add_to_cart', {
    ecommerce: {
      currency,
      value,
      items: [item],
    },
  });
  dispatchWetrackedEvent('product_added_to_cart', {
    currency,
    item,
    value,
  });
}

function trackCheckoutStarted(payload = {}) {
  const now = Date.now();
  if (now - lastCheckoutEventAt < 1500) return;
  lastCheckoutEventAt = now;

  const cart = payload.cart || null;
  const items = cartToItems(cart);
  const currency = getCartCurrency(cart);
  const value = getCartValue(cart);

  sendGtag('event', 'begin_checkout', {
    currency,
    value,
    items,
  });
  sendFbq('track', 'InitiateCheckout', {
    content_ids: items.map((item) => item.item_id).filter(Boolean),
    contents: items
      .map((item) => ({
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price,
      }))
      .filter((content) => content.id),
    currency,
    num_items: Number(cart?.totalQuantity || payload.cartQuantity || 0),
    value,
  });
  pushDataLayer('begin_checkout', {
    checkout_url: payload.checkoutUrl,
    ecommerce: {
      currency,
      value,
      items,
    },
  });
  dispatchWetrackedEvent('checkout_started', {
    cart,
    checkoutUrl: payload.checkoutUrl,
    currency,
    items,
    value,
  });
}

function trackSearchSubmitted(payload = {}) {
  trackSearch(payload.searchTerm, payload.url);
}

function trackSearchViewed(payload = {}) {
  trackSearch(payload.searchTerm, payload.url);
}

function trackSearch(searchTerm, url) {
  const term = normalizeSearchTerm(searchTerm);
  if (!term) return;

  const now = Date.now();
  if (lastSearchEvent.term === term && now - lastSearchEvent.timestamp < 5000) {
    return;
  }
  lastSearchEvent = {term, timestamp: now};

  sendGtag('event', 'search', {
    search_term: term,
  });
  sendFbq('track', 'Search', {
    search_string: term,
  });
  pushDataLayer('search', {
    search_term: term,
  });
  dispatchWetrackedEvent('search_submitted', {
    searchTerm: term,
    url: url || getCurrentHref(),
  });
}

function cartToItems(cart) {
  const lines = Array.isArray(cart?.lines?.nodes) ? cart.lines.nodes : [];
  return lines.map((line) => cartLineToItem(line)).filter(Boolean);
}

function cartLineToItem(line, quantityOverride) {
  const merchandise = line?.merchandise || {};
  const product = merchandise?.product || {};
  const variantId = compactShopifyId(merchandise.id);
  const productId = compactShopifyId(product.id);
  const price = moneyAmount(merchandise.price || line?.cost?.amountPerQuantity);
  const quantity = Number(quantityOverride || line?.quantity || 1);

  if (!variantId && !productId) return null;

  return {
    item_id: variantId || productId,
    item_name: product.title || merchandise.title || '',
    item_variant: merchandise.title || '',
    item_brand: product.vendor || '',
    price,
    quantity,
    shopify_product_gid: product.id || '',
    shopify_variant_gid: merchandise.id || '',
  };
}

function getAddedQuantity(payload) {
  const currentQuantity = Number(payload?.currentLine?.quantity || 0);
  const previousQuantity = Number(payload?.prevLine?.quantity || 0);
  return Math.max(1, currentQuantity - previousQuantity);
}

function getCartCurrency(cart) {
  return (
    cart?.cost?.totalAmount?.currencyCode ||
    cart?.cost?.subtotalAmount?.currencyCode ||
    cart?.lines?.nodes?.[0]?.merchandise?.price?.currencyCode ||
    'USD'
  );
}

function getCartValue(cart) {
  const total = moneyAmount(cart?.cost?.totalAmount);
  if (total > 0) return total;

  return roundCurrencyValue(
    cartToItems(cart).reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0,
    ),
  );
}

function getLineCurrency(line) {
  return (
    line?.merchandise?.price?.currencyCode ||
    line?.cost?.amountPerQuantity?.currencyCode ||
    line?.cost?.totalAmount?.currencyCode ||
    ''
  );
}

function moneyAmount(money) {
  const amount = Number.parseFloat(money?.amount || '0');
  return Number.isFinite(amount) ? amount : 0;
}

function roundCurrencyValue(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function compactShopifyId(id) {
  if (!id) return '';
  const match = String(id).match(/\/([^/]+)$/);
  return match?.[1] || String(id);
}

function sendGtag(...args) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag(...args);
    }
  } catch {
    // Third-party scripts should never break storefront interactions.
  }
}

function sendFbq(...args) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq(...args);
    }
  } catch {
    // Third-party scripts should never break storefront interactions.
  }
}

function pushDataLayer(event, payload = {}) {
  try {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];

    if (payload.ecommerce) {
      window.dataLayer.push({ecommerce: null});
    }

    window.dataLayer.push({
      event,
      ...payload,
    });
  } catch {
    // Ignore third-party analytics failures.
  }
}

function dispatchWetrackedEvent(event, payload = {}) {
  try {
    if (typeof window === 'undefined') return;

    const detail = {
      event,
      payload,
      source: 'hydrogen',
    };

    if (typeof window.wetracked?.track === 'function') {
      window.wetracked.track(event, payload);
    }
    if (typeof window.wt?.track === 'function') {
      window.wt.track(event, payload);
    }

    window.dispatchEvent(new CustomEvent('wetracked:event', {detail}));
    window.dispatchEvent(new CustomEvent(`wetracked:${event}`, {detail}));
  } catch {
    // Ignore third-party analytics failures.
  }
}

function getPayloadUrl(payload) {
  return payload?.url || getCurrentHref();
}

function getCurrentHref() {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

function getPagePath(url) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return '';
  }
}

function getDocumentTitle() {
  if (typeof document === 'undefined') return '';
  return document.title || '';
}

function normalizeSearchTerm(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getContentCategory(pathname) {
  const path = String(pathname || '').toLowerCase();

  if (path === '/' || path === '') return 'home';
  if (path.startsWith('/products/')) return 'product';
  if (path.startsWith('/collections/')) return 'collection';
  if (path.startsWith('/search')) return 'search';
  if (path.startsWith('/cart')) return 'cart';

  return 'page';
}
