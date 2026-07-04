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

// Resolve ONE exact name to its generic ingredient via RxNorm, or null if RxNorm
// can't resolve it. (No caching here — normalizeName caches the final answer.)
async function resolveIngredient(name) {
  try {
    // 1) name -> rxcui. search=2 is RxNorm's "normalized" match, which handles
    //    brand names, plurals, and minor spelling differences.
    const idRes = await fetch(`${RXNORM}/rxcui.json?name=${encodeURIComponent(name)}&search=2`);
    if (!idRes.ok) return null;
    const rxcui = (await idRes.json())?.idGroup?.rxnormId?.[0];
    if (!rxcui) return null;

    // 2) rxcui -> ingredient (tty=IN = "ingredient" term type).
    const relRes = await fetch(`${RXNORM}/rxcui/${rxcui}/related.json?tty=IN`);
    if (!relRes.ok) return null;
    const grp = (await relRes.json())?.relatedGroup?.conceptGroup?.find((g) => g.tty === 'IN');
    return grp?.conceptProperties?.[0]?.name || null;
  } catch (err) {
    // Network/parse problem -> treat as unresolved.
    console.log('RxNorm normalize failed for', name, '-', err.message);
    return null;
  }
}

// Drop a trailing strength/form suffix so a hand-typed dosage still resolves.
// "Ozempic 1 mg" -> "Ozempic", "Metformin 500 mg Oral Tablet" -> "Metformin".
// (Strips from the first standalone number; drug names rarely contain digits.)
const stripDosage = (name) => name.replace(/\s+\d.*$/, '').trim();

// normalizeName(rawName): resolve a medication name to its generic ingredient.
// Returns a Promise<string|null> (null only if the input is blank).
async function normalizeName(rawName) {
  const name = (rawName || '').trim();
  if (!name) return null;

  const key = name.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  // Try the full string first. If RxNorm can't resolve it — often because the
  // user hand-typed a dosage that isn't a real RxNorm product string (e.g.
  // "Ozempic 1 mg") — strip the dosage and retry with the bare drug name so its
  // use + interactions can still be looked up.
  let result = await resolveIngredient(name);
  if (!result) {
    const base = stripDosage(name);
    if (base && base.toLowerCase() !== key) {
      // Use the resolved ingredient if we get one, otherwise the clean base name
      // (still better for the downstream OpenFDA search than "Name 1 mg").
      result = (await resolveIngredient(base)) || base;
    }
  }
  // Last resort: fall back to the name as typed.
  if (!result) result = name;

  cache.set(key, result);
  return result;
}

module.exports = { normalizeName };
