import {data} from 'react-router';

const OUT_OF_SCOPE_REPLY =
  'I can only help with Pixel Zones products, delivery, location, and customer service details.';
const UNAVAILABLE_REPLY =
  'Store assistant is temporarily unavailable. Please contact us on WhatsApp: +961 81 539 339.';
const PRODUCT_NOT_FOUND_REPLY =
  'I checked Shopify and could not find a matching product right now. Please try another keyword or contact us on WhatsApp: +961 81 539 339.';
const GREETING_REPLY =
  'Hi! How can I help with Pixel Zones products, delivery, location, or customer service details?';
const OPENAI_CHAT_MODELS = ['gpt-5.4-mini', 'gpt-5-mini'];
const OPENAI_RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

const STORE_SCOPE_KEYWORDS = [
  'pixel zones',
  'store',
  'location',
  'address',
  'showroom',
  'beirut',
  'delivery',
  'shipping',
  'cash on delivery',
  'cod',
  'customer service',
  'support',
  'contact',
  'phone',
  'number',
  'whatsapp',
  'available',
  'availability',
  'stock',
  'in stock',
  'product',
  'item',
  'brand',
  'price',
  'order',
  'checkout',
];

const STORE_SERVICE_KEYWORDS = [
  'location',
  'address',
  'showroom',
  'beirut',
  'delivery',
  'shipping',
  'cash on delivery',
  'cod',
  'customer service',
  'support',
  'contact',
  'whatsapp',
  'phone number',
  'store hours',
  'open',
  'close',
];

const PRODUCT_HINT_KEYWORDS = [
  'product',
  'products',
  'item',
  'items',
  'iphone',
  'smartphone',
  'mobile',
  'laptop',
  'tablet',
  'airpods',
  'case',
  'charger',
  'cable',
  'powerbank',
  'headphone',
  'router',
  'brand',
  'brands',
  'price',
  'prices',
  'stock',
  'available',
  'availability',
  'sell',
  'carry',
];

const PRODUCT_LOOKUP_PATTERNS = [
  /\b(do you have|do u have|can i get|can you find|find|search for|looking for|i need|i want)\b/i,
  /\b(available|in stock|stock)\b/i,
];

const GREETING_PATTERNS = [
  /^(hi|hello|hey|hiya|yo)\b/i,
  /^(good\s(morning|afternoon|evening))\b/i,
];

const MODEL_HINT_WORDS = [
  'pro',
  'max',
  'plus',
  'ultra',
  'mini',
  'se',
  'air',
  'note',
  'fe',
];

const DEVICE_INTENT_KEYWORDS = [
  'iphone',
  'phone',
  'smartphone',
  'mobile',
  'galaxy',
  'ipad',
  'tablet',
  'laptop',
  'macbook',
  'watch',
  'airpods',
];

const ACCESSORY_KEYWORDS = [
  'case',
  'cover',
  'protector',
  'screen protector',
  'charger',
  'cable',
  'adapter',
  'powerbank',
  'mount',
  'holder',
  'skin',
  'strap',
];

const CONTEXT_CARRY_TOKENS = [
  'apple',
  'iphone',
  'samsung',
  'galaxy',
  'google',
  'pixel',
  'xiaomi',
  'huawei',
  'oppo',
  'oneplus',
  'ipad',
  'macbook',
  'airpods',
];

const FOLLOW_UP_ONLY_MESSAGES = new Set([
  'yes',
  'yeah',
  'yep',
  'ok',
  'okay',
  'sure',
  'please',
  'link',
  'url',
  'details',
  'more',
]);

