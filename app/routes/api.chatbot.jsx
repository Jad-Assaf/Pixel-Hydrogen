import {data} from 'react-router';

const OUT_OF_SCOPE_REPLY =
  'I can only help with Pixel Zones products, delivery, location, and customer service details.';
const UNAVAILABLE_REPLY =
  'Store assistant is temporarily unavailable. Please contact us on WhatsApp: +961 81 539 339.';
const PRODUCT_NOT_FOUND_REPLY =
  'I could not find a matching product in the Pixel Zones catalog right now. Please try another keyword or contact us on WhatsApp: +961 81 539 339.';
const GREETING_REPLY =
  'Hi! How can I help with Pixel Zones products, delivery, location, or customer service details?';
const OPENAI_CHAT_MODELS = ['gpt-5.4-mini', 'gpt-5-mini'];
const OPENAI_RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_AGENT_QUANTITY = 10;
const SHOPIFY_MCP_TOOL_SEARCH_CATALOG = 'search_shop_catalog';
const SHOPIFY_MCP_TOOL_POLICIES_AND_FAQS = 'search_shop_policies_and_faqs';
const SHOPIFY_MCP_TIMEOUT_MS = 12000;
const SHOPIFY_MCP_MAX_RESULTS = 30;
const MAX_TOOL_ROUNDS = 6;
const TOOL_MODEL_DEFAULT = 'gpt-5.4-mini';

