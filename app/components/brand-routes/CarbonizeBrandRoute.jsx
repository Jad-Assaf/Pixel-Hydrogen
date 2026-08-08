import {Analytics} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {BrandVariantCard} from '~/components/brand-routes/BrandVariantCard';
import {getProductCardEntries, withImageWidth} from '~/lib/brand-routes/utils';

const PHONE_GROUPS = [
  {
    id: 'iphone-17',
    label: 'iPhone 17',
    copy: 'Woven and forged carbon for the newest iPhone silhouettes.',
    patterns: [/\biphone\s*17\b/i, /\b17\s*(?:pro|max|air|normal)?\b/i],
  },
  {
    id: 'iphone-16',
    label: 'iPhone 16',
    copy: 'Slim structural protection across the iPhone 16 family.',
    patterns: [/\biphone\s*16\b/i, /\b16\s*(?:pro|max|normal)?\b/i],
  },
  {
    id: 'iphone-15',
    label: 'iPhone 15',
    copy: 'Carbon fiber texture with a precise iPhone 15 fit.',
    patterns: [/\biphone\s*15\b/i, /\b15\s*(?:pro|max|normal)?\b/i],
  },
  {
    id: 'iphone-12-14',
    label: 'iPhone 12, 13 & 14',
    copy: 'Earlier generations, finished in the same real-fiber construction.',
    patterns: [
      /\biphone\s*(?:12|13|14)\b/i,
      /\b(?:12|13|14)\s*(?:pro|max|normal)?\b/i,
    ],
  },
];

export function CarbonizeBrandRoute({brand, products}) {
  const catalog = products || [];
  const phoneCases = catalog.filter(isPhoneCase);
  const aramidCases = phoneCases.filter((product) =>
    hasTerm(product, 'aramid'),
  );
  const carbonCases = phoneCases.filter(
    (product) => !hasTerm(product, 'aramid'),
  );
  const wallets = catalog.filter((product) => hasTerm(product, 'wallet'));
  const wallet3k = wallets.filter((product) =>
    hasAnyTerm(product, ['3k', 'twill']),
  );
  const forgedWallets = wallets.filter((product) => hasTerm(product, 'forged'));
  const keyOrganizers = catalog.filter(isKeyOrganizer);
  const airKeyOrganizers = keyOrganizers.filter(isAirKeyOrganizer);
  const standardKeyOrganizers = keyOrganizers.filter(
    (product) => !isAirKeyOrganizer(product),
  );
  const heroProduct = carbonCases[0] || aramidCases[0] || catalog[0] || null;
  const heroImage =
    heroProduct?.selectedOrFirstAvailableVariant?.image ||
    heroProduct?.featuredImage;

  return (
    <main className="pz-carbonize-page">
      <header className="pz-carbonize-hero">
        {heroImage ? (
          <img
            className="pz-carbonize-hero-product"
            src={withImageWidth(heroImage.url, 1200)}
            alt={heroImage.altText || heroProduct.title}
            width={heroImage.width || 1200}
            height={heroImage.height || 1200}
            loading="eager"
            fetchPriority="high"
          />
        ) : null}
        <div className="pz-carbonize-hero-content">
          <p>Real carbon fiber / everyday equipment</p>
          <h1>CARBONIZE</h1>
          <p className="pz-carbonize-hero-lead">
            Woven strength. Forged character. Built to move with you.
          </p>
          <a href="#phone-cases" className="pz-carbonize-hero-link">
            Explore the collection
          </a>
        </div>
        <div className="pz-carbonize-hero-index" aria-hidden="true">
          <span>3K</span>
          <span>FORGED</span>
          <span>ARAMID</span>
        </div>
      </header>

      <nav className="pz-carbonize-nav" aria-label="Carbonize categories">
        <a href="#phone-cases">Phone cases</a>
        <a href="#aramid-cases">Aramid</a>
        <a href="#wallets">Wallets</a>
        <a href="#key-organizers">Key organizers</a>
      </nav>

      <section id="phone-cases" className="pz-carbonize-section">
        <CarbonizeSectionHeading
          index="01"
          eyebrow="Carbonize phone cases"
          title="The weave follows every generation."
          copy="Real carbon fiber cases organized by iPhone family."
        />

        <div className="pz-carbonize-model-stack">
          {PHONE_GROUPS.map((group, groupIndex) => (
            <CarbonizeProductGroup
              key={group.id}
              brand={brand}
              id={group.id}
              title={group.label}
              copy={group.copy}
              entries={getModelEntries(carbonCases, group.patterns)}
              eager={groupIndex === 0}
            />
          ))}
        </div>
      </section>

      <section
        id="aramid-cases"
        className="pz-carbonize-section pz-carbonize-section--aramid"
      >
        <CarbonizeSectionHeading
          index="02"
          eyebrow="Aramid phone cases"
          title="Aerospace fiber. Almost no bulk."
          copy="Lightweight aramid cases with a dry technical finish and precise fit."
        />
        <CarbonizeProductGrid
          brand={brand}
          products={aramidCases}
          emptyLabel="Aramid phone cases"
        />
      </section>

      <section id="wallets" className="pz-carbonize-section">
        <CarbonizeSectionHeading
          index="03"
          eyebrow="Wallets"
          title="Pocket carry, reduced to structure."
          copy="Choose the ordered 3K weave or the irregular depth of forged carbon."
        />
        <div className="pz-carbonize-split-groups">
          <CarbonizeProductGroup
            brand={brand}
            id="3k-wallets"
            title="3K Wallets"
            copy="A precise twill pattern with a glossy carbon finish."
            entries={getDefaultEntries(wallet3k)}
          />
          <CarbonizeProductGroup
            brand={brand}
            id="forged-wallets"
            title="Forged Wallets"
            copy="Black and colored forged finishes, each with a different fiber field."
            entries={getDefaultEntries(forgedWallets)}
          />
        </div>
      </section>

      <section
        id="key-organizers"
        className="pz-carbonize-section pz-carbonize-section--keys"
      >
        <CarbonizeSectionHeading
          index="04"
          eyebrow="Key organizers"
          title="Quiet the pocket. Keep the hardware."
          copy="Compact carbon systems for a cleaner, more controlled everyday carry."
        />
        <div className="pz-carbonize-split-groups">
          <CarbonizeProductGroup
            brand={brand}
            id="standard-key-organizers"
            title="Key Organizers"
            copy="Lite and Pro formats for compact or expanded key sets."
            entries={getDefaultEntries(standardKeyOrganizers)}
          />
          <CarbonizeProductGroup
            brand={brand}
            id="air-key-organizers"
            title="Air Key Organizers"
            copy="AirKey construction in woven and forged carbon finishes."
            entries={getColorEntries(airKeyOrganizers)}
          />
        </div>
      </section>

      {catalog.length ? (
        <Analytics.ProductView
          data={{
            products: catalog.map((product) => {
              const variant = product.selectedOrFirstAvailableVariant;
              return {
                id: product.id,
                title: product.title,
                price: variant?.price?.amount || '0',
                vendor: product.vendor,
                variantId: variant?.id || '',
                variantTitle: variant?.title || 'Default',
                quantity: 1,
              };
            }),
          }}
        />
      ) : null}
    </main>
  );
}

