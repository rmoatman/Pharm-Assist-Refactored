// installapp.js
// The "/install" page: how to install Pharm-Assist as a PWA on iPhone/iPad,
// Android, and desktop. Reachable from the site footer. Styled with the shared
// .info-* classes in app.css so it matches the rest of the site.

import React from 'react';

const SITE = 'pharm-assist-refactored.onrender.com';

// One install guide per platform.
const GUIDES = [
  {
    title: 'iPhone & iPad',
    meta: 'Use Safari',
    steps: [
      <>Open <strong>{SITE}</strong> in <strong>Safari</strong>. (Installing won't work in Chrome on iOS.)</>,
      <>Tap the <strong>Share</strong> button — the square with an arrow pointing up.</>,
      <>Scroll down and tap <strong>Add to Home Screen</strong>.</>,
      <>Tap <strong>Add</strong> in the top-right corner.</>,
    ],
    note: <>The Pharm-Assist icon will appear on your home screen.</>,
  },
  {
    title: 'Android',
    meta: 'Use Chrome',
    steps: [
      <>Open <strong>{SITE}</strong> in <strong>Chrome</strong>.</>,
      <>Tap the <strong>menu</strong> button — three dots, top-right.</>,
      <>Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>).</>,
      <>Confirm by tapping <strong>Install</strong>.</>,
    ],
    note: <>You may also see an install banner appear automatically — if so, just tap <strong>Install</strong>.</>,
  },
  {
    title: 'Desktop',
    meta: 'Use Chrome or Edge',
    steps: [
      <>Open <strong>{SITE}</strong> in <strong>Chrome</strong> or <strong>Edge</strong>.</>,
      <>Look for the <strong>install icon</strong> in the address bar — a monitor with a down arrow, or a small plus.</>,
      <>Click it, then click <strong>Install</strong>.</>,
    ],
    note: <>Pharm-Assist will open in its own window and be available from your applications.</>,
  },
];

export default function InstallApp() {
  return (
    <main className="info-page">
      <p className="info-eyebrow">Install App</p>
      <h1>Keep your meds within reach.</h1>

      <p className="info-lead">
        Pharm-Assist installs straight from your browser — no app store required. Once installed,
        it opens like a native app with its own icon on your home screen or desktop.
      </p>

      <div className="info-card">
        <p>
          <strong>Why install?</strong> Installing puts Pharm-Assist one tap away, so your
          medication list is easy to reach wherever you have a connection — at the pharmacy, at the
          doctor's office, or on the go.
        </p>
      </div>

      {GUIDES.map((g, gi) => (
        <React.Fragment key={g.title}>
          <section className="info-device">
            <h2>{g.title}</h2>
            <p className="info-meta">{g.meta}</p>
            <ol className="info-steps">
              {g.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <p className="info-note">{g.note}</p>
          </section>
          {gi < GUIDES.length - 1 && <hr className="info-divider" />}
        </React.Fragment>
      ))}
    </main>
  );
}
