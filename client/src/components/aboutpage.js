// aboutpage.js
// The "/about" page: the story behind Pharm-Assist and credits for the original
// class-project team. Reachable from the site footer. (Distinct from about.js,
// which is the home/landing page.) Styled with the shared .info-* classes in
// app.css so it matches the rest of the site.

import React from 'react';

// The original student team, with their GitHub profiles.
const TEAM = [
  { name: 'Anam Brazik', gh: 'abrazik' },
  { name: 'Bernie McKnight', gh: 'sissyhanks' },
  { name: 'Judy Motha', gh: 'JudyMotha' },
  { name: 'Lance Bailey', gh: 'lancebailey26' },
  { name: 'Raemarie Oatman', gh: 'rmoatman' },
];

export default function AboutPage() {
  return (
    <main className="info-page">
      <p className="info-eyebrow">About</p>
      <h1>From a class project to a living app.</h1>

      <p className="info-lead">
        Pharm-Assist began as an academic project — a team of students building a practical tool
        to help people manage their medications, check for interactions, and find prescription
        discounts. What started as coursework became a foundation worth carrying forward.
      </p>

      <p className="info-section-label">Original team</p>
      <ul className="info-credits">
        {TEAM.map((m) => (
          <li key={m.gh}>
            <span className="info-credit-name">{m.name}</span>
            <a
              className="info-credit-link"
              href={`https://github.com/${m.gh}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/{m.gh}
            </a>
          </li>
        ))}
      </ul>

      <div className="info-card">
        <p>
          In <strong>July 2026</strong>, Raemarie Oatman began refactoring and modernizing
          Pharm-Assist in collaboration with <strong>Claude Code (Anthropic)</strong>, evolving
          the app from its academic origins into a refined, production-ready platform.
        </p>
      </div>
    </main>
  );
}
