// navbar.js
// The top navigation bar shown on every page. It changes based on login state:
//  - Logged OUT: shows Sign Up / Log In links plus an inline email+password login form.
//  - Logged IN:  shows a Med List link plus a Log Out button.

import React, { useContext, useState } from 'react'; // useState = local state; useContext = read shared auth state.
import { useHistory, useLocation } from "react-router-dom"; // For navigating between pages / reading the current route.
import AuthContext from "../context/authcontext.js"; // Shared login state (loggedIn) and helpers (getLoggedIn).
import { Link } from 'react-router-dom'; // Clickable links that switch routes without a full reload.

import axios from "axios"; // HTTP client used to call the REST API.

export default function Navbar() {

//username tab password login at the extreme right of navbar
const [ email, setEmail ] = useState('');       // Value typed into the inline Email field.
const [ password, setPassword ] = useState('');  // Value typed into the inline Password field.
const [ navOpen, setNavOpen ] = useState(false); // Whether the mobile hamburger menu is expanded.

const { loggedIn } = useContext(AuthContext);    // true/false: whether a user is currently logged in.
const { getLoggedIn } = useContext(AuthContext); // Re-checks the server for the current login status.
const history = useHistory();                    // Used to redirect after login/logout.
const location = useLocation();                  // Current route, so we can hide the Med List link while already on it.

//event handling for login button
// Runs when the inline navbar login form is submitted.
const handleFormSubmit = async (event) => {
    event.preventDefault(); // Stop the default page reload.

      try {
      // Bundle the typed email/password to send to the login endpoint.
      const registerData = {
                email, password,
      };

      // POST the credentials to the login endpoint. withCredentials sends/stores the auth cookie.
      await axios.post(
        "/api/users/login",
        registerData,
        { withCredentials: true }
      );
      await getLoggedIn();        // Refresh app-wide login state now that we're authenticated.
      history.push("/med-list");  // Go to the medication list page.
    } catch (err) {
      console.error(err); // Log any error (e.g. wrong password) for debugging.
    }
  };

  // Runs when the Log Out button is clicked.
  const handleLogOut = async (event) => {
      // GET the logout endpoint to end the session on the server.
      await axios.get(
      "/api/users/logout"
    );
    await getLoggedIn(); // Refresh login state (now logged out).
    history.push("/");   // Send the user back to the home page.
  }

  // Jump to a checker section on the home page (handy on mobile, where the
  // interaction and price checkers sit below the fold). Closes the mobile menu,
  // then scrolls once the home page has had a moment to render.
  const goToSection = (id) => {
    setNavOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light App-header align-items-center">
      {/* Brand link on the left -- clicking it returns to the home page.
          Shows the wordmark logo (public/Pharm-Wordmark.png). The filename must
          match exactly on case-sensitive hosts (Render). */}
      <Link className="navbar-brand" to="/" style={{ marginLeft: '0.25in' }}>
        <img src={process.env.PUBLIC_URL + "/Pharm-Wordmark.png"} alt="Pharm-Assist" className="navbar-logo" />
      </Link>
      {/* Hamburger toggle button (Bootstrap) shown on small screens to expand/collapse the menu */}
      {/* Hamburger toggle (small screens). Toggled via React state — Bootstrap 5's
          data-bs-* collapse needs Bootstrap's JS, which this app doesn't load. */}
      <button className="navbar-toggler" type="button" onClick={() => setNavOpen(!navOpen)} aria-controls="navbarSupportedContent" aria-expanded={navOpen} aria-label="Toggle navigation" style={{ border: '1px solid rgba(0,0,0,0.4)' }}>
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className={`collapse navbar-collapse${navOpen ? ' show' : ''}`} id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          {/* Only show Sign Up link when NOT logged in. (No separate Log In link —
              the inline login form on the right handles logging in.) Colored to
              match the "Sign up" link on the home page's blue CTA banner. */}
          {loggedIn === false && (
          <li className="nav-item">
            <Link className="navbar-brand" to="/sign-up" style={{ color: '#007bff' }} onClick={() => setNavOpen(false)}>Sign Up</Link>
          </li>
          )}
          {/* Jump to the home page's interaction / price checkers. Only shown in the
              collapsed mobile menu (d-lg-none) — on desktop the checkers are visible
              on the home page, so these shortcuts would be redundant clutter. */}
          <li className="nav-item d-lg-none">
            <Link className="navbar-brand" to="/" onClick={() => goToSection('interactions')}>Check Interactions</Link>
          </li>
          <li className="nav-item d-lg-none">
            <Link className="navbar-brand" to="/" onClick={() => goToSection('prices')}>Check Prices</Link>
          </li>
        </ul>
          {/* When NOT logged in: inline login form. Stacks vertically on small screens,
              sits in a row on large screens. */}
          {loggedIn === false && (
          <form onSubmit={handleFormSubmit} className="d-flex flex-column flex-lg-row mt-2 mt-lg-0">
            {/* Email input -- updates the "email" state. BS4 has no gap utility, so
                spacing between fields comes from margins: vertical when stacked
                (mobile), horizontal when in a row (lg+). */}
            <input type="text" className="form-control mb-2 mb-lg-0 mr-lg-2" id="inputEmail" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email}/>
            {/* Password input -- updates the "password" state */}
            <input type="password" className="form-control mb-2 mb-lg-0 mr-lg-2" id="inputPassword4" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password}/>
            <button className="btn btn-success px-4" type="submit" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>Log In</button>
          </form>
          )}
          {/* When logged IN: a green Med List button (styled like Log Out) sitting
              ~0.5in to its left (mr-lg-5 = 3rem = 0.5in, desktop only), then the
              Log Out button. Med List is hidden while already on the medication page. */}
          {loggedIn === true && location.pathname !== '/med-list' && (
          <Link to="/med-list" className="btn btn-success mt-2 mt-lg-0 mr-lg-5" onClick={() => setNavOpen(false)}>My Medication List</Link>
          )}
          {loggedIn === true && (
          <button onClick={handleLogOut} className="btn btn-success mt-2 mt-lg-0" type="submit">Log Out</button>
          )}
        </div>
      </nav>
  );
}