const PRODUCT_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'any',
  'are',
  'can',
  'do',
  'for',
  'from',
  'have',
  'i',
  'in',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'please',
  'show',
  'that',
  'the',
  'this',
  'to',
  'we',
  'with',
  'you',
  'your',
]);

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return data({reply: 'Method not allowed.'}, {status: 405});
  }

  const apiKey = await resolveOpenAiApiKey(context.env, process.env);

  if (!apiKey) {
    const availableCandidates = listOpenAiEnvKeyNames(context.env).join(', ');
    const openAiBindingDebug = describeEnvBinding(context.env?.OPENAI_API_KEY);
    console.warn(
      `[chatbot] Missing OpenAI key in Hydrogen env. Detected OPENAI-like keys: ${
        availableCandidates || 'none'
      }. OPENAI_API_KEY binding debug: ${openAiBindingDebug}`,
    );
    return data({reply: UNAVAILABLE_REPLY});
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    return data({reply: 'Please send a valid message.'});
  }

  const message = sanitizeText(payload?.message);
  if (!message) {
    return data({reply: 'Please type your question first.'});
  }

  const history = normalizeHistory(payload?.history);
  if (isGreeting(message) && !hasRecentProductIntent(history)) {
    return data({reply: GREETING_REPLY});
  }

  const productLookupTerm = extractProductLookupTerm(message, history);
  const isListRequest = isCatalogListRequest(message);
  const shouldLookupProducts = shouldFetchProductsFromShopify(message, history);
  const isLikelyProductIntent = shouldLookupProducts;

  let contextualProducts = [];
  if (shouldLookupProducts) {
    contextualProducts = await fetchProductMatches(
      context.storefront,
      productLookupTerm,
      history,
      {
        requestedCount: extractRequestedProductCount(message),
        listCatalog: isListRequest,
      },
    );
  }

  const inScope = isStoreScopedQuestion(message, {
    hasProductMatch: contextualProducts.length > 0,
    isLikelyProductIntent,
  });
  if (!inScope) {
    return data({reply: OUT_OF_SCOPE_REPLY});
  }

  if (shouldLookupProducts && !contextualProducts.length) {
    return data({reply: PRODUCT_NOT_FOUND_REPLY, products: []});
  }

  const productContext = shouldLookupProducts
    ? formatProductContext(contextualProducts)
    : '';
  const maxOutputTokens = isListRequest ? 700 : 320;
  const openAiInput = buildOpenAiInput({
    history,
    message,
    productContext,
    includeProductContext: shouldLookupProducts,
  });

  try {
    const reply = await getOpenAiReplyWithRetry({
      apiKey,
      openAiInput,
      maxOutputTokens,
    });

    if (!reply) {
      return data({reply: UNAVAILABLE_REPLY});
    }

    return data({
      reply,
      products: shouldLookupProducts
        ? serializeChatbotProducts(contextualProducts)
        : [],
    });
  } catch (error) {
    console.error('OpenAI chat request crashed:', error);
    return data({reply: UNAVAILABLE_REPLY});
  }
}

async function getOpenAiReplyWithRetry({apiKey, openAiInput, maxOutputTokens}) {
  for (const model of OPENAI_CHAT_MODELS) {
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            input: openAiInput,
            max_output_tokens: maxOutputTokens,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          const reply = extractOutputText(result);
          if (reply) return reply;

          console.error(
            `OpenAI chat request returned empty output (model=${model}, attempt=${attempt}).`,
          );
          break;
        }

        const failureBody = await response.text().catch(() => '');
        console.error(
          `OpenAI chat request failed (model=${model}, attempt=${attempt}):`,
          response.status,
          failureBody,
        );

        const isRetryableStatus = OPENAI_RETRYABLE_STATUS.has(response.status);
        if (isRetryableStatus && attempt < maxAttempts) {
          await sleep(250 * attempt);
          continue;
        }

        break;
      } catch (error) {
        const isAbortError = error?.name === 'AbortError';
        console.error(
          `OpenAI chat request crashed (model=${model}, attempt=${attempt}):`,
          isAbortError ? 'timeout' : error,
        );

        if (attempt < maxAttempts) {
          await sleep(250 * attempt);
          continue;
        }
      }
    }
  }

  return '';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, 500);
}

