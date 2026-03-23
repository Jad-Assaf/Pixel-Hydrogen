import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  getWishlistFromDocumentCookie,
  subscribeToWishlistChanges,
  toggleWishlistHandle,
} from '~/lib/wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setWishlist(getWishlistFromDocumentCookie());
    return subscribeToWishlistChanges((nextWishlist) => {
      setWishlist(nextWishlist);
    });
  }, []);

  const toggleHandle = useCallback((handle) => {
    const nextWishlist = toggleWishlistHandle(handle);
    setWishlist(nextWishlist);
    return nextWishlist;
  }, []);

  const hasHandle = useCallback(
    (handle) => {
      if (!handle) return false;
      return wishlist.includes(handle);
    },
    [wishlist],
  );

  return useMemo(
    () => ({
      wishlist,
      count: wishlist.length,
      hasHandle,
      toggleHandle,
    }),
    [wishlist, hasHandle, toggleHandle],
  );
}
