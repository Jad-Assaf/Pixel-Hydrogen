import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRevalidator, useRouteLoaderData} from 'react-router';
import {useAnalytics} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {submitCheckoutStamp} from '~/lib/checkoutStamp';
import {
  buildWetrackedCheckoutAttributes,
  publishCheckoutStarted,
  withWetrackedParams,
} from '~/lib/tracking';

const INTRO_MESSAGE =
  'Hi, I can help with Pixel Zones product info, delivery details, store location, and customer service contact.';
const FALLBACK_ERROR_MESSAGE =
  'The assistant is temporarily unavailable. Please try again in a moment.';
const CHATBOT_STORAGE_KEY = 'pz_store_assistant_chat_v1';
const CHATBOT_STORAGE_TTL_MS = 1000 * 60 * 60 * 24 * 365;
const MAX_STORED_MESSAGES = 50;
const MAX_STORED_CONVERSATIONS = 12;
const MESSAGE_USAGE_LIMIT = 100;

export function StoreAssistantHomeSection() {
  return (
    <section className="pz-home-section pz-home-chatbot">
      <div className="pz-shell">
        <header className="pz-home-chatbot-intro">
          <h2 className="pz-home-chatbot-trigger-title">Pixel Zones AI</h2>
          <p className="pz-home-chatbot-trigger-copy">
            Ask about products, delivery, availability, and store support.
          </p>
        </header>
        <StoreAssistantPanel
          panelClassName="pz-home-chatbot-panel"
          inputId="pz-chatbot-home-input"
        />
      </div>
    </section>
  );
}

export function StoreAssistantProductDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <section
      ref={wrapperRef}
      className={`pz-product-chatbot${isOpen ? ' is-open' : ''}`}
      aria-label="Product assistant"
    >
      <button
        type="button"
        className="pz-product-chatbot-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="pz-product-chatbot-dropdown"
      >
        Ask Pixel Zones AI About This Product
      </button>

      {isOpen ? (
        <div
          id="pz-product-chatbot-dropdown"
          className="pz-product-chatbot-dropdown"
        >
          <StoreAssistantPanel
            onRequestClose={() => setIsOpen(false)}
            panelClassName="pz-product-chatbot-panel"
            closeButtonClassName="pz-product-chatbot-close"
            inputId="pz-chatbot-product-input"
          />
        </div>
      ) : null}
    </section>
  );
}