async function resolveOpenAiApiKey(hydrogenEnv, nodeEnv) {
  const explicitKeyNames = [
    'OPENAI_API_KEY',
    'PRIVATE_OPENAI_API_KEY',
    'OPENAI_KEY',
    'OPEN_AI_API_KEY',
    'OPENAI_API_TOKEN',
    'PRIVATE_OPENAI_API_TOKEN',
    'OPENAI_TOKEN',
  ];

  for (const keyName of explicitKeyNames) {
    const fromHydrogen = await getNonEmptyEnvValue(hydrogenEnv, keyName);
    if (fromHydrogen) return fromHydrogen;
    const fromNode = await getNonEmptyEnvValue(nodeEnv, keyName);
    if (fromNode) return fromNode;
  }

  const heuristicKey = await findHeuristicOpenAiKey(hydrogenEnv);
  if (heuristicKey) return heuristicKey;

  return findHeuristicOpenAiKey(nodeEnv);
}

async function getNonEmptyEnvValue(envObject, key) {
  return normalizeEnvSecretValue(envObject?.[key]);
}

async function findHeuristicOpenAiKey(envObject) {
  if (!envObject || typeof envObject !== 'object') return '';

  for (const [key, value] of Object.entries(envObject)) {
    const upperKey = key.toUpperCase();
    const looksLikeOpenAiKey =
      upperKey.includes('OPENAI') &&
      (upperKey.includes('KEY') ||
        upperKey.includes('TOKEN') ||
        upperKey.includes('SECRET'));

    if (!looksLikeOpenAiKey) continue;

    const normalized = await normalizeEnvSecretValue(value);
    if (normalized) return normalized;
  }

  return '';
}

function listOpenAiEnvKeyNames(envObject) {
  if (!envObject || typeof envObject !== 'object') return [];

  return Object.keys(envObject).filter((key) => {
    const upperKey = key.toUpperCase();
    return (
      upperKey.includes('OPENAI') &&
      (upperKey.includes('KEY') ||
        upperKey.includes('TOKEN') ||
        upperKey.includes('SECRET'))
    );
  });
}

async function normalizeEnvSecretValue(rawValue, depth = 0) {
  if (depth > 3) return '';

  if (typeof rawValue === 'string') {
    const normalized = rawValue.trim();
    return normalized || '';
  }

  if (rawValue == null) return '';

  if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
    return String(rawValue).trim();
  }

  if (typeof rawValue === 'function') {
    try {
      const result = rawValue();
      return normalizeEnvSecretValue(result, depth + 1);
    } catch {
      return '';
    }
  }

  if (isPromiseLike(rawValue)) {
    try {
      const resolved = await rawValue;
      return normalizeEnvSecretValue(resolved, depth + 1);
    } catch {
      return '';
    }
  }

  if (typeof rawValue === 'object') {
    const wrappedKeys = ['value', 'secret', 'token', 'key', 'apiKey'];
    for (const wrappedKey of wrappedKeys) {
      const nested = rawValue?.[wrappedKey];
      const normalizedNested = await normalizeEnvSecretValue(nested, depth + 1);
      if (normalizedNested) return normalizedNested;
    }

    const toStringValue =
      typeof rawValue.toString === 'function' ? String(rawValue).trim() : '';
    if (toStringValue && toStringValue !== '[object Object]') {
      return toStringValue;
    }

    // Some runtime wrappers expose the value on symbol keys.
    const symbols = Object.getOwnPropertySymbols(rawValue);
    for (const symbolKey of symbols) {
      const symbolValue = rawValue[symbolKey];
      const normalizedSymbolValue = await normalizeEnvSecretValue(
        symbolValue,
        depth + 1,
      );
      if (normalizedSymbolValue) return normalizedSymbolValue;
    }
  }

  return '';
}

function isPromiseLike(value) {
  return Boolean(value && typeof value.then === 'function');
}

function describeEnvBinding(rawValue) {
  const type = rawValue === null ? 'null' : typeof rawValue;

  if (type !== 'object' && type !== 'function') {
    const safeLength =
      type === 'string' ? rawValue.length : String(rawValue ?? '').length;
    return `type=${type}, length=${safeLength}`;
  }

  const constructorName = rawValue?.constructor?.name || 'Unknown';
  let keys = [];
  try {
    keys = Object.keys(rawValue).slice(0, 10);
  } catch {
    keys = [];
  }

  let symbolsCount = 0;
  try {
    symbolsCount = Object.getOwnPropertySymbols(rawValue).length;
  } catch {
    symbolsCount = 0;
  }

  return `type=${type}, ctor=${constructorName}, keys=[${keys.join(',')}], symbols=${symbolsCount}`;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .map((item) => {
      const role = item?.role === 'assistant' ? 'assistant' : 'user';
      const content = sanitizeText(item?.content);
      if (!content) return null;
      return {role, content};
    })
    .filter(Boolean)
    .slice(-8);
}

