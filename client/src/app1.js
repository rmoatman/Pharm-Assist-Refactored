// ============================================================================
// app1.js — The ROOT App component and the app's "providers".
// This component sits at the top of the tree (rendered by index.js). Its main
// job is to wrap the rest of the app in context providers (shared data) and to
// render the router that decides which page/component the user sees.
// ============================================================================

// Import React so we can write a component and use JSX.
import React from "react";
// Import our routing component (defined in routed1.js). It holds all the
// client-side routes (which URL shows which component).
import Routed from "./routed1";
// Import axios, a library for making HTTP requests to our REST API.
import axios from "axios";
// Import the AuthContextProvider component. It provides "is the user logged in?"
// information to every component inside it (see context/authcontext.js).
import { AuthContextProvider } from "./context/authcontext";
// Import the medical disclaimer banner shown at the bottom of every page.
import Disclaimer from "./components/disclaimer";

// Tell axios to always send cookies/credentials with every request. This lets
// the server recognize the logged-in user (e.g. via a session cookie) on each call.
axios.defaults.withCredentials = true;

// The App component — the root of our component tree.
function App() {
  // Return the JSX (UI) that App renders.
  return (
    // AuthContextProvider wraps everything, so any component inside it can read
    // the login state (loggedIn) and the getLoggedIn function.
    <AuthContextProvider>
      {/* Routed renders the actual pages based on the current URL. */}
      <Routed />
      {/* Disclaimer shows on every page (it sits outside the routes). */}
      <Disclaimer />
    </AuthContextProvider>
  );
}

// Export App as the default export so index.js can import and render it.
export default App;
