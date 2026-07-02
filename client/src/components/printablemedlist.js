// printablemedlist.js
// A clean, print-friendly version of the medication list, meant to be printed or
// saved as a PDF and shared with a provider. Instead of one big grid, the meds
// are grouped into a small table PER TIME OF DAY (Morning, Afternoon, ...), so
// the printout reads like a daily schedule. A medication taken at more than one
// time appears in each of those groups. Rendered off-screen in MedList and
// captured by react-to-print (via React.forwardRef).

import React from 'react';

// Each schedule field and its heading, in the order they should print.
const GROUPS = [
  ['morning', 'Morning'],
  ['afternoon', 'Afternoon'],
  ['night', 'Night'],
  ['weekly', 'Weekly'],
  ['as_needed', 'As needed'],
];

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
// Borderless cell — the mini-tables show no grid lines.
const cell = { border: 'none', padding: '2px 6px', textAlign: 'left', verticalAlign: 'middle' };

const PrintableMedList = React.forwardRef(({ meds = [], interactions = [], firstName = '', lastName = '' }, ref) => {
  const list = Array.isArray(meds) ? meds : []; // medlist can start as '' before it loads
  const flagged = Array.isArray(interactions) ? interactions : [];

  // Build "First L." from the logged-in user's name (last name shown as an initial).
  const lastInitial = lastName ? `${lastName.charAt(0).toUpperCase()}.` : '';
  const owner = `${firstName} ${lastInitial}`.trim();

  // One group per time of day, plus a catch-all for meds with no time set so
  // nothing is dropped from the printout.
  const groups = GROUPS.map(([field, label]) => ({ label, meds: list.filter((m) => m[field]) }));
  const unscheduled = list.filter((m) => GROUPS.every(([field]) => !m[field]));
  if (unscheduled.length) groups.push({ label: 'Not scheduled', meds: unscheduled });

  // A borderless mini-table for one time-of-day group. Each row has a checkbox
  // the user can tick on paper, and a line is drawn across the page below it.
  const renderGroup = ({ label, meds }) => (
    <div key={label} style={{ marginBottom: '28px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h3 style={{ margin: '0 0 4px' }}>{label}</h3>
      {/* Line across the page between the category and its first medicine */}
      <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '0 0 8px' }} />
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {meds.map((m) => (
            <tr key={m._id}>
              <td style={{ ...cell, width: '1%', whiteSpace: 'nowrap' }}>
                <input type="checkbox" readOnly />
              </td>
              <td style={cell}>{m.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div ref={ref} style={{ padding: '24px', color: '#000' }}>
      <h2>Medication List{owner ? ` for ${owner}` : ''}</h2>
      {/* Print date so the shared copy is dated (enlarged for readability). */}
      <p style={{ fontSize: '1.3rem' }}>Printed: {new Date().toLocaleDateString()}</p>

      {/* One mini-table per non-empty time-of-day group. */}
      {list.length === 0
        ? <p>No medications.</p>
        : groups.filter((g) => g.meds.length > 0).map(renderGroup)}

      {/* Interaction note: only printed when the check found possible interactions. */}
      {flagged.length > 0 && (
        <div style={{ marginTop: '0.5in', border: '1px solid #b00020', padding: '10px' }}>
          <strong>⚠️ A possible interaction was detected between:</strong>
          <ul style={{ marginTop: '6px', marginBottom: '6px' }}>
            {flagged.map((it, i) => (
              <li key={i}>{cap(it.inputA || it.a)} &amp; {cap(it.inputB || it.b)}</li>
            ))}
          </ul>
          Please contact your healthcare professional or pharmacist.
        </div>
      )}

      <p style={{ marginTop: '16px', fontSize: '0.85em' }}>
        Informational only — not medical advice. Please review with a healthcare professional or pharmacist.
      </p>
    </div>
  );
});

export default PrintableMedList;
