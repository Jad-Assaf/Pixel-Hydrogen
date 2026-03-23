import {Link, useLoaderData} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {getWishlistFromCookieHeader} from '~/lib/wishlist';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Pixel Zones | Wishlist'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context, request}) {
  const wishlistHandles = getWishlistFromCookieHeader(request.headers.get('Cookie'));

  if (!wishlistHandles.length) {
    return {products: []};
  }

  const uniqueHandles = Array.from(new Set(wishlistHandles)).slice(0, 40);
  const productsByHandle = new Map();

  const results = await Promise.all(
    uniqueHandles.map(async (handle) => {
      try {
        const data = await context.storefront.query(
          WISHLIST_PRODUCT_BY_HANDLE_QUERY,
          {
            cache: context.storefront.CacheShort(),
            variables: {handle},
          },
        );

        return data?.product || null;
      } catch {
        return null;
      }
    }),
  );

  results.forEach((product) => {
    if (product?.handle) {
      productsByHandle.set(product.handle, product);
    }
  });

  const products = wishlistHandles
    .map((handle) => productsByHandle.get(handle))
    .filter(Boolean);

  return {products};
}

export default function WishlistPage() {
  /** @type {{products: WishlistProduct[]}} */
  const {products} = useLoaderData();

  return (
    <div className="pz-page pz-wishlist-page">
      <section className="pz-home-section">
        <div className="pz-shell">
          <div className="pz-section-head">
            <div>
              <p className="pz-kicker">Saved For Later</p>
              <h2>Your Wishlist</h2>
            </div>
            <Link to="/collections/all" className="pz-inline-link" prefetch="intent">
              Continue Shopping
            </Link>
          </div>

          {products.length ? (
            <div className="pz-card-grid">
              {products.map((product) => (
                <ProductItem key={product.id} product={product} loading="lazy" showAddToCart />
              ))}
            </div>
          ) : (
            <p className="pz-empty">
              Your wishlist is empty. Tap the wishlist icon on any product to save it here.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

const WISHLIST_PRODUCT_BY_HANDLE_QUERY = `#graphql
  query WishlistProductByHandle(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...WishlistProductCard
    }
  }

  fragment WishlistMoney on MoneyV2 {
    amount
    currencyCode
  }

  fragment WishlistProductCard on Product {
    id
    handle
    title
    vendor
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...WishlistMoney
      }
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      image {
        id
        altText
        url
        width
        height
      }
      selectedOptions {
        name
        value
      }
      price {
        ...WishlistMoney
      }
      compareAtPrice {
        ...WishlistMoney
      }
    }
    variants(first: 12) {
      nodes {
        id
        title
        availableForSale
        image {
          id
          altText
          url
          width
          height
        }
        selectedOptions {
          name
          value
        }
        price {
          ...WishlistMoney
        }
      }
    }
  }
`;

/** @typedef {import('./+types/wishlist').Route} Route */
/** @typedef {import('storefrontapi.generated').WishlistProductCardFragment} WishlistProduct */
