// ===========================================================================
// server/services/rxnorm.js
// Normalizes a free-text medication name (a BRAND or a GENERIC) into its generic
// INGREDIENT name, using the free, still-live NLM RxNorm API.
//   e.g. "Coumadin" -> "warfarin",  "Tylenol" -> "acetaminophen"
//
// Why this matters: our interaction data source (OpenFDA drug labels) indexes
// drugs by their GENERIC name, so brand names must be converted first or they
// won't match. If RxNorm can't resolve a name, we fall back to the name as typed.
//
// Results are cached in memory so we don't re-hit RxNorm for the same name.
// (A future upgrade could persist this cache in MongoDB.)
// ===========================================================================

const RXNORM = 'https://rxnav.nlm.nih.gov/REST';

// lowercased input name -> resolved ingredient name (or the original name)
const cache = new Map();

// normalizeName(rawName): resolve a medication name to its generic ingredient.
// Returns a Promise<string|null> (null only if the input is blank).
async function normalizeName(rawName) {
  const name = (rawName || '').trim();
  if (!name) return null;

  const key = name.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  let result = name; // fallback: if RxNorm can't resolve it, use the name as typed
  try {
    // 1) name -> rxcui. search=2 is RxNorm's "normalized" match, which handles
    //    brand names, plurals, and minor spelling differences.
    const idRes = await fetch(`${RXNORM}/rxcui.json?name=${encodeURIComponent(name)}&search=2`);
    if (idRes.ok) {
      const idJson = await idRes.json();
      const rxcui = idJson?.idGroup?.rxnormId?.[0];
      if (rxcui) {
        // 2) rxcui -> ingredient (tty=IN = "ingredient" term type).
        const relRes = await fetch(`${RXNORM}/rxcui/${rxcui}/related.json?tty=IN`);
        if (relRes.ok) {
          const relJson = await relRes.json();
          const grp = relJson?.relatedGroup?.conceptGroup?.find((g) => g.tty === 'IN');
          const ingredient = grp?.conceptProperties?.[0]?.name;
          if (ingredient) result = ingredient;
        }
      }
    }
  } catch (err) {
    // Network/parse problem -> just fall back to the original name.
    console.log('RxNorm normalize failed for', name, '-', err.message);
  }

  cache.set(key, result);
  return result;
}

module.exports = { normalizeName };
