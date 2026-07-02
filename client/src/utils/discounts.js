// utils/discounts.js
// Helpers that build "check the discount price" links to prescription-savings
// companies for a given medication. These are just external URLs the user can
// click — no account or API needed.

// Reduce a stored title like "Warfarin sodium 2 mg Oral Tablet" down to a
// searchable drug name ("Warfarin sodium") by cutting at the first strength number.
export function drugSearchName(title = '') {
  const base = String(title).split(/\s*\d/)[0].trim();
  return base || String(title).trim();
}

// GoodRx search handles any term (brand or generic, with or without the salt).
export function goodRxUrl(title) {
  return `https://www.goodrx.com/search?query=${encodeURIComponent(drugSearchName(title))}`;
}

// SingleCare uses /prescription/<slug>; use the first word (the main ingredient).
export function singleCareUrl(title) {
  const slug = drugSearchName(title)
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://www.singlecare.com/prescription/${slug}`;
}
