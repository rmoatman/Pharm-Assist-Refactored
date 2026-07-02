// ===================================================================
// server/models/Medicine.js  (the Medicine sub-document schema)
// -------------------------------------------------------------------
// This file defines the shape of a single "medicine" entry. It is NOT
// compiled into its own standalone model — instead it is EMBEDDED
// inside the User model as an array (User.medList). Each medicine
// records its name and which times of day it should be taken.
// ===================================================================

// We only need Schema here (to describe the fields). We do not call
// model() because this schema is embedded inside User rather than
// stored in its own collection.
const { Schema } = require('mongoose');

// Define the medicine schema (the blueprint for each medicine entry).
const medicineSchema = new Schema(
  {
    // The name/label of the medicine.
    title: {
      type: String,     // text
      required: true    // must be provided
    },
    // The following boolean flags mark WHEN the medicine is taken.
    // true = take at this time, false/undefined = don't.

    // Take in the morning?
    morning: {
      type: Boolean
    },
    // Take in the afternoon?
    afternoon: {
      type: Boolean
    },
    // Take in the evening?
    evening: {
      type: Boolean
    },
    // Take at night?
    night: {
      type: Boolean
    },
    // Take only when needed (as-needed / "PRN")?
    as_needed: {
      type: Boolean
    }
  }
);



// Export the schema (not a model) so User.js can embed it in medList.
module.exports = medicineSchema;