function CarbonizeSectionHeading({index, eyebrow, title, copy}) {
  return (
    <div className="pz-carbonize-section-heading">
      <span>{index}</span>
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <p className="pz-carbonize-section-copy">{copy}</p>
      </div>
    </div>
  );
}

function CarbonizeProductGroup({brand, id, title, copy, entries, eager}) {
  return (
    <section id={id} className="pz-carbonize-product-group">
      <div className="pz-carbonize-product-group-heading">
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
      {entries.length ? (
        <div className="pz-carbonize-grid">
          {entries.map(({product, variant}, index) => (
            <BrandVariantCard
              key={`${product.id}-${variant.id}`}
              brand={brand}
              product={product}
              variant={variant}
              loading={eager && index < 3 ? 'eager' : 'lazy'}
              showVariantLabel={false}
            />
          ))}
        </div>
      ) : (
        <CarbonizeEmptyState label={title} />
      )}
    </section>
  );
}

function CarbonizeProductGrid({brand, products, emptyLabel}) {
  const entries = getDefaultEntries(products);
  return entries.length ? (
    <div className="pz-carbonize-grid">
      {entries.map(({product, variant}) => (
        <BrandVariantCard
          key={`${product.id}-${variant.id}`}
          brand={brand}
          product={product}
          variant={variant}
          loading="lazy"
          showVariantLabel={false}
        />
      ))}
    </div>
  ) : (
    <CarbonizeEmptyState label={emptyLabel} />
  );
}

function CarbonizeEmptyState({label}) {
  return (
    <div className="pz-carbonize-empty">
      <p>{label} will appear here when available.</p>
      <Link to="/search?q=Carbonize" prefetch="intent">
        Browse all Carbonize products
      </Link>
    </div>
  );
}

function getModelEntries(products, patterns) {
  return products.flatMap((product) => {
    const variants = product.variants?.nodes || [];
    const matchingVariant = variants.find((variant) =>
      patterns.some((pattern) => pattern.test(getVariantSearchText(variant))),
    );
    const titleMatches = patterns.some((pattern) =>
      pattern.test(product.title),
    );
    const variant =
      matchingVariant ||
      (titleMatches ? product.selectedOrFirstAvailableVariant : null);

    return variant ? [{product, variant}] : [];
  });
}

function getDefaultEntries(products) {
  return products.flatMap((product) => {
    const variant = product.selectedOrFirstAvailableVariant;
    return variant ? [{product, variant}] : [];
  });
}

function getColorEntries(products) {
  return products.flatMap((product) =>
    getProductCardEntries(product, 'color').map((variant) => ({
      product,
      variant,
    })),
  );
}

function isPhoneCase(product) {
  const title = product?.title || '';
  return /iphone/i.test(title) && /case|cover/i.test(title);
}

function isKeyOrganizer(product) {
  return /key\s*organizer/i.test(product?.title || '');
}

function isAirKeyOrganizer(product) {
  return /air\s*key|airkey/i.test(product?.title || '');
}

function hasTerm(product, term) {
  return (product?.title || '').toLowerCase().includes(term.toLowerCase());
}

function hasAnyTerm(product, terms) {
  return terms.some((term) => hasTerm(product, term));
}

function getVariantSearchText(variant) {
  return [
    variant?.title,
    ...(variant?.selectedOptions || []).map((option) => option.value),
  ]
    .filter(Boolean)
    .join(' ');
}
