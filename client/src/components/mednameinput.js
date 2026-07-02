// mednameinput.js
// A reusable text input with medication-name autocomplete. As the user types
// (3+ chars), it fetches name + strength suggestions from /api/drugsuggest and
// shows a dropdown; clicking one fills the field. Used on the med list and on
// the homepage's interaction and price-check fields.
//
// Props:
//   value        - current text (controlled by the parent)
//   onChange     - called with the new text (typing or picking a suggestion)
//   placeholder  - input placeholder
//   id           - input id (optional)
//   required     - mark the input as required (optional)
//   className    - input class (defaults to Bootstrap "form-control")

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function MedNameInput({ value, onChange, placeholder, id, required = false, className = 'form-control' }) {
  const [suggestions, setSuggestions] = useState([]);
  const timer = useRef(); // debounce timer so we don't fetch on every keystroke

  // Clear the dropdown if the parent clears the field (e.g. after adding a med).
  useEffect(() => {
    if (!value) setSuggestions([]);
  }, [value]);

  const handleChange = (v) => {
    onChange(v);
    clearTimeout(timer.current);
    if (v.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const r = await axios.get(`http://localhost:3001/api/drugsuggest?q=${encodeURIComponent(v.trim())}`);
        setSuggestions(r.data.suggestions || []);
      } catch (err) {
        setSuggestions([]);
      }
    }, 300);
  };

  // Fill the field with a chosen suggestion and close the dropdown.
  const pick = (s) => {
    onChange(s);
    setSuggestions([]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        id={id}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
        required={required}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="list-group" style={{ position: 'absolute', zIndex: 20, width: '100%', maxHeight: '220px', overflowY: 'auto' }}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="list-group-item list-group-item-action"
              style={{ cursor: 'pointer' }}
              onMouseDown={() => pick(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