function StoreAssistantPanel({
  onRequestClose,
  panelClassName = '',
  closeButtonClassName = 'pz-chatbot-close',
  inputId = 'pz-chatbot-input',
}) {
  const revalidator = useRevalidator();
  const rootData = useRouteLoaderData('root');
  const {open} = useAside();
  const {cart, publish, shop} = useAnalytics();
  const [conversations, setConversations] = useState(() => [
    createInitialConversation(),
  ]);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCardActionLoading, setIsCardActionLoading] = useState('');
  const [error, setError] = useState('');
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [messageUsageCount, setMessageUsageCount] = useState(0);
  const inputRef = useRef(null);
  const threadRef = useRef(null);
  const hasReachedMessageLimit = messageUsageCount >= MESSAGE_USAGE_LIMIT;

  const resetChatbotSession = useCallback(() => {
    setConversations([createInitialConversation()]);
    setActiveConversationId('');
    setInputValue('');
    setIsLoading(false);
    setIsCardActionLoading('');
    setError('');
    setMessageUsageCount(0);
  }, []);

  const activeConversation = useMemo(() => {
    if (!conversations.length) return null;

    return (
      conversations.find((conversation) => conversation.id === activeConversationId) ||
      conversations[conversations.length - 1]
    );
  }, [activeConversationId, conversations]);
  const messages = useMemo(
    () => activeConversation?.messages || [],
    [activeConversation],
  );

  useEffect(() => {
    if (!conversations.length) return;

    const activeExists = conversations.some(
      (conversation) => conversation.id === activeConversationId,
    );
    if (!activeConversationId || !activeExists) {
      setActiveConversationId(conversations[conversations.length - 1].id);
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsCacheHydrated(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem(CHATBOT_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const currentDayKey = getCurrentChatbotDayKey();
      const storedDayKey = resolveStoredChatbotDayKey(parsed);
      if (!storedDayKey || storedDayKey !== currentDayKey) {
        window.localStorage.removeItem(CHATBOT_STORAGE_KEY);
        return;
      }

      const age = Date.now() - Number(parsed?.savedAt || 0);
      if (!Number.isFinite(age) || age > CHATBOT_STORAGE_TTL_MS) {
        window.localStorage.removeItem(CHATBOT_STORAGE_KEY);
        return;
      }

      if (Array.isArray(parsed?.conversations)) {
        const restoredConversations = normalizeStoredConversations(
          parsed.conversations,
        );
        if (restoredConversations.length) {
          const latestConversation =
            [...restoredConversations].sort(
              (a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0),
            )[0] || restoredConversations[restoredConversations.length - 1];
          const singleConversation = {
            ...latestConversation,
            title: 'Conversation',
          };
          setConversations([singleConversation]);
          const storedUsageCount = Number(parsed?.messageUsageCount);
          const resolvedUsageCount = Number.isFinite(storedUsageCount)
            ? storedUsageCount
            : countUserMessages([singleConversation]);
          setMessageUsageCount(
            Math.min(
              MESSAGE_USAGE_LIMIT,
              Math.max(0, Math.trunc(resolvedUsageCount)),
            ),
          );

          setActiveConversationId(singleConversation.id);
        }
      } else if (Array.isArray(parsed?.messages)) {
        const restoredMessages = normalizeStoredMessages(parsed.messages);
        if (restoredMessages.length) {
          const migratedConversation = createConversation(
            'Conversation 1',
            restoredMessages,
          );
          setConversations([migratedConversation]);
          setActiveConversationId(migratedConversation.id);
          setMessageUsageCount(
            Math.min(
              MESSAGE_USAGE_LIMIT,
              restoredMessages.filter((item) => item.role === 'user').length,
            ),
          );
        }
      }
    } catch {
      // Ignore malformed local cache entries.
    } finally {
      setIsCacheHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isCacheHydrated) return;

    try {
      const normalizedConversations = normalizeStoredConversations(conversations);
      if (!normalizedConversations.length) return;
      const activeOnly =
        normalizedConversations.find(
          (conversation) => conversation.id === activeConversationId,
        ) || normalizedConversations[normalizedConversations.length - 1];

      const persistedActiveId = activeOnly.id;

      const payload = {
        savedAt: Date.now(),
        dayKey: getCurrentChatbotDayKey(),
        activeConversationId: persistedActiveId,
        messageUsageCount: Math.min(
          MESSAGE_USAGE_LIMIT,
          Math.max(0, Math.trunc(messageUsageCount)),
        ),
        conversations: [
          {
            id: activeOnly.id,
            title: 'Conversation',
            updatedAt: activeOnly.updatedAt,
            messages: activeOnly.messages.slice(-MAX_STORED_MESSAGES).map((item) => ({
              id: item.id,
              role: item.role,
              text: item.text,
              products: normalizeProducts(item.products),
            })),
          },
        ],
      };
      window.localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore cache write errors.
    }
  }, [conversations, activeConversationId, isCacheHydrated, messageUsageCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let timeoutId = 0;

    const scheduleNextReset = () => {
      timeoutId = window.setTimeout(() => {
        resetChatbotSession();
        scheduleNextReset();
      }, getMsUntilNextLocalMidnight());
    };

    scheduleNextReset();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [resetChatbotSession]);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;

    thread.scrollTo({
      top: thread.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading]);

  async function handleSubmit(event) {
    event.preventDefault();
    const message = inputValue.trim();
    if (!message || isLoading || !activeConversation) return;
    if (hasReachedMessageLimit) {
      setError(
        `Message limit reached (${MESSAGE_USAGE_LIMIT}/${MESSAGE_USAGE_LIMIT}). Please try again later.`,
      );
      return;
    }

    setError('');
    setInputValue('');

    const userMessage = createMessage('user', message);
    const nextMessages = [...activeConversation.messages, userMessage];
    const targetConversationId = activeConversation.id;

    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== targetConversationId) return conversation;
        return {
          ...conversation,
          messages: nextMessages,
          updatedAt: Date.now(),
        };
      }),
    );
    setMessageUsageCount((current) =>
      Math.min(MESSAGE_USAGE_LIMIT, current + 1),
    );
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          message,
          pageContext: getChatbotPageContext(),
          recentProducts: getRecentProductsForRequest(nextMessages),
          history: nextMessages
            .filter((item) => item.role === 'user' || item.role === 'assistant')
            .slice(-10)
            .map((item) => ({
              role: item.role,
              content: item.text,
            })),
        }),
      });

      if (!response.ok) {
        throw new Error('Chatbot request failed');
      }

      const payload = await response.json();
      const reply =
        typeof payload?.reply === 'string' && payload.reply.trim()
          ? payload.reply.trim()
          : FALLBACK_ERROR_MESSAGE;
      const products = normalizeProducts(payload?.products);
      const actions = normalizeAgentActions(payload?.actions);

      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.id !== targetConversationId) return conversation;
          return {
            ...conversation,
            messages: [
              ...conversation.messages,
              createMessage('assistant', reply, products),
            ],
            updatedAt: Date.now(),
          };
        }),
      );

      if (actions.length) {
        const actionError = await executeAgentActions(actions);
        if (actionError) {
          setError(actionError);
        }
      }
    } catch {
      setError(FALLBACK_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }

  async function executeAgentActions(actions) {
    for (const action of actions) {
      if (action.type === 'add_to_cart') {
        const result = await performAgentActionRequest({
          type: 'add_to_cart',
          variantId: action.variantId,
          quantity: action.quantity,
        });

        if (!result.ok) {
          return (
            result.error || 'I could not add that item to cart right now.'
          );
        }
        open('cart');
        continue;
      }

      if (action.type === 'clear_cart') {
        const result = await performAgentActionRequest({
          type: 'clear_cart',
        });
        if (!result.ok) {
          return result.error || 'I could not clear your cart right now.';
        }
        open('cart');
        continue;
      }

      if (action.type === 'go_to_checkout') {
        const result = await performAgentActionRequest({
          type: 'get_checkout_url',
        });
        const checkoutUrl =
          typeof result.checkoutUrl === 'string' ? result.checkoutUrl : '';

        if (checkoutUrl) {
          const checkoutHref = withWetrackedParams(checkoutUrl);
          const checkoutAttributes = buildWetrackedCheckoutAttributes({
            country: rootData?.consent?.country,
            host: rootData?.publicStoreDomain,
            locale: [rootData?.consent?.language, rootData?.consent?.country]
              .filter(Boolean)
              .join('-'),
          });
          publishCheckoutStarted(publish, {
            cart,
            cartQuantity: result.cartQuantity,
            checkoutUrl: checkoutHref,
            shop,
            source: 'store_assistant',
          });
          if (
            submitCheckoutStamp({
              redirectTo: checkoutHref,
              attributes: checkoutAttributes,
            })
          ) {
            return '';
          }
          window.location.assign(checkoutHref);
          return '';
        }

        window.location.assign('/cart');
        return '';
      }

      if (action.type === 'navigate' && action.target) {
        window.location.assign(action.target);
        return '';
      }
    }

    return '';
  }

  async function handleProductCardAddToCart(product) {
    if (
      !product ||
      !activeConversation ||
      isLoading ||
      !product.variantId ||
      !product.availableForSale
    ) {
      return;
    }

    setError('');
    const pendingKey = product.id || product.variantId;
    setIsCardActionLoading(pendingKey);

    const result = await performAgentActionRequest({
      type: 'add_to_cart',
      variantId: product.variantId,
      quantity: 1,
    });

    if (!result.ok) {
      setError(result.error || 'I could not add that item to cart right now.');
      setIsCardActionLoading('');
      return;
    }
    open('cart');

    const confirmation = createMessage(
      'assistant',
      `${product.title} was added to your cart.`,
    );
    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== activeConversation.id) return conversation;
        return {
          ...conversation,
          messages: [...conversation.messages, confirmation],
          updatedAt: Date.now(),
        };
      }),
    );
    setIsCardActionLoading('');
  }

  async function performAgentActionRequest(agentAction) {
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({agentAction}),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          ok: false,
          error:
            typeof payload?.error === 'string' && payload.error
              ? payload.error
              : 'Agent action failed.',
        };
      }

      return payload && typeof payload === 'object'
        ? (() => {
            if (
              payload.ok &&
              (agentAction?.type === 'add_to_cart' ||
                agentAction?.type === 'clear_cart') &&
              revalidator.state === 'idle'
            ) {
              revalidator.revalidate();
            }
            return payload;
          })()
        : {ok: false, error: 'Agent action failed.'};
    } catch {
      return {ok: false, error: 'Agent action failed.'};
    }
  }

  return (
      <section
        className={`pz-chatbot-shell ${panelClassName}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label="Pixel Zones AI Assistant"
      >
        <div className="pz-chatbot-head">
          {onRequestClose ? (
            <button
              type="button"
              className={closeButtonClassName}
              onClick={onRequestClose}
              aria-label="Close assistant"
            >
              ×
            </button>
          ) : null}
          <h2>Pixel Zones AI</h2>
        </div>

        <div
          ref={threadRef}
          className="pz-chatbot-thread"
          role="log"
          aria-live="polite"
        >
          {messages.map((message) => (
            <article
              key={message.id}
              className={`pz-chatbot-bubble is-${message.role}`}
            >
              {renderChatMessageText(message.text)}
              {message.role === 'assistant' && message.products?.length ? (
                <div className="pz-chatbot-product-strip" aria-label="Related products">
                  {message.products.map((product, index) => {
                    const url = product.url || `/products/${product.handle}`;
                    const actionKey = product.id || product.variantId;
                    const isPending = isCardActionLoading === actionKey;
                    return (
                      <article
                        key={product.id || `${product.handle || 'product'}-${index}`}
                        className="pz-chatbot-product-card"
                      >
                        <a
                          href={url}
                          className="pz-chatbot-product-link"
                        >
                          {product.imageUrl ? (
                            <img
                              src={withImageWidth(product.imageUrl, 100)}
                              alt={product.imageAlt || product.title || 'Product image'}
                              loading="lazy"
                            />
                          ) : (
                            <span className="pz-chatbot-product-image-fallback">
                              No image
                            </span>
                          )}
                          <span className="pz-chatbot-product-title">{product.title}</span>
                          {product.price ? (
                            <span className="pz-chatbot-product-price">
                              {product.price}
                            </span>
                          ) : null}
                        </a>
                        <button
                          type="button"
                          className="pz-chatbot-product-add-btn"
                          onClick={() => handleProductCardAddToCart(product)}
                          aria-label={`Add ${product.title} to cart`}
                          title={
                            product.availableForSale
                              ? `Add ${product.title} to cart`
                              : 'Out of stock'
                          }
                          disabled={
                            isPending ||
                            isLoading ||
                            !product.variantId ||
                            !product.availableForSale
                          }
                        >
                          {isPending ? '…' : '+'}
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </article>
          ))}
          {isLoading ? (
            <p className="pz-chatbot-loading" aria-hidden="true">
              Typing...
            </p>
          ) : null}
        </div>

        <form className="pz-chatbot-form" onSubmit={handleSubmit}>
          <label htmlFor={inputId} className="sr-only">
            Ask the store assistant
          </label>
          <input
            ref={inputRef}
            id={inputId}
            name="message"
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={
              hasReachedMessageLimit
                ? 'Message limit reached for now.'
                : 'Ask about products or delivery...'
            }
            autoComplete="off"
            disabled={hasReachedMessageLimit}
          />
          <button
            type="submit"
            disabled={
              hasReachedMessageLimit || isLoading || !inputValue.trim()
            }
          >
            <span className="sr-only">Send</span>
            <svg
              className="pz-chatbot-send-icon"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 4.25L10 15.75"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              <path
                d="M5.5 8.75L10 4.25L14.5 8.75"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
        {error ? <p className="pz-chatbot-error">{error}</p> : null}
      </section>
  );
}

function createInitialConversation() {
  return createConversation('Conversation');
}

function createConversation(title, seedMessages) {
  const now = Date.now();
  return {
    id: `conv-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: typeof title === 'string' && title.trim() ? title.trim() : 'Conversation',
    updatedAt: now,
    messages: normalizeStoredMessages(
      seedMessages?.length ? seedMessages : [createMessage('assistant', INTRO_MESSAGE)],
    ),
  };
}

