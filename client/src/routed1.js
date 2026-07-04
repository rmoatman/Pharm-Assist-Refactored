// ============================================================================
// routed1.js — Client-side ROUTES (the app's page navigation).
// Using react-router-dom v5, this file maps URL paths to components (which page
// shows for "/", "/login", etc.). It also GATES certain routes behind the
// login state: some pages only appear when logged out, others only when logged in.
// It additionally defines a small "print" demo (ReactToPrint) used elsewhere.
// ============================================================================

// Import React, plus the useContext hook. useContext lets a component read a
// value from a React Context (here, the login state) without passing props.
import React, { useContext } from "react";
// Import routing pieces from react-router-dom v5:
//  - BrowserRouter (renamed to Router): enables URL-based navigation.
//  - Switch: renders only the FIRST matching <Route> among its children.
//  - Route: shows its children when the current URL matches its "path".
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
// Import the page/UI components this router can display.
import About from "./components/about.js";      // The "/" home/about page.
import SampleHeader from './components/sampleheader'; // Sample content used in the printable area.
import MedList from "./components/medlist.js";   // The "/med-list" page (logged-in only).
import Navbar from "./components/navbar.js";     // Navigation bar shown on every page.
import SignUp from "./components/signup.js";     // The "/sign-up" page (logged-out only).
import Login from "./components/login.js";       // The "/login" page (logged-out only).
import ForgotPassword from "./components/forgotpassword.js"; // "/forgot-password" (logged-out).
import ResetPassword from "./components/resetpassword.js";   // "/reset-password?token=..." (logged-out).
import Privacy from "./components/privacy.js";   // The "/privacy" page (always available).
import AboutPage from "./components/aboutpage.js";   // The "/about" page (always available).
import InstallApp from "./components/installapp.js"; // The "/install" page (always available).
// Import the AuthContext itself (default export) so we can read loggedIn from it.
import AuthContext from "./context/authcontext";

// bootstrap
// Load the Bootstrap CSS framework for styling. (CSS import, no variable needed.)
import "./styles/bootstrap.min.css";

// needed to print pdf
// Import ReactToPrint, a component that lets the user print part of the page.
import ReactToPrint from "react-to-print";

//styling used for Printing
// CSS applied when printing.
import "./styles/printingstyles.css"

//styling used for App
// General app CSS.
import "./styles/app.css"

// Main App component
// A class component that just renders SampleHeader. It exists so we can grab a
// reference to it and hand its DOM to the print feature below.
class ComponentToPrint extends React.Component {
    // render() returns what this component shows on screen.
    render() {
      return (
        <div>
          {/* The content that will be captured/printed. */}
          <SampleHeader />
        </div>
      );
  }
}

// This button needed to print
// A class component that shows a "Print this out!" button wired to ReactToPrint.
class PButton extends React.Component {
  render() {
    return (
      <div>
        <ReactToPrint
          // trigger: the clickable element that starts printing.
          trigger={() => <button>Print this out!</button>}
          // content: a function returning the DOM node to print (set below via ref).
          content={() => this.componentRef}
        />
        {/* Render ComponentToPrint and save a reference to its DOM element in
            this.componentRef so the "content" function above can find it. */}
        <ComponentToPrint ref={(el) => (this.componentRef = el)} />
      </div>
    );
  }
}

// Routed — the function component actually used by the app to render pages.
function Routed() {
  // Read "loggedIn" out of the AuthContext. It can be:
  //   undefined = still checking with the server,
  //   false     = user is NOT logged in,
  //   true      = user IS logged in.
  const { loggedIn } = useContext(AuthContext);

  // Return the routed UI.
  return (
    <main>
          {/* Router turns URL changes into component changes (no full page reload). */}
          <Router>
      {/* Navbar is outside any Route, so it appears on every page. */}
      <Navbar />

        {/* "/" home route. "exact" means match the path exactly, not sub-paths. */}
        <Route exact path="/">
          <About />
        </Route>
        {/* Privacy & Security page — available whether logged in or out. */}
        <Route exact path="/privacy">
          <Privacy />
        </Route>
        {/* About and Install App pages — linked from the footer, available to all. */}
        <Route exact path="/about">
          <AboutPage />
        </Route>
        <Route exact path="/install">
          <InstallApp />
        </Route>
        {/* Switch renders only the first matching Route inside it. */}
        <Switch>
        {/* Only when the user is logged OUT: show sign-up and login routes. */}
        {loggedIn === false && (
          <>
            <Route exact path="/sign-up">
              <SignUp />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            {/* Forgot-password flow: request a link, then set a new password
                from the emailed token. Both reachable while logged out. */}
            <Route exact path="/forgot-password">
              <ForgotPassword />
            </Route>
            <Route exact path="/reset-password">
              <ResetPassword />
            </Route>
          </>
        )}
        {/* Only when the user is logged IN: show the medication list route. */}
        {loggedIn === true && (
          <>
            <Route path="/med-list">
              <MedList />
            </Route>
          </>
        )}
      </Switch>
    </Router>
    </main>
  );
}

// Export Routed as the default so app1.js can render it.
export default Routed;
