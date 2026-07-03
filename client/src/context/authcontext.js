// ============================================================================
// authcontext.js — A React CONTEXT that tracks whether the user is logged in.
// React Context is a way to share data with many components without passing
// props down by hand. Here we share two things: "loggedIn" (the login status)
// and "getLoggedIn" (a function that re-checks the status with the server).
// ============================================================================

// Import axios to make HTTP requests to our REST API.
import axios from "axios";
// Import React plus the hooks we use:
//  - createContext: makes a new Context object.
//  - useEffect: run code after the component renders (e.g. on first load).
//  - useState: store a value that, when changed, re-renders the component.
import React, { createContext, useEffect, useState } from "react";

// Create the Context object. Components can subscribe to it to read its value.
const AuthContext = createContext();

// The provider component. Anything wrapped by <AuthContextProvider> can read
// the login info. "props" carries whatever is nested inside it (props.children).
function AuthContextProvider(props) {
  // loggedIn holds the current login state; setLoggedIn updates it.
  // It starts as undefined = "we haven't checked with the server yet".
  const [loggedIn, setLoggedIn] = useState(undefined);

  // Asks the server whether the current user is logged in.
  async function getLoggedIn() {
    try {
      // Call the REST API endpoint that reports login status. "await" pauses until
      // the request finishes and returns the server's response.
      const loggedInRes = await axios.get("/api/users/loggedIn");
      // Save the server's answer (response .data) into state. Changing state here
      // re-renders consumers so routes update to match the login status.
      setLoggedIn(loggedInRes.data);
    } catch (err) {
      // If the check fails (API unreachable, network error, etc.), treat the user
      // as logged OUT rather than leaving loggedIn stuck at `undefined` — otherwise
      // the navbar renders neither the logged-in nor logged-out menu (just a blank
      // bar). Defaulting to false shows the Sign Up / Log In menu.
      console.error("login-status check failed:", err);
      setLoggedIn(false);
    }
  }

  // useEffect with an empty dependency array [] runs ONCE, right after the first
  // render. So we check the login status a single time when the app loads.
  useEffect(() => {
    getLoggedIn();
  }, []);

  // Provide the shared value to all nested components.
  return (
    // "value" is what consumers receive: the current loggedIn state plus the
    // getLoggedIn function (so components can re-check after login/logout).
    <AuthContext.Provider value={{ loggedIn, getLoggedIn }}>
      {/* props.children = whatever was nested inside <AuthContextProvider>. */}
      {props.children}
    </AuthContext.Provider>
  );
}

// Default export: the Context object itself (used with useContext to read it).
export default AuthContext;
// Named export: the provider component (used to wrap the app in app1.js).
export { AuthContextProvider };
