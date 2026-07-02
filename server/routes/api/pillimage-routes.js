// ===================================================================
// server/routes/api/pillimage-routes.js
// Route for looking up a medication's pill/label image. Mounted at
// "/api/pillimage". PUBLIC (no login) — images aren't user-specific.
// ===================================================================

const router = require('express').Router();
const { getPillImage } = require('../../services/pillImage');

// GET /api/pillimage?name=lisinopril  ->  { name, imageUrl }
router.route('/').get(async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ errorMessage: 'A medication name is required.' });
  }
  try {
    const imageUrl = await getPillImage(name);
    return res.json({ name, imageUrl }); // imageUrl is null when no image is available
  } catch (err) {
    console.log('pill image error:', err);
    return res.status(502).json({ errorMessage: 'Could not fetch a pill image right now.' });
  }
});

module.exports = router;
