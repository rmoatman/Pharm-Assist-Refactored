// ===================================================================
// server/routes/api/interaction-routes.js
// Routes for the drug-interaction checker. Mounted at "/api/interactions".
// This is PUBLIC (no authMiddleware) so the homepage checker works without login.
// ===================================================================

const router = require('express').Router();
const { check } = require('../../controllers/interaction-controller');

// POST /api/interactions  -> check a list of medications for interactions
router.route('/').post(check);

module.exports = router;
