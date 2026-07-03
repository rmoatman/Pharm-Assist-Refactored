// privacy.js
// A plain-language Privacy & Security page. It also lets a logged-in user
// permanently delete their account and all of their data.

import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/authcontext.js';

export default function Privacy() {
  const { loggedIn, getLoggedIn } = useContext(AuthContext);
  const history = useHistory();
  const [error, setError] = useState('');

  // Permanently delete the logged-in user's account after a confirmation.
  const handleDelete = async () => {
    const ok = window.confirm(
      'This permanently deletes your account and all of your data (your medication list). This cannot be undone. Are you sure?'
    );
    if (!ok) return;
    try {
      await axios.delete('/api/users/deleteAccount', { withCredentials: true });
      await getLoggedIn();     // refresh app-wide login state (now logged out)
      history.push('/');       // back to the home page
    } catch (err) {
      console.error(err);
      setError('Sorry — we could not delete your account. Please try again.');
    }
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4">Privacy &amp; Security</h1>

      <p>
        Pharm-Assist is a personal project provided for informational purposes only. This page
        explains what information it collects, how that information is used, and the choices you have.
      </p>

      <h4 className="mt-4">What we collect</h4>
      <ul>
        <li>Your <strong>name</strong> and <strong>email address</strong> (used for your account and to email your list to yourself).</li>
        <li>Your <strong>password</strong>, stored only as a securely hashed value — never in plain text.</li>
        <li>Your <strong>medication list</strong> and dosing schedule.</li>
      </ul>

      <h4 className="mt-4">How we use it</h4>
      <ul>
        <li>Only to provide the app to you: to store and display your medication list, check for interactions, and generate your printout/email.</li>
        <li>We do <strong>not</strong> sell or share your personal information.</li>
      </ul>

      <h4 className="mt-4">Information sent to other services</h4>
      <ul>
        <li>When you check interactions, look up a medication, or view a description, the <strong>medication name</strong> (not your identity) is sent to public U.S. government drug databases (NLM RxNorm, openFDA, DailyMed).</li>
        <li>When you use the discount buttons, the medication name is used to open a price page on GoodRx or SingleCare in a new tab.</li>
        <li>When you email your list, it is handed to your chosen email service (Gmail, Outlook, Yahoo, or your default mail app) — Pharm-Assist does not send email itself.</li>
      </ul>

      <h4 className="mt-4">Security</h4>
      <ul>
        <li>Passwords are hashed with bcrypt.</li>
        <li>The site is served over HTTPS, and your login is kept in a secure, http-only cookie.</li>
        <li>This is a personal/portfolio project provided “as is,” without warranty. Please don’t store information you would consider highly sensitive.</li>
      </ul>

      <h4 className="mt-4">Not medical advice</h4>
      <p>
        Interaction and drug information comes from public FDA/NLM data and may be incomplete or out
        of date. Pharm-Assist does not provide medical advice. Always consult a healthcare
        professional or pharmacist.
      </p>

      <h4 className="mt-4">Your choices</h4>
      <p>You can permanently delete your account and all of your data at any time.</p>

      {loggedIn === true ? (
        <>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Delete My Account
          </button>
          {error && <p className="text-danger mt-2">{error}</p>}
        </>
      ) : (
        <p className="text-muted">Log in to delete your account.</p>
      )}
    </div>
  );
}
