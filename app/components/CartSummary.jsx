import {Money} from '@shopify/hydrogen';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const className =
    layout === 'page'
      ? 'pz-cart-summary pz-cart-summary-page'
      : 'pz-cart-summary pz-cart-summary-aside';

  return (
    <section aria-labelledby="cart-summary" className={className}>
      <h2 id="cart-summary">Order Summary</h2>

      <div className="pz-summary-rows">
        <SummaryRow label="Subtotal" amount={cart?.cost?.subtotalAmount} />
        <div className="pz-summary-row">
          <span>Shipping (Estimated)</span>
          <strong>Calculated at checkout</strong>
        </div>
        <SummaryRow label="Tax" amount={cart?.cost?.totalTaxAmount} fallback="$0.00" />
      </div>

      <div className="pz-summary-total">
        <span>Total</span>
        <strong>
          {cart?.cost?.totalAmount ? <Money data={cart.cost.totalAmount} /> : '$0.00'}
        </strong>
      </div>

      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />

      {layout === 'page' ? (
        <div className="pz-summary-benefits">
          <p>Free shipping on orders over $500</p>
          <p>2-year protection included</p>
        </div>
      ) : null}
    </section>
  );
}

function SummaryRow({label, amount, fallback = '-'}) {
  return (
    <div className="pz-summary-row">
      <span>{label}</span>
      <strong>{amount ? <Money data={amount} /> : fallback}</strong>
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string}}
 */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <a href={checkoutUrl} target="_self" className="pz-btn pz-btn-primary pz-summary-checkout">
      Proceed to Checkout
    </a>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
