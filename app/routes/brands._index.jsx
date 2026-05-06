import {Link} from 'react-router';
import {BRANDS} from '~/lib/brands';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Pixel Zones | Brands'},
    {
      name: 'description',
      content: 'Browse all brand routes at Pixel Zones.',
    },
  ];
};

export default function BrandsIndexRoute() {
  return (
    <div className="pz-brand-directory">
      <div className="pz-shell">
        <div className="pz-brand-directory-grid pz-brand-directory-grid--logos">
          {BRANDS.map((brand) => (
            <Link
              key={brand.handle}
              to={brand.route}
              prefetch="intent"
              className="pz-brand-directory-logo-card"
              aria-label={`Open ${brand.name}`}
            >
              <div className="pz-brand-directory-logo">
                <img src={brand.logo} alt={brand.name} loading="lazy" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/brands._index').Route} Route */