const STORE_TOOL_DEFINITIONS = [
  {
    type: 'function',
    name: 'search_store_catalog',
    description:
      'Search the Pixel Zones catalog for matching products, availability, and recommendations.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        query: {type: 'string'},
        shopping_context: {type: 'string'},
      },
      required: ['query'],
    },
  },
  {
    type: 'function',
    name: 'search_store_policies',
    description:
      'Look up store policies, delivery, shipping, payment, and FAQ information.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        question: {type: 'string'},
        context: {type: 'string'},
      },
      required: ['question'],
    },
  },
  {
    type: 'function',
    name: 'get_product_details',
    description:
      'Fetch detailed product information by product handle or product URL.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        handle: {type: 'string'},
        product_url: {type: 'string'},
      },
      required: [],
    },
  },
  {
    type: 'function',
    name: 'get_cart_summary',
    description:
      'Read the current cart to answer questions about item count, totals, and checkout.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {},
      required: [],
    },
  },
];

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
  'cart',
  'basket',
  'bag',
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
  'phone',
  'smartphone',
  'mobile',
  'computer',
  'desktop',
  'pc',
  'laptop',
  'tablet',
  'airpods',
  'case',
  'charger',
  'cable',
  'powerbank',
  'router',
  'headphone',
  'headphones',
  'headset',
  'speaker',
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
  'computer',
  'desktop',
  'pc',
  'notebook',
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
  'briefcase',
  'tote',
  'backpack',
  'bag',
  'sleeve',
  'stand',
  'mouse',
  'keyboard',
  'printer',
  'router',
  'headphone',
  'headphones',
  'headset',
  'speaker',
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

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    return data({reply: 'Please send a valid message.'});
  }

  const agentActionRequest = normalizeAgentActionRequest(payload?.agentAction);
  if (agentActionRequest) {
    return handleAgentActionRequest({context, agentActionRequest});
  }

  const message = sanitizeText(payload?.message);
  if (!message) {
    return data({reply: 'Please type your question first.'});
  }
  const pageContext = normalizePageContext(payload?.pageContext);
  const currentProductHandle = detectCurrentProductHandle(pageContext);

  const apiKey = await resolveOpenAiApiKey(context.env, process.env);

  if (!apiKey) {
    const availableCandidates = listOpenAiEnvKeyNames(context.env).join(', ');
    const openAiBindingDebug = describeEnvBinding(context.env?.OPENAI_API_KEY);
    console.warn(
      `[chatbot] Missing OpenAI key in Hydrogen env. Detected OPENAI-like keys: ${
        availableCandidates || 'none'
      }. OPENAI_API_KEY binding debug: ${openAiBindingDebug}`,
    );
    return data({reply: UNAVAILABLE_REPLY, actions: []});
  }

  const history = normalizeHistory(payload?.history);
  const recentProducts = normalizeRecentProducts(payload?.recentProducts);
  if (isGreeting(message) && !hasRecentProductIntent(history)) {
    return data({reply: GREETING_REPLY});
  }

  const referencedOptionIndex = extractReferencedOptionIndex(message);
  const isExplicitOptionAddIntent =
    isAddToCartIntent(message) && referencedOptionIndex !== null;

  if (isExplicitOptionAddIntent && !recentProducts.length) {
    return data({
      reply:
        'I could not find the previous product list in this conversation. Please ask me to list products again first.',
      actions: [],
    });
  }

  if (
    isExplicitOptionAddIntent &&
    referencedOptionIndex >= recentProducts.length
  ) {
    return data({
      reply: `I could not find option #${referencedOptionIndex + 1} in the last list.`,
      actions: [],
    });
  }

  if (
    shouldRejectClearlyOffTopicRequest(message, {
      pageContext,
      currentProductHandle,
    })
  ) {
    return data({reply: OUT_OF_SCOPE_REPLY, products: [], actions: []});
  }

  const productLookupTerm = extractProductLookupTerm(message, history);
  const isListRequest = isCatalogListRequest(message);
  const shouldLookupProducts =
    !isExplicitOptionAddIntent &&
    shouldFetchProductsFromShopify(message, history);
  const isLikelyProductIntent = shouldLookupProducts;

  let contextualProducts = recentProducts;
  let toolReply = '';
  let toolBasedProducts = [];
  let usedFallbackProductLookup = false;

  if (!isExplicitOptionAddIntent) {
    try {
      const toolResult = await runStoreToolLoop({
        apiKey,
        model: sanitizeText(context?.env?.OPENAI_CHATBOT_MODEL) || TOOL_MODEL_DEFAULT,
        messages: [...history, {role: 'user', content: message}],
        toolContext: {
          context,
          message,
          history,
          pageContext,
          currentProductHandle,
        },
      });

      toolReply = sanitizeText(extractOutputText(toolResult.response));
      toolBasedProducts = toolResult.ui.products || [];
    } catch (error) {
      console.error('Chatbot tool loop failed:', error);
    }
  }

  if (toolBasedProducts.length) {
    contextualProducts = toolBasedProducts;
  } else if (shouldLookupProducts) {
    contextualProducts = await fetchProductMatches(context, productLookupTerm, history, {
      requestedCount: extractRequestedProductCount(message),
      listCatalog: isListRequest,
    });
    usedFallbackProductLookup = contextualProducts.length > 0;
  }

  let policyContext = '';
  if (isStoreServiceIntent(message)) {
    policyContext = await fetchStorePoliciesContext(
      context,
      message,
      history,
      contextualProducts,
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

  const agentPlan = buildAgentPlan({
    message,
    products: contextualProducts,
    referencedOptionIndex,
  });
  const shouldAttachProducts = shouldIncludeProductsInResponse({
    message,
    shouldLookupProducts,
    isListRequest,
    isExplicitOptionAddIntent,
  });
  if (agentPlan.actions.length) {
    return data({
      reply: agentPlan.reply,
      products: shouldAttachProducts
        ? serializeChatbotProducts(contextualProducts)
        : [],
      actions: agentPlan.actions,
    });
  }

  if (toolReply && !(shouldLookupProducts && usedFallbackProductLookup)) {
    return data({
      reply: toolReply,
      products: shouldAttachProducts
        ? serializeChatbotProducts(contextualProducts)
        : [],
      actions: [],
    });
  }

  const productContext = shouldLookupProducts
    ? formatProductContext(contextualProducts)
    : '';
  const maxOutputTokens = isListRequest ? 700 : 320;
  const openAiInput = buildOpenAiInput({
    history,
    message,
    productContext,
    policyContext,
    includeProductContext: shouldLookupProducts,
    includePolicyContext: Boolean(policyContext),
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
      products: shouldAttachProducts
        ? serializeChatbotProducts(contextualProducts)
        : [],
      actions: [],
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

async function runStoreToolLoop({apiKey, model, messages, toolContext}) {
  const uiState = createToolUiState();
  const instructions = buildToolInstructions({
    pageContext: toolContext?.pageContext,
    currentProductHandle: toolContext?.currentProductHandle,
  });
  const conversation = serializeConversationForTools(messages);

  let response = await createOpenAiResponse(apiKey, {
    model,
    instructions,
    input: conversation,
    tools: STORE_TOOL_DEFINITIONS,
    max_output_tokens: 900,
  });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const functionCalls = getFunctionCalls(response);
    if (!functionCalls.length) {
      return {
        response,
        ui: finalizeToolUiState(uiState),
      };
    }

    const toolOutputs = [];
    for (const call of functionCalls) {
      const args = safeParseJson(call.arguments) || {};
      const output = await runStoreToolByName(call.name, args, toolContext).catch(
        (error) => ({
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : 'Tool execution failed unexpectedly.',
        }),
      );

      updateToolUiState(uiState, call.name, output);

      toolOutputs.push({
        type: 'function_call_output',
        call_id: call.call_id,
        output: JSON.stringify(output),
      });
    }

    response = await createOpenAiResponse(apiKey, {
      model,
      previous_response_id: response.id,
      input: toolOutputs,
      tools: STORE_TOOL_DEFINITIONS,
      max_output_tokens: 900,
    });
  }

  throw new Error('The chatbot exceeded its tool-call limit.');
}

async function createOpenAiResponse(apiKey, payload) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.error?.message || `OpenAI chat request failed (${response.status}).`;
    throw new Error(message);
  }

  return data;
}

function getFunctionCalls(openaiResponse) {
  if (!Array.isArray(openaiResponse?.output)) return [];
  return openaiResponse.output.filter((item) => item?.type === 'function_call');
}

function createToolUiState() {
  return {
    products: new Map(),
  };
}

function updateToolUiState(state, toolName, output) {
  if (!state || !output?.ok) return;

  if (toolName === 'search_store_catalog') {
    registerToolProducts(state, output.products);
    return;
  }

  if (toolName === 'get_product_details' && output.product) {
    registerToolProducts(state, [output.product]);
  }
}

function registerToolProducts(state, products) {
  if (!Array.isArray(products)) return;

  products.forEach((product) => {
    if (!product || typeof product !== 'object') return;
    const key = getMcpProductDedupKey(product);
    if (!key) return;
    state.products.set(key, product);
  });
}

function finalizeToolUiState(state) {
  return {
    products: Array.from(state.products.values()).slice(0, SHOPIFY_MCP_MAX_RESULTS),
  };
}

function buildToolInstructions({pageContext, currentProductHandle} = {}) {
  const currentPageLine = pageContext?.pathname
    ? `Current page: ${pageContext.pathname}.`
    : '';
  const productHandleLine = currentProductHandle
    ? `The shopper is currently viewing product handle "${currentProductHandle}". If they refer to "this", "this product", or "it", use get_product_details with that handle.`
    : '';

  return [
    'You are the Pixel Zones storefront assistant.',
    'Always use tools for factual store data (catalog, policies, cart, product details).',
    'Never invent product availability, price, policy, or cart details.',
    `If user asks anything unrelated to store shopping/support, reply exactly: "${OUT_OF_SCOPE_REPLY}"`,
    'When user asks for products, always call search_store_catalog first.',
    'When user asks policy/delivery/customer-service questions, call search_store_policies.',
    'If the user is on a product page and asks about this product, use get_product_details for that exact product handle.',
    'Keep responses concise and helpful.',
    'Store facts:',
    '- Store: Pixel Zones',
    '- Location: Beirut, Adlieh, Sami Al Solh Avenue, Sequoia Building',
    '- Customer service / WhatsApp: +961 81 539 339',
    '- Delivery: Same-day in Beirut (when possible), 2-3 working days outside Beirut, cash on delivery, delivery all over Lebanon.',
    currentPageLine,
    productHandleLine,
  ].join(' ');
}

function serializeConversationForTools(messages) {
  return (Array.isArray(messages) ? messages : [])
    .slice(-12)
    .map((message) => {
      const role = message?.role === 'assistant' ? 'Assistant' : 'User';
      return `${role}: ${sanitizeText(message?.content)}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

async function runStoreToolByName(name, args, toolContext) {
  switch (name) {
    case 'search_store_catalog':
      return searchStoreCatalogTool(args, toolContext);
    case 'search_store_policies':
      return searchStorePoliciesTool(args, toolContext);
    case 'get_product_details':
      return getProductDetailsTool(args, toolContext);
    case 'get_cart_summary':
      return getCartSummaryTool(toolContext);
    default:
      return {
        ok: false,
        error: `Unknown tool "${name}".`,
      };
  }
}

async function searchStoreCatalogTool(args, toolContext) {
  const rawQuery = sanitizeText(args?.query);
  const shoppingContext = sanitizeText(args?.shopping_context || args?.context);
  const query = normalizeCatalogSearchQuery(rawQuery) || rawQuery;

  if (!query) {
    return {ok: false, error: 'Missing query.'};
  }

  const intentProfile = getCatalogIntentProfile(`${query} ${shoppingContext}`.trim());
  const searchQueries = buildProductSearchQueries(query, intentProfile).slice(0, 5);
  const deduped = new Map();

  for (const searchQuery of searchQueries) {
    const matches = await searchShopCatalogViaMcp(toolContext.context, {
      query: searchQuery,
      contextHint: buildCatalogContextHint({
        searchSeed: searchQuery,
        rankingSeed: query,
        history: toolContext.history || [],
        intentProfile,
      }),
      limit: SHOPIFY_MCP_MAX_RESULTS,
    });

    matches.forEach((product) => {
      const key = getMcpProductDedupKey(product);
      if (!key || deduped.has(key)) return;
      deduped.set(key, product);
    });

    if (deduped.size >= SHOPIFY_MCP_MAX_RESULTS) {
      break;
    }
  }

  let products = Array.from(deduped.values());
  const requestedFamily = getRequestedCatalogFamily(query);
  if (requestedFamily) {
    products = filterProductsByCatalogFamily(products, requestedFamily);
  }

  products = rankProductsForMessage(products, query).slice(0, SHOPIFY_MCP_MAX_RESULTS);

  return {
    ok: true,
    source: 'pixel_zones_catalog',
    query,
    products,
  };
}

async function searchStorePoliciesTool(args, toolContext) {
  const question = sanitizeText(args?.question);
  const contextHint = sanitizeText(args?.context);
  if (!question) {
    return {ok: false, error: 'Missing question.'};
  }

  const result = await callStorefrontMcpTool(toolContext.context, {
    toolName: SHOPIFY_MCP_TOOL_POLICIES_AND_FAQS,
    argumentsPayload: {
      query: question,
      ...(contextHint ? {context: contextHint} : {}),
    },
  });

  if (!result || result.isError) {
    return {ok: false, error: 'Policy lookup unavailable right now.'};
  }

  const answer = extractMcpResultText(result);
  return {
    ok: true,
    source: 'pixel_zones_policy',
    answer: answer || null,
  };
}

async function getProductDetailsTool(args, toolContext) {
  const handle =
    sanitizeText(args?.handle) ||
    extractHandleFromProductUrl(sanitizeText(args?.product_url)) ||
    sanitizeText(toolContext?.currentProductHandle);

  if (!handle) {
    return {ok: false, error: 'Provide product handle or product URL.'};
  }

  try {
    const response = await toolContext.context.storefront.query(
      CHATBOT_PRODUCT_DETAILS_QUERY,
      {
        variables: {handle},
        cache: toolContext.context.storefront.CacheShort(),
      },
    );

    const product = normalizeMcpProductCandidate(response?.product);
    if (!product) {
      return {ok: false, error: `Product "${handle}" not found.`};
    }

    return {
      ok: true,
      product,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Product details are unavailable right now.',
    };
  }
}

async function getCartSummaryTool(toolContext) {
  const cart = await toolContext.context.cart.get().catch(() => null);
  const lines = Array.isArray(cart?.lines?.nodes) ? cart.lines.nodes : [];

  return {
    ok: true,
    cart: {
      total_quantity: Number(cart?.totalQuantity || 0),
      checkout_url: sanitizeText(cart?.checkoutUrl),
      items: lines.map((line) => ({
        line_id: sanitizeText(line?.id),
        merchandise_id: sanitizeText(line?.merchandise?.id),
        product_title: sanitizeText(line?.merchandise?.product?.title),
        variant_title: sanitizeText(line?.merchandise?.title),
        handle: sanitizeText(line?.merchandise?.product?.handle),
        quantity: Number(line?.quantity || 0),
      })),
    },
  };
}

function shouldRejectClearlyOffTopicRequest(message, context = {}) {
  const normalized = sanitizeText(message).toLowerCase();
  if (!normalized || looksStoreRelatedMessage(normalized, context)) {
    return false;
  }

  const offTopicPatterns = [
    /\b(write|generate|create|build|debug|fix|review|explain|optimize)\b.{0,50}\b(code|javascript|js|typescript|ts|python|react|css|html|sql|api|function|component|script)\b/,
    /\btranslate\b|\btranslation\b|\bproofread\b|\bparaphrase\b|\bsummarize\b|\bsummary\b|\brewrite\b/,
    /\bweather\b|\bforecast\b|\bnews\b|\bheadline\b|\bcapital of\b|\bpopulation of\b/,
    /\bpoem\b|\bstory\b|\bessay\b|\bjoke\b|\briddle\b/,
  ];

  return offTopicPatterns.some((pattern) => pattern.test(normalized));
}

function looksStoreRelatedMessage(message, context = {}) {
  const normalized = sanitizeText(message).toLowerCase();
  if (!normalized) return false;

  if (
    context?.currentProductHandle &&
    /\b(this|it|that|this product|that product|this one|that one)\b/.test(
      normalized,
    )
  ) {
    return true;
  }

  if (hasProductIntent(normalized)) return true;
  if (isAddToCartIntent(normalized)) return true;
  if (isCheckoutIntent(normalized)) return true;
  if (isClearCartIntent(normalized)) return true;
  if (isCatalogListRequest(normalized)) return true;
  if (isStoreServiceIntent(normalized)) return true;
  if (isProductPageNavigationIntent(normalized)) return true;
  if (extractSearchPageNavigationTerm(normalized)) return true;
  return false;
}

function normalizeCatalogSearchQuery(query) {
  const raw = sanitizeText(query).toLowerCase();
  if (!raw) return '';

  const normalized = raw
    .replace(/[^\p{L}\p{N}\s/+.-]/gu, ' ')
    .replace(
      /\b(i need|i want|i would like|i'm looking for|i am looking for|looking for|show me|find me|help me find|can you find|can you show me|could you show me|recommend|suggest|give me|a good|some|please)\b/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();

  return normalized || raw;
}

function getRequestedCatalogFamily(query) {
  const normalized = sanitizeText(query).toLowerCase();
  if (!normalized) return null;

  if (/\b(laptop|notebook|macbook)\b/.test(normalized)) return 'laptop';
  if (/\b(computer|desktop|gaming pc|pc build|tower|pc)\b/.test(normalized))
    return 'computer';
  if (/\b(monitor|display)\b/.test(normalized)) return 'monitor';
  if (/\b(ip phone|voip|sip|dect|grandstream|desk phone|office phone|conference phone)\b/.test(normalized))
    return 'ipPhone';
  if (/\b(phone|smartphone|iphone|mobile|galaxy)\b/.test(normalized))
    return 'smartphone';
  if (/\b(tablet|ipad|tab)\b/.test(normalized)) return 'tablet';
  return null;
}

function matchesRequestedCatalogFamily(product, family) {
  const haystack = [
    sanitizeText(product?.title),
    sanitizeText(product?.handle),
    sanitizeText(product?.onlineStoreUrl),
    sanitizeText(product?.productType),
    Array.isArray(product?.tags) ? product.tags.join(' ') : '',
  ]
    .join(' ')
    .toLowerCase();

  if (!haystack) return false;

  switch (family) {
    case 'laptop':
      return isComputerLikeText(haystack);
    case 'computer':
      return (
        isComputerLikeText(haystack) && !isAccessoryLikeText(haystack)
      );
    case 'monitor':
      return /\b(monitor|display)\b/.test(haystack);
    case 'ipPhone':
      return (
        isIpPhoneLikeText(haystack) &&
        !isAccessoryLikeText(haystack)
      );
    case 'smartphone':
      return isSmartphoneLikeText(haystack) && !isAccessoryLikeText(haystack);
    case 'tablet':
      return /\b(tablet|ipad|tab)\b/.test(haystack) && !isAccessoryLikeText(haystack);
    default:
      return true;
  }
}

function filterProductsByCatalogFamily(products, family) {
  if (!family) return products;
  return (products || []).filter((product) =>
    matchesRequestedCatalogFamily(product, family),
  );
}

function isAccessoryLikeText(text) {
  return /\b(backpack|bag|briefcase|tote|pouch|sleeve|cooling|cooler|fan|pad|stand|holder|dock|docking|adapter|charger|cable|hub|case|cover|skin|sticker|mouse|keyboard|headset|speaker|controller|printer|router|wifi router|mobile wifi|flash drive|hard drive|card reader|splitter|switch|accessor(?:y|ies))\b/.test(
    String(text || '').toLowerCase(),
  );
}

function isSmartphoneLikeText(text) {
  const normalized = String(text || '').toLowerCase();
  if (isIpPhoneLikeText(normalized)) return false;
  if (/\b(smartphone printer|mobile wifi|wifi router|router|printer)\b/.test(normalized))
    return false;

  return /\b(iphone|smartphone|mobile phone|cell phone|samsung galaxy|galaxy s\d*|galaxy a\d*|galaxy z|xiaomi|redmi|poco|huawei|oppo|oneplus|google pixel)\b/.test(
    normalized,
  );
}

function isIpPhoneLikeText(text) {
  return /\b(ip phone|sip account|sip accounts|voip|dect|grandstream|desk phone|office phone|conference phone|wifi ip phone|wi-fi ip phone)\b/.test(
    String(text || '').toLowerCase(),
  );
}

function isComputerLikeText(text) {
  const normalized = String(text || '').toLowerCase();
  if (isAccessoryLikeText(normalized)) return false;

  return (
    /\b(laptop|notebook|macbook|desktop|computer|tower|all in one|aio|alienware|omen|nitro|legion|zenbook|vivobook|thinkpad|rog|predator)\b/.test(
      normalized,
    ) ||
    /\b(i[3579]-\d{4,5}|ryzen\s+[3579]|intel core|windows\s+11|ssd|ram|ddr[45]?|fhd)\b/.test(
      normalized,
    )
  );
}

function safeParseJson(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeAgentActionRequest(rawValue) {
  if (!rawValue || typeof rawValue !== 'object') return null;

  const type = sanitizeText(rawValue.type).toLowerCase();
  if (type === 'add_to_cart') {
    const variantId = sanitizeText(rawValue.variantId);
    if (!variantId) return null;
    const quantity = normalizeAgentQuantity(rawValue.quantity);
    return {type, variantId, quantity};
  }

  if (type === 'get_checkout_url') {
    return {type};
  }

  if (type === 'clear_cart') {
    return {type};
  }

  return null;
}

function normalizeAgentQuantity(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  const integer = Math.trunc(numeric);
  if (integer < 1) return 1;
  return Math.min(integer, MAX_AGENT_QUANTITY);
}

async function handleAgentActionRequest({context, agentActionRequest}) {
  const {cart} = context;

  try {
    if (agentActionRequest.type === 'add_to_cart') {
      const result = await cart.addLines([
        {
          merchandiseId: agentActionRequest.variantId,
          quantity: agentActionRequest.quantity,
        },
      ]);

      const responseHeaders = result?.cart?.id
        ? cart.setCartId(result.cart.id)
        : new Headers();

      if (result?.errors?.length) {
        const firstError = result.errors[0];
        return data(
          {
            ok: false,
            error:
              sanitizeText(firstError?.message) ||
              'Could not add this product to cart right now.',
          },
          {status: 400, headers: responseHeaders},
        );
      }

      return data(
        {
          ok: true,
          cartQuantity: Number(result?.cart?.totalQuantity || 0),
          checkoutUrl: sanitizeText(result?.cart?.checkoutUrl),
        },
        {headers: responseHeaders},
      );
    }

    if (agentActionRequest.type === 'get_checkout_url') {
      const existingCart = await cart.get();
      return data({
        ok: true,
        checkoutUrl: sanitizeText(existingCart?.checkoutUrl),
        cartQuantity: Number(existingCart?.totalQuantity || 0),
      });
    }

    if (agentActionRequest.type === 'clear_cart') {
      const existingCart = await cart.get();
      const existingLines = existingCart?.lines?.nodes || [];
      const lineIds = existingLines
        .map((line) => sanitizeText(line?.id))
        .filter(Boolean);

      if (!lineIds.length) {
        return data({
          ok: true,
          cartQuantity: Number(existingCart?.totalQuantity || 0),
          clearedCount: 0,
        });
      }

      const result = await cart.removeLines(lineIds);
      const responseHeaders = result?.cart?.id
        ? cart.setCartId(result.cart.id)
        : new Headers();

      if (result?.errors?.length) {
        const firstError = result.errors[0];
        return data(
          {
            ok: false,
            error:
              sanitizeText(firstError?.message) ||
              'Could not clear cart right now.',
          },
          {status: 400, headers: responseHeaders},
        );
      }

      return data(
        {
          ok: true,
          cartQuantity: Number(result?.cart?.totalQuantity || 0),
          clearedCount: lineIds.length,
          checkoutUrl: sanitizeText(result?.cart?.checkoutUrl),
        },
        {headers: responseHeaders},
      );
    }
  } catch (error) {
    console.error('Chatbot agent action failed:', error);
  }

  return data(
    {
      ok: false,
      error: 'Agent action failed. Please try again.',
    },
    {status: 500},
  );
}

function buildAgentPlan({message, products, referencedOptionIndex = null}) {
  if (isClearCartIntent(message)) {
    return {
      reply: 'Clearing your cart now.',
      actions: [{type: 'clear_cart'}],
    };
  }

  const searchTerm = extractSearchPageNavigationTerm(message);
  if (searchTerm) {
    const encoded = encodeURIComponent(searchTerm);
    const target = `/search?q=${encoded}`;
    return {
      reply: `Opening search results for "${searchTerm}".`,
      actions: [{type: 'navigate', target}],
    };
  }

  const wantsAdd = isAddToCartIntent(message);
  const wantsCheckout = isCheckoutIntent(message);
  const wantsProductPage = isProductPageNavigationIntent(message);

  if (!wantsAdd && !wantsCheckout && !wantsProductPage) {
    return {reply: '', actions: []};
  }

  const bestProduct =
    referencedOptionIndex !== null
      ? products[referencedOptionIndex] || null
      : pickBestAgentProduct(products, message);

  if (wantsAdd) {
    if (!bestProduct) {
      return {reply: PRODUCT_NOT_FOUND_REPLY, actions: []};
    }

    const variantId = getAgentProductVariantId(bestProduct);
    if (!variantId) {
      return {
        reply:
          'I found a matching product, but I could not determine a purchasable variant yet.',
        actions: [],
      };
    }

    const isAvailable = getAgentProductAvailability(bestProduct);
    if (!isAvailable) {
      return {
        reply: `${getAgentProductTitle(bestProduct)} is currently out of stock, so I can’t add it to cart right now.`,
        actions: [],
      };
    }

    const quantity = extractRequestedQuantity(message);
    const actions = [
      {
        type: 'add_to_cart',
        variantId,
        quantity,
        productTitle: getAgentProductTitle(bestProduct),
      },
    ];

    if (wantsCheckout) {
      actions.push({type: 'go_to_checkout'});
      return {
        reply: `Adding ${quantity} × ${getAgentProductTitle(bestProduct)} and taking you to checkout.`,
        actions,
      };
    }

    return {
      reply: `Adding ${quantity} × ${getAgentProductTitle(bestProduct)} to your cart now.`,
      actions,
    };
  }

  if (wantsCheckout) {
    return {
      reply: 'Taking you to checkout.',
      actions: [{type: 'go_to_checkout'}],
    };
  }

  if (wantsProductPage) {
    if (!bestProduct) {
      return {reply: PRODUCT_NOT_FOUND_REPLY, actions: []};
    }
    const target = buildProductUrl(bestProduct);
    return {
      reply: `Opening the product page for ${getAgentProductTitle(bestProduct)}.`,
      actions: [{type: 'navigate', target}],
    };
  }

  return {reply: '', actions: []};
}

function extractSearchPageNavigationTerm(message) {
  const normalized = sanitizeText(message);
  if (!normalized) return '';

  const patterns = [
    /(?:go to|open|take me to|navigate to|bring me to)\s+(?:the\s+)?search(?:\s+page)?(?:\s+for|\s+with|\s+term\s+)?(.+)/i,
    /(?:search(?:\s+page)?\s+for)\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    const extracted = sanitizeText(match?.[1] || '').replace(/[?!.]+$/g, '');
    if (extracted) return extracted.slice(0, 120);
  }

  return '';
}

function isAddToCartIntent(message) {
  const normalized = sanitizeText(message).toLowerCase();
  if (!normalized) return false;

  return (
    /\badd to cart\b/i.test(normalized) ||
    /\b(add|put)\b.{0,40}\b(?:to|in)\s+(?:my\s+)?cart\b/i.test(normalized)
  );
}

function isCheckoutIntent(message) {
  const normalized = sanitizeText(message).toLowerCase();
  if (!normalized) return false;

  return (
    /\b(go to|take me to|proceed to|continue to|open)\s+checkout\b/i.test(
      normalized,
    ) ||
    /\bcheckout now\b/i.test(normalized) ||
    /^checkout$/i.test(normalized)
  );
}

function isClearCartIntent(message) {
  const normalized = sanitizeText(message).toLowerCase();
  if (!normalized) return false;

  const clearWords = /\b(empty|clear|remove|delete)\b/i.test(normalized);
  const cartWords = /\b(cart|basket|bag)\b/i.test(normalized);
  if (clearWords && cartWords) return true;

  return /\bremove all(?: items)?(?: from)? (?:my )?(?:cart|basket|bag)\b/i.test(
    normalized,
  );
}

function isProductPageNavigationIntent(message) {
  const normalized = sanitizeText(message).toLowerCase();
  if (!normalized) return false;
  if (isCheckoutIntent(normalized) || isAddToCartIntent(normalized)) return false;
  if (extractSearchPageNavigationTerm(normalized)) return false;
  if (/\bcart\b/i.test(normalized)) return false;

  return (
    /\b(open|go to|take me to|navigate to|bring me to)\b/i.test(normalized) &&
    (/\b(page|product|details?)\b/i.test(normalized) || hasProductIntent(normalized))
  );
}

function extractRequestedQuantity(message) {
  const normalized = sanitizeText(message).toLowerCase();
  if (!normalized) return 1;

  const patterns = [
    /\badd\s+(\d{1,2})\s*(?:x\b|of\b)?/i,
    /\b(\d{1,2})\s*x\b/i,
    /\bquantity\s*(\d{1,2})\b/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      return normalizeAgentQuantity(match[1]);
    }
  }

  return 1;
}

function extractReferencedOptionIndex(message) {
  const normalized = sanitizeText(message).toLowerCase();
  if (!normalized) return null;

  if (/\bfirst\b/i.test(normalized)) return 0;
  if (/\bsecond\b/i.test(normalized)) return 1;
  if (/\bthird\b/i.test(normalized)) return 2;
  if (/\bfourth\b/i.test(normalized)) return 3;
  if (/\bfifth\b/i.test(normalized)) return 4;
  if (/\bsixth\b/i.test(normalized)) return 5;
  if (/\bseventh\b/i.test(normalized)) return 6;
  if (/\beighth\b/i.test(normalized)) return 7;
  if (/\bninth\b/i.test(normalized)) return 8;
  if (/\btenth\b/i.test(normalized)) return 9;

  const numericPatterns = [
    /\b(?:option|item|product|result)\s*#?\s*(\d{1,2})\b/i,
    /\b(\d{1,2})(?:st|nd|rd|th)\b/i,
    /\bnumber\s*(\d{1,2})\b/i,
  ];

  for (const pattern of numericPatterns) {
    const match = normalized.match(pattern);
    const rawIndex = Number(match?.[1]);
    if (Number.isFinite(rawIndex) && rawIndex > 0) {
      return Math.min(rawIndex - 1, 29);
    }
  }

  return null;
}

function pickBestAgentProduct(products, message) {
  if (!Array.isArray(products) || !products.length) return null;

  const preference = getAgentSelectionPreference(message);
  const ranked = rankProductsForMessage(products, message);
  const availableRanked = ranked.filter(
    (product) => getAgentProductAvailability(product),
  );
  const rankedWithVariants = ranked.filter((product) =>
    getAgentProductVariantId(product),
  );
  const availableWithVariants = availableRanked.filter((product) =>
    getAgentProductVariantId(product),
  );

  const primaryCandidates =
    availableWithVariants.length || preference !== 'best_match'
      ? availableWithVariants
      : rankedWithVariants;
  const fallbackCandidates = rankedWithVariants.length
    ? rankedWithVariants
    : ranked;

  if (preference === 'cheapest') {
    return (
      pickProductByPrice(primaryCandidates, 'asc') ||
      pickProductByPrice(fallbackCandidates, 'asc') ||
      fallbackCandidates[0] ||
      null
    );
  }

  if (preference === 'most_expensive') {
    return (
      pickProductByPrice(primaryCandidates, 'desc') ||
      pickProductByPrice(fallbackCandidates, 'desc') ||
      fallbackCandidates[0] ||
      null
    );
  }

  return primaryCandidates[0] || fallbackCandidates[0] || null;
}

function getAgentSelectionPreference(message) {
  const normalized = sanitizeText(message).toLowerCase();
  if (!normalized) return 'best_match';

  if (
    /\b(cheapest|lowest\s+price|least\s+expensive|budget|most\s+affordable)\b/i.test(
      normalized,
    )
  ) {
    return 'cheapest';
  }

  if (
    /\b(most\s+expensive|highest\s+price|premium|top\s+price)\b/i.test(
      normalized,
    )
  ) {
    return 'most_expensive';
  }

  return 'best_match';
}

function pickProductByPrice(products, direction) {
  if (!Array.isArray(products) || !products.length) return null;

  const priced = products
    .map((product) => ({
      product,
      amount: getProductMinAmount(product),
    }))
    .filter((entry) => Number.isFinite(entry.amount));

  if (!priced.length) return null;

  priced.sort((a, b) =>
    direction === 'desc' ? b.amount - a.amount : a.amount - b.amount,
  );

  return priced[0]?.product || null;
}

function getProductMinAmount(product) {
  const directAmount = Number(product?.priceAmount);
  if (Number.isFinite(directAmount)) return directAmount;

  const rawAmount = product?.priceRange?.minVariantPrice?.amount;
  const numeric = Number(rawAmount);
  if (!Number.isFinite(numeric)) return NaN;
  return numeric;
}

function getAgentProductVariantId(product) {
  return sanitizeText(
    product?.selectedOrFirstAvailableVariant?.id || product?.variantId,
  );
}

function getAgentProductAvailability(product) {
  if (typeof product?.availableForSale === 'boolean') {
    return product.availableForSale;
  }
  return Boolean(product?.selectedOrFirstAvailableVariant?.availableForSale);
}

function getAgentProductTitle(product) {
  return sanitizeText(product?.title) || 'This product';
}

function buildProductUrl(product) {
  const onlineStoreUrl = sanitizeText(product?.onlineStoreUrl || product?.url);
  if (onlineStoreUrl) {
    try {
      const parsed = new URL(onlineStoreUrl);
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return onlineStoreUrl;
    }
  }

  const handle = sanitizeText(product?.handle);
  if (handle) return `/products/${handle}`;
  return '/search';
}

function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, 500);
}

function normalizePageContext(rawPageContext) {
  if (!rawPageContext || typeof rawPageContext !== 'object') return null;

  const pathname = sanitizeText(rawPageContext.pathname);
  const url = sanitizeText(rawPageContext.url);
  const title = sanitizeText(rawPageContext.title);

  if (!pathname && !url && !title) return null;
  return {pathname, url, title};
}

function detectCurrentProductHandle(pageContext) {
  const pathname = sanitizeText(pageContext?.pathname || '');
  const url = sanitizeText(pageContext?.url || '');

  const fromPath = pathname.match(/^\/products\/([^/?#]+)/i);
  if (fromPath?.[1]) {
    return decodeURIComponent(fromPath[1]);
  }

  if (!url) return '';
  return extractHandleFromProductUrl(url);
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

function normalizeRecentProducts(products) {
  if (!Array.isArray(products)) return [];

  return products
    .map((product) => {
      if (!product || typeof product !== 'object') return null;
      const title = sanitizeText(product?.title);
      const variantId = sanitizeText(product?.variantId);
      if (!title || !variantId) return null;

      const parsedPriceAmount = parsePriceAmount(product?.price);

      return {
        id: sanitizeText(product?.id),
        handle: sanitizeText(product?.handle),
        title,
        url: sanitizeText(product?.url),
        variantId,
        availableForSale:
          typeof product?.availableForSale === 'boolean'
            ? product.availableForSale
            : true,
        price: sanitizeText(product?.price),
        ...(Number.isFinite(parsedPriceAmount)
          ? {priceAmount: parsedPriceAmount}
          : {}),
      };
    })
    .filter(Boolean)
    .slice(0, 30);
}

function parsePriceAmount(value) {
  if (typeof value !== 'string') return NaN;

  const cleaned = value.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  const numeric = Number(cleaned?.[0]);
  return Number.isFinite(numeric) ? numeric : NaN;
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
    hasCatalogKeyword(lower, word),
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
  if (isAddToCartIntent(message)) return true;
  if (isProductPageNavigationIntent(message)) return true;
  if (hasProductIntent(message)) return true;

  return isFollowUpMessage(message) && hasRecentProductIntent(history);
}

function shouldIncludeProductsInResponse({
  message,
  shouldLookupProducts,
  isListRequest,
  isExplicitOptionAddIntent = false,
}) {
  if (!shouldLookupProducts) return false;
  if (isExplicitOptionAddIntent) return false;
  if (isListRequest) return true;
  if (extractSearchPageNavigationTerm(message)) return false;
  if (isAddToCartIntent(message)) return false;
  if (isCheckoutIntent(message)) return false;
  if (isProductPageNavigationIntent(message)) return false;
  if (hasProductIntent(message)) return true;

  return /\b(show|list|display|options|models|in stock|available|price)\b/i.test(
    message,
  );
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

  // Hard guard: product/cart/navigation intents are always in scope,
  // even if a previous classifier branch failed.
  if (
    hasProductIntent(message) ||
    looksLikeModelPhrase(message) ||
    isCatalogListRequest(message) ||
    isAddToCartIntent(message) ||
    isCheckoutIntent(message) ||
    isClearCartIntent(message) ||
    isProductPageNavigationIntent(message) ||
    extractSearchPageNavigationTerm(message)
  ) {
    return true;
  }

  const lower = message.toLowerCase();
  return STORE_SCOPE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

async function fetchProductMatches(context, message, history = [], options = {}) {
  const maxResults = Math.min(
    Math.max(options.requestedCount || 10, 1),
    SHOPIFY_MCP_MAX_RESULTS,
  );
  const shouldListCatalog = Boolean(options.listCatalog);
  const allowCatalogFallback = Boolean(options.allowCatalogFallback);
  const intentProfile = getCatalogIntentProfile(message);
  const searchSeedMessages = buildSearchSeedMessages(message, history);
  const rankingSeed =
    searchSeedMessages.find((seed) => !isFollowUpMessage(seed)) ||
    searchSeedMessages[0] ||
    message;
  const dedupedProducts = new Map();

  if (shouldListCatalog) {
    const catalogProducts = await searchShopCatalogViaMcp(context, {
      query: buildCatalogFallbackQuery(message),
      contextHint: 'Catalog listing request',
      limit: maxResults,
    });
    catalogProducts.forEach((product) => {
      const key = getMcpProductDedupKey(product);
      if (!dedupedProducts.has(key)) {
        dedupedProducts.set(key, product);
      }
    });
    if (dedupedProducts.size >= maxResults) {
      return rankProductsForMessage(
        Array.from(dedupedProducts.values()),
        rankingSeed,
      ).slice(0, maxResults);
    }
  }

  for (const searchSeed of searchSeedMessages) {
    const queries = buildProductSearchQueries(searchSeed, intentProfile);
    if (!queries.length) continue;

    const searchQueries = queries.slice(0, 4);

    const queryResults = await Promise.all(
      searchQueries.map((query) =>
        searchShopCatalogViaMcp(context, {
          query,
          contextHint: buildCatalogContextHint({
            searchSeed,
            rankingSeed,
            history,
            intentProfile,
          }),
          limit: maxResults,
        }),
      ),
    );

    queryResults.flat().forEach((product) => {
      const key = getMcpProductDedupKey(product);
      if (!dedupedProducts.has(key)) {
        dedupedProducts.set(key, product);
      }
    });

    if (dedupedProducts.size >= maxResults) break;
  }

  let products = Array.from(dedupedProducts.values());
  const requestedFamily = getRequestedCatalogFamily(rankingSeed);
  if (requestedFamily) {
    products = filterProductsByCatalogFamily(products, requestedFamily);
  }

  if (intentProfile.prefersPrimaryDevice && !requestedFamily) {
    const primaryDeviceMatches = products.filter(
      (product) => !isAccessoryProduct(product),
    );

    if (primaryDeviceMatches.length) {
      products = primaryDeviceMatches;
    } else {
      const focusedDeviceMatches = await searchShopCatalogViaMcp(context, {
        query: buildPrimaryDeviceFallbackQuery(rankingSeed, intentProfile),
        contextHint: buildPrimaryDeviceContextHint({
          rankingSeed,
          intentProfile,
        }),
        limit: maxResults,
      });

      const focusedPrimary = focusedDeviceMatches.filter(
        (product) => !isAccessoryProduct(product),
      );
      if (focusedPrimary.length) {
        products = focusedPrimary;
      } else if (focusedDeviceMatches.length) {
        products = focusedDeviceMatches;
      }
    }
  }

  if (!products.length && (allowCatalogFallback || shouldListCatalog)) {
    products = await searchShopCatalogViaMcp(context, {
      query: buildCatalogFallbackQuery(rankingSeed),
      contextHint: 'Fallback to broad catalog search',
      limit: maxResults,
    });
    if (requestedFamily) {
      products = filterProductsByCatalogFamily(products, requestedFamily);
    }
  }

  return rankProductsForMessage(products, rankingSeed).slice(0, maxResults);
}

async function fetchStorePoliciesContext(
  context,
  message,
  history = [],
  products = [],
) {
  const hasStoreServiceIntent = isStoreServiceIntent(message);
  if (!hasStoreServiceIntent) return '';

  const lastNonFollowUp =
    history
      .slice()
      .reverse()
      .find(
        (item) =>
          item?.role === 'user' &&
          item?.content &&
          !isFollowUpMessage(item.content),
      )?.content || '';

  const policyQuery = sanitizeText(
    `${lastNonFollowUp ? `${lastNonFollowUp} ` : ''}${message}`,
  );
  if (!policyQuery) return '';

  const result = await callStorefrontMcpTool(context, {
    toolName: SHOPIFY_MCP_TOOL_POLICIES_AND_FAQS,
    argumentsPayload: {
      query: policyQuery,
      context: buildPolicyContextHint({message, products}),
    },
  });

  if (!result || result.isError) {
    return '';
  }

  const policyText = extractMcpResultText(result);
  return sanitizeText(policyText).slice(0, 2000);
}

async function searchShopCatalogViaMcp(
  context,
  {query, contextHint = '', limit = 10},
) {
  const normalizedQuery = sanitizeText(query);
  if (!normalizedQuery) return [];

  const result = await callStorefrontMcpTool(context, {
    toolName: SHOPIFY_MCP_TOOL_SEARCH_CATALOG,
    argumentsPayload: {
      query: normalizedQuery,
      context:
        sanitizeText(contextHint) || 'Product search for Pixel Zones customer',
    },
  });

  if (!result || result.isError) {
    return searchShopCatalogViaStorefrontApi(context, {
      query: normalizedQuery,
      limit,
    });
  }

  const mcpProducts = normalizeMcpCatalogProducts(result).slice(
    0,
    Math.max(1, limit),
  );
  if (mcpProducts.length) return mcpProducts;

  return searchShopCatalogViaStorefrontApi(context, {
    query: normalizedQuery,
    limit,
  });
}

async function searchShopCatalogViaStorefrontApi(context, {query, limit = 10}) {
  const normalizedQuery = sanitizeText(query);
  if (!normalizedQuery || !context?.storefront?.query) return [];

  try {
    const result = await context.storefront.query(CHATBOT_PRODUCT_SEARCH_QUERY, {
      variables: {
        term: normalizedQuery,
        first: Math.max(1, Math.min(Number(limit) || 10, SHOPIFY_MCP_MAX_RESULTS)),
      },
    });

    const nodes = Array.isArray(result?.products?.nodes)
      ? result.products.nodes
      : [];

    return nodes
      .filter((node) => node?.__typename === 'Product')
      .map(normalizeStorefrontProductForChatbot)
      .filter(Boolean)
      .slice(0, Math.max(1, limit));
  } catch (error) {
    console.error('[chatbot] Storefront product search failed:', error);
    return [];
  }
}

function normalizeStorefrontProductForChatbot(product) {
  if (!product?.title) return null;

  const selectedVariant =
    product.selectedOrFirstAvailableVariant ||
    product.variants?.nodes?.find((variant) => variant?.availableForSale) ||
    product.variants?.nodes?.[0] ||
    null;
  const selectedPrice =
    selectedVariant?.price || product.priceRange?.minVariantPrice || null;

  return {
    id: product.id || '',
    handle: product.handle || '',
    title: product.title || '',
    vendor: product.vendor || '',
    productType: product.productType || '',
    tags: Array.isArray(product.tags) ? product.tags : [],
    onlineStoreUrl: product.onlineStoreUrl || '',
    featuredImage:
      product.featuredImage || selectedVariant?.image || product.images?.nodes?.[0] || null,
    priceRange: selectedPrice
      ? {
          minVariantPrice: selectedPrice,
        }
      : null,
    selectedOrFirstAvailableVariant: selectedVariant
      ? {
          id: selectedVariant.id || '',
          availableForSale: Boolean(selectedVariant.availableForSale),
          title: selectedVariant.title || '',
          price: selectedPrice,
          compareAtPrice: selectedVariant.compareAtPrice || null,
        }
      : null,
    availableForSale: Boolean(selectedVariant?.availableForSale),
    variantId: selectedVariant?.id || '',
  };
}

async function callStorefrontMcpTool(context, {toolName, argumentsPayload}) {
  const response = await callStorefrontMcp(context, {
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: argumentsPayload,
    },
  });

  if (!response) return null;
  return response.result || null;
}

async function callStorefrontMcp(context, {method, params}) {
  const domain = resolveStorefrontMcpDomain(context);
  if (!domain) {
    console.error('[chatbot] Missing store domain for Storefront MCP.');
    return null;
  }

  const endpoint = `https://${domain}/api/mcp`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SHOPIFY_MCP_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `pz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        method,
        params,
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      console.error('[chatbot] Storefront MCP request failed:', {
        status: response.status,
        body: payload,
      });
      return null;
    }

    if (payload?.error) {
      console.error('[chatbot] Storefront MCP JSON-RPC error:', payload.error);
      return null;
    }

    return payload;
  } catch (error) {
    const reason = error?.name === 'AbortError' ? 'timeout' : error;
    console.error('[chatbot] Storefront MCP request crashed:', reason);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function resolveStorefrontMcpDomain(context) {
  const env = context?.env || {};
  const candidates = [
    env.PUBLIC_STORE_DOMAIN,
    env.PUBLIC_STOREFRONT_DOMAIN,
    env.SHOPIFY_STORE_DOMAIN,
    env.PRIVATE_STORE_DOMAIN,
    env.PUBLIC_STOREFRONT_ID,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeStoreDomain(candidate);
    if (normalized) return normalized;
  }

  return '';
}

function normalizeStoreDomain(value) {
  const raw = sanitizeText(String(value || ''));
  if (!raw) return '';

  const withoutProtocol = raw.replace(/^https?:\/\//i, '');
  const withoutPath = withoutProtocol.split('/')[0]?.trim() || '';
  if (!withoutPath) return '';

  if (withoutPath.endsWith('.myshopify.com')) return withoutPath;
  if (withoutPath.includes('.')) return withoutPath;
  return `${withoutPath}.myshopify.com`;
}

function buildCatalogFallbackQuery(message) {
  const terms = extractSearchTerms(message).slice(0, 6);
  if (terms.length) return terms.join(' ');
  return 'all products';
}

function buildCatalogContextHint({
  searchSeed,
  rankingSeed,
  history,
  intentProfile,
}) {
  const historyHints = history
    .slice(-3)
    .filter((entry) => entry?.role === 'user')
    .map((entry) => sanitizeText(entry.content))
    .filter(Boolean)
    .join(' | ');

  const intentHint = buildIntentProfileHint(intentProfile);

  return sanitizeText(
    `Current request: ${searchSeed}. Primary intent: ${rankingSeed}. Recent user intent: ${historyHints}. ${intentHint}`,
  );
}

function buildPolicyContextHint({message, products = []}) {
  const productHint = products.length
    ? `Matched products in this turn: ${products
        .slice(0, 3)
        .map((product) => sanitizeText(product?.title))
        .filter(Boolean)
        .join(', ')}`
    : 'No product matches in this turn.';
  return sanitizeText(`User asks: ${message}. ${productHint}`);
}

function buildIntentProfileHint(intentProfile = {}) {
  const details = [];

  if (intentProfile.prefersPrimaryDevice) {
    details.push(
      'User wants a primary device. Prioritize phones/laptops/tablets/watches and avoid accessories unless explicitly requested.',
    );
  }

  if (intentProfile.wantsAccessory) {
    details.push('User is asking for accessories.');
  }

  if (intentProfile.brandHints?.length) {
    details.push(`Brand hints: ${intentProfile.brandHints.join(', ')}`);
  }

  if (!details.length) {
    return 'User intent is general product lookup.';
  }

  return details.join(' ');
}

function buildPrimaryDeviceFallbackQuery(message, intentProfile = {}) {
  const parts = [];
  if (intentProfile.brandHints?.length) {
    parts.push(intentProfile.brandHints.join(' '));
  }

  const cleanMessage = sanitizeText(message)
    .replace(/\b(case|cover|charger|cable|accessories?|screen protector|protector)\b/gi, '')
    .trim();
  if (cleanMessage) {
    parts.push(cleanMessage);
  }

  const requestedFamily = getRequestedCatalogFamily(message);
  if (requestedFamily === 'smartphone') {
    parts.push('iphone samsung galaxy smartphone mobile phone');
  } else if (requestedFamily === 'laptop' || requestedFamily === 'computer') {
    parts.push('laptop notebook macbook desktop computer');
  } else {
    parts.push('device phone smartphone laptop tablet');
  }
  return sanitizeText(parts.join(' '));
}

function buildPrimaryDeviceContextHint({rankingSeed, intentProfile = {}}) {
  const brandHint = intentProfile.brandHints?.length
    ? `Brand preference: ${intentProfile.brandHints.join(', ')}.`
    : '';

  return sanitizeText(
    `Find primary device products for: ${rankingSeed}. Return real phones/tablets/laptops/watches first, not cases or chargers. ${brandHint}`,
  );
}

function normalizeMcpCatalogProducts(result) {
  const candidates = collectMcpProductCandidates(result);
  const deduped = new Map();

  candidates.forEach((candidate) => {
    const normalized = normalizeMcpProductCandidate(candidate);
    if (!normalized) return;
    const key = getMcpProductDedupKey(normalized);
    if (!deduped.has(key)) {
      deduped.set(key, normalized);
    }
  });

  return Array.from(deduped.values()).slice(0, SHOPIFY_MCP_MAX_RESULTS);
}

function collectMcpProductCandidates(source) {
  const collected = [];
  const visited = new Set();

  function walk(value, depth = 0) {
    if (depth > 6 || value == null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, depth + 1));
      return;
    }

    if (typeof value !== 'object') {
      if (typeof value === 'string') {
        const parsed = parseJsonLikeValue(value);
        if (parsed) walk(parsed, depth + 1);
      }
      return;
    }

    if (visited.has(value)) return;
    visited.add(value);

    if (looksLikeMcpProductCandidate(value)) {
      collected.push(value);
    }

    for (const nested of Object.values(value)) {
      walk(nested, depth + 1);
    }
  }

  walk(source, 0);
  return collected;
}

function looksLikeMcpProductCandidate(value) {
  if (!value || typeof value !== 'object') return false;

  const title = pickFirstString([
    value.title,
    value.product_title,
    value.productTitle,
    value.name,
    value.product_name,
  ]);
  if (!title) return false;

  const url = pickFirstString([
    value.onlineStoreUrl,
    value.product_url,
    value.productUrl,
    value.url,
    value.link,
    value.href,
  ]);

  const variantId = pickFirstString([
    value.variantId,
    value.variant_id,
    value.merchandiseId,
    value.merchandise_id,
    value?.selectedOrFirstAvailableVariant?.id,
  ]);

  const hasPrice =
    value?.price != null ||
    value?.priceRange != null ||
    value?.min_price != null ||
    value?.amount != null;

  return Boolean(url || variantId || hasPrice);
}

function normalizeMcpProductCandidate(candidate) {
  const title = pickFirstString([
    candidate?.title,
    candidate?.product_title,
    candidate?.productTitle,
    candidate?.name,
    candidate?.product_name,
  ]);
  if (!title) return null;

  const onlineStoreUrl = pickFirstString([
    candidate?.onlineStoreUrl,
    candidate?.product_url,
    candidate?.productUrl,
    candidate?.url,
    candidate?.link,
    candidate?.href,
  ]);
  const handle =
    pickFirstString([candidate?.handle, candidate?.product_handle]) ||
    extractHandleFromProductUrl(onlineStoreUrl);

  const variantInfo = extractMcpVariant(candidate);
  const priceInfo = extractMcpPrice(candidate, variantInfo);
  const availableForSale = extractMcpAvailability(candidate, variantInfo);
  const imageUrl = extractMcpImageUrl(candidate);
  const tags = normalizeMcpTags(candidate?.tags || candidate?.tag_list);

  const normalized = {
    id:
      pickFirstString([
        candidate?.id,
        candidate?.product_id,
        candidate?.productId,
      ]) || `${handle || title.toLowerCase()}-${variantInfo.id || 'default'}`,
    title,
    handle: handle || '',
    vendor: pickFirstString([candidate?.vendor, candidate?.brand, candidate?.manufacturer]),
    productType: pickFirstString([
      candidate?.productType,
      candidate?.product_type,
      candidate?.type,
      candidate?.category,
    ]),
    tags,
    onlineStoreUrl: onlineStoreUrl || (handle ? `/products/${handle}` : ''),
    featuredImage: imageUrl
      ? {
          url: imageUrl,
          altText: pickFirstString([candidate?.imageAlt, candidate?.image_alt]) || title,
        }
      : null,
    priceRange: priceInfo.amount
      ? {
          minVariantPrice: {
            amount: priceInfo.amount,
            currencyCode: priceInfo.currencyCode || 'USD',
          },
        }
      : null,
    selectedOrFirstAvailableVariant: {
      id: variantInfo.id || '',
      availableForSale,
      price: priceInfo.amount
        ? {
            amount: priceInfo.amount,
            currencyCode: priceInfo.currencyCode || 'USD',
          }
        : null,
      compareAtPrice: null,
    },
    availableForSale,
    variantId: variantInfo.id || '',
  };

  return normalized;
}

function extractMcpVariant(candidate) {
  const fallbackVariant = Array.isArray(candidate?.variants)
    ? candidate.variants[0]
    : null;
  const nestedVariant =
    candidate?.selectedOrFirstAvailableVariant ||
    candidate?.selected_variant ||
    candidate?.variant ||
    fallbackVariant ||
    null;

  const id = pickFirstString([
    nestedVariant?.id,
    nestedVariant?.variant_id,
    nestedVariant?.variantId,
    nestedVariant?.merchandise_id,
    nestedVariant?.merchandiseId,
    candidate?.variantId,
    candidate?.variant_id,
    candidate?.merchandiseId,
    candidate?.merchandise_id,
  ]);

  return {id, raw: nestedVariant};
}

function extractMcpAvailability(candidate, variantInfo) {
  const availabilityCandidate = pickFirstDefined([
    candidate?.availableForSale,
    candidate?.available_for_sale,
    candidate?.in_stock,
    candidate?.available,
    variantInfo?.raw?.availableForSale,
    variantInfo?.raw?.available_for_sale,
    variantInfo?.raw?.in_stock,
    variantInfo?.raw?.available,
  ]);

  if (typeof availabilityCandidate === 'boolean') return availabilityCandidate;
  if (typeof availabilityCandidate === 'string') {
    const lower = availabilityCandidate.toLowerCase();
    if (['true', 'yes', 'in stock', 'available'].includes(lower)) return true;
    if (['false', 'no', 'out of stock', 'sold out'].includes(lower)) return false;
  }

  return true;
}

function extractMcpPrice(candidate, variantInfo) {
  const priceCandidate = pickFirstDefined([
    variantInfo?.raw?.price,
    candidate?.price,
    candidate?.priceRange?.minVariantPrice,
    candidate?.min_price,
    candidate?.amount,
  ]);

  if (priceCandidate && typeof priceCandidate === 'object') {
    const amount = normalizeMcpAmount(
      pickFirstDefined([
        priceCandidate?.amount,
        priceCandidate?.value,
        priceCandidate?.price,
      ]),
    );
    const currencyCode = pickFirstString([
      priceCandidate?.currencyCode,
      priceCandidate?.currency_code,
      priceCandidate?.currency,
      candidate?.currencyCode,
      candidate?.currency_code,
      candidate?.currency,
    ]);

    return {amount, currencyCode};
  }

  if (typeof priceCandidate === 'number' || typeof priceCandidate === 'string') {
    const amount = normalizeMcpAmount(priceCandidate);
    const currencyCode = pickFirstString([
      candidate?.currencyCode,
      candidate?.currency_code,
      candidate?.currency,
    ]);
    return {amount, currencyCode};
  }

  return {amount: '', currencyCode: ''};
}

function normalizeMcpAmount(value) {
  if (value == null) return '';
  const numeric =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(numeric)) return '';
  return numeric.toString();
}

function extractMcpImageUrl(candidate) {
  return pickFirstString([
    candidate?.featuredImage?.url,
    candidate?.image?.url,
    candidate?.image_url,
    candidate?.imageUrl,
    candidate?.thumbnail?.url,
    candidate?.thumbnail_url,
  ]);
}

function normalizeMcpTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => sanitizeText(String(tag))).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => sanitizeText(tag))
      .filter(Boolean);
  }
  return [];
}

