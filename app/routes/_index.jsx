import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

const HOME_SECTION_CONFIG = [
  {key: 'newArrivals', title: 'New arrivals', handle: 'new-arrivals'},
  {key: 'hotDeals', title: 'Hot Deals', handle: 'hot-deals'},
  {key: 'apple', title: 'Apple', handle: 'apple'},
  {key: 'gamingLaptops', title: 'Gaming Laptops', handle: 'gaming-laptops'},
  {
    key: 'carbonizeProducts',
    title: 'Carbonize Products',
    handle: 'carbonize-collection',
  },
];

const BRAND_LIST = [
  'Apple',
  'Asus',
  'MSI',
  'Razer',
  'Lenovo',
  'Dell',
  'HP',
  'Alienware',
];

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const criticalData = await loadCriticalData(args);
  return criticalData;
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const menuResult = await context.storefront.query(MENU_QUERY, {
    variables: {handle: 'new-main-menu'},
  });

  const menu = menuResult?.menu ?? null;
  const menuCollectionHandles = getUniqueHandles(
    getCollectionHandlesFromMenu(menu?.items || []),
  );

  const [featuredResult, sectionCollections, shopByCollectionsData] =
    await Promise.all([
      context.storefront.query(FEATURED_COLLECTION_QUERY),
      context.storefront.query(buildHomeSectionsQuery(HOME_SECTION_CONFIG)),
      menuCollectionHandles.length
        ? context.storefront.query(
            buildShopByCollectionsQuery(menuCollectionHandles),
          )
        : Promise.resolve({}),
    ]);

  const sections = HOME_SECTION_CONFIG.map((section) => ({
    ...section,
    collection: sectionCollections?.[section.key] ?? null,
  }));

  const shopByCollections = menuCollectionHandles
    .map((_, index) => shopByCollectionsData?.[`collection_${index}`])
    .filter(Boolean);

  return {
    featuredCollection: featuredResult?.collections?.nodes?.[0] ?? null,
    menu,
    sections,
    shopByCollections,
    publicStoreDomain: context.env?.PUBLIC_STORE_DOMAIN,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  const [newArrivals, hotDeals, apple, gamingLaptops, carbonizeProducts] =
    data.sections;

  return (
    <div className="home">
      <FeaturedCollection collection={data.featuredCollection} />

      <HomeSection title={newArrivals.title}>
        <CollectionRow collection={newArrivals.collection} />
      </HomeSection>

      <HomeSection title={hotDeals.title}>
        <CollectionRow collection={hotDeals.collection} />
      </HomeSection>

      <HomeSection title={apple.title}>
        <CollectionRow collection={apple.collection} />
      </HomeSection>

      <HomeSection title="Shop by collection">
        <CollectionCardGrid collections={data.shopByCollections} />
      </HomeSection>

      <HomeSection title={gamingLaptops.title}>
        <CollectionRow collection={gamingLaptops.collection} />
      </HomeSection>

      <HomeSection title={carbonizeProducts.title}>
        <CollectionRow collection={carbonizeProducts.collection} />
      </HomeSection>

      <HomeSection title="Brands">
        <BrandGrid brands={BRAND_LIST} />
      </HomeSection>

      <HomeSection title="Quick Links">
        <QuickLinks
          menuItems={data.menu?.items ?? []}
          publicStoreDomain={data.publicStoreDomain}
        />
      </HomeSection>
    </div>
  );
}

/**
 * @param {{title: string; children: React.ReactNode}}
 */