function isGreeting(message) {
  const normalized = sanitizeText(message).toLowerCase();
  if (!normalized) return false;
  if (normalized.split(' ').length > 4) return false;
  return GREETING_PATTERNS.some((pattern) => pattern.test(normalized));
}

function hasProductIntent(message) {
  const lower = message.toLowerCase();
  return (
    looksLikeModelPhrase(lower) ||
    PRODUCT_HINT_KEYWORDS.some((keyword) => lower.includes(keyword)) ||
    PRODUCT_LOOKUP_PATTERNS.some((pattern) => pattern.test(lower))
  );
}

function looksLikeModelPhrase(message) {
  const lower = sanitizeText(message).toLowerCase();
  if (!lower) return false;

  const hasDigit = /\b\d{1,3}\b/.test(lower);
  const hasModelWord = MODEL_HINT_WORDS.some((word) => lower.includes(word));
  const hasDeviceWord = DEVICE_INTENT_KEYWORDS.some((word) =>
    lower.includes(word),
  );

  return hasDeviceWord || (hasDigit && hasModelWord);
}

function baseExtractProductLookupTerm(message) {
  const normalized = sanitizeText(message).replace(/[?!.]+$/g, '');
  if (!normalized) return '';

  const patterns = [
    /(?:do you have|do u have|can i get|can you find|find|search for|looking for|i need|i want)\s+(.+)/i,
    /(?:is|are)\s+(.+?)\s+(?:available|in stock)/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      const extracted = sanitizeText(match[1]).replace(/[?!.]+$/g, '');
      if (extracted) return extracted;
    }
  }

  return normalized
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractProductLookupTerm(message, history = []) {
  const baseTerm = baseExtractProductLookupTerm(message);
  if (!baseTerm) return '';

  if (!looksLikeModelPhrase(baseTerm)) {
    return baseTerm;
  }

  const lastProductMessage = getLastProductIntentMessage(history);
  if (!lastProductMessage) return baseTerm;

  const contextTerm = baseExtractProductLookupTerm(lastProductMessage);
  if (!contextTerm) return baseTerm;

  const contextTokens = extractSearchTerms(contextTerm);
  const baseTokens = extractSearchTerms(baseTerm);
  const carryTokens = contextTokens.filter((token) =>
    CONTEXT_CARRY_TOKENS.includes(token),
  );

  if (!carryTokens.length) return baseTerm;

  const merged = [...new Set([...carryTokens, ...baseTokens])].join(' ');
  return merged || baseTerm;
}

function getLastProductIntentMessage(history) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];
    if (item?.role !== 'user') continue;
    if (!item?.content) continue;
    if (hasProductIntent(item.content) || isCatalogListRequest(item.content)) {
      return item.content;
    }
  }

  return '';
}

function shouldFetchProductsFromShopify(message, history) {
  if (isStoreServiceIntent(message) && !hasRecentProductIntent(history)) {
    return false;
  }

  if (isCatalogListRequest(message)) return true;
  if (hasProductIntent(message)) return true;

  return isFollowUpMessage(message) && hasRecentProductIntent(history);
}

function isStoreServiceIntent(message) {
  const lower = message.toLowerCase();
  return STORE_SERVICE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function hasRecentProductIntent(history) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];
    if (item?.role !== 'user') continue;
    if (!item?.content) continue;
    if (isFollowUpMessage(item.content)) continue;
    if (hasProductIntent(item.content) || isCatalogListRequest(item.content)) {
      return true;
    }
  }

  return false;
}

function isCatalogListRequest(message) {
  const lower = message.toLowerCase();
  return (
    /(list|show|display|give)\s+\d{1,3}/i.test(lower) ||
    /(\d{1,3})\s+(products|items)/i.test(lower) ||
    /(list|show|display|give).*(products|items)/i.test(lower)
  );
}

