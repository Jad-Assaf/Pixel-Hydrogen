export const CHECKOUT_STARTED_EVENT = 'checkout_started';
export const SEARCH_SUBMITTED_EVENT = 'search_submitted';

const WETRACKED_ATTRIBUTION_KEYS = [
  '_kx',
  'epik',
  'fbc',
  'fbclid',
  'fbp',
  'gbraid',
  'gclid',
  'msclkid',
  'rdt_cid',
  'ScCid',
  'ttp',
  'ttclid',
  'twclid',
  'wbraid',
  'utm_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];

export function publishCheckoutStarted(publish, payload = {}) {
  if (typeof publish !== 'function') return;

  publish(CHECKOUT_STARTED_EVENT, {
    eventTimestamp: Date.now(),
    url: getCurrentHref(),
    ...payload,
  });
}

export function publishSearchSubmitted(publish, payload = {}) {
  if (typeof publish !== 'function') return;

  const searchTerm = normalizeSearchTerm(payload.searchTerm);
  if (!searchTerm) return;

  publish(SEARCH_SUBMITTED_EVENT, {
    eventTimestamp: Date.now(),
    url: getCurrentHref(),
    ...payload,
    searchTerm,
  });
}

export function withWetrackedParams(url) {
  if (!url || typeof window === 'undefined') return url || '';

  const trackingParams = getWetrackedParams();
  if (!trackingParams) return url;

  try {
    const isRelativePath = url.startsWith('/') && !url.startsWith('//');
    const parsedUrl = new URL(url, window.location.origin);
    const parsedParams = new URLSearchParams(trackingParams);

    parsedParams.forEach((value, key) => {
      if (value && !parsedUrl.searchParams.has(key)) {
        parsedUrl.searchParams.set(key, value);
      }
    });

    if (isRelativePath) {
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }

    return parsedUrl.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${trackingParams}`;
  }
}

export function persistWetrackedAttribution() {
  if (typeof window === 'undefined') return;

  const currentParams = new URLSearchParams(window.location.search);
  const nextAttributes = readStoredWetrackedAttributes();
  let hasChanges = false;

  WETRACKED_ATTRIBUTION_KEYS.forEach((key) => {
    const value = currentParams.get(key);
    if (value) {
      nextAttributes[key] = value;
      hasChanges = true;
    }
  });

  if (!hasChanges) return;

  try {
    window.localStorage.setItem(
      'wt:attributes',
      JSON.stringify(nextAttributes),
    );
    window['wt:attributes'] = {
      ...(window['wt:attributes'] || {}),
      ...nextAttributes,
    };
  } catch {
    // Ignore third-party tracking storage failures.
  }
}

export function buildWetrackedCheckoutAttributes({
  country = '',
  host = '',
  locale = '',
} = {}) {
  if (typeof window === 'undefined') return [];

  const trackedAttributes = getTrackedWetrackedAttributes();
  const checkoutAttributes = new Map();

  Object.entries(trackedAttributes).forEach(([key, value]) => {
    if (value) {
      checkoutAttributes.set(key, String(value));
    }
  });

  setCheckoutAttribute(
    checkoutAttributes,
    'country',
    firstNonEmpty(
      normalizeCountryCode(country),
      normalizeCountryCode(window.Shopify?.country),
      extractCountryFromLocale(locale),
      extractCountryFromLocale(document?.documentElement?.lang),
      extractCountryFromLocale(navigator?.language),
    ),
  );
  setCheckoutAttribute(
    checkoutAttributes,
    'fbp',
    firstNonEmpty(trackedAttributes.fbp, readCookie('_fbp')),
  );
  setCheckoutAttribute(
    checkoutAttributes,
    'host',
    firstNonEmpty(normalizeHost(host), normalizeHost(window.location.host)),
  );
  setCheckoutAttribute(
    checkoutAttributes,
    'locale',
    firstNonEmpty(
      normalizeLocale(locale),
      normalizeLocale(window.Shopify?.locale),
      normalizeLocale(document?.documentElement?.lang),
      normalizeLocale(navigator?.language),
    ),
  );
  setCheckoutAttribute(checkoutAttributes, 'sh', window.screen?.height);
  setCheckoutAttribute(checkoutAttributes, 'sw', window.screen?.width);
  setCheckoutAttribute(
    checkoutAttributes,
    'ttp',
    firstNonEmpty(trackedAttributes.ttp, readCookie('_ttp')),
  );
  // WeTracked did not document `vid`; map it to Shopify's visitor cookie as a best-effort visitor id.
  setCheckoutAttribute(checkoutAttributes, 'vid', readCookie('_shopify_y'));

  return Array.from(checkoutAttributes.entries())
    .map(([key, value]) => ({
      key: String(key || '').trim(),
      value: String(value || '').trim(),
    }))
    .filter((attribute) => attribute.key && attribute.value);
}

function getWetrackedParams() {
  const params = new URLSearchParams();

  addSearchParams(params, window['wt:params']);
  addAttributionParamsFromSearch(params, window.location.search);
  addStoredWetrackedAttributes(params);

  return params.toString();
}

function getTrackedWetrackedAttributes() {
  const trackedAttributes = {};

  addTrackedAttributesFromSearchParams(trackedAttributes, window['wt:params']);
  addTrackedAttributesFromSearchParams(
    trackedAttributes,
    window.location.search,
  );
  Object.entries(readStoredWetrackedAttributes()).forEach(([key, value]) => {
    if (
      WETRACKED_ATTRIBUTION_KEYS.includes(key) &&
      value &&
      !trackedAttributes[key]
    ) {
      trackedAttributes[key] = String(value);
    }
  });

  return trackedAttributes;
}

function addSearchParams(targetParams, rawParams) {
  if (!rawParams || typeof rawParams !== 'string') return;

  const normalizedParams = rawParams.startsWith('?')
    ? rawParams.slice(1)
    : rawParams;
  const params = new URLSearchParams(normalizedParams);

  params.forEach((value, key) => {
    if (value && !targetParams.has(key)) {
      targetParams.set(key, value);
    }
  });
}

function addTrackedAttributesFromSearchParams(targetAttributes, rawParams) {
  if (!rawParams || typeof rawParams !== 'string') return;

  const normalizedParams = rawParams.startsWith('?')
    ? rawParams.slice(1)
    : rawParams;
  const params = new URLSearchParams(normalizedParams);

  WETRACKED_ATTRIBUTION_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value && !targetAttributes[key]) {
      targetAttributes[key] = value;
    }
  });
}

function addAttributionParamsFromSearch(targetParams, search) {
  if (!search) return;

  const currentParams = new URLSearchParams(search);
  WETRACKED_ATTRIBUTION_KEYS.forEach((key) => {
    const value = currentParams.get(key);
    if (value && !targetParams.has(key)) {
      targetParams.set(key, value);
    }
  });
}

function addStoredWetrackedAttributes(targetParams) {
  const storedAttributes = readStoredWetrackedAttributes();

  WETRACKED_ATTRIBUTION_KEYS.forEach((key) => {
    const value = storedAttributes[key];
    if (value && !targetParams.has(key)) {
      targetParams.set(key, String(value));
    }
  });
}

function readStoredWetrackedAttributes() {
  try {
    const storedAttributes = JSON.parse(
      window.localStorage.getItem('wt:attributes') || '{}',
    );
    const runtimeAttributes =
      window['wt:attributes'] && typeof window['wt:attributes'] === 'object'
        ? window['wt:attributes']
        : {};
    const nextAttributes = {
      ...runtimeAttributes,
      ...storedAttributes,
    };

    if (!nextAttributes || typeof nextAttributes !== 'object') return {};

    return nextAttributes;
  } catch {
    return {};
  }
}

function setCheckoutAttribute(attributes, key, value) {
  const normalizedKey = String(key || '').trim();
  const normalizedValue = String(value || '').trim();

  if (!normalizedKey || !normalizedValue) return;
  attributes.set(normalizedKey, normalizedValue);
}

function firstNonEmpty(...values) {
  return (
    values.find((value) => String(value || '').trim()) || ''
  );
}

function normalizeCountryCode(value) {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) return '';

  return normalizedValue.toUpperCase();
}

function normalizeHost(value) {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) return '';

  try {
    if (normalizedValue.includes('://')) {
      return new URL(normalizedValue).host;
    }
  } catch {
    return '';
  }

  return normalizedValue;
}

function normalizeLocale(value) {
  const normalizedValue = String(value || '')
    .replace(/_/g, '-')
    .trim();
  if (!normalizedValue) return '';

  const [languagePart, regionPart, ...rest] = normalizedValue.split('-');
  const language = languagePart ? languagePart.toLowerCase() : '';
  const region = regionPart ? regionPart.toUpperCase() : '';
  const nextParts = [language];

  if (region) nextParts.push(region);
  if (rest.length) nextParts.push(...rest.filter(Boolean));

  return nextParts.filter(Boolean).join('-');
}

function extractCountryFromLocale(locale) {
  const normalizedLocale = normalizeLocale(locale);
  if (!normalizedLocale.includes('-')) return '';

  const [, region = ''] = normalizedLocale.split('-');
  return normalizeCountryCode(region);
}

function readCookie(name) {
  const normalizedName = String(name || '').trim();
  if (!normalizedName || typeof document === 'undefined') return '';

  const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`),
  );

  return match?.[1] ? decodeURIComponent(match[1]) : '';
}

function normalizeSearchTerm(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCurrentHref() {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}