function createMessage(role, text, products = []) {
  const safeRole = role === 'user' ? 'user' : 'assistant';
  const cleanedText =
    safeRole === 'assistant'
      ? sanitizeAssistantText(text)
      : sanitizeUserText(text);

  return {
    id: `${safeRole}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: safeRole,
    text: cleanedText || (safeRole === 'assistant' ? FALLBACK_ERROR_MESSAGE : ''),
    products: normalizeProducts(products),
  };
}

function normalizeStoredConversations(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((conversation, index) => {
      if (!conversation || typeof conversation !== 'object') return null;

      const messages = normalizeStoredMessages(conversation.messages);
      if (!messages.length) return null;

      const id =
        typeof conversation.id === 'string' && conversation.id
          ? conversation.id
          : `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const title =
        typeof conversation.title === 'string' && conversation.title.trim()
          ? conversation.title.trim()
          : `Conversation ${index + 1}`;
      const updatedAt = Number.isFinite(Number(conversation.updatedAt))
        ? Number(conversation.updatedAt)
        : Date.now();

      return {id, title, updatedAt, messages};
    })
    .filter(Boolean)
    .slice(-MAX_STORED_CONVERSATIONS);
}

function normalizeStoredMessages(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const role = item.role === 'user' ? 'user' : 'assistant';
      const rawText = typeof item.text === 'string' ? item.text : '';
      const text =
        role === 'assistant'
          ? sanitizeAssistantText(rawText)
          : sanitizeUserText(rawText);
      if (!text) return null;

      return {
        id:
          typeof item.id === 'string' && item.id
            ? item.id
            : `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role,
        text,
        products: normalizeProducts(item.products),
      };
    })
    .filter(Boolean)
    .slice(-MAX_STORED_MESSAGES);
}

function countUserMessages(conversationItems) {
  if (!Array.isArray(conversationItems)) return 0;

  return conversationItems.reduce((total, conversation) => {
    if (!Array.isArray(conversation?.messages)) return total;
    return (
      total +
      conversation.messages.filter((item) => item?.role === 'user').length
    );
  }, 0);
}

function getRecentProductsForRequest(messages) {
  if (!Array.isArray(messages)) return [];

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const item = messages[index];
    if (item?.role !== 'assistant') continue;
    const products = normalizeProducts(item?.products);
    if (!products.length) continue;
    return products;
  }

  return [];
}

function getCurrentChatbotDayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function resolveStoredChatbotDayKey(payload) {
  if (typeof payload?.dayKey === 'string' && payload.dayKey) {
    return payload.dayKey;
  }

  const savedAt = Number(payload?.savedAt);
  if (!Number.isFinite(savedAt)) return '';

  const savedDate = new Date(savedAt);
  const year = savedDate.getFullYear();
  const month = String(savedDate.getMonth() + 1).padStart(2, '0');
  const day = String(savedDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMsUntilNextLocalMidnight() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(1000, nextMidnight.getTime() - now.getTime());
}

function normalizeProducts(products) {
  if (!Array.isArray(products)) return [];

  return products
    .map((product) => {
      if (!product || typeof product !== 'object') return null;
      const title =
        typeof product.title === 'string' ? product.title.trim() : '';
      if (!title) return null;

      return {
        id: typeof product.id === 'string' ? product.id : '',
        handle: typeof product.handle === 'string' ? product.handle : '',
        title,
        url: typeof product.url === 'string' ? product.url : '',
        variantId:
          typeof product.variantId === 'string' ? product.variantId : '',
        availableForSale:
          typeof product.availableForSale === 'boolean'
            ? product.availableForSale
            : true,
        imageUrl: typeof product.imageUrl === 'string' ? product.imageUrl : '',
        imageAlt:
          typeof product.imageAlt === 'string' ? product.imageAlt : title,
        price: typeof product.price === 'string' ? product.price : '',
      };
    })
    .filter(Boolean)
    .slice(0, 20);
}

function withImageWidth(url, width) {
  if (!url || !width) return url || '';
  try {
    const parsedUrl = new URL(
      url,
      typeof window === 'undefined' ? 'https://pixelzones.local' : window.location.origin,
    );
    parsedUrl.searchParams.set('width', String(width));
    if (url.startsWith('/') && !url.startsWith('//')) {
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }
    return parsedUrl.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}`;
  }
}