function extractRequestedProductCount(message) {
  const matches = [
    message.match(/\b(?:list|show|display|give)\s+(\d{1,3})\b/i),
    message.match(/\b(\d{1,3})\s+(?:products|items)\b/i),
  ];

  for (const match of matches) {
    const numeric = Number(match?.[1]);
    if (Number.isFinite(numeric) && numeric > 0) {
      return Math.min(numeric, 30);
    }
  }

  return 10;
}

function isFollowUpMessage(message) {
  const lower = sanitizeText(message).toLowerCase();
  if (!lower) return false;

  if (FOLLOW_UP_ONLY_MESSAGES.has(lower)) return true;
  if (['yes please', 'show link', 'send link', 'share link'].includes(lower)) {
    return true;
  }

  if (lower.includes('the phone') || lower.includes('this one')) return true;
  if (lower.includes('that one') || lower.includes('its link')) return true;

  const words = lower.split(' ').filter(Boolean);
  return words.length <= 2 && !hasProductIntent(lower);
}

function buildSearchSeedMessages(message, history) {
  const seeds = [];
  const seen = new Set();

  function pushSeed(value) {
    const normalized = sanitizeText(value);
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    seeds.push(normalized);
  }

  pushSeed(message);

  const lowerMessage = message.toLowerCase();
  const wordCount = lowerMessage.split(/\s+/).filter(Boolean).length;
  const shouldUseHistory = isFollowUpMessage(message) || wordCount <= 5;

  if (!shouldUseHistory) return seeds;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const item = history[index];
    if (item?.role !== 'user') continue;
    if (!item?.content) continue;
    if (item.content.toLowerCase() === lowerMessage) continue;
    if (isFollowUpMessage(item.content)) continue;
    pushSeed(item.content);
    if (seeds.length >= 4) break;
  }

  return seeds;
}

