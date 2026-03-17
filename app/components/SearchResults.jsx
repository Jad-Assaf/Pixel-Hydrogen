import {Link, useLocation, useNavigate} from 'react-router';
import {useEffect, useMemo, useState} from 'react';
import {urlWithTrackingParams} from '~/lib/search';
import {ProductItem} from '~/components/ProductItem';
import {ArrowIcon} from '~/components/Icons';

const PRODUCTS_PER_PAGE = 30;
const EMPTY_PRODUCTS = [];

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
function SearchResultsProducts({products, term}) {
  const location = useLocation();
  const navigate = useNavigate();
  const productNodes = products?.nodes || EMPTY_PRODUCTS;
  const pagination = products.pagination || {
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    hasMorePages: false,
  };
  const [currentPage, setCurrentPage] = useState(pagination.currentPage);
  const loadedPageCount = Math.max(
    1,
    Math.ceil(productNodes.length / PRODUCTS_PER_PAGE),
  );
  const maxReachablePage = pagination.hasMorePages
    ? loadedPageCount + 1
    : loadedPageCount;
  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return productNodes.slice(start, start + PRODUCTS_PER_PAGE);
  }, [currentPage, productNodes]);

  useEffect(() => {
    setCurrentPage(pagination.currentPage);
  }, [pagination.currentPage, term]);

  if (!productNodes.length) {
    return null;
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < maxReachablePage;
  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), maxReachablePage);
    if (nextPage === currentPage) return;

    const params = new URLSearchParams(location.search);
    if (term) {
      params.set('q', term);
    }
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    } else {
      params.delete('page');
    }
    const query = params.toString();
    const targetPath = query ? `/search?${query}` : '/search';

    if (nextPage > loadedPageCount && pagination.hasMorePages) {
      if (typeof window !== 'undefined') {
        window.scrollTo({top: 0, behavior: 'auto'});
      }
      navigate(targetPath);
      return;
    }

    setCurrentPage(nextPage);

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', targetPath);
      window.scrollTo({top: 0, behavior: 'auto'});
    }
  };

  return (
    <section className="pz-search-group">
      <div className="pz-search-group-head">
        <p className="pz-kicker">Catalog</p>
        <h2>Products</h2>
      </div>
      <section className="pz-shop-products pz-search-products">
        <div className="pz-shop-grid">
          {pagedProducts.map((product, index) => (
            <ProductItem
              key={product.id}
              product={toProductCard(product)}
              loading={index < 6 && currentPage === 1 ? 'eager' : 'lazy'}
            />
          ))}
        </div>

        {maxReachablePage > 1 ? (
          <nav className="pagination pz-page-pagination pz-search-pagination" aria-label="Search products pagination">
            {hasPreviousPage ? (
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                className="pagination-link pz-pagination-direction"
              >
                <ArrowIcon direction="left" />
                <span className="sr-only">Previous</span>
              </button>
            ) : (
              <span className="pagination-link is-disabled pz-pagination-direction">
                <ArrowIcon direction="left" />
                <span className="sr-only">Previous</span>
              </span>
            )}

            <div className="pagination-pages">
              {Array.from({length: maxReachablePage}, (_, index) => {
                const page = index + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    type="button"
                    key={page}
                    className={`pagination-link${isActive ? ' is-active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {hasNextPage ? (
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                className="pagination-link pz-pagination-direction"
              >
                <ArrowIcon direction="right" />
                <span className="sr-only">Next</span>
              </button>
            ) : (
              <span className="pagination-link is-disabled pz-pagination-direction">
                <ArrowIcon direction="right" />
                <span className="sr-only">Next</span>
              </span>
            )}
          </nav>
        ) : null}
      </section>
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
