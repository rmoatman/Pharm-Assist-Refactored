// ===================================================================
// server/routes/api/drugsuggest-routes.js
// Route for the medication-name autocomplete. Mounted at "/api/drugsuggest".
// PUBLIC (no login required) — it's just a name lookup.
// ===================================================================

const router = require('express').Router();
const { suggest } = require('../../services/drugSuggest');

// GET /api/drugsuggest?q=warf  ->  { suggestions: ["Warfarin sodium 2 mg Oral Tablet", ...] }
router.route('/').get(async (req, res) => {
  const q = req.query.q;
  if (!q || q.trim().length < 3) {
    return res.json({ suggestions: [] }); // too short to search yet
  }
  try {
    const suggestions = await suggest(q);
    return res.json({ suggestions });
  } catch (err) {
    console.log('drugsuggest error:', err);
    return res.status(502).json({ suggestions: [], errorMessage: 'Could not fetch suggestions.' });
  }
});

module.exports = router;
