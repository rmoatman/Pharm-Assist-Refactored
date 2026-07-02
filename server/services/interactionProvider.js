// ===========================================================================
// server/services/interactionProvider.js
// Detects potential drug–drug interactions using the FREE OpenFDA drug-labeling
// API. Every FDA label has a free-text "drug_interactions" section; we treat two
// drugs as potentially interacting if EITHER drug's labels name the other.
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
// Approach: for each PAIR of drugs we run a single OpenFDA search that asks
// "does drug A's label mention drug B, OR does drug B's label mention drug A?"
// across the WHOLE label corpus. Searching all labels (rather than a small
// sample) is what lets us catch one-directional cases like acetaminophen↔warfarin
// (acetaminophen labels mention warfarin, but not vice-versa). Pair results are
// cached in memory so repeated checks are instant.
// ===========================================================================

const { normalizeName } = require('./rxnorm');

const OPENFDA = 'https://api.fda.gov/drug/label.json';
const MAX_MEDS = 20;      // safety cap so one request can't fan out to huge API usage
const CONCURRENCY = 6;    // how many pair lookups to run at once (be gentle on the API)

// An optional free API key raises OpenFDA's rate limit (1k/day -> 120k/day).
const API_KEY = process.env.OPENFDA_API_KEY;

// sorted "a|b" pair key -> boolean (do they interact?)
const pairCache = new Map();

// Run async `fn` over `items` with a limited number in flight at once.
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// Does either drug's FDA label name the other? One OpenFDA query, both directions.
async function pairInteracts(a, b) {
  const key = [a.toLowerCase(), b.toLowerCase()].sort().join('|');
  if (pairCache.has(key)) return pairCache.get(key);

  // Strip any double-quotes from names so they can't break the quoted query.
  const qa = a.replace(/"/g, '');
  const qb = b.replace(/"/g, '');

  let hit = false;
  try {
    const search =
      `(openfda.generic_name:"${qa}" AND drug_interactions:"${qb}")` +
      ` OR ` +
      `(openfda.generic_name:"${qb}" AND drug_interactions:"${qa}")`;
    let url = `${OPENFDA}?search=${encodeURIComponent(search)}&limit=1`;
    if (API_KEY) url += `&api_key=${API_KEY}`;

    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      hit = (json?.meta?.results?.total || 0) > 0;
    }
    // NOTE: OpenFDA returns HTTP 404 when there are zero matches — that just means
    // "no interaction found," not an error, so `hit` stays false.
  } catch (err) {
    console.log('OpenFDA pair check failed for', a, '+', b, '-', err.message);
  }

  pairCache.set(key, hit);
  return hit;
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

  // 2) Build the list of unordered pairs to check.
  const pairs = [];
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      pairs.push([drugs[i], drugs[j]]);
    }
  }

  // 3) Check each pair (with limited concurrency) and keep the ones that interact.
  const flags = await mapWithConcurrency(pairs, CONCURRENCY, async ([A, B]) => {
    const interacts = await pairInteracts(A.name, B.name);
    return interacts ? { a: A.name, b: B.name, inputA: A.input, inputB: B.input } : null;
  });

  return {
    normalized: drugs.map((d) => ({ input: d.input, name: d.name })),
    interactions: flags.filter(Boolean),
    source: 'openFDA drug labeling (informational only)',
  };
}

module.exports = { checkInteractions };
