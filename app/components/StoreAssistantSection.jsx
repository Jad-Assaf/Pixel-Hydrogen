import {useEffect, useMemo, useRef, useState} from 'react';

const INTRO_MESSAGE =
  'Hi, I can help with Pixel Zones product info, delivery details, store location, and customer service contact.';
const FALLBACK_ERROR_MESSAGE =
  'The assistant is temporarily unavailable. Please try again in a moment.';
const CHATBOT_STORAGE_KEY = 'pz_store_assistant_chat_v1';
const CHATBOT_STORAGE_TTL_MS = 1000 * 60 * 60 * 24 * 365;
const MAX_STORED_MESSAGES = 50;
const MAX_STORED_CONVERSATIONS = 12;
const MESSAGE_USAGE_LIMIT = 100;

export function StoreAssistantFloating() {
  const [conversations, setConversations] = useState(() => [
    createConversation('Conversation 1'),
  ]);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const [messageUsageCount, setMessageUsageCount] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const threadRef = useRef(null);
  const remainingMessages = Math.max(0, MESSAGE_USAGE_LIMIT - messageUsageCount);
  const hasReachedMessageLimit = remainingMessages <= 0;

  const activeConversation = useMemo(() => {
    if (!conversations.length) return null;

    return (
      conversations.find((conversation) => conversation.id === activeConversationId) ||
      conversations[conversations.length - 1]
    );
  }, [activeConversationId, conversations]);

  const orderedConversations = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  );
  const messages = activeConversation?.messages || [];

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
          setConversations(restoredConversations);
          const storedUsageCount = Number(parsed?.messageUsageCount);
          const resolvedUsageCount = Number.isFinite(storedUsageCount)
            ? storedUsageCount
            : countUserMessages(restoredConversations);
          setMessageUsageCount(
            Math.min(
              MESSAGE_USAGE_LIMIT,
              Math.max(0, Math.trunc(resolvedUsageCount)),
            ),
          );

          const preferredId =
            typeof parsed.activeConversationId === 'string'
              ? parsed.activeConversationId
              : '';
          const hasPreferredId = restoredConversations.some(
            (conversation) => conversation.id === preferredId,
          );
          setActiveConversationId(
            hasPreferredId
              ? preferredId
              : restoredConversations[restoredConversations.length - 1].id,
          );
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

      const persistedActiveId = normalizedConversations.some(
        (conversation) => conversation.id === activeConversationId,
      )
        ? activeConversationId
        : normalizedConversations[normalizedConversations.length - 1].id;

      const payload = {
        savedAt: Date.now(),
        activeConversationId: persistedActiveId,
        messageUsageCount: Math.min(
          MESSAGE_USAGE_LIMIT,
          Math.max(0, Math.trunc(messageUsageCount)),
        ),
        conversations: normalizedConversations.map((conversation) => ({
          id: conversation.id,
          title: conversation.title,
          updatedAt: conversation.updatedAt,
          messages: conversation.messages
            .slice(-MAX_STORED_MESSAGES)
            .map((item) => ({
              id: item.id,
              role: item.role,
              text: item.text,
              products: normalizeProducts(item.products),
            })),
        })),
      };
      window.localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore cache write errors.
    }
  }, [conversations, activeConversationId, isCacheHydrated, messageUsageCount]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('pz-chatbot-open', isOpen);

    return () => {
      document.body.classList.remove('pz-chatbot-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const thread = threadRef.current;
    if (!thread) return;

    thread.scrollTo({
      top: thread.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading, isOpen]);

  function handleNewConversation() {
    const nextConversation = createConversation(
      `Conversation ${Math.min(999, conversations.length + 1)}`,
    );

    setConversations((current) =>
      [...current, nextConversation].slice(-MAX_STORED_CONVERSATIONS),
    );
    setActiveConversationId(nextConversation.id);
    setInputValue('');
    setError('');
    setIsLoading(false);
  }

  function handleClearConversation() {
    if (!activeConversation) return;

    setConversations((current) =>
      current.map((conversation) => {
        if (conversation.id !== activeConversation.id) return conversation;
        return {
          ...conversation,
          messages: [createMessage('assistant', INTRO_MESSAGE)],
          updatedAt: Date.now(),
        };
      }),
    );

    setInputValue('');
    setError('');
    setIsLoading(false);
  }

  function handleDeleteConversation() {
    if (!activeConversation) return;

    let nextActiveId = '';
    setConversations((current) => {
      if (current.length <= 1) {
        const replacement = createConversation('Conversation 1');
        nextActiveId = replacement.id;
        return [replacement];
      }

      const nextConversations = current.filter(
        (conversation) => conversation.id !== activeConversation.id,
      );
      const fallbackConversation =
        [...nextConversations].sort((a, b) => b.updatedAt - a.updatedAt)[0] ||
        nextConversations[nextConversations.length - 1];

      nextActiveId = fallbackConversation?.id || '';
      return nextConversations;
    });

    if (nextActiveId) {
      setActiveConversationId(nextActiveId);
    }

    setInputValue('');
    setError('');
    setIsLoading(false);
  }

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
    } catch {
      setError(FALLBACK_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={`pz-floating-chatbot ${isOpen ? 'is-open' : ''}`}
      aria-label="Store assistant"
    >
      <span className="pz-floating-chatbot-label" aria-hidden="true">
        Pixel Zones AI
      </span>
      <button
        type="button"
        className="pz-floating-chatbot-toggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Close store assistant' : 'Open store assistant'}
        aria-expanded={isOpen}
      >
        <svg
          className="pz-floating-chatbot-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M9 15C8.44771 15 8 15.4477 8 16C8 16.5523 8.44771 17 9 17C9.55229 17 10 16.5523 10 16C10 15.4477 9.55229 15 9 15Z"
            fill="#111830"
          />
          <path
            d="M14 16C14 15.4477 14.4477 15 15 15C15.5523 15 16 15.4477 16 16C16 16.5523 15.5523 17 15 17C14.4477 17 14 16.5523 14 16Z"
            fill="#111830"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 1C10.8954 1 10 1.89543 10 3C10 3.74028 10.4022 4.38663 11 4.73244V7H6C4.34315 7 3 8.34315 3 10V20C3 21.6569 4.34315 23 6 23H18C19.6569 23 21 21.6569 21 20V10C21 8.34315 19.6569 7 18 7H13V4.73244C13.5978 4.38663 14 3.74028 14 3C14 1.89543 13.1046 1 12 1ZM5 10C5 9.44772 5.44772 9 6 9H7.38197L8.82918 11.8944C9.16796 12.572 9.86049 13 10.618 13H13.382C14.1395 13 14.832 12.572 15.1708 11.8944L16.618 9H18C18.5523 9 19 9.44772 19 10V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V10ZM13.382 11L14.382 9H9.61803L10.618 11H13.382Z"
            fill="#111830"
          />
          <path
            d="M1 14C0.447715 14 0 14.4477 0 15V17C0 17.5523 0.447715 18 1 18C1.55228 18 2 17.5523 2 17V15C2 14.4477 1.55228 14 1 14Z"
            fill="#111830"
          />
          <path
            d="M22 15C22 14.4477 22.4477 14 23 14C23.5523 14 24 14.4477 24 15V17C24 17.5523 23.5523 18 23 18C22.4477 18 22 17.5523 22 17V15Z"
            fill="#111830"
          />
        </svg>
      </button>

      {isOpen ? (
        <button
          type="button"
          className="pz-floating-chatbot-backdrop"
          onClick={() => setIsOpen(false)}
          aria-label="Close store assistant"
        />
      ) : null}

      <section
        className="pz-floating-chatbot-panel pz-chatbot-shell"
        role="dialog"
        aria-modal="true"
        aria-label="Pixel Zones AI Assistant"
      >
        <div className="pz-chatbot-head">
          <button
            type="button"
            className="pz-floating-chatbot-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close assistant"
          >
            ×
          </button>
          <h2>Pixel Zones AI</h2>
          <div className="pz-chatbot-head-controls">
            <select
              className="pz-chatbot-conversation-select"
              value={activeConversation?.id || ''}
              onChange={(event) => {
                setActiveConversationId(event.target.value);
                setInputValue('');
                setError('');
              }}
              aria-label="Select conversation"
            >
              {orderedConversations.map((conversation) => (
                <option key={conversation.id} value={conversation.id}>
                  {conversation.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="pz-chatbot-conversation-btn"
              onClick={handleNewConversation}
            >
              New chat
            </button>
            <button
              type="button"
              className="pz-chatbot-conversation-btn"
              onClick={handleClearConversation}
            >
              Clear
            </button>
            <button
              type="button"
              className="pz-chatbot-conversation-btn is-delete"
              onClick={handleDeleteConversation}
            >
              Delete
            </button>
          </div>
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
              {message.text}
              {message.role === 'assistant' && message.products?.length ? (
                <div className="pz-chatbot-product-strip" aria-label="Related products">
                  {message.products.map((product, index) => {
                    const url = product.url || `/products/${product.handle}`;
                    return (
                      <a
                        key={product.id || `${product.handle || 'product'}-${index}`}
                        href={url}
                        className="pz-chatbot-product-card"
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
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
          <label htmlFor="pz-chatbot-input" className="sr-only">
            Ask the store assistant
          </label>
          <input
            ref={inputRef}
            id="pz-chatbot-input"
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
        <p className="pz-chatbot-limit">
          {remainingMessages} of {MESSAGE_USAGE_LIMIT} messages remaining
        </p>
        {error ? <p className="pz-chatbot-error">{error}</p> : null}
      </section>
    </div>
  );
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
        imageUrl: typeof product.imageUrl === 'string' ? product.imageUrl : '',
        imageAlt:
          typeof product.imageAlt === 'string' ? product.imageAlt : title,
        price: typeof product.price === 'string' ? product.price : '',
      };
    })
    .filter(Boolean)
    .slice(0, 20);
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
