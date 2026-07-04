// forgotpassword.js
// The "Forgot your password?" page. The user enters their email and we POST it
// to /api/users/request-reset, which (if an account exists) emails a reset link.
// For privacy the server always responds the same way, so we always show the
// same confirmation message — we never reveal whether the email has an account.

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Clickable route link back to Log In.
import axios from 'axios'; // HTTP client used to call the REST API.

export default function ForgotPassword() {
  const [ email, setEmail ] = useState('');      // Value typed into the Email field.
  const [ submitted, setSubmitted ] = useState(false); // True once the request is sent (show the confirmation).
  const [ sending, setSending ] = useState(false);     // True while the request is in flight (disable the button).

  // Runs when the form is submitted.
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Stop the default page reload.
    setSending(true);
    try {
      await axios.post('/api/users/request-reset', { email });
    } catch (err) {
      // Even on error we show the same generic confirmation (no enumeration,
      // and we don't want to hint that a specific email failed).
      console.error(err);
    } finally {
      setSending(false);
      setSubmitted(true); // Always show the same "check your email" message.
    }
  };

  return (
    <div className="container">
      <h3 className="mt-4">Reset your password</h3>

      {submitted ? (
        // Generic confirmation shown after submitting (whether or not the email exists).
        <div className="mt-3">
          <p>If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. The link expires in 1 hour.</p>
          <p className="mb-0">Didn't get it? Check your spam folder, or <Link to="/forgot-password" onClick={() => setSubmitted(false)}>try again</Link>.</p>
          <p className="mt-3 mb-0"><Link to="/login">Back to Log In</Link></p>
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="row g-3">
          <div className="col-md-12">
            <label htmlFor="resetEmail" className="form-label">Enter your account email</label>
            <input type="email" className="form-control" id="resetEmail" onChange={(e) => setEmail(e.target.value)} value={email} required />
          </div>

          {/* mt-3 for spacing (the BS5 g-3 gutter is a no-op under the vendored BS4 CSS). */}
          <div className="col-12 mt-3">
            <button className="btn btn-outline-info" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send reset link'}
            </button>
          </div>

          <div className="col-12">
            <p><Link to="/login">Back to Log In</Link></p>
          </div>
        </form>
      )}
    </div>
  );
}
