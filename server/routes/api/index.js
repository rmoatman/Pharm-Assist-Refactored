// ===================================================================
// server/routes/api/index.js  (API router hub)
// -------------------------------------------------------------------
// This router collects all of the "/api" routes together. Right now it
// only has user-related routes, but new API areas (e.g. medicines,
// admin) would also be mounted here.
// The parent router (routes/index.js) mounts this under "/api", so a
// path here of "/users" becomes "/api/users" overall.
// ===================================================================

// Create a mini Express Router to group the API routes.
const router = require('express').Router();

// Import the user-related routes (register, login, saveMed, etc.).
const userRoutes = require('./user-routes');
// Import the public drug-interaction checker routes.
const interactionRoutes = require('./interaction-routes');


// Mount user routes at "/users". Combined with the "/api" prefix from
// the parent router, these become "/api/users/...".
router.use('/users', userRoutes);

// Mount interaction routes at "/interactions" -> "/api/interactions".
router.use('/interactions', interactionRoutes);

// Export this API router so the parent router can attach it.
module.exports = router;
