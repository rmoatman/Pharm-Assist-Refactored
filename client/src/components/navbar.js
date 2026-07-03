// navbar.js
// The top navigation bar shown on every page. It changes based on login state:
//  - Logged OUT: shows Sign Up / Log In links plus an inline email+password login form.
//  - Logged IN:  shows a Med List link plus a Log Out button.

import React, { useContext, useState } from 'react'; // useState = local state; useContext = read shared auth state.
import { useHistory } from "react-router-dom"; // For navigating between pages in code.
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

  return (
    <nav className="navbar navbar-expand-lg App-header align-items-end">
      {/* Brand link on the left -- clicking it returns to the home page */}
      <Link className="navbar-brand" to="/" style={{ fontSize: '2.5rem' }}><strong>Pharm-Assist</strong></Link>
      {/* Hamburger toggle button (Bootstrap) shown on small screens to expand/collapse the menu */}
      {/* Hamburger toggle (small screens). Toggled via React state — Bootstrap 5's
          data-bs-* collapse needs Bootstrap's JS, which this app doesn't load. */}
      <button className="navbar-toggler" type="button" onClick={() => setNavOpen(!navOpen)} aria-controls="navbarSupportedContent" aria-expanded={navOpen} aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className={`collapse navbar-collapse${navOpen ? ' show' : ''}`} id="navbarSupportedContent">
        <ul className="navbar-nav me-auto">
          {/* Only show Sign Up link when NOT logged in */}
          {loggedIn === false && (
          <li className="nav-item">
            <Link className="navbar-brand" to="/sign-up" onClick={() => setNavOpen(false)}>Sign Up</Link>
          </li>
          )}
          {/* Only show Log In link when NOT logged in */}
          {loggedIn === false && (
          <li className="nav-item">
            <Link className="navbar-brand" to="/login" onClick={() => setNavOpen(false)}>Log In</Link>
          </li>
          )}
          {/* Only show Med List link when logged IN */}
          {loggedIn === true && (
          <li className="nav-item">
            <Link className="navbar-brand" to="/med-list" onClick={() => setNavOpen(false)}>Med List</Link>
          </li>
          )}
        </ul>
          {/* When NOT logged in: inline login form. Stacks vertically on small screens,
              sits in a row on large screens. */}
          {loggedIn === false && (
          <form onSubmit={handleFormSubmit} className="d-flex flex-column flex-lg-row gap-2 mt-2 mt-lg-0">
            {/* Email input -- updates the "email" state */}
            <input type="text" className="form-control" id="inputUsername" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email}/>
            {/* Password input -- updates the "password" state */}
            <input type="password" className="form-control" id="inputPassword4" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password}/>
            <button className="btn btn-success" type="submit">Login</button>
          </form>
          )}
          {/* When logged IN: show a Log Out button that runs handleLogOut */}
          {loggedIn === true && (
          <button onClick={handleLogOut} className="btn btn-success mt-2 mt-lg-0" type="submit">Log Out</button>
          )}
        </div>
      </nav>
  );
}
