import {lazy, Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link, useFetcher, useLoaderData} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {ArrowIcon} from '~/components/Icons';
import {BRANDS} from '~/lib/brands';

const HEADER_MENU_HANDLE = 'new-main-menu';
const PRODUCT_ROW_INITIAL_COUNT = 6;
const PRODUCT_ROW_BATCH_SIZE = 6;
const PRODUCT_ROW_MAX_COUNT = 20;
const EMPTY_PAGE_INFO = {
  hasNextPage: false,
  endCursor: null,
};

const InstagramFeedSection = lazy(() =>
  import('~/components/InstagramFeedSection').then((module) => ({
    default: module.InstagramFeedSection,
  })),
);
const StoreAssistantHomeSection = lazy(() =>
  import('~/components/StoreAssistantSection').then((module) => ({
    default: module.StoreAssistantHomeSection,
  })),
);

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Pixel Zones | Home'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  const {storefront} = context;

  const [homeData, menuData] = await Promise.all([
    storefront.query(HOME_QUERY),
    storefront.query(HOME_MENU_QUERY, {
      cache: storefront.CacheLong(),
      variables: {menuHandle: HEADER_MENU_HANDLE},
    }),
  ]);

  const mainMenuCollections = getMainMenuCollections(menuData?.menu?.items);
  const menuCollectionsPromise = mainMenuCollections.length
    ? fetchMenuCollectionNodes(storefront, mainMenuCollections, {
        queryById: MENU_COLLECTION_META_QUERY,
        queryByHandle: COLLECTION_META_BY_HANDLE_QUERY,
      }).then((nodes) => buildCollectionCards(mainMenuCollections, nodes))
    : Promise.resolve([]);
  const deferredMenuCollectionRows = mainMenuCollections.length
    ? fetchMenuCollectionNodes(storefront, mainMenuCollections, {
        queryById: MENU_COLLECTION_ROWS_QUERY,
        queryByHandle: COLLECTION_ROW_BY_HANDLE_QUERY,
      }).then((nodes) => buildCollectionRows(mainMenuCollections, nodes))
    : Promise.resolve([]);
  const menuCollections = await menuCollectionsPromise;

  return {
    products: homeData?.products?.nodes || [],
    productsPageInfo: normalizeConnectionPageInfo(homeData?.products?.pageInfo),
    menuCollections,
    deferredMenuCollectionRows,
  };
}

