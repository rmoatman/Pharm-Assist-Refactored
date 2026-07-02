// ===========================================================================
// server/services/pillImage.js
// Looks up a photo of a medication using the free NLM DailyMed API. (The old
// NLM Pillbox/RxImage image APIs were retired, so DailyMed is the free option.)
//
// How it works:
//   1) Search DailyMed for drug labels ("SPLs") matching the medication name.
//   2) For a matching label, read its media list and grab the first image.
// The image is served directly by DailyMed, so we just return its URL and let
// the browser load it. Results are cached in memory per drug name.
//
// Caveat: these are label images. For solid oral drugs they usually include a
// pill/capsule photo, but not every drug has one — in that case we return null.
// ===========================================================================

const { normalizeName } = require('./rxnorm');

const DAILYMED = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';
const MAX_LABELS = 3; // how many matching labels to check for an image before giving up

// name (lowercased) -> image URL (or null if none found)
const cache = new Map();

// Try to find an image URL for an exact drug-name search term.
async function findImageForName(name) {
  // 1) Find label setids matching this name.
  const searchUrl = `${DAILYMED}/spls.json?drug_name=${encodeURIComponent(name)}&pagesize=${MAX_LABELS}`;
  const res = await fetch(searchUrl);
  if (!res.ok) return null;
  const json = await res.json();
  const setids = (json?.data || []).map((d) => d.setid).filter(Boolean).slice(0, MAX_LABELS);

  // 2) For each label, look for an image in its media list; return the first one.
  for (const setid of setids) {
    const mres = await fetch(`${DAILYMED}/spls/${setid}/media.json`);
    if (!mres.ok) continue;
    const mjson = await mres.json();
    const img = (mjson?.data?.media || []).find((m) => /image/i.test(m.mime_type || '') && m.url);
    if (img) return img.url;
  }
  return null;
}

// Public interface: get a pill/label image URL for a medication name, or null.
async function getPillImage(rawName) {
  const name = (rawName || '').trim();
  if (!name) return null;

  const key = name.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  let url = null;
  try {
    // Try the name as entered first.
    url = await findImageForName(name);

    // If nothing, fall back to the generic ingredient name (handles brand names).
    if (!url) {
      const generic = await normalizeName(name);
      if (generic && generic.toLowerCase() !== key) {
        url = await findImageForName(generic);
      }
    }
  } catch (err) {
    console.log('pill image lookup failed for', name, '-', err.message);
  }

  cache.set(key, url);
  return url;
}

module.exports = { getPillImage };
