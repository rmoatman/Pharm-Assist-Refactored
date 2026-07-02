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

// Turn a drug name into a URL slug using the first word (the main ingredient),
// e.g. "Warfarin sodium" -> "warfarin". Both sites key their drug pages on this.
function drugSlug(title) {
  return drugSearchName(title)
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// GoodRx: link straight to the drug's price page (goodrx.com/<drug>) so the
// medication is already selected — no search step needed.
export function goodRxUrl(title) {
  return `https://www.goodrx.com/${drugSlug(title)}`;
}

// SingleCare: link to the drug's price page (/prescription/<drug>).
export function singleCareUrl(title) {
  return `https://www.singlecare.com/prescription/${drugSlug(title)}`;
}
