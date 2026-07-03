// disclaimer.js
// A small always-visible banner reminding users that this app does NOT provide
// medical advice. Because Pharm-Assist deals with medications and interaction
// data (which can be incomplete or out of date), this notice is shown on every
// page — it is rendered once in app1.js, below the router.

import React from 'react';

export default function Disclaimer() {
  return (
    // A footer banner. Bootstrap's "alert alert-warning" gives it the yellow
    // caution styling; role="alert" helps screen readers announce it.
    <footer className="container-fluid mt-4">
      <div className="alert alert-warning text-center mb-0" role="alert">
        <strong>Disclaimer:</strong> Pharm-Assist is for informational purposes only and does
        not provide medical advice. Interaction results may be incomplete or out of date. Always
        consult a qualified healthcare professional or pharmacist before making any decisions
        about your medications.
        {/* Link to the Privacy & Security page. A plain anchor is used because the
            disclaimer renders outside the Router (a full navigation is fine here). */}
        <div className="mt-1">
          <a href="/privacy">Privacy &amp; Security</a>
        </div>
      </div>
    </footer>
  );
}
