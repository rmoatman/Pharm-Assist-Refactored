// sampleheader.js
// A tiny presentational component that renders a static page header.
// It has no state, no props, and no data fetching -- it just shows some text.

import React from 'react'; // React is needed so we can write JSX (the HTML-like markup below).
import '../styles/printingstyles.css'; // Imports CSS styles (used mainly for print formatting).

// SampleHeader is a "function component": a function that returns JSX to display.
function SampleHeader() {
  return (
    // {/* A semantic <header> element styled by the "header" CSS class */}
    <header className="header">
      {/* Just a static heading -- no dynamic data here */}
      <h1>This is a Sample Home Page</h1>
    </header>
  );
}

export default SampleHeader; // Makes this component importable from other files.
