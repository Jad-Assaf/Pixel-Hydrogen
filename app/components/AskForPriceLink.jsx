import {ASK_FOR_PRICE_LABEL, getAskForPriceUrl} from '~/lib/pricing';

export function AskForPriceLink({
  className,
  productHandle,
  children = ASK_FOR_PRICE_LABEL,
}) {
  return (
    <a
      className={className}
      href={getAskForPriceUrl(productHandle)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
