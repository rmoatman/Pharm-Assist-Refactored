// interactionwarnings.js
// Shows the result of a drug-interaction check for a list of medications.
// Used on the med list (Phase 2) and reused by the public homepage checker
// (Phase 3). This component is PURELY presentational — the parent does the API
// call and passes the results in as props.

import React from 'react';

// Capitalize the first letter for nicer display (e.g. "warfarin" -> "Warfarin").
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export default function InteractionWarnings({ interactions = [], loading = false, medCount = 0 }) {
  // Nothing to compare until there are at least two medications.
  if (medCount < 2) return null;

  // Still waiting on the interaction API.
  if (loading) {
    return (
      <div className="alert alert-info" role="status">
        Checking your medications for interactions…
      </div>
    );
  }

  // No flagged pairs -> reassuring message (still "informational only").
  if (!interactions.length) {
    return (
      <div className="alert alert-success" role="status">
        No interactions found.{' '}
        <small>(Informational only — not medical advice.)</small>
      </div>
    );
  }

  // One or more flagged pairs -> a warning list.
  return (
    <div className="alert alert-danger" role="alert">
      <strong>⚠️ Possible interaction{interactions.length > 1 ? 's' : ''} found:</strong>
      <ul className="mb-2 mt-2">
        {interactions.map((it, i) => (
          <li key={i}>
            {cap(it.inputA || it.a)} &amp; {cap(it.inputB || it.b)}
          </li>
        ))}
      </ul>
      <small>
        Informational only — not medical advice. Please consult a healthcare professional or pharmacist.
      </small>
    </div>
  );
}
