// ===========================================================================
// server/services/drugInfo.js
// Returns two short bits of info about a medication, from the free OpenFDA
// drug-labeling API, in a SINGLE label fetch:
//   - use:         what the drug is for (from "purpose" for OTC drugs, else the
//                  "indications_and_usage" section), e.g. "Acid reducer".
//   - description: what the pill looks like (color/shape/imprint, from the
//                  "how_supplied" section).
// Either can be null when the label doesn't provide it. Cached per drug name.
// ===========================================================================

const { normalizeName } = require('./rxnorm');

const OPENFDA = 'https://api.fda.gov/drug/label.json';
const API_KEY = process.env.OPENFDA_API_KEY; // optional, raises rate limits

// name (lowercased) -> { use, description }
const cache = new Map();

// --- small text helpers ---
const clean = (v) => (Array.isArray(v) ? v.join(' ') : (v || '')).replace(/\s+/g, ' ').trim();
const capFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const truncate = (s, n) => {
  if (s.length <= n) return s;
  let cut = s.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  if (sp > n * 0.6) cut = cut.slice(0, sp); // break on a word boundary when reasonable
  return cut.replace(/[\s,;:]+$/, '') + '…'; // trim trailing punctuation before the ellipsis
};

// Like truncate but WITHOUT an ellipsis — a safety cap for the full "use" text
// (which the client shows on hover), so it can't be unreasonably long.
const softCap = (s, n) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const sp = cut.lastIndexOf(' ');
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:]+$/, '');
};

// --- appearance ("description") from how_supplied ---
const COLORS = 'white|off-white|yellow|pink|blue|green|orange|brown|red|purple|gray|grey|tan|beige|peach|lavender|clear|colorless';

function extractAppearance(text) {
  if (!text) return null;
  const cleaned = clean(text);
  const re = new RegExp(`((?:${COLORS})[^.]*?(?:tablet|capsule|caplet)[^.]*\\.)`, 'i');
  const m = cleaned.match(re);
  if (!m) return null;
  let s = m[1].trim();
  const cut = s.search(/\s(?:packaged|supplied|available|stored?|store|bottles?|ndc)\b/i);
  if (cut > 40) s = s.slice(0, cut).replace(/[,;\s]+$/, '') + '.';
  return capFirst(truncate(s, 280));
}

// --- "use" from purpose (OTC) or indications_and_usage (Rx) ---
function extractUse(purpose, indications) {
  // OTC labels have a short, ready-made "purpose" (e.g. "Pain reliever").
  const p = clean(purpose).replace(/^purpose[s]?:?\s*/i, '').trim();
  if (p) return capFirst(softCap(p, 160));

  // Otherwise pull a brief phrase out of the (verbose) indications section.
  let t = clean(indications);
  if (!t) return null;
  t = t.replace(/^\d+\s*/, '').replace(/^(INDICATIONS AND USAGE|Use\(s\)|Uses?|Indications?)\s*/i, '').trim();

  const m =
    t.match(/indicated\s+(?:for|to|as)\b[:\s]+([^.]*)/i) ||
    t.match(/\b((?:treats?|relieves?|reduces?)\s+[^.]*)/i);
  let use = (m ? m[1] : t.split(/(?<=[.])\s/)[0]) || '';
  use = use.replace(/^the treatment of\s+/i, '').replace(/^:\s*/, '').trim();
  if (!use) return null;
  // Return the complete indication (the client shows a short line + this full text
  // on hover). The high cap is only a safety bound against pathological run-ons.
  return capFirst(softCap(use, 800));
}

// Fetch one OpenFDA label for a generic-name search.
async function fetchLabel(name) {
  let url = `${OPENFDA}?search=openfda.generic_name:"${encodeURIComponent(name)}"&limit=1`;
  if (API_KEY) url += `&api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null; // 404 = no label found
  const json = await res.json();
  return json?.results?.[0] || null;
}

// Public interface: get { use, description } for a medication name.
async function getDrugInfo(rawName) {
  const name = (rawName || '').trim();
  if (!name) return { use: null, description: null };

  const key = name.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  let label = null;
  try {
    label = await fetchLabel(name);
    if (!label) {
      // Fall back to the generic ingredient name (handles brand names).
      const generic = await normalizeName(name);
      if (generic && generic.toLowerCase() !== key) label = await fetchLabel(generic);
    }
  } catch (err) {
    console.log('drug info lookup failed for', name, '-', err.message);
  }

  const info = {
    use: label ? extractUse(label.purpose, label.indications_and_usage) : null,
    description: label ? extractAppearance(label.how_supplied) : null,
  };
  cache.set(key, info);
  return info;
}

module.exports = { getDrugInfo };
