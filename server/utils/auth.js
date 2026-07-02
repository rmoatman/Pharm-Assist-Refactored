// ===========================================================================
// server/utils/auth.js
// This file handles AUTHENTICATION using JWTs (JSON Web Tokens). A JWT is a
// signed string that proves who a user is. This file provides three helpers:
//  - authMiddleware: protects REST routes (checks the cookie token).
//  - authContext:    provides the logged-in user to GraphQL (Apollo) requests.
//  - signToken:      creates a new token when a user logs in or registers.
// ===========================================================================

const jwt = require('jsonwebtoken'); // Library to create (sign) and verify JWT tokens

// set token secret and expiration date
const secret = 'mysecretsshhhhh'; // The secret key used to sign/verify tokens (should be kept private / in an env var)
const expiration = '2h';          // Tokens are valid for 2 hours

module.exports = {
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

  // Apollo Server context function for the GraphQL API: reads a Bearer token
  // (header/query/body) and returns { user } when valid, or {} for public ops.
  authContext: function ({ req }) {
    // Look for the token in the request body, then the query string, then the
    // Authorization header — whichever is found first.
    let token = req.body?.token || req.query?.token || req.headers?.authorization;

    // ["Bearer", "<tokenvalue>"]
    // Auth headers usually look like "Bearer <token>"; strip the "Bearer " prefix
    // to get just the token value. slice(7) drops the first 7 characters.
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    if (!token) {
      // No token: this is a public request, so return context without a user
      return { req };
    }

    try {
      // Verify the token and attach the user data to the GraphQL context
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      return { req, user: data };
    } catch {
      // Invalid/expired token: proceed without a user (some queries are public)
      console.log('Invalid token');
      return { req };
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
