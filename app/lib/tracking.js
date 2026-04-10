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

function getWetrackedParams() {
  const params = new URLSearchParams();

  addSearchParams(params, window['wt:params']);
  addAttributionParamsFromSearch(params, window.location.search);
  addStoredWetrackedAttributes(params);

  return params.toString();
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

    if (!storedAttributes || typeof storedAttributes !== 'object') return {};

    return storedAttributes;
  } catch {
    return {};
  }
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
