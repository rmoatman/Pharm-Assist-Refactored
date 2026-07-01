const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // Express middleware for the REST routes: verifies the cookie token and
  // attaches req.user, or rejects the request when no valid token is present.
  authMiddleware: function (req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'You need to be logged in!' });
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
      return next();
    } catch {
      console.log('Invalid token');
      return res.status(401).json({ message: 'Invalid token!' });
    }
  },

  // Apollo Server context function for the GraphQL API: reads a Bearer token
  // (header/query/body) and returns { user } when valid, or {} for public ops.
  authContext: function ({ req }) {
    let token = req.body?.token || req.query?.token || req.headers?.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    if (!token) {
      return { req };
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      return { req, user: data };
    } catch {
      console.log('Invalid token');
      return { req };
    }
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
