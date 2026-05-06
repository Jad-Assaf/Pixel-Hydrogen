import {Link} from 'react-router';
import {BRANDS, groupBrandsByFamily} from '~/lib/brands';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Pixel Zones | Brands'},
    {
      name: 'description',
      content:
        'Explore brand landing pages across mobile, audio, gaming, creator tools, and everyday accessories.',
    },
  ];
};

export default function BrandsIndexRoute() {
  const brandGroups = groupBrandsByFamily(BRANDS);

  return (
    <div className="pz-brand-directory">
      <div className="pz-shell">
        <nav className="pz-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" prefetch="intent">
            Home
          </Link>
          <span>/</span>
          <span>Brands</span>
        </nav>

        <header className="pz-brand-directory-hero">
          <div>
            <p className="pz-kicker">Brand Routes</p>
            <h1>Pick a world, not just a logo.</h1>
          </div>
          <p>
            Every brand below now has its own custom page with a tailored visual
            direction and a direct path into the matching collection.
          </p>
        </header>

        {brandGroups.map((group) => (
          <section
            key={group.family}
            className="pz-brand-directory-group"
            aria-labelledby={`brand-group-${group.family}`}
          >
            <div className="pz-brand-directory-head">
              <div>
                <p className="pz-kicker">{group.brands.length} brands</p>
                <h2 id={`brand-group-${group.family}`}>{group.label}</h2>
              </div>
            </div>

            <div className="pz-brand-directory-grid">
              {group.brands.map((brand) => (
                <Link
                  key={brand.handle}
                  to={brand.route}
                  prefetch="intent"
                  className={`pz-brand-directory-card pz-brand-directory-card--${brand.layout}`}
                  style={getBrandThemeVars(brand)}
                >
                  <div className="pz-brand-directory-card-topline">
                    <span>{brand.familyLabel}</span>
                    <strong>Open</strong>
                  </div>
                  <div className="pz-brand-directory-logo">
                    <img src={brand.logo} alt={brand.name} loading="lazy" />
                  </div>
                  <div className="pz-brand-directory-copy">
                    <h3>{brand.name}</h3>
                    <p>{brand.headline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function getBrandThemeVars(brand) {
  return {
    '--brand-accent': brand.palette.accent,
    '--brand-accent-soft': brand.palette.accentSoft,
    '--brand-ink': brand.palette.ink,
    '--brand-surface': brand.palette.surface,
    '--brand-card': brand.palette.card,
    '--brand-glow': brand.palette.glow,
    '--brand-mesh-a': brand.palette.meshA,
    '--brand-mesh-b': brand.palette.meshB,
  };
}

/** @typedef {import('./+types/brands._index').Route} Route */
