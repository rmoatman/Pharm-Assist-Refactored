// login.js
// Renders the Log In page: a form with email + password fields.
// On submit it POSTs the credentials to the API, refreshes the logged-in state,
// and redirects the user to their medication list.

import React, { useContext, useState } from 'react'; // useState = local state; useContext = read a shared context (auth state).
import { useHistory, useLocation, Link } from "react-router-dom"; // navigate / read route state / route links.
import AuthContext from "../context/authcontext.js"; // Shared login state (whether a user is logged in) and helpers.
import axios from "axios"; // HTTP client used to call the REST API.

export default function Login() {
  const [ email, setEmail ] = useState('');               // Holds what the user types in the Email field.
  const [ password, setPassword ] = useState('');         // Holds what the user types in the Password field.
  const [ errorMessage, setErrorMessage ] = useState(''); // Holds an error message to show if login fails.

  const { getLoggedIn } = useContext(AuthContext); // getLoggedIn() re-checks the server for the current login status.
  const history = useHistory();                    // Lets us send the user to another page in code.
  const location = useLocation();                  // Route state; carries a flag after a successful password reset.
  const justReset = location.state?.reset === true; // True when redirected here from the reset-password page.

  // Runs when the Log In form is submitted (user clicks "Log In" or presses Enter).
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Stop the browser's default full-page reload on form submit.
    setErrorMessage('');    // Clear any previous error before trying again.

    try {
      // POST the email/password to the login endpoint. withCredentials sends/stores the auth cookie.
      await axios.post(
        "/api/users/login",
        { email, password },
        { withCredentials: true }
      );
      await getLoggedIn();        // Update the app-wide "logged in" state now that we're authenticated.
      history.push("/med-list");  // Navigate to the medication list page.
    } catch (err) {
      console.error(err);                              // Log the real error for debugging.
      setErrorMessage("Incorrect email or password."); // Show a friendly message to the user.
    }
  };

  return (
    <div className="container">
      <h3 className="mt-4">Log In</h3>
      {/* Shown once after the user completes a password reset (redirected here). */}
      {justReset && (
        <p className="text-success mt-2">Your password has been reset. Please log in with your new password.</p>
      )}
      {/* Login form -- handleFormSubmit runs on submit */}
      <form onSubmit={handleFormSubmit} className="row g-3">
        {/* Email input -- typing updates the "email" state via setEmail */}
        <div className="col-md-12">
          <label htmlFor="loginEmail" className="form-label">Email</label>
          <input type="email" className="form-control" id="loginEmail" onChange={(e) => setEmail(e.target.value)} value={email} required />
        </div>

        {/* Password input -- typing updates the "password" state via setPassword.
            mt-4 gives a bit more breathing room above the Password field. */}
        <div className="col-md-12 mt-4">
          <label htmlFor="loginPassword" className="form-label">Password</label>
          <input type="password" className="form-control" id="loginPassword" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} required />
        </div>

        {/* Conditional rendering: only show this red error text if errorMessage is not empty */}
        {errorMessage && (
          <div className="col-12">
            <p className="text-danger">{errorMessage}</p>
          </div>
        )}

        {/* Submit button that triggers handleFormSubmit. mt-3 adds space above it
            (the form's BS5 g-3 gutter is a no-op under the vendored BS4 CSS). */}
        <div className="col-12 mt-3">
          <button className="btn btn-outline-info" type="submit">
            Log In
          </button>
        </div>

        {/* Forgot-password link + sign-up link for users without an account.
            mt-3 matches the gap above the Log In button. */}
        <div className="col-12 mt-3">
          <p className="mb-1"><Link to="/forgot-password">Forgot password?</Link></p>
          <p className="mb-0">Don't have an account? <Link to="/sign-up">Sign up</Link></p>
        </div>
      </form>
    </div>
  );
}
