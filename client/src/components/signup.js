// signup.js
// Renders the Sign Up page: a form to create a new account.
// On submit it POSTs the new user's details to the register endpoint,
// refreshes the logged-in state, and redirects to the medication list.

import React, { useContext, useState } from 'react'; // useState = local state; useContext = read shared auth state.
import { useHistory } from "react-router-dom"; // useHistory lets us navigate to another page in code.
// import { createUser } from '../utils/API'; // (Unused/old import, left commented out.)
import AuthContext from "../context/authcontext.js"; // Shared login state and helpers.
import axios from "axios"; // HTTP client used to call the REST API.

export default function SignUp() {
  const [ email, setEmail ] = useState('');         // Email field value.
  const [ password, setPassword ] = useState('');   // Password field value.
  const [ firstName, setFirstName ] = useState(''); // First name field value.
  const [ lastName, setLastName ] = useState('');   // Last name field value.
  const [ username, setUserName ] = useState('');   // Username field value.

  const { getLoggedIn } = useContext(AuthContext); // getLoggedIn() re-checks the server for the current login status.
  const history = useHistory();                    // Used to redirect after a successful sign up.

  // Runs when the Sign Up form is submitted.
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent the default page reload.

      try {
      // Bundle all the form fields into one object to send to the server.
      const registerData = {
        firstName,
        lastName,
        username,
        email,
        password,
      };

      // POST the new-user data to the register endpoint. withCredentials sends/stores the auth cookie.
      await axios.post(
        "http://localhost:3001/api/users/register",
        registerData,
        { withCredentials: true }
      );
      await getLoggedIn();       // Update app-wide login state (the new account is now logged in).
      history.push("/med-list"); // Send the user to their medication list.
    } catch (err) {
      console.error(err); // Log any error (e.g. email already taken) for debugging.
    }
  };

  return (
    <div className="container">
      <h3>Sign Up</h3>
    {/* Sign-up form -- handleFormSubmit runs on submit */}
    <form onSubmit={handleFormSubmit} className="row g-3">
      {/* Email input -- updates the "email" state as the user types */}
      <div className="col-md-12">
        <label htmlFor="inputEmail4" className="form-label">Email</label>
        <input type="email"  className="form-control" id="inputEmail4" onChange={(e) => setEmail(e.target.value)} value={email} />
      </div>

      {/* Username input -- updates the "username" state */}
      <div className="col-6">
        <label htmlFor="inputUsername" className="form-label">Username</label>
        <input type="text" className="form-control" id="inputUsername" placeholder="Username" onChange={(e) => setUserName(e.target.value)} value={username}/>
      </div>

      {/* Password input -- updates the "password" state */}
      <div className="col-md-6">
        <label htmlFor="inputPassword" className="form-label">Password</label>
        <input type="password" className="form-control" id="inputPassword4" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password}/>
      </div>

      {/* First name input -- updates the "firstName" state */}
      <div className="col-6">
        <label htmlFor="inputFName" className="form-label">First name</label>
        <input type="text" className="form-control" id="inputFName" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} value={firstName}/>
      </div>
      {/* Last name input -- updates the "lastName" state */}
      <div className="col-md-6">
        <label htmlFor="inputLName" className="form-label">Last Name</label>
        <input type="text" className="form-control" id="inputLName" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} value={lastName}/>
      </div>


      {/* <div className="col-12">
        <button type="submit" className="btn btn-primary">Sign in</button>
      </div> */}
  {/* Submit button that triggers handleFormSubmit to create the account */}
  <div className="col-12">
  <button className="btn btn-outline-info" type="submit">
                Sign In
              </button>

              </div>
    </form>

  </div>
  );
}