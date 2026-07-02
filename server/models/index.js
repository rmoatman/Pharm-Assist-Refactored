// ===================================================================
// server/models/index.js
// -------------------------------------------------------------------
// This is the "barrel" (aggregator) file for all Mongoose models.
// Instead of importing each model from its own file everywhere in the
// app, other files can import them from this one central place, e.g.:
//    const { User, Medicine } = require('../models');
// It keeps imports short and gives us a single source of truth for
// which models exist.
// ===================================================================

// Import the User model (a compiled Mongoose model that maps to the
// "users" collection in MongoDB). See ./User.js for its schema.
// NOTE: the require path is './User' (capital U). On case-sensitive
// systems (like Linux servers) this must match the real filename.
const User = require('./User');

// Import the Medicine schema/model definition from ./Medicine.js.
// (Medicine is actually a sub-document schema used inside User, so it
// may not be a full standalone model — see ./Medicine.js.)
const Medicine = require('./Medicine')

// Export both so other files can grab them with destructuring:
//    const { User, Medicine } = require('../models');
module.exports = { User, Medicine };
