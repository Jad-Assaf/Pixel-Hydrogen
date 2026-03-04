import {Link} from 'react-router';
import {Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams} from '~/lib/search';
import {ProductItem} from '~/components/ProductItem';

/**
 * @param {Omit<SearchResultsProps, 'error' | 'type'>}
 */
export function SearchResults({term, result, children}) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

/**
 * @param {PartialSearchResult<'articles'>}
 */
function SearchResultsArticles({term, articles}) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <section className="pz-search-group">
      <div className="pz-search-group-head">
        <p className="pz-kicker">Content</p>
        <h2>Articles</h2>
      </div>
      <div className="pz-search-list">
        {articles.nodes.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <article className="pz-search-item pz-search-item--simple" key={article.id}>
              <Link prefetch="intent" to={articleUrl}>
                {article.title}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/**
 * @param {PartialSearchResult<'products'>}
 */
function SearchResultsProducts({products}) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <section className="pz-search-group">
      <div className="pz-search-group-head">
        <p className="pz-kicker">Catalog</p>
        <h2>Products</h2>
      </div>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          return (
            <section className="pz-shop-products pz-search-products">
              <div>
                <PreviousLink>
                  {isLoading ? 'Loading...' : <span>Load previous</span>}
                </PreviousLink>
              </div>

              <div className="pz-shop-grid">
                {nodes.map((product) => (
                  <ProductItem
                    key={product.id}
                    product={toProductCard(product)}
                    loading="lazy"
                  />
                ))}
              </div>

              <div>
                <NextLink>
                  {isLoading ? 'Loading...' : <span>Load more</span>}
                </NextLink>
              </div>
            </section>
          );
        }}
      </Pagination>
    </section>
  );
}

function toProductCard(product) {
  const variant = product.selectedOrFirstAvailableVariant || null;
  const variantPrice = variant?.price || null;

  return {
    ...product,
    handle: product.handle,
    featuredImage: variant?.image || null,
    priceRange: variantPrice
      ? {
          minVariantPrice: variantPrice,
          maxVariantPrice: variantPrice,
        }
      : product.priceRange,
    selectedOrFirstAvailableVariant: variant
      ? {
          ...variant,
          availableForSale: variant.availableForSale ?? true,
        }
      : null,
  };
}

function SearchResultsEmpty() {
  return (
    <p className="pz-search-empty">No results yet. Try a different keyword.</p>
  );
}

/** @typedef {RegularSearchReturn['result']['items']} SearchItems */
/**
 * @typedef {Pick<
 *   SearchItems,
 *   ItemType
 * > &
 *   Pick<RegularSearchReturn, 'term'>} PartialSearchResult
 * @template {keyof SearchItems} ItemType
 */
/**
 * @typedef {RegularSearchReturn & {
 *   children: (args: SearchItems & {term: string}) => React.ReactNode;
 * }} SearchResultsProps
 */

/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