function isStoreScopedQuestion(message, {hasProductMatch, isLikelyProductIntent}) {
  if (hasProductMatch || isLikelyProductIntent) return true;
  const lower = message.toLowerCase();
  return STORE_SCOPE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

async function fetchProductMatches(
  storefront,
  message,
  history = [],
  options = {},
) {
  const maxResults = Math.min(Math.max(options.requestedCount || 10, 1), 30);
  const shouldListCatalog = Boolean(options.listCatalog);
  const allowCatalogFallback = Boolean(options.allowCatalogFallback);

  if (shouldListCatalog) {
    const catalogProducts = await fetchCatalogProducts(storefront, maxResults);
    if (catalogProducts.length) {
      return catalogProducts.slice(0, maxResults);
    }
  }

  const searchSeedMessages = buildSearchSeedMessages(message, history);
  const rankingSeed =
    searchSeedMessages.find((seed) => !isFollowUpMessage(seed)) ||
    searchSeedMessages[0] ||
    message;
  const dedupedProducts = new Map();

  for (const searchSeed of searchSeedMessages) {
    const queries = buildProductSearchQueries(searchSeed);
    if (!queries.length) continue;

    const searchQueries = queries.slice(0, 5);

    const [searchResults, productsResults] = await Promise.all([
      Promise.all(
        searchQueries.map((query) => searchProductsByQuery(storefront, query)),
      ),
      Promise.all(
        searchQueries.map((query) =>
          searchProductsByProductsQuery(storefront, query),
        ),
      ),
    ]);

    [...searchResults.flat(), ...productsResults.flat()].forEach((product) => {
      if (!product?.id) return;
      if (!dedupedProducts.has(product.id)) {
        dedupedProducts.set(product.id, product);
      }
    });

    if (dedupedProducts.size < Math.min(maxResults, 4)) {
      const predictiveProducts = await searchProductsPredictive(
        storefront,
        queries[0] || searchSeed,
      );

      predictiveProducts.forEach((product) => {
        if (!product?.id) return;
        if (!dedupedProducts.has(product.id)) {
          dedupedProducts.set(product.id, product);
        }
      });
    }

    if (dedupedProducts.size >= maxResults) break;
  }

  let products = Array.from(dedupedProducts.values());

  if (!products.length && allowCatalogFallback) {
    const fallbackProducts = await searchProductsCatalogFallback(
      storefront,
      rankingSeed,
      maxResults,
    );
    products = fallbackProducts;
  }

  return rankProductsForMessage(products, rankingSeed).slice(0, maxResults);
}

async function searchProductsByProductsQuery(storefront, query) {
  try {
    const result = await storefront.query(CHATBOT_PRODUCTS_QUERY_SEARCH, {
      cache: storefront.CacheShort(),
      variables: {
        query,
        first: 12,
      },
    });

    return result?.products?.nodes || [];
  } catch (error) {
    console.error('Shopify products(query) search failed:', error);
    return [];
  }
}

async function searchProductsByQuery(storefront, query) {
  try {
    const result = await storefront.query(CHATBOT_PRODUCT_SEARCH_QUERY, {
      cache: storefront.CacheShort(),
      variables: {
        query,
        first: 12,
      },
    });

    return (
      result?.search?.nodes?.filter((node) => node?.__typename === 'Product') || []
    );
  } catch (error) {
    console.error('Shopify product search failed:', error);
    return [];
  }
}

async function searchProductsPredictive(storefront, term) {
  try {
    const result = await storefront.query(CHATBOT_PREDICTIVE_PRODUCTS_QUERY, {
      cache: storefront.CacheShort(),
      variables: {
        term,
        limit: 10,
      },
    });

    return result?.predictiveSearch?.products || [];
  } catch (error) {
    console.error('Shopify predictive product search failed:', error);
    return [];
  }
}

async function searchProductsCatalogFallback(storefront, message, maxResults) {
  try {
    const result = await storefront.query(CHATBOT_CATALOG_PRODUCTS_QUERY, {
      cache: storefront.CacheShort(),
      variables: {
        first: 120,
      },
    });

    const allProducts = result?.products?.nodes || [];
    return rankProductsForMessage(allProducts, message).slice(0, maxResults);
  } catch (error) {
    console.error('Shopify catalog fallback search failed:', error);
    return [];
  }
}

async function fetchCatalogProducts(storefront, count) {
  try {
    const first = Math.min(Math.max(count, 1), 30);
    const result = await storefront.query(CHATBOT_CATALOG_PRODUCTS_QUERY, {
      cache: storefront.CacheShort(),
      variables: {
        first,
      },
    });

    return result?.products?.nodes || [];
  } catch (error) {
    console.error('Shopify catalog product query failed:', error);
    return [];
  }
}

async function fetchFeaturedProducts(storefront) {
  try {
    const result = await storefront.query(CHATBOT_FEATURED_PRODUCTS_QUERY, {
      cache: storefront.CacheShort(),
      variables: {
        first: 6,
      },
    });

    return result?.products?.nodes || [];
  } catch (error) {
    console.error('Shopify featured product query failed:', error);
    return [];
  }
}

function buildProductSearchQueries(message) {
  const variants = [];
  const seen = new Set();

  function push(value) {
    const normalized = sanitizeText(value).toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    variants.push(normalized);
  }

  push(message);

  const cleaned = message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return variants;

  const tokens = cleaned
    .split(' ')
    .filter((token) => token.length > 1 && !PRODUCT_STOP_WORDS.has(token))
    .slice(0, 10);

  if (tokens.length) {
    push(tokens.join(' '));
    push(tokens.slice(0, 6).join(' '));

    if (tokens.length > 1) {
      push(`"${tokens.slice(0, 5).join(' ')}"`);
    }

    tokens.slice(0, 5).forEach((token) => {
      push(token);
      push(`title:${token}*`);
      push(`vendor:${token}*`);
      push(`product_type:${token}*`);
      push(`tag:${token}*`);
    });
  }

  return variants;
}

function rankProductsForMessage(products, message) {
  const terms = extractSearchTerms(message);
  if (!terms.length) return products;
  const preferPrimaryDevice = shouldPreferPrimaryDevice(message);

  return [...products].sort((a, b) => {
    const scoreA = scoreProductMatch(a, terms, {preferPrimaryDevice});
    const scoreB = scoreProductMatch(b, terms, {preferPrimaryDevice});

    if (scoreB !== scoreA) return scoreB - scoreA;
    return (a?.title || '').localeCompare(b?.title || '');
  });
}

function extractSearchTerms(message) {
  return message
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) => token.length > 1 && !PRODUCT_STOP_WORDS.has(token),
    )
    .slice(0, 10);
}

