import {Analytics} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {
  BEATS_SECTIONS,
  BeatsBrandRoute,
} from '~/components/brand-routes/BeatsBrandRoute';
import {
  BLACK_SHARK_SECTIONS,
  BlackSharkBrandRoute,
} from '~/components/brand-routes/BlackSharkBrandRoute';
import {
  TORRAS_SECTIONS,
  TorrasBrandRoute,
} from '~/components/brand-routes/TorrasBrandRoute';
import {getBrandByHandle} from '~/lib/brands';
import {
  loadBrandCollection,
  loadBrandProducts,
  loadConfiguredBrandSections,
} from '~/lib/brand-routes/data.server';
import {getBrandThemeVars} from '~/lib/brand-routes/utils';
import brandRouteStyles from '~/styles/brands-handle.css?url';

export function links() {
  return [{rel: 'stylesheet', href: brandRouteStyles}];
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data, params}) => {
  const brandName = data?.brand?.name || params?.handle || 'Brand';
  const description =
    data?.brand?.summary ||
    `Explore curated products and a custom landing page for ${brandName}.`;

  return [
    {title: `Pixel Zones | ${brandName}`},
    {name: 'description', content: description},
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context, params}) {
  const brand = getBrandByHandle(params.handle);

  if (!brand) {
    throw new Response(`Brand ${params.handle} not found`, {status: 404});
  }

  const {storefront} = context;

  if (brand.handle === 'beats') {
    const beatsProducts = await loadBrandProducts(
      storefront,
      BEATS_SECTIONS.flatMap((section) => section.productHandles),
    );

    return {
      brand,
      beatsProducts,
    };
  }

  const collection = await loadBrandCollection(storefront, brand);

  if (brand.handle === 'black-shark') {
    const blackSharkSections = await loadConfiguredBrandSections(
      storefront,
      BLACK_SHARK_SECTIONS,
    );

    return {
      brand,
      collection,
      blackSharkSections,
    };
  }

  if (brand.handle === 'torras') {
    const torrasSections = await loadConfiguredBrandSections(
      storefront,
      TORRAS_SECTIONS,
    );

    return {
      brand,
      collection,
      torrasSections,
    };
  }

  return {
    brand,
    collection,
    products: collection?.products?.nodes || [],
  };
}

export default function BrandRoute() {
  const data = useLoaderData();

  if (data.brand.handle === 'beats') {
    return <BeatsBrandRoute brand={data.brand} products={data.beatsProducts} />;
  }

  if (data.brand.handle === 'black-shark') {
    return (
      <BlackSharkBrandRoute
        brand={data.brand}
        collection={data.collection}
        sections={data.blackSharkSections || []}
      />
    );
  }

  if (data.brand.handle === 'torras') {
    return (
      <TorrasBrandRoute
        brand={data.brand}
        collection={data.collection}
        sections={data.torrasSections || []}
      />
    );
  }

  return (
    <GenericBrandRoute
      brand={data.brand}
      collection={data.collection}
      products={data.products || []}
    />
  );
}

function GenericBrandRoute({brand, collection, products}) {
  const collectionPath = collection?.handle
    ? `/collections/${collection.handle}`
    : `/search?q=${encodeURIComponent(brand.name)}`;
  const primaryActionLabel = collection
    ? `Shop ${brand.name}`
    : `Search ${brand.name}`;
  const style = getBrandThemeVars(brand);

  return (
    <div
      className={`pz-brand-page pz-brand-page--${brand.layout} pz-brand-family--${brand.family}`}
      style={style}
    >
      <div className="pz-shell">
        <nav className="pz-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" prefetch="intent">
            Home
          </Link>
          <span>/</span>
          <Link to="/brands" prefetch="intent">
            Brands
          </Link>
          <span>/</span>
          <span>{brand.name}</span>
        </nav>
      </div>

      <header className="pz-brand-hero">
        <div className="pz-shell pz-brand-hero-shell">
          <div className="pz-brand-hero-copy">
            <p className="pz-brand-eyebrow">{brand.eyebrow}</p>
            <h1>{brand.name}</h1>
            <p className="pz-brand-headline">{brand.headline}</p>
            <p className="pz-brand-summary">{brand.summary}</p>

            <div className="pz-brand-actions">
              <Link
                to={collectionPath}
                prefetch="intent"
                className="pz-brand-cta"
              >
                {primaryActionLabel}
              </Link>
              <Link
                to="/brands"
                prefetch="intent"
                className="pz-brand-cta pz-brand-cta--ghost"
              >
                Browse all brands
              </Link>
            </div>

            <div className="pz-brand-chip-row" aria-label="Brand traits">
              {brand.notes.map((note) => (
                <span key={note} className="pz-brand-chip">
                  {note}
                </span>
              ))}
            </div>
          </div>

          <div className="pz-brand-stage" aria-hidden="true">
            <div className="pz-brand-stage-panel">
              <div className="pz-brand-stage-grid" />
              <div className="pz-brand-stage-logo">
                <img src={brand.logo} alt="" loading="eager" />
              </div>
            </div>

            <div className="pz-brand-stage-stack">
              {brand.focusAreas.map((area) => (
                <article key={area.title} className="pz-brand-stage-card">
                  <strong>{area.title}</strong>
                  <p>{area.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="pz-brand-section pz-brand-products pz-brand-products-only">
        <div className="pz-shell">
          {products.length ? (
            <div className="pz-card-grid">
              {products.map((productItem, index) => (
                <ProductItem
                  key={productItem.id}
                  product={productItem}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  showAddToCart
                />
              ))}
            </div>
          ) : (
            <div className="pz-brand-empty">
              <h3>Collection is being curated.</h3>
              <p>
                Products will appear here as soon as the Shopify collection is
                populated.
              </p>
              <Link
                to={`/search?q=${encodeURIComponent(brand.name)}`}
                prefetch="intent"
              >
                Search {brand.name} products
              </Link>
            </div>
          )}
        </div>
      </section>

      {collection?.id ? (
        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      ) : null}
    </div>
  );
}

/** @typedef {import('./+types/brands.$handle').Route} Route */
