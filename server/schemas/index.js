// ===========================================================================
// index.js — the "bundle" for our GraphQL schema.
//
// A GraphQL API needs two pieces to work:
//   1. typeDefs  = the SHAPE of the API (what types, queries, and mutations
//                  exist). Think of it as the menu.
//   2. resolvers = the FUNCTIONS that actually do the work for each query and
//                  mutation. Think of it as the kitchen that fills each order.
//
// This file simply imports both pieces and re-exports them together so that
// the Apollo Server setup (elsewhere in the project) can grab them in one line.
// ===========================================================================

// Bring in the schema definition (the "menu" of types/queries/mutations).
const typeDefs = require('./typeDefs');
// Bring in the resolver functions (the "kitchen" that fulfills each request).
const resolvers = require('./resolvers');

// Export both together as a single object so they can be imported at once,
// e.g. const { typeDefs, resolvers } = require('./schemas');
module.exports = { typeDefs, resolvers };
