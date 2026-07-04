// resetpassword.js
// The page the reset-link email points at: /reset-password?token=...
// It reads the token from the URL, collects a new password (twice), and POSTs
// { token, password } to /api/users/reset-password. On success it sends the
// user to the Log In page. An invalid/expired token is reported by the server.

import React, { useState } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  // Pull the one-time token out of the URL query string (?token=...).
  const token = new URLSearchParams(useLocation().search).get('token');

  const [ password, setPassword ] = useState('');       // New password.
  const [ confirm, setConfirm ] = useState('');         // Confirmation (must match).
  const [ errorMessage, setErrorMessage ] = useState('');
  const [ saving, setSaving ] = useState(false);        // True while the request is in flight.
  const history = useHistory();

  // Runs when the form is submitted.
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    // Client-side checks before hitting the server.
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setErrorMessage('The two passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await axios.post('/api/users/reset-password', { token, password });
      // Success -> send them to Log In with a small flag so it can show a note.
      history.push('/login', { reset: true });
    } catch (err) {
      const serverMessage = err.response?.data?.errorMessage;
      setErrorMessage(serverMessage || 'Could not reset your password. Please request a new link.');
    } finally {
      setSaving(false);
    }
  };

  // No token in the URL at all -> the link was malformed.
  if (!token) {
    return (
      <div className="container">
        <h3 className="mt-4">Reset your password</h3>
        <p className="text-danger mt-3">This reset link is missing its token. Please request a new one.</p>
        <p><Link to="/forgot-password">Request a new reset link</Link></p>
      </div>
    );
  }

  return (
    <div className="container">
      <h3 className="mt-4">Choose a new password</h3>
      <form onSubmit={handleFormSubmit} className="row g-3">
        <div className="col-md-12">
          <label htmlFor="newPassword" className="form-label">New password</label>
          <input type="password" className="form-control" id="newPassword" placeholder="At least 6 characters" onChange={(e) => setPassword(e.target.value)} value={password} required />
        </div>

        <div className="col-md-12 mt-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm new password</label>
          <input type="password" className="form-control" id="confirmPassword" placeholder="Re-enter password" onChange={(e) => setConfirm(e.target.value)} value={confirm} required />
        </div>

        {errorMessage && (
          <div className="col-12">
            <p className="text-danger mb-1">{errorMessage}</p>
            <p className="mb-0"><Link to="/forgot-password">Request a new reset link</Link></p>
          </div>
        )}

        <div className="col-12 mt-3">
          <button className="btn btn-outline-info" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Reset password'}
          </button>
        </div>
      </form>
    </div>
  );
}
