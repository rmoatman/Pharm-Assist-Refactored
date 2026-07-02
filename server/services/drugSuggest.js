// ===========================================================================
// server/services/drugSuggest.js
// Powers the medication-name autocomplete. Given what the user has typed so far
// (e.g. "warf"), it returns medication name + strength suggestions like
// "Warfarin sodium 2 mg Oral Tablet", using the free NLM RxNorm API.
//
// How it works:
//   1) RxNorm's full list of display names (~28k) is fetched once and cached.
//      We prefix-match the typed text against it locally (fast + reliable for
//      partial input, which the approximate-match endpoints are not).
//   2) For the best-matching drug name(s), drugs.json gives the clinical drug
//      products (tty=SCD), which include the available strengths.
// Suggestions are cached per query string.
// ===========================================================================

const RXNORM = 'https://rxnav.nlm.nih.gov/REST';
const MAX = 12;      // most suggestions to return
const MIN_CHARS = 3; // don't search until the user has typed a few characters

// Cached list of all RxNorm display names, and the in-flight fetch promise.
let displayNames = null;
let displayNamesPromise = null;

// lowercased query -> array of suggestion strings
const suggestCache = new Map();

// Fetch the big display-name list once and reuse it.
async function getDisplayNames() {
  if (displayNames) return displayNames;
  if (!displayNamesPromise) {
    displayNamesPromise = (async () => {
      try {
        const res = await fetch(`${RXNORM}/displaynames.json`);
        displayNames = res.ok ? ((await res.json()).displayTermsList?.term || []) : [];
      } catch (err) {
        console.log('displaynames fetch failed -', err.message);
        displayNames = [];
      }
      return displayNames;
    })();
  }
  return displayNamesPromise;
}

// RxNorm uppercases "tall man" letters (e.g. "metFORMIN"); normalize for display.
const cleanCase = (n) => {
  const s = n.toLowerCase().trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Tidy a drug product name ("... 2 MG ..." -> "... 2 mg ...").
const format = (name) => {
  const s = name.replace(/\bMG\b/g, 'mg').replace(/\bML\b/g, 'mL').replace(/\bMCG\b/g, 'mcg');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// First strength number in a name, used for sorting ("2 mg" -> 2).
const strengthOf = (s) => {
  const m = s.match(/([\d.]+)\s*mg/i);
  return m ? parseFloat(m[1]) : Infinity;
};

// Get the clinical-drug product names (with strengths) for a drug name.
async function scdProducts(name) {
  try {
    const res = await fetch(`${RXNORM}/drugs.json?name=${encodeURIComponent(name)}`);
    if (!res.ok) return [];
    const json = await res.json();
    const grp = (json.drugGroup?.conceptGroup || []).find((g) => g.tty === 'SCD');
    const names = (grp?.conceptProperties || []).map((p) => p.name);
    // Prefer single-ingredient products (no "/"); fall back to all if none.
    const single = names.filter((n) => !n.includes('/'));
    return single.length ? single : names;
  } catch (err) {
    return [];
  }
}

async function suggest(rawQ) {
  const q = (rawQ || '').trim();
  if (q.length < MIN_CHARS) return [];

  const key = q.toLowerCase();
  if (suggestCache.has(key)) return suggestCache.get(key);

  let out = [];
  try {
    const names = await getDisplayNames();
    const matches = names.filter((n) => n.toLowerCase().startsWith(key));

    // Prefer single-ingredient base names, shortest first (the "plain" drug).
    const bases = [...new Set(matches.filter((n) => !n.includes('/')).map(cleanCase))]
      .sort((a, b) => a.length - b.length)
      .slice(0, 2);
    const chosen = bases.length ? bases : [...new Set(matches.map(cleanCase))].slice(0, 2);

    // Expand each chosen base name into its strengths.
    for (const base of chosen) {
      const products = await scdProducts(base);
      if (products.length) out.push(...products.map(format));
    }
    // If no product strengths were found at all, fall back to the plain names.
    if (out.length === 0) out = chosen;

    out = [...new Set(out)].sort((a, b) => strengthOf(a) - strengthOf(b)).slice(0, MAX);
  } catch (err) {
    console.log('drug suggest failed for', q, '-', err.message);
  }

  suggestCache.set(key, out);
  return out;
}

// Warm the display-name cache in the background so the first search is fast.
getDisplayNames();

module.exports = { suggest };
