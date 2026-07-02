// ===================================================================
// server/routes/api/user-routes.js  (user API endpoints)
// -------------------------------------------------------------------
// This file defines all the HTTP routes related to users: registering,
// logging in/out, checking login status, fetching a user, and adding /
// deleting medicines. Each route points to a controller function that
// contains the actual logic. Some routes are protected by
// authMiddleware, which verifies the user's login token first.
//
// Because this router is mounted at "/api/users" (see the parent
// routers), each path below is relative to that. For example
// "/register" here means the full URL "/api/users/register".
// ===================================================================

// Create a mini Express Router for user routes.
const router = require('express').Router();

// Import the controller functions that do the real work for each route.
// (Destructured from the user-controller module.)
const {
  getSingleUser, // fetch the currently logged-in user's data
  saveMed,       // add a medicine to the user's medList
  deleteMed,     // remove a medicine from the user's medList
  login,         // verify credentials and log the user in
  register,      // create a new user account
  logout,        // log the current user out
  loggedin       // report whether a user is currently logged in
} = require('../../controllers/user-controller');

// Import authMiddleware: a gatekeeper function that checks the request
// carries a valid auth token. Put it before a controller to protect
// that route (only logged-in users can reach it).
const { authMiddleware } = require('../../utils/auth');

// http://localhost:3001/api/users
// (Base URL these routes live under during local development.)

// POST /api/users/register  -> create a new account.
router.route('/register').post(register);

// POST /api/users/login     -> log in with username/email + password.
router.route('/login').post(login);

// GET  /api/users/logout    -> log the current user out.
router.route('/logout').get(logout);

// GET  /api/users/loggedin  -> check if someone is currently logged in.
router.route('/loggedin').get(loggedin);

// GET  /api/users/getSingleUser -> get the logged-in user's info.
// Protected: authMiddleware runs first to confirm the token is valid.
router.route('/getSingleUser').get(authMiddleware, getSingleUser);

// POST /api/users/saveMed   -> add a medicine to the user's list.
// Protected by authMiddleware (must be logged in).
router.route('/saveMed').post(authMiddleware, saveMed);

// GET  /api/users/deleteMed -> delete a medicine from the user's list.
// Protected by authMiddleware. (Note: uses GET even though it deletes.)
router.route('/deleteMed').get(authMiddleware, deleteMed);


// Export the router so the API index can mount it.
module.exports = router;

// ---- Reference / earlier versions (all commented out, not active) ----
// import middleware
// const { authMiddleware } = require('../../utils/auth');

// put authMiddleware anywhere we need to send a token for verification of user
// router.route('/').post(createUser).put(authMiddleware, saveMed);

// router.route('/login').post(login);

// router.route('/me').get(authMiddleware, getSingleUser);

// router.route('/medicine/:medicineName').delete(authMiddleware, deleteMed);


