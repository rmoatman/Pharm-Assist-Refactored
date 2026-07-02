// ============================================================================
// reportWebVitals.js — Create React App PERFORMANCE BOILERPLATE.
// This file comes with Create React App. It can measure how fast/smooth the app
// feels (Web Vitals metrics) and hand those numbers to a function you provide.
// It is optional; if you never pass a function, it does nothing.
// ============================================================================

// reportWebVitals takes one argument, onPerfEntry: a function that will receive
// each performance measurement. (An "arrow function" is just a way to write a function.)
const reportWebVitals = onPerfEntry => {
  // Only do the work if onPerfEntry was actually given AND is a real function.
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically (lazily) load the "web-vitals" library only when needed, so it
    // isn't part of the initial bundle. When it loads, we pull out five metric
    // functions and call each one, passing our onPerfEntry callback to report to.
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);   // CLS: Cumulative Layout Shift (visual stability).
      getFID(onPerfEntry);   // FID: First Input Delay (responsiveness).
      getFCP(onPerfEntry);   // FCP: First Contentful Paint (first content shown).
      getLCP(onPerfEntry);   // LCP: Largest Contentful Paint (main content loaded).
      getTTFB(onPerfEntry);  // TTFB: Time To First Byte (server response speed).
    });
  }
};

// Export so index.js (or wherever) can optionally call reportWebVitals(...).
export default reportWebVitals;
