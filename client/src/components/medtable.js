// medtable.js
// A table that displays the user's medications and lets them edit a med's
// dosing schedule in place. It receives three props from its parent (MedList):
//   - medlist:  the array of medication objects to show
//   - onDelete: called with a med's title when its "Remove" button is clicked
//   - onUpdate: called with (medId, schedule) when an edited schedule is saved
// The table owns a little local state to track which row is being edited and the
// in-progress ("draft") schedule for that row; saving/deleting is done by the parent.

import React, { useState } from 'react';
import { goodRxUrl, singleCareUrl } from '../utils/discounts'; // Links to prescription-discount sites.

// The schedule fields that make up a medication's dosing schedule.
const SCHEDULE_FIELDS = ['morning', 'afternoon', 'night', 'weekly', 'as_needed'];

// Human-readable labels for the schedule fields (used by the mobile card view).
const FIELD_LABELS = { morning: 'Morning', afternoon: 'Afternoon', night: 'Night', weekly: 'Weekly', as_needed: 'As needed' };

// Pins the Actions (Edit/Remove) column to the right edge so it stays visible
// even when the wide table scrolls horizontally on smaller screens.
const stickyActions = {
    position: 'sticky',
    right: 0,
    background: '#fff',
    zIndex: 2,
    width: '90px', // narrow, since Edit/Remove are stacked
    boxShadow: '-4px 0 6px -2px rgba(0,0,0,0.12)',
};

