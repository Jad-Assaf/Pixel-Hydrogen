import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Pixel Zones | Shop'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request}) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 9,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
  ]);

  return {products};
}

/**
 * @param {Route.LoaderArgs}
 */
function loadDeferredData() {
  return {};
}

export default function ShopRoute() {
  /** @type {LoaderReturnData} */
  const {products} = useLoaderData();

  return (
    <div className="pz-shop-page">
      <nav className="pz-breadcrumbs" aria-label="Breadcrumb">
        <span>Home</span>
        <span>/</span>
        <span>Shop</span>
        <span>/</span>
        <span>Laptops &amp; Computers</span>
      </nav>

      <div className="pz-shop-head">
        <h1>Laptops &amp; Computers</h1>
        <button type="button" className="pz-sort-btn">
          Best Selling
        </button>
      </div>

      <div className="pz-shop-layout">
        <aside className="pz-shop-filters" aria-label="Shop filters">
          <section>
            <h3>Price Range</h3>
            <div className="pz-filter-price">
              <input type="number" placeholder="Min" aria-label="Minimum price" />
              <input type="number" placeholder="Max" aria-label="Maximum price" />
            </div>
          </section>

          <section>
            <h3>Brand</h3>
            <label>
              <input type="checkbox" defaultChecked /> Quantum
            </label>
            <label>
              <input type="checkbox" /> Visionary
            </label>
            <label>
              <input type="checkbox" /> SyncChip
            </label>
            <label>
              <input type="checkbox" /> TypePro
            </label>
          </section>

          <section>
            <h3>Memory</h3>
            <div className="pz-chip-row">
              <button type="button" className="is-active">
                32GB
              </button>
              <button type="button">64GB</button>
              <button type="button">128GB</button>
            </div>
          </section>

          <button type="button" className="pz-reset-filters">
            Reset All Filters
          </button>
        </aside>

        <section className="pz-shop-products">
          <PaginatedResourceSection
            connection={products}
            resourcesClassName="pz-shop-grid"
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 6 ? 'eager' : 'lazy'}
                showAddToCart
              />
            )}
          </PaginatedResourceSection>
        </section>
      </div>
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }

  fragment CollectionItem on Product {
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
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
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
        ...MoneyCollectionItem
      }
      compareAtPrice {
        ...MoneyCollectionItem
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
          ...MoneyCollectionItem
        }
      }
    }
  }
`;

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

/** @typedef {import('./+types/collections.all').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
