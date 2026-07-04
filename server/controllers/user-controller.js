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
const { signToken, secret } = require('../utils/auth'); // Helper that creates a signed JWT + the shared signing secret
const jwt = require('jsonwebtoken');              // JWT library, used here to verify a token in "loggedin"
const crypto = require('crypto');                 // Node's built-in crypto: random reset tokens + hashing
const { sendPasswordResetEmail } = require('../utils/mailer'); // Sends the password-reset email (Gmail/Nodemailer)

// Hash a reset token with SHA-256. The raw token (high-entropy random bytes) is
// emailed to the user; only this hash is stored, so the DB alone can't reset a
// password. SHA-256 (fast, unsalted) is fine here BECAUSE the token is random
// and long — unlike passwords, it isn't guessable/brute-forceable.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// How long a reset link stays valid: 1 hour.
const RESET_TTL_MS = 60 * 60 * 1000;

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
  // getSingleUser: look up ONE user, either by the logged-in user's id or by an
  // id in the URL params.
  // Inputs: { user, params } from the request; res to send the response.
  async getSingleUser({ user = null, params }, res) {
    const foundUser = await User.findOne({
      // Use the logged-in user's _id if present, otherwise the id from the URL.
      _id: user ? user._id : params.id,
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
    // Basic input validation before we touch the database.
    const { firstName, lastName, email, password } = body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ errorMessage: "All fields are required." });
    }
    if (!/.+@.+\..+/.test(email)) {
      return res.status(400).json({ errorMessage: "Please enter a valid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ errorMessage: "Password must be at least 6 characters." });
    }

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
    // Both fields are required to attempt a login.
    if (!body.email || !body.password) {
      return res.status(400).json({ errorMessage: "Email and password are required." });
    }

    const user = await User.findOne({ email: body.email }); // Find the user by email

    if(!user) {
      // Use 401 for BOTH unknown email and wrong password: consistent status
      // codes, and we avoid revealing which email addresses have accounts.
      return res.status(401).json({ errorMessage: "Incorrect email or password" });
    }

    // Compare the submitted password to the stored (hashed) one.
    // isCorrectPassword is a method defined on the User model.
    const correctPw = await user.isCorrectPassword(body.password);

    if (!correctPw) {
      // Wrong password -> reject with 401 Unauthorized
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const token = signToken(user); // Password is correct -> create a login token

    res
    .cookie("token", token, cookieOptions) // Store the token in the cookie
    .send();                               // Send an empty successful response
  },

  // requestReset: start the forgot-password flow. Takes an email, and IF an
  // account exists, generates a one-time reset token, stores its hash + expiry,
  // and emails the user a reset link. Always responds the SAME way regardless of
  // whether the email exists, so the endpoint can't be used to discover which
  // addresses have accounts. Takes the full req so we can build an absolute link.
  async requestReset(req, res) {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ errorMessage: 'Email is required.' });
    }
    // Generic reply used in every non-error case (found or not).
    const generic = { message: 'If an account exists for that email, a reset link is on its way.' };

    try {
      const user = await User.findOne({ email });
      if (user) {
        // Random, high-entropy token: emailed raw, stored only as a hash.
        const rawToken = crypto.randomBytes(32).toString('hex');
        user.resetTokenHash = hashToken(rawToken);
        user.resetTokenExpires = new Date(Date.now() + RESET_TTL_MS);
        await user.save(); // pre('save') won't re-hash the password (it's unchanged)

        // Build the link to the client reset page. CLIENT_URL is set in .env for
        // dev (the React server) and prod; fall back to this request's origin.
        const base = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
        const resetUrl = `${base}/reset-password?token=${rawToken}`;

        // Don't let an email failure reveal anything or 500 the request.
        try {
          await sendPasswordResetEmail(email, resetUrl);
        } catch (mailErr) {
          console.error('reset email failed for', email, '-', mailErr.message);
        }
      }
      return res.json(generic);
    } catch (err) {
      console.error('requestReset error:', err);
      // Still generic — don't leak whether the account exists.
      return res.json(generic);
    }
  },

  // resetPassword: finish the flow. Takes { token, password }, verifies the token
  // (correct hash AND not expired), sets the new password, and consumes the token
  // so the link can't be reused.
  async resetPassword({ body }, res) {
    const { token, password } = body;
    if (!token || !password) {
      return res.status(400).json({ errorMessage: 'This reset link is missing information. Please request a new one.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ errorMessage: 'Password must be at least 6 characters.' });
    }

    try {
      // Match on the token hash AND an expiry still in the future.
      const user = await User.findOne({
        resetTokenHash: hashToken(token),
        resetTokenExpires: { $gt: new Date() },
      });
      if (!user) {
        return res.status(400).json({ errorMessage: 'This reset link is invalid or has expired. Please request a new one.' });
      }

      user.password = password;          // pre('save') hook hashes the new password
      user.resetTokenHash = undefined;   // single-use: consume the token
      user.resetTokenExpires = undefined;
      await user.save();

      return res.json({ message: 'Your password has been reset. You can now log in.' });
    } catch (err) {
      console.error('resetPassword error:', err);
      return res.status(400).json({ errorMessage: 'Could not reset your password. Please request a new link.' });
    }
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

  // updateMed: change the dosing schedule (time-of-day flags) of one medication
  // that's already in the logged-in user's medList. The medication is identified
  // by its subdocument _id (medId), so titles don't have to be unique.
  // Inputs: { user } (from auth), { body: { medId, morning, afternoon, ... } }.
  async updateMed({ user, body }, res) {
    const { medId, title, morning, afternoon, night, weekly, as_needed } = body;
    try {
      // Fields to update on the matched medicine. Always update the schedule flags.
      const set = {
        'medList.$.morning': !!morning,
        'medList.$.afternoon': !!afternoon,
        'medList.$.night': !!night,
        'medList.$.weekly': !!weekly,
        'medList.$.as_needed': !!as_needed,
      };
      // Only rename the medicine when a non-empty title is sent, so an empty box
      // can never wipe out the medication's name.
      if (typeof title === 'string' && title.trim()) {
        set['medList.$.title'] = title.trim();
      }
      const updatedUser = await User.findOneAndUpdate(
        // Match this user AND the specific medicine inside their medList array.
        { _id: user._id, 'medList._id': medId },
        // The positional "$" updates the matched medList element's fields.
        { $set: set },
        { new: true, runValidators: true } // return the updated doc; enforce schema rules
      );
      if (!updatedUser) {
        // No user/medicine matched that id.
        return res.status(404).json({ message: 'Medication not found.' });
      }
      return res.json(updatedUser); // Send back the updated user
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
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

  // deleteAccount: permanently delete the logged-in user (and their medication
  // list, which lives inside the user document). Also clears the auth cookie.
  // Input: { user } (from authMiddleware); res.
  async deleteAccount({ user }, res) {
    try {
      const deleted = await User.findByIdAndDelete(user._id);
      if (!deleted) {
        return res.status(404).json({ message: 'Account not found.' });
      }
      // Expire the auth cookie so the browser is logged out immediately.
      return res
        .cookie('token', '', { ...cookieOptions, expires: new Date(0) })
        .json({ message: 'Your account and data have been deleted.' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ errorMessage: 'Could not delete the account. Please try again.' });
    }
  },
}
