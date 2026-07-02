// ===========================================================================
// server/services/pillDescription.js
// Returns a short TEXT description of a medication's physical appearance
// (color / shape / imprint) using the free OpenFDA drug-labeling API.
//
// OpenFDA labels have a "how_supplied" section whose text usually describes what
// the pill looks like, e.g. "...white to off-white, round tablets, imprinted with
// 'H150' on one side...". We pull that text and trim it down to the sentence(s)
// that actually describe appearance. Cached per drug name.
//
// Not every drug's label describes appearance, in which case we return null.
// ===========================================================================

const { normalizeName } = require('./rxnorm');

const OPENFDA = 'https://api.fda.gov/drug/label.json';
const API_KEY = process.env.OPENFDA_API_KEY; // optional, raises rate limits

// name (lowercased) -> description string (or null)
const cache = new Map();

// Color words that typically begin a pill's appearance description.
const COLORS = 'white|off-white|yellow|pink|blue|green|orange|brown|red|purple|gray|grey|tan|beige|peach|lavender|clear|colorless';

// Pull just the appearance clause out of the (noisy) how_supplied text. The
// description almost always reads like "<color> ... tablet/capsule ... imprinted
// with '<code>'.". We capture from the first color word through that sentence's
// end, which skips the surrounding NDC numbers, bottle sizes, and storage text.
function extractAppearance(text) {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const re = new RegExp(`((?:${COLORS})[^.]*?(?:tablet|capsule|caplet)[^.]*\\.)`, 'i');
  const m = cleaned.match(re);
  if (!m) return null; // no recognizable appearance description in this label
  let s = m[1].trim();

  // Cut off trailing packaging/storage noise (bottle sizes, NDC codes, storage).
  const cut = s.search(/\s(?:packaged|supplied|available|stored?|store|bottles?|ndc)\b/i);
  if (cut > 40) s = s.slice(0, cut).replace(/[,;\s]+$/, '') + '.';

  if (s.length > 280) s = s.slice(0, 277).trim() + '…';
  return s.charAt(0).toUpperCase() + s.slice(1); // capitalize first letter
}

// Fetch the raw how_supplied text for an exact generic-name search.
async function fetchHowSupplied(name) {
  let url = `${OPENFDA}?search=openfda.generic_name:"${encodeURIComponent(name)}"&limit=1`;
  if (API_KEY) url += `&api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null; // 404 = no label found
  const json = await res.json();
  const hs = json?.results?.[0]?.how_supplied;
  return Array.isArray(hs) ? hs.join(' ') : (hs || null);
}

// Public interface: get a short appearance description for a medication, or null.
async function getPillDescription(rawName) {
  const name = (rawName || '').trim();
  if (!name) return null;

  const key = name.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  let text = null;
  try {
    text = await fetchHowSupplied(name);
    if (!text) {
      // Fall back to the generic ingredient name (handles brand names).
      const generic = await normalizeName(name);
      if (generic && generic.toLowerCase() !== key) {
        text = await fetchHowSupplied(generic);
      }
    }
  } catch (err) {
    console.log('pill description lookup failed for', name, '-', err.message);
  }

  const description = extractAppearance(text);
  cache.set(key, description);
  return description;
}

module.exports = { getPillDescription };
