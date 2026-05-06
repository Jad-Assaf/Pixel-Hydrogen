import {
  INSTAGRAM_FEED_ITEMS,
  INSTAGRAM_PROFILE_URL,
} from '~/lib/instagramFeed';

export function InstagramFeedSection() {
  return (
    <section
      className="pz-home-section pz-home-instagram"
      aria-labelledby="pz-home-instagram-title"
    >
      <div className="pz-shell">
        <header className="pz-instagram-copy">
          <h2 id="pz-home-instagram-title">From Instagram</h2>
          <p>Recent posts from Pixel Zones, loaded without the heavyweight embed.</p>
        </header>

        <div className="pz-instagram-track" role="list" aria-label="Instagram posts">
          {INSTAGRAM_FEED_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pz-instagram-card"
              role="listitem"
              aria-label={item.alt}
            >
              <img
                src={item.image}
                alt={item.alt}
                className="pz-instagram-media"
                loading="lazy"
              />
            </a>
          ))}
        </div>

        <div className="pz-instagram-cta-wrap">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pz-instagram-cta"
          >
            Visit Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
