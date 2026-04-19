import {CartForm, Money, useAnalytics} from '@shopify/hydrogen';
import {useRouteLoaderData} from 'react-router';
import {buildCheckoutStampFormInput} from '~/lib/checkoutStamp';
import {
  buildWetrackedCheckoutAttributes,
  publishCheckoutStarted,
  withWetrackedParams,
} from '~/lib/tracking';

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

      <CartCheckoutActions cart={cart} />

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
 * @param {{cart: OptimisticCart<CartApiQueryFragment | null>}}
 */
function CartCheckoutActions({cart}) {
  const {publish, shop} = useAnalytics();
  const rootData = useRouteLoaderData('root');
  const checkoutUrl = cart?.checkoutUrl;
  if (!checkoutUrl) return null;

  const checkoutHref = withWetrackedParams(checkoutUrl);
  const checkoutAttributes = buildWetrackedCheckoutAttributes({
    country: rootData?.consent?.country,
    host: rootData?.publicStoreDomain,
    locale: [rootData?.consent?.language, rootData?.consent?.country]
      .filter(Boolean)
      .join('-'),
  });
  const checkoutStampFormInput = buildCheckoutStampFormInput({
    redirectTo: checkoutHref,
    attributes: checkoutAttributes,
  });

  return (
    <CartForm
      route="/cart"
      action={checkoutStampFormInput.action}
      inputs={checkoutStampFormInput.inputs}
    >
      <button
        type="submit"
        className="pz-btn pz-btn-primary pz-summary-checkout"
        onClick={() => {
          publishCheckoutStarted(publish, {
            cart,
            checkoutUrl: checkoutHref,
            shop,
          });
        }}
      >
        Proceed to Checkout
      </button>
    </CartForm>
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
