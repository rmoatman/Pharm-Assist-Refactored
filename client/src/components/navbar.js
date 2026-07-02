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
        "http://localhost:3001/api/users/login",
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
      "http://localhost:3001/api/users/logout"
    );
    await getLoggedIn(); // Refresh login state (now logged out).
    history.push("/");   // Send the user back to the home page.
  }

  return (
    <nav className="navbar navbar-expand-lg App-header">
      {/* Brand link on the left -- clicking it returns to the home page */}
      <Link className="navbar-brand" to="/"><strong>Pharm-Assist</strong></Link>
      {/* Hamburger toggle button (Bootstrap) shown on small screens to expand/collapse the menu */}
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          {/* Only show Sign Up link when NOT logged in */}
          {loggedIn === false && (
          <li className="nav-item">
            <Link className="navbar-brand" to="/sign-up">Sign Up</Link>
          </li>
          )}
          {/* Only show Log In link when NOT logged in */}
          {loggedIn === false && (
          <li className="nav-item">
            <Link className="navbar-brand" to="/login">Log In</Link>
          </li>
          )}
          {/* Only show Med List link when logged IN */}
          {loggedIn === true && (
          <li className="nav-item">
            <Link className="navbar-brand" to="/med-list">Med List</Link>
          </li>
          )}
        </ul>
          {/* When NOT logged in: inline login form (email + password + Login button) that runs handleFormSubmit */}
          {loggedIn === false && (
          <form onSubmit={handleFormSubmit} className="d-flex">

		  {/* Email input -- updates the "email" state */}
		  <input type="text" className="form-control" id="inputUsername" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email}/>
		  {/* Password input -- updates the "password" state */}
		  <input type="password" className="form-control" id="inputPassword4" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password}/>

            <button className="btn btn-outline-success" type="submit" >Login</button>
          </form>
          )}
          {/* When logged IN: show a Log Out button that runs handleLogOut */}
          {loggedIn === true && (
          <button onClick={handleLogOut} className="btn btn-outline-success" type="submit">Log Out</button>
          )}
        </div>
      </nav>
  );
}