function shouldPreferPrimaryDevice(message) {
  const lower = sanitizeText(message).toLowerCase();
  if (!lower) return false;

  const hasDeviceIntent = DEVICE_INTENT_KEYWORDS.some((word) =>
    lower.includes(word),
  );
  const hasAccessoryIntent = ACCESSORY_KEYWORDS.some((word) =>
    lower.includes(word),
  );

  return hasDeviceIntent && !hasAccessoryIntent;
}

function isAccessoryProduct(product) {
  const searchable = [
    product?.title || '',
    product?.productType || '',
    Array.isArray(product?.tags) ? product.tags.join(' ') : '',
  ]
    .join(' ')
    .toLowerCase();

  return ACCESSORY_KEYWORDS.some((keyword) => searchable.includes(keyword));
}

function scoreProductMatch(product, terms, options = {}) {
  const title = (product?.title || '').toLowerCase();
  const vendor = (product?.vendor || '').toLowerCase();
  const handle = (product?.handle || '').toLowerCase();
  const productType = (product?.productType || '').toLowerCase();
  const tags = Array.isArray(product?.tags)
    ? product.tags.join(' ').toLowerCase()
    : '';

  let score = 0;
  for (const term of terms) {
    if (title.includes(term)) score += 5;
    if (vendor.includes(term)) score += 3;
    if (handle.includes(term)) score += 3;
    if (productType.includes(term)) score += 2;
    if (tags.includes(term)) score += 2;
  }

  if (options.preferPrimaryDevice && isAccessoryProduct(product)) {
    score -= 4;
  }

  return score;
}

function formatMoney(amount, currencyCode) {
  if (amount == null || !currencyCode) return 'N/A';

  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(numeric);
}

function serializeChatbotProducts(products) {
  return (products || [])
    .map((product) => {
      if (!product?.title) return null;
      const minPrice = product?.priceRange?.minVariantPrice;
      const price = formatMoney(minPrice?.amount, minPrice?.currencyCode);
      const url =
        typeof product?.onlineStoreUrl === 'string' && product.onlineStoreUrl
          ? product.onlineStoreUrl
          : product?.handle
            ? `/products/${product.handle}`
            : '';

      return {
        id: product?.id || '',
        handle: product?.handle || '',
        title: product?.title || '',
        url,
        imageUrl: product?.featuredImage?.url || '',
        imageAlt: product?.featuredImage?.altText || product?.title || '',
        price: price === 'N/A' ? '' : price,
      };
    })
    .filter(Boolean)
    .slice(0, 20);
}

function formatProductContext(products) {
  if (!products.length) {
    return 'No direct Shopify product matches were found for this query.';
  }

  return products
    .map((product, index) => {
      const minPrice = product?.priceRange?.minVariantPrice;
      const availability = product?.selectedOrFirstAvailableVariant?.availableForSale
        ? 'In stock'
        : 'Out of stock';
      const price = formatMoney(minPrice?.amount, minPrice?.currencyCode);
      const productUrl =
        typeof product?.onlineStoreUrl === 'string' && product.onlineStoreUrl
          ? product.onlineStoreUrl
          : product?.handle
            ? `/products/${product.handle}`
            : 'n/a';

      return [
        `${index + 1}. ${product.title || 'Untitled product'}`,
        `handle: ${product.handle || 'n/a'}`,
        `brand: ${product.vendor || 'n/a'}`,
        `type: ${product.productType || 'n/a'}`,
        `price: ${price}`,
        `availability: ${availability}`,
        `url: ${productUrl}`,
      ].join(' | ');
    })
    .join('\n');
}

