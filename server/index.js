// ===========================================================================
// server/index.js
// This is the MAIN ENTRY POINT for the back-end server. When you run the
// server, this file boots up everything: it creates the Express web server,
// attaches the Apollo GraphQL server on top of it, wires up middleware
// (cookies, CORS, JSON parsing), plugs in the REST routes, and finally starts
// listening for incoming HTTP requests once the database is connected.
// ===========================================================================

const express = require('express');            // Express: the web-server framework that handles HTTP requests/responses
const path = require('path');                  // Node's built-in "path" helper for building safe file paths across OSes
const cookieParser = require("cookie-parser"); // Middleware that reads cookies from incoming requests into req.cookies
const cors = require("cors");                   // Middleware that controls which other websites (origins) may call this API
const db = require('./config/connection');     // Our Mongoose database connection object (see config/connection.js)
const routes = require('./routes');            // Our REST API route definitions (the Express Router)
const { ApolloServer } = require('apollo-server-express'); // Apollo: lets us run a GraphQL server inside Express
const { typeDefs, resolvers } = require('./schemas');       // GraphQL type definitions (schema) and resolvers (the logic)
const { authContext } = require('./utils/auth');           // Function that reads the auth token for each GraphQL request

const app = express();                         // Create the Express application instance
const PORT = process.env.PORT || 3001;         // Use the host's PORT env var if set (e.g. in production), otherwise 3001

// Build the Apollo GraphQL server. typeDefs = the shape of the data,
// resolvers = the functions that fetch/change it, and context runs on every
// request (authContext attaches the logged-in user, if any).
const server =  new ApolloServer({
  typeDefs,
  resolvers,
  context: authContext,
});

// Attach the Apollo server to Express so GraphQL is reachable (default at /graphql).
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form bodies into req.body
app.use(express.json());                          // Parse JSON request bodies into req.body
app.use(cookieParser());                          // Populate req.cookies from the Cookie header
app.use(
  cors({
    // Only allow the front-end (React dev server) and this server itself to make requests
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true, // Allow cookies/credentials to be sent along with cross-origin requests
  })
);

// if we're in production, serve client/build as static assets
// (In production the built React app lives in client/build; Express serves those files directly.)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(routes); // Register all of our REST routes on the app

// Wait until the database connection is open ("open" fires once), THEN start
// the server. This ensures we don't accept requests before the DB is ready.
db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
