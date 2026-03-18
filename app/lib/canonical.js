export const CANONICAL_ORIGIN = 'https://pixelzones.com';

export function canonicalizeRequest(request) {
  const url = new URL(request.url);
  url.protocol = 'https:';
  url.host = 'pixelzones.com';
  return new Request(url.toString(), request);
}

export function canonicalUrl(pathname = '/', search = '') {
  return `${CANONICAL_ORIGIN}${pathname}${search}`;
}