function buildOpenAiInput({
  history,
  message,
  productContext,
  includeProductContext = false,
}) {
  const systemPrompt = [
    'You are Pixel Zones store assistant.',
    'You must ONLY answer questions related to Pixel Zones store details and products.',
    'Allowed topics: store location, customer service number, delivery information, and Shopify product data.',
    `If the user asks anything outside scope, reply exactly: "${OUT_OF_SCOPE_REPLY}"`,
    'Never provide general knowledge answers.',
    'Use only the facts provided here and any live Shopify lookup data provided in the conversation.',
    'If live Shopify lookup data is provided, only mention products from that data.',
    'Do not invent warranty, specs, stock, or prices.',
    'If asked for a product URL, provide the url value from live Shopify lookup data when available.',
    'If no live product match is provided, clearly say the product is not currently found.',
    'If only accessories/cases are shown, do not claim the main device itself is available.',
    'If user asks to list N products and live lookup data is provided, list up to N products from that data.',
    'If data is missing, say you do not have that information yet.',
    'Keep replies concise, clear, and helpful.',
    'Store facts:',
    '- Store: Pixel Zones',
    '- Location: Beirut, Adlieh, Sami Al Solh Avenue, Sequoia Building',
    '- Customer service / WhatsApp: +961 81 539 339',
    '- Delivery: Same-day in Beirut (when possible), 2-3 working days outside Beirut, cash on delivery, delivery all over Lebanon, and confirmation before delivery.',
  ].join('\n');

  const input = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
  ];

  if (includeProductContext && productContext) {
    input.push({
      role: 'assistant',
      content: `Live Shopify lookup data:\n${productContext}`,
    });
  }

  input.push({
    role: 'user',
    content: message,
  });

  return input;
}

function extractOutputText(responseBody) {
  if (
    typeof responseBody?.output_text === 'string' &&
    responseBody.output_text.trim()
  ) {
    return responseBody.output_text.trim();
  }

  const texts = [];
  const output = Array.isArray(responseBody?.output) ? responseBody.output : [];

  output.forEach((item) => {
    if (!Array.isArray(item?.content)) return;
    item.content.forEach((contentItem) => {
      if (
        contentItem?.type === 'output_text' &&
        typeof contentItem?.text === 'string'
      ) {
        texts.push(contentItem.text);
      }
    });
  });

  return texts.join('\n').trim();
}

const CHATBOT_PRODUCT_SEARCH_QUERY = `#graphql
  query ChatbotProductSearch(
    $country: CountryCode
    $language: LanguageCode
    $query: String!
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    search(
      query: $query
      first: $first
      types: [PRODUCT]
      unavailableProducts: HIDE
    ) {
      nodes {
        __typename
        ... on Product {
          id
          title
          handle
          vendor
          productType
          tags
          onlineStoreUrl
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          selectedOrFirstAvailableVariant {
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

const CHATBOT_PRODUCTS_QUERY_SEARCH = `#graphql
  query ChatbotProductsQuerySearch(
    $country: CountryCode
    $language: LanguageCode
    $query: String!
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query, sortKey: RELEVANCE) {
      nodes {
        id
        title
        handle
        vendor
        productType
        tags
        onlineStoreUrl
        featuredImage {
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        selectedOrFirstAvailableVariant {
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const CHATBOT_FEATURED_PRODUCTS_QUERY = `#graphql
  query ChatbotFeaturedProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        vendor
        productType
        tags
        onlineStoreUrl
        featuredImage {
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        selectedOrFirstAvailableVariant {
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const CHATBOT_PREDICTIVE_PRODUCTS_QUERY = `#graphql
  query ChatbotPredictiveProducts(
    $country: CountryCode
    $language: LanguageCode
    $term: String!
    $limit: Int!
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      query: $term
      limit: $limit
      limitScope: EACH
      types: [PRODUCT]
    ) {
      products {
        id
        title
        handle
        vendor
        productType
        tags
        onlineStoreUrl
        featuredImage {
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        selectedOrFirstAvailableVariant {
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

const CHATBOT_CATALOG_PRODUCTS_QUERY = `#graphql
  query ChatbotCatalogProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        vendor
        productType
        tags
        onlineStoreUrl
        featuredImage {
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        selectedOrFirstAvailableVariant {
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/api.chatbot').Route} Route */
