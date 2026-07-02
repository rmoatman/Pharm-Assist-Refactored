// printablemedlist.js
// A clean, print-friendly version of the medication list (no buttons/checkboxes
// you can click), meant to be printed or saved as a PDF and shared with a
// provider. It is rendered off-screen in MedList and captured by react-to-print.
// It uses React.forwardRef so the print library can grab its underlying DOM node.

import React from 'react';

// Column definitions: [med field, human label].
const SCHEDULE = [
  ['morning', 'Morning'],
  ['afternoon', 'Afternoon'],
  ['evening', 'Evening'],
  ['night', 'Night'],
  ['as_needed', 'As needed'],
];

// Inline styles so the printout looks tidy without depending on app CSS.
const cell = { border: '1px solid #333', padding: '6px 10px', textAlign: 'left' };
const centerCell = { ...cell, textAlign: 'center' };

const PrintableMedList = React.forwardRef(({ meds = [] }, ref) => {
  const list = Array.isArray(meds) ? meds : []; // medlist can start as '' before it loads

  return (
    <div ref={ref} style={{ padding: '24px', color: '#000' }}>
      <h2>Medication List</h2>
      {/* Print date so the shared copy is dated. */}
      <p>Printed: {new Date().toLocaleDateString()}</p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={cell}>Medication</th>
            {SCHEDULE.map(([, label]) => (
              <th key={label} style={centerCell}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td style={cell} colSpan={6}>No medications.</td></tr>
          ) : (
            list.map((med) => (
              <tr key={med._id}>
                <td style={cell}>{med.title}</td>
                {SCHEDULE.map(([field, label]) => (
                  <td key={label} style={centerCell}>{med[field] ? '✓' : ''}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p style={{ marginTop: '16px', fontSize: '0.85em' }}>
        Informational only — not medical advice. Please review with a healthcare professional or pharmacist.
      </p>
    </div>
  );
});

export default PrintableMedList;