function HomeSection({title, children}) {
  return (
    <section className="home-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/**
 * @param {{collection: SectionCollection | null}}
 */
function CollectionRow({collection}) {
  if (!collection) {
    return <p>Collection coming soon.</p>;
  }

  const products = collection.products?.nodes ?? [];

  if (!products.length) {
    return <p>No products available yet.</p>;
  }

  return (
    <>
      <div className="section-row">
        {products.map((product) => (
          <ProductItem key={product.id} product={product} showAddToCart />
        ))}
      </div>
      <Link className="section-link" to={`/collections/${collection.handle}`}>
        View all →
      </Link>
    </>
  );
}

/**
 * @param {{collections: Array<CollectionCard> | undefined}}
 */
function CollectionCardGrid({collections}) {
  if (!collections?.length) {
    return <p>Add collection links to the "new-main-menu" to show them here.</p>;
  }

  return (
    <div className="collection-card-grid">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

/**
 * @param {{collection: CollectionCard}}
 */
function CollectionCard({collection}) {
  const displayImage =
    collection.image ?? collection.products?.nodes?.[0]?.featuredImage ?? null;

  return (
    <Link
      className="collection-card"
      to={`/collections/${collection.handle}`}
    >
      {displayImage ? (
        <div className="collection-card-image">
          <img
            alt={displayImage.altText || collection.title}
            className="collection-card-img"
            src={displayImage.url}
            width={400}
          />
        </div>
      ) : null}
      <div>
        <h3>{collection.title}</h3>
      </div>
    </Link>
  );
}
/**
 * @param {{brands: string[]}}
 */
function BrandGrid({brands}) {
  return (
    <div className="brand-grid">
      {brands.map((brand) => (
        <div className="brand-pill" key={brand}>
          {brand}
        </div>
      ))}
    </div>
  );
}

/**
 * @param {{menuItems: MenuItem[]; publicStoreDomain?: string}}
 */
function QuickLinks({menuItems, publicStoreDomain}) {
  const links = (menuItems || []).filter(Boolean);

  if (!links.length) {
    return <p>Add links to the "new-main-menu" to show quick links here.</p>;
  }

  return (
    <div className="quick-links">
      {links.map((item) => {
        const normalized = normalizeMenuUrl(item.url, publicStoreDomain);
        if (!normalized) return null;

        if (normalized.external) {
          return (
            <a
              key={item.id}
              href={normalized.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {item.title}
            </a>
          );
        }

        return (
          <Link key={item.id} to={normalized.url}>
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment | null;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link className="featured-collection" to={`/collections/${collection.handle}`}>
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <div>
        <p className="section-eyebrow">Featured collection</p>
        <h1>{collection.title}</h1>
      </div>
    </Link>
  );
}

function getUniqueHandles(handles) {
  const seen = new Set();
  return handles.filter((handle) => {
    if (seen.has(handle)) return false;
    seen.add(handle);
    return true;
  });
}

function getCollectionHandlesFromMenu(items) {
  const handles = [];
  (items || []).forEach((item) => {
    const handle = getCollectionHandleFromUrl(item?.url);
    if (handle) handles.push(handle);
  });
  return handles;
}

function getCollectionHandleFromUrl(url) {
  if (!url) return null;
  try {
    const normalized = url.startsWith('http')
      ? new URL(url)
      : new URL(url, 'https://example.com');
    const match = normalized.pathname.match(/^\/collections\/([^/?#]+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

function normalizeMenuUrl(url, publicStoreDomain) {
  if (!url) return null;

  const isInternalDomain =
    url.includes('myshopify.com') ||
    (publicStoreDomain && url.includes(publicStoreDomain));

  if (url.startsWith('/') || isInternalDomain) {
    try {
      const path = url.startsWith('/') ? url : new URL(url).pathname;
      return {url: path, external: false};
    } catch (error) {
      return {url, external: false};
    }
  }

  return {url, external: true};
}

function buildHomeSectionsQuery(sections) {
  return `#graphql
    ${PRODUCT_ITEM_FRAGMENT}
    query HomeSections($country: CountryCode, $language: LanguageCode)
      @inContext(country: $country, language: $language) {
      ${sections
        .map(
          (section) => `
        ${section.key}: collection(handle: ${JSON.stringify(section.handle)}) {
          id
          title
          handle
          products(first: 10, sortKey: CREATED, reverse: true) {
            nodes {
              ...ProductItem
            }
          }
        }`,
        )
        .join('\n')}
    }
  `;
}

function buildShopByCollectionsQuery(handles) {
  return `#graphql
    query ShopByCollections($country: CountryCode, $language: LanguageCode)
      @inContext(country: $country, language: $language) {
      ${handles
        .map(
          (handle, index) => `
        collection_${index}: collection(handle: ${JSON.stringify(handle)}) {
          id
          title
          handle
          image {
            id
            url
            altText
            width
            height
          }
          products(first: 1, sortKey: CREATED, reverse: true) {
            nodes {
              featuredImage {
                id
                url
                altText
                width
                height
              }
            }
          }
        }`,
        )
        .join('\n')}
    }
  `;
}

const MENU_QUERY = `#graphql
  query Menu($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    menu(handle: $handle) {
      items {
        id
        title
        url
        items {
          id
          title
          url
          items {
            id
            title
            url
          }
        }
      }
    }
  }
`;

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      url
      altText
      width
      height
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      availableForSale
      price {
        amount
        currencyCode
      }
      product {
        title
        handle
      }
      selectedOptions {
        name
        value
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('storefrontapi.generated').MenuItem} MenuItem */
/** @typedef {import('storefrontapi.generated').Collection} Collection */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */

/**
 * @typedef {{
 *  id: string;
 *  title: string;
 *  handle: string;
 *  products: {nodes: ProductItemFragment[]};
 * }} SectionCollection
 */

/**
 * @typedef {{
 *  id: string;
 *  title: string;
 *  handle: string;
 *  image?: {
 *    id: string;
 *    url: string;
 *    altText?: string | null;
 *    width?: number | null;
 *    height?: number | null;
 *  } | null;
 *  products?: {
 *    nodes: {
 *      featuredImage?: {
 *        id: string;
 *        url: string;
 *        altText?: string | null;
 *        width?: number | null;
 *        height?: number | null;
 *      } | null;
 *    }[];
 *  };
 * }} CollectionCard
 */
