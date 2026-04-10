import {useRef, useEffect} from 'react';
import {Form} from 'react-router';
import {useAnalytics} from '@shopify/hydrogen';
import {publishSearchSubmitted} from '~/lib/tracking';

/**
 * Search form component that sends search requests to the `/search` route.
 * @example
 * ```tsx
 * <SearchForm>
 *  {({inputRef}) => (
 *    <>
 *      <input
 *        ref={inputRef}
 *        type="search"
 *        defaultValue={term}
 *        name="q"
 *        placeholder="Search…"
 *      />
 *      <button type="submit">Search</button>
 *   </>
 *  )}
 *  </SearchForm>
 * @param {SearchFormProps}
 */
export function SearchForm({children, onSubmit, ...props}) {
  const inputRef = useRef(null);
  const {publish, shop} = useAnalytics();

  useFocusOnCmdK(inputRef);

  if (typeof children !== 'function') {
    return null;
  }

  function handleSubmit(event) {
    onSubmit?.(event);
    if (event.defaultPrevented) return;

    publishSearchSubmitted(publish, {
      searchTerm: new FormData(event.currentTarget).get('q'),
      shop,
    });
  }

  return (
    <Form method="get" {...props} onSubmit={handleSubmit}>
      {children({inputRef})}
    </Form>
  );
}

/**
 * Focuses the input when cmd+k is pressed
 * @param {React.RefObject<HTMLInputElement>} inputRef
 */
function useFocusOnCmdK(inputRef) {
  // focus the input when cmd+k is pressed
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'k' && event.metaKey) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === 'Escape') {
        inputRef.current?.blur();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef]);
}

/**
 * @typedef {Omit<FormProps, 'children'> & {
 *   children: (args: {
 *     inputRef: React.RefObject<HTMLInputElement>;
 *   }) => React.ReactNode;
 * }} SearchFormProps
 */

/** @typedef {import('react-router').FormProps} FormProps */
