// ===================================================================
// server/routes/index.js  (top-level Express router)
// -------------------------------------------------------------------
// This is the main router that the Express server plugs in. It does two
// jobs:
//   1. Send any request starting with /api to the API routes.
//   2. For every other request, serve the built React front-end
//      (single-page app) so the browser gets the app's HTML.
// ===================================================================

// Create a new Express Router. A Router is like a mini-app that groups
// related routes together and can be mounted onto the main server.
const router = require('express').Router();

// Node's built-in "path" module helps build correct file paths that
// work on any operating system (Windows, Mac, Linux).
const path = require('path');

// Import the API sub-router (handles everything under /api).
const apiRoutes = require('./api');

// Mount the API routes: any URL beginning with "/api" is handled by
// apiRoutes (e.g. /api/users/login).
router.use('/api', apiRoutes);

// serve up react front-end in production
// Catch-all handler: for ANY request not matched above, send back the
// React app's built index.html. This lets client-side routing work —
// the browser loads the app and React decides what to show.
// __dirname is this file's folder; we go up two levels to reach the
// client/build folder.
router.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

// Export the configured router so server.js can use it.
module.exports = router;
