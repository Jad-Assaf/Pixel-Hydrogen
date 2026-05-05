import {useEffect} from 'react';
import {AnalyticsEvent, useAnalytics} from '@shopify/hydrogen';
import {
  CHECKOUT_STARTED_EVENT,
  SEARCH_SUBMITTED_EVENT,
  persistWetrackedAttribution,
} from '~/lib/tracking';
import {getMetaContentIdFromVariant} from '~/lib/meta';

const TRACKING_INTEGRATION_NAME = 'Pixel_Zones_Tracking_Events';
const META_DEBUG_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
]);
const RECENT_EVENT_WINDOW_MS = 1500;

let didRegisterTrackingEvents = false;
let lastPageViewUrl = '';
let lastSearchEvent = {term: '', timestamp: 0};
const recentEventRegistry = new Map();

export function TrackingEvents() {
  const {register, subscribe} = useAnalytics();

  useEffect(() => {
    if (didRegisterTrackingEvents) return;

    didRegisterTrackingEvents = true;
    const {ready} = register(TRACKING_INTEGRATION_NAME);

    subscribe(AnalyticsEvent.PAGE_VIEWED, trackPageViewed);
    subscribe(AnalyticsEvent.PRODUCT_VIEWED, trackProductViewed);
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

  sendGtag('event', 'page_view', {
    page_location: url,
    page_path: pagePath,
    page_title: pageTitle,
  });
  trackMetaEvent('PageView');
  pushDataLayer('page_view', {
    page_location: url,
    page_path: pagePath,
    page_title: pageTitle,
  });
  dispatchWetrackedEvent('page_viewed', {url});
}

function trackProductViewed(payload = {}) {
  const trackedProduct = getTrackedProduct(payload);
  const metaContentId = getMetaContentIdFromVariant({
    id: trackedProduct?.variantId,
  });

  if (!trackedProduct || !metaContentId) return;

  const url = getPayloadUrl(payload);
  const eventKey = ['ViewContent', metaContentId, url].filter(Boolean).join(':');
  if (shouldSkipRecentEvent(eventKey)) return;

  const pagePath = getPagePath(url);
  const pageTitle = getDocumentTitle();
  const price = roundCurrencyValue(moneyAmount(trackedProduct.price));
  const currency = getTrackedProductCurrency(trackedProduct, payload);
  const item = productViewToItem(trackedProduct, metaContentId, price);

  sendGtag('event', 'view_content', {
    currency,
    value: price,
    items: [item],
    page_location: url,
    page_path: pagePath,
    page_title: pageTitle,
  });
  trackMetaEvent('ViewContent', {
    content_ids: [metaContentId],
    content_type: 'product',
    contents: [
      {
        id: metaContentId,
        quantity: 1,
        item_price: price,
      },
    ],
    value: price,
    currency,
  });
  pushDataLayer('view_content', {
    page_location: url,
    page_path: pagePath,
    page_title: pageTitle,
    ecommerce: {
      currency,
      value: price,
      items: [item],
    },
  });
  dispatchWetrackedEvent('view_content', {
    currency,
    item,
    value: price,
    url,
  });
}

function trackProductAddedToCart(payload = {}) {
  const item = cartLineToItem(payload.currentLine, getAddedQuantity(payload));
  if (!item) return;

  const eventKey = [
    'AddToCart',
    payload?.currentLine?.id || item.item_id,
    item.quantity,
    payload?.cart?.updatedAt || '',
  ].join(':');
  if (shouldSkipRecentEvent(eventKey)) return;

  const value = roundCurrencyValue(item.price * item.quantity);
  const currency = getLineCurrency(payload.currentLine) || getCartCurrency(payload.cart);

  sendGtag('event', 'add_to_cart', {
    currency,
    value,
    items: [item],
  });
  trackMetaEvent('AddToCart', {
    content_ids: [item.item_id],
    content_type: 'product',
    contents: [
      {
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price,
      },
    ],
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
  const cart = payload.cart || null;
  const items = cartToItems(cart);
  if (!items.length) return;

  const currency = getCartCurrency(cart);
  const value = getCartValue(cart);
  const totalQuantity =
    Number(cart?.totalQuantity || payload.cartQuantity || 0) ||
    items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const eventKey = [
    'InitiateCheckout',
    cart?.id || '',
    cart?.updatedAt || '',
    payload.checkoutUrl || '',
    items.map((item) => `${item.item_id}:${item.quantity}`).join(','),
  ].join(':');
  if (shouldSkipRecentEvent(eventKey)) return;

  const contentIds = items.map((item) => item.item_id).filter(Boolean);
  if (!contentIds.length) return;

  sendGtag('event', 'begin_checkout', {
    currency,
    value,
    items,
  });
  trackMetaEvent('InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    contents: items
      .map((item) => ({
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price,
      }))
      .filter((content) => content.id),
    currency,
    num_items: totalQuantity,
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
  const variantId = getMetaContentIdFromVariant(merchandise);
  const price = moneyAmount(merchandise.price || line?.cost?.amountPerQuantity);
  const quantity = normalizeQuantity(quantityOverride ?? line?.quantity ?? 1);

  if (!variantId) return null;

  return {
    item_id: variantId,
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
    'USD'
  );
}

function moneyAmount(money) {
  const rawValue =
    money && typeof money === 'object' ? money.amount : money;
  const amount = Number.parseFloat(String(rawValue ?? '0'));
  return Number.isFinite(amount) ? amount : 0;
}

function roundCurrencyValue(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function normalizeQuantity(value) {
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
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

function trackMetaEvent(eventName, payload) {
  logMetaEvent(eventName, payload);

  if (typeof payload === 'undefined') {
    sendFbq('track', eventName);
    return;
  }

  sendFbq('track', eventName, payload);
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
    const baseUrl =
      typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
    const parsedUrl = new URL(url, baseUrl);
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

function getTrackedProduct(payload) {
  const products = Array.isArray(payload?.products) ? payload.products : [];
  return products.find((product) =>
    Boolean(getMetaContentIdFromVariant({id: product?.variantId})),
  );
}

function productViewToItem(product, variantId, price) {
  return {
    item_id: variantId,
    item_name: product?.title || '',
    item_variant: product?.variantTitle || '',
    item_brand: product?.vendor || '',
    price,
    quantity: 1,
    shopify_product_gid: product?.id || '',
    shopify_variant_gid: product?.variantId || '',
  };
}

function getTrackedProductCurrency(product, payload) {
  return normalizeCurrencyCode(product?.currencyCode || payload?.shop?.currency || 'USD');
}

function normalizeCurrencyCode(value) {
  const currency = String(value || '').trim().toUpperCase();
  return currency || 'USD';
}

function shouldSkipRecentEvent(key, windowMs = RECENT_EVENT_WINDOW_MS) {
  if (!key) return false;

  const now = Date.now();
  for (const [eventKey, timestamp] of recentEventRegistry.entries()) {
    if (now - timestamp > windowMs) {
      recentEventRegistry.delete(eventKey);
    }
  }

  const lastSeenAt = recentEventRegistry.get(key);
  if (lastSeenAt && now - lastSeenAt < windowMs) {
    return true;
  }

  recentEventRegistry.set(key, now);
  return false;
}

function logMetaEvent(eventName, payload) {
  if (process.env.NODE_ENV === 'production') return;
  if (!META_DEBUG_EVENTS.has(eventName)) return;

  console.warn('[Meta Pixel]', eventName, payload);
}
