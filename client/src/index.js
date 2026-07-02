// ============================================================================
// index.js — The React ENTRY / MOUNT POINT for the whole app.
// This is the very first JavaScript file that runs in the browser. Its job is
// to take our top-level React component (<App />) and "mount" (render) it into
// the actual HTML page so the user can see it.
// ============================================================================

// Import the core React library. Needed so we can write React components/JSX.
import React from 'react';
// Import ReactDOM, the piece of React that knows how to put React components
// into the real web page (the browser's DOM). In React 17 we use ReactDOM.render.
import ReactDOM from 'react-dom';
// Import our top-level App component from app1.js (the "./" means same folder).
import App from './app1.js';
// Import global CSS styles. Importing a .css file here applies those styles
// across the whole app; there is no variable to use, we just load the file.
import './index.css';

// App.js is located in /src
// ReactDOM.render(whatToShow, whereToPutIt) draws our React UI onto the page.
ReactDOM.render(
  // <React.StrictMode> is a development-only helper. It wraps the app and warns
  // you about potential problems in your code. It does not render any visible UI.
  <React.StrictMode>
    {/* <App /> is our whole application. Everything else lives inside it. */}
    <App />
  </React.StrictMode>,
  // Find the <div id="root"></div> element inside public/index.html and render
  // the React app into it. This is the single spot on the page React controls.
  document.getElementById('root')
);

// Register the service worker (public/sw.js) so the app is installable and works
// offline. Only runs in production builds served over HTTPS (or localhost).
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('Service worker registration failed:', err);
    });
  });
}
