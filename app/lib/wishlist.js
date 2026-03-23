const WISHLIST_COOKIE_KEY = 'pz_wishlist';
const WISHLIST_EVENT = 'pz:wishlist-updated';
const WISHLIST_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export {
  WISHLIST_COOKIE_KEY,
  WISHLIST_EVENT,
  WISHLIST_MAX_AGE_SECONDS,
};

export function getWishlistFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return [];
  const cookieValue = readCookieValue(cookieHeader, WISHLIST_COOKIE_KEY);
  return parseWishlistValue(cookieValue);
}

export function getWishlistFromDocumentCookie() {
  if (typeof document === 'undefined') return [];
  return getWishlistFromCookieHeader(document.cookie || '');
}

export function setWishlistInDocumentCookie(handles) {
  if (typeof document === 'undefined') return normalizeWishlist(handles);

  const normalized = normalizeWishlist(handles);
  const value = encodeURIComponent(JSON.stringify(normalized));
  const expires = new Date(
    Date.now() + WISHLIST_MAX_AGE_SECONDS * 1000,
  ).toUTCString();

  document.cookie = `${WISHLIST_COOKIE_KEY}=${value}; path=/; max-age=${WISHLIST_MAX_AGE_SECONDS}; expires=${expires}; SameSite=Lax`;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(WISHLIST_EVENT, {
        detail: normalized,
      }),
    );
  }

  return normalized;
}

export function toggleWishlistHandle(handle) {
  const normalizedHandle = normalizeHandle(handle);
  if (!normalizedHandle) return getWishlistFromDocumentCookie();

  const wishlist = getWishlistFromDocumentCookie();
  const exists = wishlist.includes(normalizedHandle);

  if (exists) {
    return setWishlistInDocumentCookie(
      wishlist.filter((value) => value !== normalizedHandle),
    );
  }

  return setWishlistInDocumentCookie([...wishlist, normalizedHandle]);
}

export function subscribeToWishlistChanges(callback) {
  if (typeof window === 'undefined') return () => {};

  const handler = (event) => {
    if (Array.isArray(event?.detail)) {
      callback(normalizeWishlist(event.detail));
      return;
    }

    callback(getWishlistFromDocumentCookie());
  };

  window.addEventListener(WISHLIST_EVENT, handler);

  return () => {
    window.removeEventListener(WISHLIST_EVENT, handler);
  };
}

function parseWishlistValue(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    return normalizeWishlist(parsed);
  } catch {
    return [];
  }
}

function normalizeWishlist(value) {
  if (!Array.isArray(value)) return [];

  const uniqueHandles = [];
  const seen = new Set();

  value.forEach((entry) => {
    const handle = normalizeHandle(entry);
    if (!handle || seen.has(handle)) return;
    seen.add(handle);
    uniqueHandles.push(handle);
  });

  return uniqueHandles.slice(0, 100);
}

function normalizeHandle(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function readCookieValue(cookieHeader, key) {
  const parts = cookieHeader.split(';');

  for (const part of parts) {
    const [rawName, ...rawValue] = part.split('=');
    if (!rawName) continue;
    if (rawName.trim() !== key) continue;
    return rawValue.join('=').trim();
  }

  return '';
}
