import {useFetcher, useNavigate} from 'react-router';
import {useRef, useEffect} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {publishSearchSubmitted} from '~/lib/tracking';

export const SEARCH_ENDPOINT = '/search';

/**
 *  Search form component that sends search requests to the `/search` route
 * @param {SearchFormPredictiveProps}
 */
export function SearchFormPredictive({
  children,
  className = 'predictive-search-form',
  onClose,
  limit = 5,
  ...props
}) {
  const fetcher = useFetcher({key: 'search'});
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const {publish, shop} = useAnalytics();

  /** Navigate to the search page with the current input value */
  function goToSearch(event) {
    event?.preventDefault();
    event?.stopPropagation();
    const term = inputRef?.current?.value?.trim();
    publishSearchSubmitted(publish, {searchTerm: term, shop});
    void navigate(SEARCH_ENDPOINT + (term ? `?q=${encodeURIComponent(term)}` : ''));
    onClose?.();
  }

  /** Fetch search results based on the input value */
  function fetchResults(event) {
    void fetcher.submit(
      {q: event.target.value || '', limit, predictive: true},
      {method: 'GET', action: SEARCH_ENDPOINT},
    );
  }

  // ensure the passed input has a type of search, because SearchResults
  // will select the element based on the input
  useEffect(() => {
    inputRef?.current?.setAttribute('type', 'search');
  }, []);

  if (typeof children !== 'function') {
    return null;
  }

  return (
    <fetcher.Form {...props} className={className} onSubmit={goToSearch}>
      {children({inputRef, fetcher, fetchResults, goToSearch})}
    </fetcher.Form>
  );
}

/**
 * @typedef {(args: {
 *   fetchResults: (event: React.ChangeEvent<HTMLInputElement>) => void;
 *   goToSearch: () => void;
 *   inputRef: React.MutableRefObject<HTMLInputElement | null>;
 *   fetcher: Fetcher<PredictiveSearchReturn>;
 * }) => React.ReactNode} SearchFormPredictiveChildren
 */
/**
 * @typedef {Omit<FormProps, 'children'> & {
 *   children: SearchFormPredictiveChildren | null;
 *   onClose?: () => void;
 *   limit?: number;
 * }} SearchFormPredictiveProps
 */

/** @typedef {import('react-router').FormProps} FormProps */
/** @template T @typedef {import('react-router').Fetcher<T>} Fetcher */
/** @typedef {import('~/lib/search').PredictiveSearchReturn} PredictiveSearchReturn */
