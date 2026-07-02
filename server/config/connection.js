// ===========================================================================
// server/config/connection.js
// This file's only job is to CONNECT to the MongoDB database using Mongoose
// (a library that makes working with MongoDB easier). It opens the connection
// and then exports the connection object so other files (like index.js and
// seeds.js) can wait for it to be ready.
// ===========================================================================

const mongoose = require('mongoose'); // Mongoose: the tool we use to talk to MongoDB

// Connect to the database. Use the MONGODB_URI environment variable if one is
// provided (e.g. a hosted database in production); otherwise fall back to a
// local database named "pharm-assist" running on this machine.
// The empty {} is the options object (no extra options are set here).
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/pharm-assist', {
});

// Export the active connection so other files can listen for events like
// "open" (fired when the DB is ready to use).
module.exports = mongoose.connection;