function extractHandleFromProductUrl(url) {
  const normalized = pickFirstString([url]);
  if (!normalized) return '';

  try {
    const parsed = new URL(normalized, 'https://example.com');
    const match = parsed.pathname.match(/\/products\/([^/?#]+)/i);
    return match?.[1] ? decodeURIComponent(match[1]) : '';
  } catch {
    const match = normalized.match(/\/products\/([^/?#]+)/i);
    return match?.[1] ? decodeURIComponent(match[1]) : '';
  }
}

function getMcpProductDedupKey(product) {
  return sanitizeText(
    product?.id ||
      product?.selectedOrFirstAvailableVariant?.id ||
      product?.handle ||
      `${product?.title || ''}-${product?.onlineStoreUrl || ''}`,
  ).toLowerCase();
}

function extractMcpResultText(result) {
  const parts = [];

  if (Array.isArray(result?.content)) {
    result.content.forEach((item) => {
      if (typeof item?.text === 'string' && item.text.trim()) {
        parts.push(item.text.trim());
      }
    });
  }

  if (result?.structuredContent) {
    const serialized = safeJsonStringify(result.structuredContent);
    if (serialized) {
      parts.push(serialized);
    }
  }

  return parts.join('\n\n').trim();
}

function parseJsonLikeValue(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return null;

  const attempts = [
    normalized,
    normalized.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim(),
    extractFirstJsonBlock(normalized),
  ].filter(Boolean);

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt);
    } catch {
      // Continue trying.
    }
  }

  return null;
}

function extractFirstJsonBlock(value) {
  const arrayMatch = value.match(/\[[\s\S]+\]/);
  if (arrayMatch?.[0]) return arrayMatch[0];
  const objectMatch = value.match(/\{[\s\S]+\}/);
  return objectMatch?.[0] || '';
}

function pickFirstString(values) {
  if (!Array.isArray(values)) return '';

  for (const value of values) {
    if (typeof value !== 'string') continue;
    const normalized = sanitizeText(value);
    if (normalized) return normalized;
  }

  return '';
}

function pickFirstDefined(values) {
  if (!Array.isArray(values)) return undefined;
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

function safeJsonStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function buildProductSearchQueries(message, intentProfile = {}) {
  const variants = [];
  const seen = new Set();

  function push(value) {
    const normalized = sanitizeText(value).toLowerCase().replace(/\s+/g, ' ');
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

    tokens.slice(0, 5).forEach((token) => push(token));
  }

  const requestedFamily = getRequestedCatalogFamily(cleaned);
  if (requestedFamily === 'smartphone') {
    push('iphone');
    push('samsung galaxy');
    push('smartphone');
    push('mobile phone');
  } else if (requestedFamily === 'tablet') {
    push('ipad');
    push('tablet');
    push('samsung tab');
  } else if (requestedFamily === 'laptop') {
    push('macbook');
    push('laptop');
    push('notebook');
  } else if (requestedFamily === 'computer') {
    push('laptop');
    push('desktop computer');
    push('notebook');
    push('macbook');
  }

  if (intentProfile.prefersPrimaryDevice) {
    push(`${cleaned} device`);
    push(`${cleaned} phone`);
    push(`${cleaned} smartphone`);
    push(`${cleaned} mobile phone`);
    if (intentProfile.brandHints?.length) {
      intentProfile.brandHints.forEach((brand) => {
        push(`${brand} ${cleaned} phone`);
      });
    }
  }

  if (intentProfile.wantsAccessory) {
    push(`${cleaned} accessories`);
  }

  if (!variants.length) {
    push(cleaned);
  }

  return variants;
}

function getCatalogIntentProfile(message) {
  const normalized = sanitizeText(message).toLowerCase();
  const tokenized = normalized.replace(/[^\p{L}\p{N}\s-]/gu, ' ');

  const wantsDevice = DEVICE_INTENT_KEYWORDS.some((keyword) =>
    hasCatalogKeyword(tokenized, keyword),
  );
  const wantsAccessory = ACCESSORY_KEYWORDS.some((keyword) =>
    hasCatalogKeyword(tokenized, keyword),
  );

  const brandHints = extractBrandHints(tokenized);

  return {
    wantsDevice,
    wantsAccessory,
    prefersPrimaryDevice: wantsDevice && !wantsAccessory,
    brandHints,
  };
}

function extractBrandHints(input) {
  const knownBrands = [
    'apple',
    'iphone',
    'samsung',
    'galaxy',
    'google',
    'pixel',
    'xiaomi',
    'huawei',
    'lenovo',
    'anker',
    'tp-link',
    'asus',
    'msi',
    'hp',
    'dell',
  ];

  const hints = [];
  knownBrands.forEach((brand) => {
    if (input.includes(brand)) {
      hints.push(brand);
    }
  });

  if (input.includes('iphone') && !hints.includes('apple')) {
    hints.push('apple');
  }

  return [...new Set(hints)].slice(0, 4);
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
    hasCatalogKeyword(lower, word),
  );
  const hasAccessoryIntent = ACCESSORY_KEYWORDS.some((word) =>
    hasCatalogKeyword(lower, word),
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

  return ACCESSORY_KEYWORDS.some((keyword) =>
    hasCatalogKeyword(searchable, keyword),
  );
}

function hasCatalogKeyword(value, keyword) {
  const normalizedValue = String(value || '').toLowerCase();
  const normalizedKeyword = String(keyword || '').toLowerCase().trim();
  if (!normalizedValue || !normalizedKeyword) return false;

  const pattern = normalizedKeyword
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+');

  return new RegExp(`\\b${pattern}\\b`, 'i').test(normalizedValue);
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
        variantId: product?.selectedOrFirstAvailableVariant?.id || '',
        availableForSale: Boolean(
          product?.selectedOrFirstAvailableVariant?.availableForSale,
        ),
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
    return 'No direct Pixel Zones catalog matches were found for this query.';
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
  policyContext,
  includeProductContext = false,
  includePolicyContext = false,
}) {
  const systemPrompt = [
    'You are Pixel Zones store assistant.',
    'You must ONLY answer questions related to Pixel Zones store details and products.',
    'Allowed topics: store location, customer service number, delivery information, and Pixel Zones catalog data.',
    `If the user asks anything outside scope, reply exactly: "${OUT_OF_SCOPE_REPLY}"`,
    'Never provide general knowledge answers.',
    'Use only the facts provided here and any live Pixel Zones catalog lookup data provided in the conversation.',
    'If live catalog lookup data is provided, only mention products from that data.',
    'Do not invent warranty, specs, stock, or prices.',
    'If asked for a product URL, provide the url value from live catalog data when available.',
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
      content: `Live Pixel Zones catalog data:\n${productContext}`,
    });
  }

  if (includePolicyContext && policyContext) {
    input.push({
      role: 'assistant',
      content: `Live Pixel Zones policy/FAQ data:\n${policyContext}`,
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

const CHATBOT_PRODUCT_DETAILS_QUERY = `#graphql
  query ChatbotProductDetails($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      vendor
      productType
      tags
      onlineStoreUrl
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      selectedOrFirstAvailableVariant {
        id
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;

const CHATBOT_PRODUCT_SEARCH_QUERY = `#graphql
  query ChatbotProductSearch($term: String!, $first: Int!) {
    products: search(
      query: $term
      types: [PRODUCT]
      first: $first
      unavailableProducts: HIDE
    ) {
      nodes {
        __typename
        ... on Product {
          id
          handle
          title
          vendor
          productType
          tags
          onlineStoreUrl
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          selectedOrFirstAvailableVariant(
            selectedOptions: []
            ignoreUnknownOptions: true
            caseInsensitiveMatch: true
          ) {
            id
            availableForSale
            title
            image {
              url
              altText
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
          variants(first: 5) {
            nodes {
              id
              availableForSale
              title
              image {
                url
                altText
              }
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
  }
`;

/** @typedef {import('./+types/api.chatbot').Route} Route */
