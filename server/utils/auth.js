// ===========================================================================
// server/utils/auth.js
// This file handles AUTHENTICATION using JWTs (JSON Web Tokens). A JWT is a
// signed string that proves who a user is. This file provides two helpers:
//  - authMiddleware: protects REST routes (checks the cookie token).
//  - signToken:      creates a new token when a user logs in or registers.
// ===========================================================================

const jwt = require('jsonwebtoken'); // Library to create (sign) and verify JWT tokens

// set token secret and expiration date
// The signing secret comes from the JWT_SECRET environment variable (loaded from
// .env by index.js). The hard-coded string is only a fallback for local dev —
// set a real, long, random JWT_SECRET in production.
const secret = process.env.JWT_SECRET || 'mysecretsshhhhh';
const expiration = '2h';          // Tokens are valid for 2 hours

module.exports = {
  // The JWT signing secret, exported so other modules (e.g. the controller's
  // "loggedin" check) verify tokens with the SAME secret, not a duplicated one.
  secret,
  // Express middleware for the REST routes: verifies the cookie token and
  // attaches req.user, or rejects the request when no valid token is present.
  authMiddleware: function (req, res, next) {
    const token = req.cookies?.token; // Read the token from the request's cookies (?. avoids errors if no cookies)

    if (!token) {
      // No token means the user isn't logged in -> block the request
      return res.status(401).json({ message: 'You need to be logged in!' });
    }

    try {
      // Verify the token; "data" is the payload we stored (username, email, _id).
      // maxAge enforces the expiration window.
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data; // Attach the user info to the request so route handlers can use it
      return next();   // Let the request continue to the actual route
    } catch {
      // Token was present but invalid or expired
      console.log('Invalid token');
      return res.status(401).json({ message: 'Invalid token!' });
    }
  },

  // signToken: create a new JWT for a user.
  // Input: an object with username, email, and _id (extra fields are ignored).
  // Returns: a signed token string that expires after `expiration`.
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id }; // The data to embed inside the token

    // Wrap the payload under a "data" key and sign it with our secret.
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
