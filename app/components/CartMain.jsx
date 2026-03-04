import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

/**
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart}) {
  const cart = useOptimisticCart(originalCart);
  const lines = cart?.lines?.nodes ?? [];

  if (!lines.length) {
    return <CartEmpty layout={layout} />;
  }

  if (layout === 'aside') {
    return (
      <div className="pz-cart-main pz-cart-main-aside">
        <ul className="pz-cart-lines">
          {lines.map((line) => (
            <CartLineItem key={line.id} line={line} layout={layout} />
          ))}
        </ul>
        <CartSummary cart={cart} layout={layout} />
      </div>
    );
  }

  return (
    <div className="pz-cart-main pz-cart-main-page">
      <div className="pz-cart-main-left">
        <div className="pz-cart-lines-card">
          <ul className="pz-cart-lines">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul>
        </div>

        <section className="pz-cart-suggestions">
          <h2>You May Also Like</h2>
          <div className="pz-suggestion-grid">
            {SUGGESTIONS.map((item) => (
              <article key={item.id} className="pz-suggestion-card">
                <div className="pz-image-placeholder" aria-hidden="true" />
                <h3>{item.name}</h3>
                <p>{item.price}</p>
                <button type="button">Add to Cart</button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <CartSummary cart={cart} layout={layout} />
    </div>
  );
}

/**
 * @param {{
 *   layout?: CartMainProps['layout'];
 * }}
 */
function CartEmpty({layout}) {
  const {close} = useAside();

  return (
    <div className="pz-cart-empty">
      <h2>Your cart is empty</h2>
      <p>Add something from the shop and it will appear here.</p>
      <Link
        className="pz-btn pz-btn-primary"
        to="/shop"
        onClick={() => {
          if (layout === 'aside') close();
        }}
        prefetch="viewport"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

const SUGGESTIONS = [
  {id: 's1', name: 'Wireless Keyboard', price: '$129.00'},
  {id: 's2', name: 'Ergo Mouse Pro', price: '$89.00'},
  {id: 's3', name: 'Noise Canceling Headphones', price: '$249.00'},
  {id: 's4', name: 'Docking Station', price: '$199.00'},
];

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
