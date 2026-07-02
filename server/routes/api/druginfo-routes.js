// ===================================================================
// server/routes/api/druginfo-routes.js
// Route for a medication's "use" (what it's for) and appearance description.
// Mounted at "/api/druginfo". PUBLIC (no login required).
// ===================================================================

const router = require('express').Router();
const { getDrugInfo } = require('../../services/drugInfo');

// GET /api/druginfo?name=lisinopril  ->  { name, use, description }
router.route('/').get(async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ errorMessage: 'A medication name is required.' });
  }
  try {
    const info = await getDrugInfo(name);
    return res.json({ name, ...info }); // use and/or description may be null
  } catch (err) {
    console.log('drug info error:', err);
    return res.status(502).json({ errorMessage: 'Could not fetch drug info right now.' });
  }
});

module.exports = router;
