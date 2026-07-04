// ===================================================================
// server/models/user.js  (the User model)
// -------------------------------------------------------------------
// This file defines the shape of a "User" document in MongoDB using a
// Mongoose Schema, then compiles it into a model we can query with.
// It also handles password security (hashing before save) and a helper
// method to check a login password. In the app, a User owns a list of
// medicines (medList).
// ===================================================================

// Pull two tools out of the mongoose library:
//  - Schema: used to describe the structure of a document (its fields).
//  - model:  turns a Schema into a usable model (for find/create/etc.).
const { Schema, model } = require('mongoose');

// Import the Medicine sub-document schema so we can embed a list of
// medicines directly inside each User document (see medList below).
const medicineSchema = require('./Medicine');

// bcrypt is a library for hashing (scrambling) passwords so we never
// store the raw/plain-text password in the database.
const bcrypt = require('bcrypt');

// Define the User schema: the blueprint for every user document.
const UserSchema = new Schema(
  {
    // User's first name.
    firstName: {
      type: String,     // stored as text
      required: true,   // cannot be empty — must be provided
      trim: true        // automatically strips leading/trailing spaces
    },
    // User's last name.
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    // The password. Stored HASHED (not plain text) thanks to the
    // pre('save') hook below.
    password: {
      type: String,
      required: true,
    },
    // The user's email address.
    email: {
      type: String,
      required: true,
      unique: true,   // no two users can share the same email
      // match: a regex validator ensuring the value looks like an email
      // (something@something.something). If it fails, Mongoose rejects
      // the save with the message provided.
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    // medList: an array of embedded medicine sub-documents. Each user
    // carries their own list of medicines inline (not a separate
    // collection with references). Shape is defined by medicineSchema.
    medList: [medicineSchema],

    // --- Password reset (forgot-password flow) ---
    // We email the user a random token but store only its SHA-256 HASH here,
    // so a leaked database can't be used to reset anyone's password. The token
    // is single-use (cleared after a successful reset) and short-lived.
    resetTokenHash: {
      type: String,
    },
    // When the reset token stops working. Compared against "now" on reset.
    resetTokenExpires: {
      type: Date,
    },
  },
  // The commented-out block below (toJSON virtuals) is disabled. If
  // enabled, it would include Mongoose "virtual" fields when a document
  // is converted to JSON. It is currently not in effect.
  // {
  //   toJSON: {
  //     virtuals: true,
  //   },
  // }
  );

// pre('save') hook: middleware that runs automatically RIGHT BEFORE a
// user document is saved to the database. We use it to hash the
// password so the raw password is never stored.
UserSchema.pre('save', async function (next) {
  // Only hash when the document is brand new OR the password field was
  // changed. This avoids re-hashing an already-hashed password on
  // unrelated updates. (`this` refers to the user document being saved.)
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10; // cost factor: higher = slower & more secure
    // Replace the plain password with its hashed version.
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  // Call next() to let Mongoose continue with the actual save.
  next();
});

// custom method to compare and validate password for logging in
// Instance method available on any user document, e.g. user.isCorrectPassword(...)
// It compares a plain-text password attempt against the stored hash and
// returns true/false (as a Promise, because it's async).
UserSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// (Disabled) Example of a virtual field that would return how many
// medicines are in the list. Not active because it's commented out.
// medicineSchema.virtual('medCount').get(function () {
//   return this.medList.length;
// });

// Compile the schema into a model named 'User'. Mongoose will use the
// collection "users" (lowercased + pluralized) in MongoDB.
const User = model('User', UserSchema);

// Export the finished model so other files (like models/index.js) can use it.
module.exports = User;
