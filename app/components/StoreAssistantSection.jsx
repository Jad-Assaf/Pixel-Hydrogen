import {useEffect, useRef, useState} from 'react';

const INTRO_MESSAGE =
  'Hi, I can help with Pixel Zones product info, delivery details, store location, and customer service contact.';

const FALLBACK_ERROR_MESSAGE =
  'The assistant is temporarily unavailable. Please try again in a moment.';
const CHATBOT_STORAGE_KEY = 'pz_store_assistant_chat_v1';
const CHATBOT_STORAGE_TTL_MS = 1000 * 60 * 60 * 24 * 365;
const MAX_STORED_MESSAGES = 50;

export function StoreAssistantFloating() {
  const [messages, setMessages] = useState([
    {id: 'intro', role: 'assistant', text: INTRO_MESSAGE},
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const threadRef = useRef(null);

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

      const restored = normalizeStoredMessages(parsed?.messages);
      if (restored.length) {
        setMessages(restored);
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
      const payload = {
        savedAt: Date.now(),
        messages: messages.slice(-MAX_STORED_MESSAGES).map((item) => ({
          id: item.id,
          role: item.role,
          text: item.text,
          products: normalizeProducts(item.products),
        })),
      };
      window.localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore cache write errors.
    }
  }, [messages, isCacheHydrated]);

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
    if (!isOpen) return;
    const thread = threadRef.current;
    if (!thread) return;

    thread.scrollTo({
      top: thread.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isLoading, isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    const message = inputValue.trim();
    if (!message || isLoading) return;

    setError('');
    setInputValue('');

    const userMessage = createMessage('user', message);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
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

      setMessages((current) => [
        ...current,
        createMessage('assistant', reply, products),
      ]);
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

      <section className="pz-floating-chatbot-panel pz-chatbot-shell">
        <div className="pz-chatbot-head">
          <p className="pz-kicker">Need Help Fast?</p>
          <h2>Store Assistant</h2>
          <p>Ask about products, delivery timings, location, or customer service.</p>
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
            placeholder="Ask about products or delivery..."
            autoComplete="off"
          />
          <button type="submit" disabled={isLoading || !inputValue.trim()}>
            Send
          </button>
        </form>

        <p className="pz-chatbot-note">
          This assistant only answers Pixel Zones related questions.
        </p>
        {error ? <p className="pz-chatbot-error">{error}</p> : null}
      </section>
    </div>
  );
}

function createMessage(role, text, products = []) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    products: normalizeProducts(products),
  };
}

function normalizeStoredMessages(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const role = item.role === 'user' ? 'user' : 'assistant';
      const text = typeof item.text === 'string' ? item.text.trim() : '';
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
