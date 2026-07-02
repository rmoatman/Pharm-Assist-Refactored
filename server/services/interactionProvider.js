// ===========================================================================
// server/services/interactionProvider.js
// Detects potential drug–drug interactions using the FREE OpenFDA drug-labeling
// API. Every FDA label has a free-text "drug_interactions" section; we treat two
// drugs as potentially interacting if either one's label text names the other.
//
// This module is a PROVIDER. `checkInteractions(names)` is the public interface.
// To upgrade to a structured/commercial source later (e.g. DrugBank), write a new
// module with the SAME checkInteractions(names) signature and swap it in the
// controller — nothing else has to change.
//
// IMPORTANT: OpenFDA label text is NOT a curated interaction database. It can
// miss interactions or over-report them, so results are informational only
// (that's why the app shows a medical disclaimer everywhere).
//
// Efficiency: we fetch each drug's interaction text ONCE (O(n) API calls), then
// compare every pair locally (cheap). Texts are cached in memory across requests.
// ===========================================================================

const { normalizeName } = require('./rxnorm');

const OPENFDA = 'https://api.fda.gov/drug/label.json';
const MAX_MEDS = 25;          // safety cap so one request can't fan out to huge API usage
const LABELS_PER_DRUG = 5;    // join several labels per drug to widen coverage in one call

// An optional free API key raises OpenFDA's rate limit (1k/day -> 120k/day).
const API_KEY = process.env.OPENFDA_API_KEY;

// ingredient name (lowercased) -> combined "drug_interactions" text ('' if none)
const labelCache = new Map();

// Fetch (and cache) the drug_interactions text for one generic drug name.
async function getInteractionText(name) {
  const key = name.toLowerCase();
  if (labelCache.has(key)) return labelCache.get(key);

  let text = '';
  try {
    let url = `${OPENFDA}?search=openfda.generic_name:"${encodeURIComponent(name)}"&limit=${LABELS_PER_DRUG}`;
    if (API_KEY) url += `&api_key=${API_KEY}`;

    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      // Join the drug_interactions text from each returned label into one blob.
      text = (json?.results || [])
        .map((r) => (Array.isArray(r.drug_interactions) ? r.drug_interactions.join(' ') : (r.drug_interactions || '')))
        .join(' ');
    }
    // NOTE: OpenFDA returns HTTP 404 when there are zero matches. That is not an
    // error for us — it just means we have no label text, so text stays ''.
  } catch (err) {
    console.log('OpenFDA label fetch failed for', name, '-', err.message);
  }

  labelCache.set(key, text);
  return text;
}

// Does `text` mention `drug` as a whole word (case-insensitive)?
function mentions(text, drug) {
  if (!text || !drug) return false;
  const safe = drug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex-special chars
  return new RegExp(`\\b${safe}\\b`, 'i').test(text);
}

// Public interface. Given a list of medication names (brand or generic), returns
// which pairs potentially interact plus how each name was normalized.
async function checkInteractions(medNames) {
  // 1) Normalize to generic ingredient + dedupe (keep the user's original text).
  const seen = new Map(); // ingredient(lowercased) -> { name, input }
  for (const raw of medNames.slice(0, MAX_MEDS)) {
    const name = await normalizeName(raw);
    if (!name) continue;
    const k = name.toLowerCase();
    if (!seen.has(k)) seen.set(k, { name, input: raw });
  }
  const drugs = [...seen.values()];

  // 2) Fetch each drug's interaction text once (in parallel).
  const texts = {};
  await Promise.all(
    drugs.map(async (d) => {
      texts[d.name.toLowerCase()] = await getInteractionText(d.name);
    })
  );

  // 3) Compare every unordered pair; flag if either label names the other.
  const interactions = [];
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const A = drugs[i];
      const B = drugs[j];
      const hit =
        mentions(texts[A.name.toLowerCase()], B.name) ||
        mentions(texts[B.name.toLowerCase()], A.name);
      if (hit) {
        interactions.push({ a: A.name, b: B.name, inputA: A.input, inputB: B.input });
      }
    }
  }

  return {
    normalized: drugs.map((d) => ({ input: d.input, name: d.name })),
    interactions,
    source: 'openFDA drug labeling (informational only)',
  };
}

module.exports = { checkInteractions };