export default function Homepage() {
  /**
   * @type {{
   *   products: HomeProduct[];
   *   productsPageInfo: ConnectionPageInfo;
   *   menuCollections: HomeCollectionCard[];
   *   deferredMenuCollectionRows: Promise<HomeCollectionRow[]>;
   * }}
   */
  const data = useLoaderData();
  const products = data.products || [];
  const productsPageInfo = data.productsPageInfo || EMPTY_PAGE_INFO;
  const menuCollections = data.menuCollections || [];
  const carouselBrands = [
    ...BRANDS.map((brand) => ({...brand, copy: 'a'})),
    ...BRANDS.map((brand) => ({...brand, copy: 'b'})),
  ];
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [heroProgressCycle, setHeroProgressCycle] = useState(0);
  const [customersServed, setCustomersServed] = useState(0);
  const [isCustomersInView, setIsCustomersInView] = useState(false);
  const customersSectionRef = useRef(null);
  const heroSwipeStateRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    deltaX: 0,
    hasSwiped: false,
  });

  useEffect(() => {
    if (HERO_SLIDES.length <= 1) return undefined;

    const timeoutId = window.setTimeout(() => {
      setHeroSlideIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [heroSlideIndex]);

  useEffect(() => {
    setHeroProgressCycle((current) => current + 1);
  }, [heroSlideIndex]);

  useEffect(() => {
    const node = customersSectionRef.current;
    if (!node) return undefined;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setIsCustomersInView(Boolean(entry?.isIntersecting));
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const duration = 1600;
    const target = 12000;
    let frameId = 0;

    if (!isCustomersInView) {
      setCustomersServed(0);
      return undefined;
    }

    const startTime = performance.now();
    const tick = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCustomersServed(Math.floor(target * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isCustomersInView]);

  function goToHeroSlide(index) {
    if (!HERO_SLIDES.length) return;
    const total = HERO_SLIDES.length;
    const nextIndex = ((index % total) + total) % total;
    setHeroSlideIndex(nextIndex);
  }

  function goToNextHeroSlide() {
    goToHeroSlide(heroSlideIndex + 1);
  }

  function goToPreviousHeroSlide() {
    goToHeroSlide(heroSlideIndex - 1);
  }

  function handleHeroPointerDown(event) {
    if (HERO_SLIDES.length <= 1) return;

    if (event.pointerType === 'mouse' && event.button !== 0) return;

    heroSwipeStateRef.current.pointerId = event.pointerId;
    heroSwipeStateRef.current.startX = event.clientX;
    heroSwipeStateRef.current.startY = event.clientY;
    heroSwipeStateRef.current.deltaX = 0;
    heroSwipeStateRef.current.hasSwiped = false;
  }

  function handleHeroPointerMove(event) {
    const swipe = heroSwipeStateRef.current;
    if (swipe.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - swipe.startX;
    const deltaY = event.clientY - swipe.startY;

    if (
      !swipe.hasSwiped &&
      Math.abs(deltaX) > HERO_SWIPE_THRESHOLD_PX &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      swipe.hasSwiped = true;
      swipe.deltaX = deltaX;
      if (deltaX < 0) {
        goToNextHeroSlide();
      } else {
        goToPreviousHeroSlide();
      }
      return;
    }

    swipe.deltaX = deltaX;
  }

  function resetHeroSwipe(pointerId) {
    const swipe = heroSwipeStateRef.current;
    if (swipe.pointerId !== pointerId) return;

    window.setTimeout(() => {
      swipe.hasSwiped = false;
    }, 0);

    swipe.pointerId = null;
    swipe.deltaX = 0;
  }

  function handleHeroPointerUp(event) {
    resetHeroSwipe(event.pointerId);
  }

  function handleHeroPointerCancel(event) {
    resetHeroSwipe(event.pointerId);
  }

  function handleHeroSlideClick(event) {
    if (!heroSwipeStateRef.current.hasSwiped) return;
    event.preventDefault();
  }

  return (
    <div className="pz-home">
      <section className="pz-hero">
        <div
          className="pz-hero-slideshow"
          aria-label="Featured banners"
          onPointerDown={handleHeroPointerDown}
          onPointerMove={handleHeroPointerMove}
          onPointerUp={handleHeroPointerUp}
          onPointerCancel={handleHeroPointerCancel}
        >
          {HERO_SLIDES.map((slide, index) => (
            <Link
              key={slide.desktop}
              className={`pz-hero-slide${index === heroSlideIndex ? ' is-active' : ''}`}
              to={slide.href}
              prefetch="intent"
              aria-label={slide.alt}
              onClick={handleHeroSlideClick}
            >
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet={withImageWidth(slide.desktop, 700)}
                />
                <img
                  src={withImageWidth(slide.desktop, 1500)}
                  alt={slide.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : undefined}
                  draggable={false}
                />
              </picture>
            </Link>
          ))}

          {HERO_SLIDES.length > 1 ? (
            <div className="pz-hero-dots" role="tablist" aria-label="Hero slides">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.desktop}
                  type="button"
                  className={`pz-hero-dot${index === heroSlideIndex ? ' is-active' : ''}`}
                  aria-label={`Show slide ${index + 1}: ${slide.alt}`}
                  aria-current={index === heroSlideIndex ? 'true' : undefined}
                  onClick={() => {
                    if (index === heroSlideIndex) {
                      setHeroProgressCycle((current) => current + 1);
                      return;
                    }
                    goToHeroSlide(index);
                  }}
                >
                  {index === heroSlideIndex ? (
                    <span
                      key={`${heroSlideIndex}-${heroProgressCycle}`}
                      className="pz-hero-dot-fill"
                      style={{
                        animationDuration: `${HERO_SLIDE_DURATION_MS}ms`,
                      }}
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="pz-brand-strip">
        <div className="pz-shell">
          <p>Brands</p>
          <div className="pz-brand-carousel" aria-label="Popular brands">
            <div className="pz-brand-track" role="list">
              {carouselBrands.map((brand) => (
                <Link
                  key={`${brand.copy}-${brand.handle}`}
                  to="/brands"
                  prefetch="intent"
                  className="pz-brand-logo-link"
                  role="listitem"
                  aria-label="Browse all brands"
                >
                  <img src={brand.logo} alt={brand.name} loading="lazy" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HomeProductRowSection
        title="New Arrivals"
        kicker="Curated Collection"
        linkTo="/collections/new-arrivals"
        initialProducts={products}
        initialPageInfo={productsPageInfo}
        loadSource={{mode: 'latest'}}
        showControls
      />

      <section className="pz-home-section pz-home-collections">
        <div className="pz-shell">
          <div className="pz-section-head">
            <div>
              <p className="pz-kicker">Shop By Category</p>
              <h2>Main Categories</h2>
            </div>
            {/* <Link to="/collections" prefetch="intent" className="pz-inline-link">
              View All Collections
            </Link> */}
          </div>

          {menuCollections.length ? (
            <div className="pz-collection-card-row">
              {menuCollections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.handle}`}
                  prefetch="intent"
                  className="pz-collection-card"
                >
                  <div className="pz-collection-card-image">
                    {collection.image?.url ? (
                      <img
                        src={withImageWidth(collection.image.url, 200)}
                        alt={collection.image.altText || collection.title}
                        loading="lazy"
                        width={collection.image.width || 200}
                        height={collection.image.height || 200}
                      />
                    ) : (
                      <div
                        className="pz-image-placeholder"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="pz-collection-card-copy">
                    <p>{formatCollectionTitle(collection)}</p>
                    {/* <small>
                      {collection.products.length} product
                      {collection.products.length === 1 ? '' : 's'}
                    </small> */}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="pz-empty">
              Add collections to your main menu to populate this row.
            </p>
          )}
        </div>
      </section>

      {menuCollections.length ? (
        <Suspense fallback={<HomeCollectionRowsSkeleton collections={menuCollections} />}>
          <Await resolve={data.deferredMenuCollectionRows}>
            {(collectionRows) =>
              (collectionRows || [])
                .filter(
                  (collection) =>
                    Array.isArray(collection?.products) &&
                    collection.products.length > 0,
                )
                .map((collection) => (
                  <HomeProductRowSection
                    key={`row-${collection.id}`}
                    className="pz-home-collection-products"
                    title={formatCollectionTitle(collection)}
                    linkTo={`/collections/${collection.handle}`}
                    initialProducts={collection.products}
                    initialPageInfo={collection.productsPageInfo}
                    loadSource={{handle: collection.handle}}
                    itemKeyPrefix={collection.id}
                  />
                ))
            }
          </Await>
        </Suspense>
      ) : null}

      <DeferredHomeSection skeleton={<InstagramFeedSectionSkeleton />}>
        <InstagramFeedSection />
      </DeferredHomeSection>
      <DeferredHomeSection skeleton={<StoreAssistantSectionSkeleton />}>
        <StoreAssistantHomeSection />
      </DeferredHomeSection>

      <section className="pz-home-section pz-home-customers" ref={customersSectionRef}>
        <div className="pz-shell">
          <p className="pz-home-customers-count">
            {customersServed.toLocaleString()}+
          </p>
          <h1>Customers Served</h1>
        </div>
      </section>
    </div>
  );
}

function HomeProductRowSection({
  title,
  kicker,
  linkTo,
  initialProducts,
  initialPageInfo,
  loadSource,
  showControls = false,
  className = '',
  itemKeyPrefix = '',
}) {
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const fetcher = useFetcher();
  const [products, setProducts] = useState(initialProducts || []);
  const [pageInfo, setPageInfo] = useState(initialPageInfo || EMPTY_PAGE_INFO);
  const [hasPrefetchedNearView, setHasPrefetchedNearView] = useState(false);
  const productsRef = useRef(products);
  const pageInfoRef = useRef(pageInfo);
  const fetcherStateRef = useRef(fetcher.state);
  const rowStateKey = `${loadSource.mode || 'collection'}:${loadSource.handle || ''}:${itemKeyPrefix}`;
  const isNearView = useNearViewport(sectionRef, '320px');
  const isLoadingMore = fetcher.state !== 'idle';

  productsRef.current = products;
  pageInfoRef.current = pageInfo;
  fetcherStateRef.current = fetcher.state;

  function loadMoreProducts() {
    if (fetcherStateRef.current !== 'idle') return;
    if (!pageInfoRef.current?.hasNextPage) return;
    if (productsRef.current.length >= PRODUCT_ROW_MAX_COUNT) return;

    const remaining = PRODUCT_ROW_MAX_COUNT - productsRef.current.length;
    const params = new URLSearchParams();
    params.set(
      'limit',
      String(Math.min(PRODUCT_ROW_BATCH_SIZE, remaining)),
    );

    if (pageInfoRef.current?.endCursor) {
      params.set('cursor', pageInfoRef.current.endCursor);
    }

    if (loadSource.mode === 'latest') {
      params.set('mode', 'latest');
    }

    if (loadSource.handle) {
      params.set('handle', loadSource.handle);
    }

    fetcher.load(`/api/home-products?${params.toString()}`);
  }

  useEffect(() => {
    setProducts(initialProducts || []);
    setPageInfo(initialPageInfo || EMPTY_PAGE_INFO);
    setHasPrefetchedNearView(false);
  }, [initialPageInfo, initialProducts, rowStateKey]);

  useEffect(() => {
    if (!fetcher.data) return;
    setProducts((current) => mergeProducts(current, fetcher.data.products || []));
    setPageInfo(normalizeConnectionPageInfo(fetcher.data.pageInfo));
  }, [fetcher.data]);

  useEffect(() => {
    if (!isNearView || hasPrefetchedNearView) return;
    setHasPrefetchedNearView(true);
    loadMoreProducts();
  }, [hasPrefetchedNearView, isNearView]);

  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return undefined;

    const handleScroll = () => {
      const remaining = node.scrollWidth - node.clientWidth - node.scrollLeft;
      if (remaining <= node.clientWidth * 0.75) {
        loadMoreProducts();
      }
    };

    node.addEventListener('scroll', handleScroll, {passive: true});
    return () => node.removeEventListener('scroll', handleScroll);
  }, [products.length, pageInfo.endCursor, pageInfo.hasNextPage]);

  function scrollProducts(direction) {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.clientWidth * 0.85;
    carouselRef.current.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  return (
    <section
      ref={sectionRef}
      className={`pz-home-section ${className}`.trim()}
    >
      <div className="pz-shell">
        <div className={`pz-section-head${showControls ? '' : ' pz-section-head-row'}`}>
          <div>
            {kicker ? <p className="pz-kicker">{kicker}</p> : null}
            <h2>{title}</h2>
          </div>
          {showControls ? (
            <div className="pz-carousel-controls">
              <button
                type="button"
                className="pz-carousel-btn"
                onClick={() => scrollProducts('prev')}
                aria-label="Previous products"
              >
                <ArrowIcon direction="left" />
                <span className="sr-only">Previous</span>
              </button>
              <button
                type="button"
                className="pz-carousel-btn"
                onClick={() => scrollProducts('next')}
                aria-label="Next products"
              >
                <ArrowIcon direction="right" />
                <span className="sr-only">Next</span>
              </button>
              <Link
                to={linkTo}
                prefetch="intent"
                className="pz-inline-link"
              >
                View All
              </Link>
            </div>
          ) : (
            <Link
              to={linkTo}
              prefetch="intent"
              className="pz-inline-link"
            >
              View All
            </Link>
          )}
        </div>

        {products.length ? (
          <div
            className={`pz-product-carousel${
              showControls ? '' : ' pz-collection-product-carousel'
            }`}
            ref={carouselRef}
          >
            {products.map((product, index) => (
              <div
                className="pz-product-carousel-item"
                key={`${itemKeyPrefix || title}-${product.id}`}
              >
                <ProductItem
                  product={product}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  showAddToCart
                />
              </div>
            ))}

            {isLoadingMore
              ? Array.from({
                  length: Math.min(
                    PRODUCT_ROW_BATCH_SIZE,
                    Math.max(0, PRODUCT_ROW_MAX_COUNT - products.length),
                  ),
                }).map((_, index) => (
                  <div
                    className="pz-product-carousel-item"
                    key={`${rowStateKey}-loading-${index}`}
                    aria-hidden="true"
                  >
                    <ProductCardSkeleton />
                  </div>
                ))
              : null}
          </div>
        ) : (
          <p className="pz-empty">
            Add products to your store to populate this section.
          </p>
        )}
      </div>
    </section>
  );
}

function DeferredHomeSection({children, skeleton}) {
  const sectionRef = useRef(null);
  const shouldLoad = useNearViewport(sectionRef, '420px');

  return (
    <div ref={sectionRef} className="pz-home-deferred">
      {shouldLoad ? <Suspense fallback={skeleton}>{children}</Suspense> : skeleton}
    </div>
  );
}

function HomeCollectionRowsSkeleton({collections}) {
  return (collections || []).map((collection) => (
    <HomeProductRowSectionSkeleton
      key={`row-skeleton-${collection.id}`}
      className="pz-home-collection-products"
      title={formatCollectionTitle(collection)}
    />
  ));
}

function HomeProductRowSectionSkeleton({title, kicker, className = ''}) {
  const titleWidth = `${Math.min(Math.max(title.length + 2, 12), 28)}ch`;

  return (
    <section
      className={`pz-home-section ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="pz-shell">
        <div className="pz-section-head pz-section-head-row pz-home-row-skeleton-head">
          <div className="pz-home-row-skeleton-copy">
            {kicker ? (
              <span
                className="pz-skeleton-block pz-home-row-skeleton-kicker"
                style={{width: `${Math.min(Math.max(kicker.length + 2, 10), 20)}ch`}}
              />
            ) : null}
            <span
              className="pz-skeleton-block pz-home-row-skeleton-title"
              style={{width: titleWidth}}
            />
          </div>
          <span className="pz-skeleton-block pz-home-row-skeleton-link" />
        </div>
        <div className="pz-product-carousel pz-collection-product-carousel">
          {Array.from({length: PRODUCT_ROW_INITIAL_COUNT}, (_, index) => (
            <div
              className="pz-product-carousel-item"
              key={`row-skeleton-card-${title}-${index}`}
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstagramFeedSectionSkeleton() {
  return (
    <section
      className="pz-home-section pz-home-instagram pz-instagram-skeleton-section"
      aria-hidden="true"
    >
      <div className="pz-shell">
        <div className="pz-instagram-copy">
          <span className="pz-skeleton-block pz-skeleton-title" />
          <span className="pz-skeleton-block pz-skeleton-copy" />
        </div>
        <div className="pz-instagram-track">
          {Array.from({length: 6}, (_, index) => (
            <div
              key={`instagram-skeleton-${index}`}
              className="pz-instagram-card is-skeleton"
            >
              <span className="pz-skeleton-block pz-skeleton-fill" />
            </div>
          ))}
        </div>
        <div className="pz-instagram-cta-wrap">
          <span className="pz-skeleton-block pz-skeleton-button" />
        </div>
      </div>
    </section>
  );
}

function StoreAssistantSectionSkeleton() {
  return (
    <section
      className="pz-home-section pz-home-chatbot pz-home-chatbot-skeleton"
      aria-hidden="true"
    >
      <div className="pz-shell">
        <div className="pz-home-chatbot-intro">
          <span className="pz-skeleton-block pz-skeleton-kicker-dot" />
          <span className="pz-skeleton-block pz-skeleton-chatbot-title" />
          <span className="pz-skeleton-block pz-skeleton-chatbot-copy" />
        </div>
        <div className="pz-chatbot-shell pz-home-chatbot-panel">
          <div className="pz-chatbot-head">
            <span className="pz-skeleton-block pz-skeleton-panel-title" />
          </div>
          <div className="pz-chatbot-thread">
            <span className="pz-skeleton-block pz-skeleton-bubble is-wide" />
            <span className="pz-skeleton-block pz-skeleton-bubble is-mid" />
            <span className="pz-skeleton-block pz-skeleton-bubble is-short" />
          </div>
          <div className="pz-chatbot-form">
            <span className="pz-skeleton-block pz-skeleton-input" />
            <span className="pz-skeleton-block pz-skeleton-send" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <article className="pz-product-card pz-product-card-skeleton">
      <div className="pz-product-media">
        <span className="pz-skeleton-block pz-skeleton-product-media" />
      </div>
      <div className="pz-product-meta">
        <span className="pz-skeleton-block pz-skeleton-product-vendor" />
        <span className="pz-skeleton-block pz-skeleton-product-title" />
        <span className="pz-skeleton-block pz-skeleton-product-title is-secondary" />
      </div>
      <div className="pz-product-card-footer">
        <span className="pz-skeleton-block pz-skeleton-product-swatches" />
        <span className="pz-skeleton-block pz-skeleton-product-price" />
      </div>
      <span className="pz-skeleton-block pz-skeleton-product-add" />
    </article>
  );
}

function getMainMenuCollections(items) {
  const seen = new Set();

  return (items || [])
    .map((item) => {
      if (!item) return null;

      const handle = getCollectionHandleFromMenuUrl(item.url);
      const hasCollectionReference =
        (item.type === 'COLLECTION' && item.resourceId) || handle;

      if (!hasCollectionReference) return null;

      return {
        id: item.id,
        title: item.title,
        resourceId: item.resourceId || null,
        handle: handle ? handle.toLowerCase() : null,
      };
    })
    .filter(Boolean)
    .filter((item) => {
      const key = item.resourceId || item.handle;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

async function fetchMenuCollectionNodes(storefront, menuItems, queries) {
  const itemsWithIds = menuItems.filter((item) => item.resourceId);
  const itemsWithoutIds = menuItems.filter(
    (item) => !item.resourceId && item.handle,
  );

  let collectionsById = [];
  let collectionsByHandle = [];

  if (itemsWithIds.length) {
    const {nodes} = await storefront.query(queries.queryById, {
      cache: storefront.CacheLong(),
      variables: {ids: itemsWithIds.map((item) => item.resourceId)},
    });
    collectionsById = nodes || [];
  }

  if (itemsWithoutIds.length) {
    const handleResults = await Promise.all(
      itemsWithoutIds.map((item) =>
        storefront
          .query(queries.queryByHandle, {
            cache: storefront.CacheLong(),
            variables: {handle: item.handle},
          })
          .catch(() => null),
      ),
    );

    collectionsByHandle = handleResults
      .map((result) => result?.collection)
      .filter(Boolean);
  }

  return [...collectionsById, ...collectionsByHandle];
}

function formatCollectionTitle(collection) {
  const rawTitle =
    typeof collection?.title === 'string' ? collection.title.trim() : '';
  return rawTitle;
}

function buildCollectionCards(menuItems, nodes) {
  const lookups = createCollectionLookups(nodes);

  return menuItems
    .map((item) => {
      const collection = getMenuCollectionMatch(item, lookups);
      if (!collection?.handle) return null;

      return {
        id: collection.id,
        title: collection.title || item.title,
        handle: collection.handle,
        image: pickCollectionImage(collection),
      };
    })
    .filter(Boolean);
}

function buildCollectionRows(menuItems, nodes) {
  const lookups = createCollectionLookups(nodes);

  return menuItems
    .map((item) => {
      const collection = getMenuCollectionMatch(item, lookups);
      if (!collection?.handle) return null;

      return {
        id: collection.id,
        title: collection.title || item.title,
        handle: collection.handle,
        image: pickCollectionImage(collection),
        products: collection.products?.nodes || [],
        productsPageInfo: normalizeConnectionPageInfo(collection.products?.pageInfo),
      };
    })
    .filter(Boolean);
}

function createCollectionLookups(nodes) {
  const collectionNodes = (nodes || []).filter(
    (node) => node?.__typename === 'Collection',
  );

  return {
    collectionById: new Map(
      collectionNodes.map((collection) => [collection.id, collection]),
    ),
    collectionByHandle: new Map(
      collectionNodes
        .filter((collection) => collection?.handle)
        .map((collection) => [collection.handle.toLowerCase(), collection]),
    ),
  };
}

function getMenuCollectionMatch(item, lookups) {
  return (
    (item.resourceId ? lookups.collectionById.get(item.resourceId) : null) ||
    (item.handle
      ? lookups.collectionByHandle.get(item.handle.toLowerCase())
      : null)
  );
}

function normalizeConnectionPageInfo(pageInfo) {
  return {
    hasNextPage: Boolean(pageInfo?.hasNextPage),
    endCursor: pageInfo?.endCursor || null,
  };
}

function mergeProducts(currentProducts, nextProducts) {
  const seen = new Set();
  return [...(currentProducts || []), ...(nextProducts || [])].filter((product) => {
    if (!product?.id || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

function useNearViewport(ref, rootMargin = '320px') {
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (isNearViewport) return undefined;
    const node = ref.current;
    if (!node || typeof window === 'undefined') return undefined;
    if (typeof window.IntersectionObserver !== 'function') {
      setIsNearViewport(true);
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsNearViewport(true);
        observer.disconnect();
      },
      {rootMargin},
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isNearViewport, ref, rootMargin]);

  return isNearViewport;
}

function pickCollectionImage(collection) {
  const candidates = [
    collection?.image,
    collection?.latestProduct?.nodes?.[0]?.featuredImage,
    collection?.products?.nodes?.[0]?.featuredImage,
  ];

  return candidates.find((image) => image?.url) || null;
}

function getCollectionHandleFromMenuUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url, 'https://example.com');
    const match = parsed.pathname.match(/\/collections\/([^/]+)/i);
    if (!match?.[1]) return null;
    const handle = decodeURIComponent(match[1]);
    if (!handle || handle.toLowerCase() === 'all') return null;
    return handle;
  } catch {
    return null;
  }
}

function withImageWidth(url, width) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}`;
}

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(
      first: 6
      sortKey: CREATED_AT
      reverse: true
    ) {
      nodes {
        ...HomeProductCard
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }

  fragment HomeMoney on MoneyV2 {
    amount
    currencyCode
  }

  fragment HomeProductCard on Product {
    id
    handle
    title
    vendor
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...HomeMoney
      }
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      image {
        id
        altText
        url
        width
        height
      }
      selectedOptions {
        name
        value
      }
      price {
        ...HomeMoney
      }
      compareAtPrice {
        ...HomeMoney
      }
    }
    variants(first: 12) {
      nodes {
        id
        title
        availableForSale
        image {
          id
          altText
          url
          width
          height
        }
        selectedOptions {
          name
          value
        }
        price {
          ...HomeMoney
        }
        compareAtPrice {
          ...HomeMoney
        }
      }
    }
  }
`;

const HOME_MENU_QUERY = `#graphql
  query HomeMenu(
    $country: CountryCode
    $language: LanguageCode
    $menuHandle: String!
  ) @inContext(country: $country, language: $language) {
    menu(handle: $menuHandle) {
      id
      items {
        id
        title
        type
        resourceId
        url
      }
    }
  }
`;

const MENU_COLLECTION_META_QUERY = `#graphql
  query HomeMenuCollectionMeta(
    $country: CountryCode
    $language: LanguageCode
    $ids: [ID!]!
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      __typename
      ...HomeMenuCollectionMetaNode
    }
  }

  fragment HomeMenuCollectionMetaNode on Collection {
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    latestProduct: products(first: 1, sortKey: CREATED, reverse: true) {
      nodes {
        featuredImage {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

const COLLECTION_META_BY_HANDLE_QUERY = `#graphql
  query HomeCollectionMetaByHandle(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      __typename
      id
      title
      handle
      image {
        url
        altText
        width
        height
      }
      latestProduct: products(first: 1, sortKey: CREATED, reverse: true) {
        nodes {
          featuredImage {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

const MENU_COLLECTION_ROWS_QUERY = `#graphql
  query HomeMenuCollections(
    $country: CountryCode
    $language: LanguageCode
    $ids: [ID!]!
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      __typename
      ...HomeMenuCollectionNode
    }
  }

  fragment HomeMenuCollectionNode on Collection {
    id
    title
    handle
    products(first: 6, sortKey: BEST_SELLING) {
      nodes {
        ...HomeCollectionProductCard
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }

  fragment HomeCollectionMoney on MoneyV2 {
    amount
    currencyCode
  }

  fragment HomeCollectionProductCard on Product {
    id
    handle
    title
    vendor
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...HomeCollectionMoney
      }
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      image {
        id
        altText
        url
        width
        height
      }
      selectedOptions {
        name
        value
      }
      price {
        ...HomeCollectionMoney
      }
      compareAtPrice {
        ...HomeCollectionMoney
      }
    }
    variants(first: 12) {
      nodes {
        id
        title
        availableForSale
        image {
          id
          altText
          url
          width
          height
        }
        selectedOptions {
          name
          value
        }
        price {
          ...HomeCollectionMoney
        }
        compareAtPrice {
          ...HomeCollectionMoney
        }
      }
    }
  }
`;

const COLLECTION_ROW_BY_HANDLE_QUERY = `#graphql
  query HomeCollectionRowByHandle(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      __typename
      id
      title
      handle
      products(first: 6, sortKey: BEST_SELLING) {
        nodes {
          id
          handle
          title
          vendor
          featuredImage {
            id
            altText
            url
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          selectedOrFirstAvailableVariant {
            id
            availableForSale
            image {
              id
              altText
              url
              width
              height
            }
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
          variants(first: 12) {
            nodes {
              id
              title
              availableForSale
              image {
                id
                altText
                url
                width
                height
              }
              selectedOptions {
                name
                value
              }
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const HERO_SLIDES = [
  {
    href: '/collections/aulumu-products',
    desktop: 'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/aulumu-desktop.jpg?v=1773951906',
    alt: 'Aulumu banner',
  },
  {
    href: '/products/nothing-headphone-1-headphones',
    desktop: 'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/nothing-desk.jpg?v=1773951906',
    alt: 'Nothing banner',
  },
  {
    href: '/collections/moft-products',
    desktop: 'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/moft-desk.jpg?v=1773951906',
    alt: 'Moft banner',
  },
  {
    href: '/collections/dji-products',
    desktop: 'https://cdn.shopify.com/s/files/1/0769/7317/9187/files/dji-desk.jpg?v=1773951907',
    alt: 'DJI banner',
  },
];

const HERO_SLIDE_DURATION_MS = 4200;
const HERO_SWIPE_THRESHOLD_PX = 46;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').HomeProductCardFragment} HomeProduct */
/**
 * @typedef {{
 *   hasNextPage: boolean;
 *   endCursor: string | null;
 * }} ConnectionPageInfo
 */
/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   handle: string;
 *   image: {
 *     url?: string;
 *     altText?: string | null;
 *     width?: number | null;
 *     height?: number | null;
 *   } | null;
 * }} HomeCollectionCard
 */
/**
 * @typedef {{
 *   id: string;
 *   title: string;
  *   handle: string;
 *   image: {
 *     url?: string;
 *     altText?: string | null;
 *     width?: number | null;
 *     height?: number | null;
 *   } | null;
 *   products: HomeProduct[];
 *   productsPageInfo: ConnectionPageInfo;
 * }} HomeCollectionRow
 */
