import {CartForm} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';

/**
 * @param {{
 *   layout: CartLayout;
 *   line: CartLine;
 * }}
 */
export function CartLineItem({layout, line}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = product?.handle ? `/products/${product.handle}` : null;
  const {close} = useAside();
  const imageUrl = image?.url ? withImageWidth(image.url, 180) : null;

  return (
    <li key={id} className={`pz-cart-line ${layout === 'aside' ? 'is-aside' : ''}`}>
      <div className="pz-cart-line-media">
        {imageUrl ? (
          <img alt={title} className="pz-cart-line-image" src={imageUrl} width={90} height={90} />
        ) : (
          <div className="pz-image-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="pz-cart-line-body">
        {lineItemUrl ? (
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') close();
            }}
            className="pz-cart-line-title"
          >
            {product.title}
          </Link>
        ) : (
          <p className="pz-cart-line-title">{product?.title ?? title}</p>
        )}

        {selectedOptions.length ? (
          <p className="pz-cart-line-subtitle">
            {selectedOptions.map((option) => `${option.name}: ${option.value}`).join(' · ')}
          </p>
        ) : null}

        <CartLineQuantity line={line} />
      </div>

      <div className="pz-cart-line-total">
        <ProductPrice price={line?.cost?.totalAmount} />
      </div>
    </li>
  );
}

/**
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line}) {
  if (!line || typeof line?.quantity === 'undefined') return null;

  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="pz-cart-line-controls">
      <div className="pz-qty-control">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            type="submit"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
          >
            -
          </button>
        </CartLineUpdateButton>

        <span>{quantity}</span>

        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            type="submit"
            aria-label="Increase quantity"
            disabled={!!isOptimistic}
          >
            +
          </button>
        </CartLineUpdateButton>
      </div>

      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * @param {{
 *   lineIds: string[];
 *   disabled: boolean;
 * }}
 */
function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button className="pz-remove-line" disabled={disabled} type="submit">
        Remove
      </button>
    </CartForm>
  );
}

/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {string[]} lineIds
 */
function getUpdateKey(lineIds) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

function withImageWidth(url, width) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */

/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
