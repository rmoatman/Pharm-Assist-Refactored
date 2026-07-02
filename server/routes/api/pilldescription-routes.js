// ===================================================================
// server/routes/api/pilldescription-routes.js
// Route for looking up a medication's text appearance description.
// Mounted at "/api/pilldescription". PUBLIC (no login required).
// ===================================================================

const router = require('express').Router();
const { getPillDescription } = require('../../services/pillDescription');

// GET /api/pilldescription?name=lisinopril  ->  { name, description }
router.route('/').get(async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ errorMessage: 'A medication name is required.' });
  }
  try {
    const description = await getPillDescription(name);
    return res.json({ name, description }); // description is null when none is available
  } catch (err) {
    console.log('pill description error:', err);
    return res.status(502).json({ errorMessage: 'Could not fetch a description right now.' });
  }
});

module.exports = router;
