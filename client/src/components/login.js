import React, { useContext, useState } from 'react';
import { useHistory, Link } from "react-router-dom";
import AuthContext from "../context/authcontext.js";
import axios from "axios";

export default function Login() {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ errorMessage, setErrorMessage ] = useState('');

  const { getLoggedIn } = useContext(AuthContext);
  const history = useHistory();

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      await axios.post(
        "http://localhost:3001/api/users/login",
        { email, password },
        { withCredentials: true }
      );
      await getLoggedIn();
      history.push("/med-list");
    } catch (err) {
      console.error(err);
      setErrorMessage("Incorrect email or password.");
    }
  };

  return (
    <div className="container">
      <h3 className="mt-4">Log In</h3>
      <form onSubmit={handleFormSubmit} className="row g-3">
        <div className="col-md-12">
          <label htmlFor="loginEmail" className="form-label">Email</label>
          <input type="email" className="form-control" id="loginEmail" onChange={(e) => setEmail(e.target.value)} value={email} required />
        </div>

        <div className="col-md-12">
          <label htmlFor="loginPassword" className="form-label">Password</label>
          <input type="password" className="form-control" id="loginPassword" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} required />
        </div>

        {errorMessage && (
          <div className="col-12">
            <p className="text-danger">{errorMessage}</p>
          </div>
        )}

        <div className="col-12">
          <button className="btn btn-outline-info" type="submit">
            Log In
          </button>
        </div>

        <div className="col-12">
          <p>Don't have an account? <Link to="/sign-up">Sign up</Link></p>
        </div>
      </form>
    </div>
  );
}
