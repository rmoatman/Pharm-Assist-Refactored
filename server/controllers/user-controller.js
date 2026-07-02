// ===========================================================================
// server/controllers/user-controller.js
// A "controller" holds the FUNCTIONS that run when a REST route is hit. This
// file contains all the user-related logic: getting a user, registering,
// logging in/out, checking if someone is logged in, and adding/removing meds
// from a user's medication list. Each function receives the Express request
// and response objects and sends a response back to the browser.
//
// Note: the request objects below are destructured, e.g. { body }, { user, params }.
// Those properties (body, params, query, user) all come off the Express `req`.
// ===========================================================================

const { User } = require('../models');            // The User Mongoose model (find/create/update users)
const { Medicine } = require('../models');        // The Medicine model (imported but not directly used in this file)
const { signToken, secret } = require('../utils/auth'); // Helper that creates a signed JWT + the shared signing secret
const jwt = require('jsonwebtoken');              // JWT library, used here to verify a token in "loggedin"

// In production the client is served over HTTPS from the same origin, so the
// auth cookie must be Secure + SameSite=None. For local http://localhost dev,
// those flags prevent the browser from storing the cookie, so relax them.
const isProd = process.env.NODE_ENV === 'production'; // true when running in production, false in local dev
const cookieOptions = {
  httpOnly: true,                       // JavaScript in the browser cannot read this cookie (safer against XSS)
  secure: isProd,                       // only send over HTTPS in production
  sameSite: isProd ? 'none' : 'lax',    // 'none' allows cross-site cookies in prod; 'lax' works for local http dev
};

// Export an object where each key is a controller function used by the routes.
module.exports = {
  // getSingleUser: look up ONE user, either by the logged-in user's id, by an
  // id in the URL params, or by a username in the URL params.
  // Inputs: { user, params } from the request; res to send the response.
  async getSingleUser({ user = null, params }, res) {
    const foundUser = await User.findOne({
      // $or means "match ANY of these": use the logged-in user's _id if present,
      // otherwise the id from the URL, OR match on the username from the URL.
      $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
    });

    if (!foundUser) {
      // No matching user -> respond with 400 and an error message
      return res.status(400).json({ message: 'Cannot find a user with this id!' });
    }

    res.json(foundUser); // Send the found user back as JSON
  },

//register
  // register: create a brand-new user account.
  // Input: request body containing the new user's details; res for the response.
  async register({ body }, res) {
    const existingUser = await User.findOne({ email: body.email }); // Is this email already taken?

    if (existingUser)
      // Email already used -> reject with an error message
      return res.status(400).json({
        errorMessage: "There is an existing account associated with this email address."
      });

    const newUser = await User.create(body); // Create the new user in the database

    if (!newUser) {
      // Creation failed for some reason
      return res.status(400).json({ message: 'Something is wrong!' });
    }
    const token = signToken(newUser); // Make a login token so the new user is immediately signed in
    // res.json({ token, newUser });  // (old approach: send token in JSON body — left here as a note)
    res
      .cookie("token", token, cookieOptions) // Store the token in an httpOnly cookie
      .send();                               // Send an empty successful response
  },

//login
  // login: sign an existing user in by checking their email and password.
  // Input: request body with { email, password }; res for the response.
  async login({ body }, res) {
    const user = await User.findOne({ email: body.email }); // Find the user by email

    if(!user) {
      // No user with that email. (Note: uses status 410 "Gone" here, whereas the
      // wrong-password case below uses 401 — slightly inconsistent status codes.)
      return res.status(410).json({ errorMessage: "Incorrect username or password" });
    }

    // Compare the submitted password to the stored (hashed) one.
    // isCorrectPassword is a method defined on the User model.
    const correctPw = await user.isCorrectPassword(body.password);

    if (!correctPw) {
      // Wrong password -> reject with 401 Unauthorized
      return res.status(401).json({ message: "Incorrect username or password" });
    }

    const token = signToken(user); // Password is correct -> create a login token

    res
    .cookie("token", token, cookieOptions) // Store the token in the cookie
    .send();                               // Send an empty successful response
  },

//logout
  // logout: clear the auth cookie so the user is no longer logged in.
  logout(req, res) {
    res.cookie("token", "", {
      ...cookieOptions,        // reuse the same cookie settings...
      expires: new Date(0),    // ...but set an expiry in the past so the browser deletes it
    }).send();
  },

  // loggedin: quick check that tells the front-end whether the current cookie
  // token is valid. Responds with true (logged in) or false (not).
  async loggedin(req, res) {
  try {
    const token = req.cookies.token;    // Read the token from the cookie
    if (!token) return res.json(false); // No token at all -> not logged in

    jwt.verify(token, secret); // Throws if the token is invalid/expired (same secret as utils/auth.js)

    res.send(true);        // Token verified -> logged in
  } catch (err) {
    res.json(false);       // Verification failed -> not logged in
  }
  },

  // saveMed: add a medication to the logged-in user's medList.
  // Inputs: { user } (from auth), { body } (the medicine data); res for response.
  async saveMed({ user, body }, res) {
    console.log(user); // Debug log of the current user
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },                         // find this user
        { $addToSet: { medList: body } },          // add the med to medList (only if not already present)
        { new: true, runValidators: true }         // return the updated doc and enforce schema validation
      );
      return res.json(updatedUser); // Send back the updated user
    } catch (err) {
      console.log(err);
      return res.status(400).json(err); // On error, respond with 400 and the error
    }
  },

  // deleteMed: remove a medication from the logged-in user's medList.
  // Inputs: { user } (from auth), { query } (has the med title to remove); res.
  async deleteMed({ user, query }, res) {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },                                  // find this user
      { $pull: { medList: { title: query.title } } },     // remove any med whose title matches
      { new: true }                                       // return the updated document
    );
    if (!updatedUser) {
      // User not found
      return res.status(404).json({ message: "Couldn't find user with this id!" });
    }
    return res.json(updatedUser); // Send back the updated user
  },
}