export default function MedTable(props) {
    const { medlist, onDelete, onUpdate, info = {} } = props;

    // Which medication row is currently being edited (its _id), or null if none.
    const [editingId, setEditingId] = useState(null);
    // The in-progress schedule while editing a row (a copy of that med's flags).
    const [draft, setDraft] = useState({});
    // The med._id whose "used for" tooltip is currently shown (on hover), or null.
    const [hovered, setHovered] = useState(null);

    // Enter edit mode for a med: remember its id and copy its current schedule.
    const startEdit = (med) => {
        setEditingId(med._id);
        setDraft({
            morning: !!med.morning,
            afternoon: !!med.afternoon,
            night: !!med.night,
            weekly: !!med.weekly,
            as_needed: !!med.as_needed,
        });
    };

    // Leave edit mode without saving.
    const cancelEdit = () => setEditingId(null);

    // Flip one checkbox in the draft schedule.
    const toggleDraft = (field) => setDraft((d) => ({ ...d, [field]: !d[field] }));

    // Save the draft schedule for a med (parent does the API call), then exit edit mode.
    const saveEdit = async (medId) => {
        await onUpdate(medId, draft);
        setEditingId(null);
    };

    // Builds the table's header row from a fixed list of column names.
    const renderHeader = () => {
        let headerElement = ['title', 'morning', 'afternoon', 'night', 'weekly', 'as needed', 'actions'];
        return headerElement.map((key, index) => {
            if (key === 'actions') return <th key={index} style={stickyActions}>{key.toUpperCase()}</th>;
            const isSchedule = key !== 'title'; // center the time-of-day columns over their checkboxes
            return <th key={index} style={isSchedule ? { textAlign: 'center' } : undefined}>{key.toUpperCase()}</th>;
        });
    };

    // Builds the table body: one row per medication.
    const displayMeds = () => {
        // Nothing saved yet (or the list hasn't loaded) -> show a friendly message.
        if (!medlist || medlist.length === 0) {
            return (<tr><td colSpan="7"><h2>no meds!</h2></td></tr>);
        }

        return medlist.map((med, rowIndex) => {
            const isEditing = editingId === med._id; // is THIS row being edited?
            // Match the striped-row background so the pinned Actions column keeps the
            // same grey/white as the rest of the row (table-striped shades odd rows).
            const rowBg = rowIndex % 2 === 0 ? '#f2f2f2' : '#fff';

            // A single schedule checkbox cell. While editing it's toggleable and
            // bound to the draft; otherwise it's read-only and shows the saved value.
            const scheduleCell = (field) => (
                <td style={{ textAlign: 'center' }}>
                    <input
                        type="checkbox"
                        id={`medication_${med._id}_${field}`}
                        checked={isEditing ? !!draft[field] : !!med[field]}
                        onChange={isEditing ? () => toggleDraft(field) : undefined}
                        readOnly={!isEditing}
                        aria-label={`${med.title} ${field.replace('_', ' ')}`}
                    />
                </td>
            );

            return (
                <tr key={med._id}>
                    {/* Medication name, what it's used for, then a spaced-out appearance description. */}
                    <td>
                        <strong>{med.title}</strong>
                        {/* What the medication is used for, in italics. Clamped to one line;
                            hovering shows the full text in a larger, readable tooltip. */}
                        {info[med.title]?.use && (
                            <div
                                style={{ position: 'relative', maxWidth: '320px' }}
                                onMouseEnter={() => setHovered(med._id)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                <div style={{
                                    fontSize: '0.85em', color: '#333', marginTop: '2px', fontStyle: 'italic',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {info[med.title].use}
                                </div>
                                {hovered === med._id && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, zIndex: 30,
                                        background: '#fff', color: '#000', border: '1px solid #ccc',
                                        borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                                        padding: '8px 10px', marginTop: '2px',
                                        width: '340px', maxWidth: '90vw', whiteSpace: 'normal', fontSize: '1rem',
                                    }}>
                                        {info[med.title].use}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Appearance description, with a blank space above it. */}
                        {info[med.title]?.description && (
                            <div style={{ fontSize: '0.8em', color: '#555', marginTop: '10px', maxWidth: '320px' }}>
                                {info[med.title].description}
                            </div>
                        )}
                        {/* Links to check prescription discounts, with a space above them. */}
                        <div style={{ fontSize: '0.8em', marginTop: '14px' }}>
                            💲 Discounts:{' '}
                            <a href={goodRxUrl(med.title)} target="_blank" rel="noopener noreferrer">GoodRx</a>
                            {' · '}
                            <a href={singleCareUrl(med.title)} target="_blank" rel="noopener noreferrer">SingleCare</a>
                        </div>
                    </td>
                    {/* The five schedule checkboxes */}
                    {SCHEDULE_FIELDS.map((field) => (
                        <React.Fragment key={field}>{scheduleCell(field)}</React.Fragment>
                    ))}
                    {/* Actions: Edit/Remove normally, or Save/Cancel while editing this row.
                        Pinned to the right so it's always visible without horizontal scrolling. */}
                    <td style={{ ...stickyActions, background: rowBg }}>
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm d-block w-100"
                                    style={{ marginBottom: '0.15in' }}
                                    onClick={() => saveEdit(med._id)}
                                    aria-label={`Save schedule for ${med.title}`}
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm d-block w-100"
                                    onClick={cancelEdit}
                                    aria-label={`Cancel editing ${med.title}`}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm d-block w-100"
                                    style={{ marginBottom: '0.15in' }}
                                    onClick={() => startEdit(med)}
                                    aria-label={`Edit schedule for ${med.title}`}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm d-block w-100"
                                    onClick={() => onDelete(med.title)}
                                    aria-label={`Remove ${med.title}`}
                                >
                                    Remove
                                </button>
                            </>
                        )}
                    </td>
                </tr>
            );
        });
    };

    // ----- Mobile card view (shown on small screens instead of the wide table) -----

    // The schedule as labeled checkboxes (editable while editing, else read-only).
    const scheduleChecks = (med, isEditing) => (
        <div className="d-flex flex-wrap" style={{ gap: '4px 16px' }}>
            {SCHEDULE_FIELDS.map((field) => (
                <div className="form-check" key={field}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`card_${med._id}_${field}`}
                        checked={isEditing ? !!draft[field] : !!med[field]}
                        onChange={isEditing ? () => toggleDraft(field) : undefined}
                        readOnly={!isEditing}
                    />
                    <label className="form-check-label" htmlFor={`card_${med._id}_${field}`}>{FIELD_LABELS[field]}</label>
                </div>
            ))}
        </div>
    );

    // Edit/Remove (or Save/Cancel) buttons, side by side, for a card.
    const cardActions = (med, isEditing) => (isEditing ? (
        <>
            <button type="button" className="btn btn-outline-success btn-sm" style={{ marginRight: '0.15in' }} onClick={() => saveEdit(med._id)}>Save</button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
        </>
    ) : (
        <>
            <button type="button" className="btn btn-outline-primary btn-sm" style={{ marginRight: '0.15in' }} onClick={() => startEdit(med)}>Edit</button>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => onDelete(med.title)}>Remove</button>
        </>
    ));

    // One card per medication.
    const renderCards = () => {
        if (!medlist || medlist.length === 0) {
            return <h2>no meds!</h2>;
        }
        return medlist.map((med) => {
            const isEditing = editingId === med._id;
            return (
                <div className="card mb-3" key={med._id}>
                    <div className="card-body">
                        <h5 className="card-title mb-1"><strong>{med.title}</strong></h5>
                        {info[med.title]?.use && (
                            <div style={{ fontSize: '0.9em', color: '#333', fontStyle: 'italic' }}>{info[med.title].use}</div>
                        )}
                        {info[med.title]?.description && (
                            <div style={{ fontSize: '0.85em', color: '#555', marginTop: '6px' }}>{info[med.title].description}</div>
                        )}
                        <div className="mt-3 mb-2">
                            <div className="fw-bold mb-1" style={{ fontSize: '0.85em' }}>Schedule</div>
                            {scheduleChecks(med, isEditing)}
                        </div>
                        <div className="mt-2">{cardActions(med, isEditing)}</div>
                        <div style={{ fontSize: '0.85em', marginTop: '10px' }}>
                            💲 Discounts:{' '}
                            <a href={goodRxUrl(med.title)} target="_blank" rel="noopener noreferrer">GoodRx</a>
                            {' · '}
                            <a href={singleCareUrl(med.title)} target="_blank" rel="noopener noreferrer">SingleCare</a>
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <>
            {/* Desktop / tablet (md and up): the full table. table-responsive keeps it
                within the container width; horizontal scroll only if truly needed. */}
            <div className="table-responsive d-none d-md-block">
                <table className="table table-striped">
                    <thead>
                        <tr>{renderHeader()}</tr>
                    </thead>
                    <tbody>
                        {displayMeds()}
                    </tbody>
                </table>
            </div>

            {/* Phones (below md): a stacked card per medication instead of the wide table. */}
            <div className="d-md-none">
                {renderCards()}
            </div>
        </>
    );
}