function normalizeAgentActions(actions) {
  if (!Array.isArray(actions)) return [];

  return actions
    .map((action) => {
      if (!action || typeof action !== 'object') return null;
      const type =
        typeof action.type === 'string'
          ? action.type.trim().toLowerCase()
          : '';

      if (type === 'navigate') {
        const target = normalizeNavigationTarget(action.target);
        if (!target) return null;
        return {type, target};
      }

      if (type === 'add_to_cart') {
        const variantId =
          typeof action.variantId === 'string' ? action.variantId.trim() : '';
        if (!variantId) return null;

        const quantity = Number(action.quantity);
        const normalizedQuantity =
          Number.isFinite(quantity) && quantity > 0
            ? Math.min(10, Math.trunc(quantity))
            : 1;

        return {
          type,
          variantId,
          quantity: normalizedQuantity,
        };
      }

      if (type === 'go_to_checkout') {
        return {type};
      }

      if (type === 'clear_cart') {
        return {type};
      }

      return null;
    })
    .filter(Boolean)
    .slice(0, 4);
}

function normalizeNavigationTarget(target) {
  if (typeof target !== 'string') return '';
  const trimmed = target.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('/')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (typeof window !== 'undefined' && parsed.origin !== window.location.origin) {
      return '';
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '';
  }
}

function sanitizeUserText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function sanitizeAssistantText(value) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, '$1')
    .replace(/https?:\/\/[^\s)]+/gi, '')
    .replace(/\bwww\.[^\s)]+/gi, '')
    .replace(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)]*)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .trim();
}

function renderChatMessageText(text) {
  const safeText = typeof text === 'string' ? text : '';
  if (!safeText) return '';

  const lines = safeText.split(/\r?\n/);
  return lines.map((line, lineIndex) => (
    <span key={`line-${lineIndex}`}>
      {renderInlineStrongText(line)}
      {lineIndex < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

function renderInlineStrongText(text) {
  const safeText = typeof text === 'string' ? text : '';
  if (!safeText) return '';

  const parts = safeText.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/);
    if (match?.[1]) {
      return <strong key={`strong-${index}`}>{match[1]}</strong>;
    }

    return <span key={`text-${index}`}>{part}</span>;
  });
}

function getChatbotPageContext() {
  if (typeof window === 'undefined') return null;

  const pathname = String(window.location?.pathname || '').trim();
  const url = String(window.location?.href || '').trim();
  const title = String(document?.title || '').trim();

  if (!pathname && !url && !title) return null;
  return {pathname, url, title};
}
