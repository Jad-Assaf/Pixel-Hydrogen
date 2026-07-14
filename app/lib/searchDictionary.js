import MiniSearch from 'minisearch';
import {SEARCH_TERMS} from './searchTerms.generated.js';

const MIN_WORD_LENGTH = 3;
const MIN_CORRECTION_WORD_LENGTH = 2;
const FUZZY_SEARCH_DISTANCE = 0.3;

const SEARCH_ALIASES = new Map(
  Object.entries({
    airpdos: 'airpods',
    airpod: 'airpods',
    airpodspro: 'airpods pro',
    andriod: 'android',
    appel: 'apple',
    aplle: 'apple',
    basues: 'baseus',
    cabe: 'cable',
    chager: 'charger',
    chrager: 'charger',
    cover: 'case',
    galax: 'galaxy',
    huawe: 'huawei',
    huawi: 'huawei',
    iphne: 'iphone',
    iphon: 'iphone',
    iphnoe: 'iphone',
    iphonee: 'iphone',
    magsaf: 'magsafe',
    magsafecharger: 'magsafe charger',
    powerbank: 'power bank',
    powr: 'power',
    promax: 'pro max',
    samasung: 'samsung',
    samsng: 'samsung',
    sasmung: 'samsung',
    screan: 'screen',
    screenprotector: 'screen protector',
    usbc: 'usb c',
    wirless: 'wireless',
    xiamo: 'xiaomi',
    xiomi: 'xiaomi',
  }),
);

/**
 * @param {{
 *   term: string;
 * }} args
 */
export async function getCorrectedSearchTerm({term}) {
  const normalizedTerm = normalizeSearchTerm(term);
  if (!normalizedTerm) return '';

  const aliasTerm = applyAliasCorrections(normalizedTerm);
  if (aliasTerm !== normalizedTerm) return aliasTerm;

  const correctedWords = tokenizeSearchText(normalizedTerm).map((word) =>
    correctSearchWord(word, getCatalogSearchIndex()),
  );
  const correctedTerm = correctedWords.join(' ').trim();

  if (!correctedTerm || correctedTerm === normalizedTerm) {
    return normalizedTerm;
  }

  return correctedTerm;
}

/**
 * @param {string} value
 */
export function normalizeSearchTerm(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * @param {string} term
 */
function applyAliasCorrections(term) {
  const words = tokenizeSearchText(term);
  const corrected = words.flatMap((word) => {
    const alias = SEARCH_ALIASES.get(word);
    return alias ? tokenizeSearchText(alias) : [word];
  });

  return corrected.join(' ');
}

function getCatalogSearchIndex() {
  if (!catalogSearchIndex) {
    catalogSearchIndex = buildCatalogSearchIndex();
  }

  return catalogSearchIndex;
}

function buildCatalogSearchIndex() {
  const words = new Set();

  SEARCH_TERMS.forEach((term) => addWords(words, term));
  for (const alias of SEARCH_ALIASES.values()) {
    addWords(words, alias);
  }

  const documents = Array.from(words).map((term, id) => ({id, term}));
  const index = new MiniSearch({
    fields: ['term'],
    storeFields: ['term'],
    searchOptions: {
      fuzzy: FUZZY_SEARCH_DISTANCE,
      prefix: true,
    },
  });

  index.addAll(documents);

  return {index, words};
}

/**
 * @param {Set<string>} words
 * @param {string | null | undefined} value
 */
function addWords(words, value) {
  tokenizeSearchText(value).forEach((word) => {
    if (word.length >= MIN_WORD_LENGTH || /\d/.test(word)) {
      words.add(word);
    }
  });
}

/**
 * @param {string | null | undefined} value
 */
function tokenizeSearchText(value) {
  return normalizeSearchTerm(value).split(' ').filter(Boolean);
}

/**
 * @param {string} word
 * @param {{index: MiniSearch; words: Set<string>}} dictionary
 */
function correctSearchWord(word, dictionary) {
  if (word.length < MIN_CORRECTION_WORD_LENGTH || dictionary.words.has(word)) {
    return word;
  }

  const [prefixMatch] = dictionary.index.search(word, {
    fuzzy: false,
    prefix: true,
  });

  if (prefixMatch?.term) {
    return prefixMatch.term;
  }

  const [suggestion] = dictionary.index.autoSuggest(word, {
    fuzzy: FUZZY_SEARCH_DISTANCE,
    prefix: true,
  });

  return suggestion?.terms?.[0] || word;
}

let catalogSearchIndex = null;
