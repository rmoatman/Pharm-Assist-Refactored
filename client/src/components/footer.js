// footer.js
// The site footer (navigation links), shown at the very bottom of every page —
// separate from the medical Disclaimer banner. It's rendered in app1.js OUTSIDE
// the Router, so it uses plain <a> tags (a full navigation is fine for a footer)
// rather than react-router <Link>.

import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <a href="/about">About</a>
        <a href="/install">Install App</a>
        <a href="/privacy">Privacy &amp; Security</a>
        <a href="mailto:raemarie.oatman@gmail.com">Email</a>
        <a href="https://github.com/rmoatman/Pharm-Assist-Refactored" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
      <div className="footer-copy">© {year} Pharm-Assist</div>
    </footer>
  );
}
