// medtable.js
// A table that displays the user's medications and lets them edit a med's
// dosing schedule in place. It receives three props from its parent (MedList):
//   - medlist:  the array of medication objects to show
//   - onDelete: called with a med's title when its "Remove" button is clicked
//   - onUpdate: called with (medId, schedule) when an edited schedule is saved
// The table owns a little local state to track which row is being edited and the
// in-progress ("draft") schedule for that row; saving/deleting is done by the parent.

import React, { useState } from 'react';

// The schedule fields that make up a medication's dosing schedule.
const SCHEDULE_FIELDS = ['morning', 'afternoon', 'evening', 'night', 'weekly', 'as_needed'];

export default function MedTable(props) {
    const { medlist, onDelete, onUpdate, images = {} } = props;

    // Which medication row is currently being edited (its _id), or null if none.
    const [editingId, setEditingId] = useState(null);
    // The in-progress schedule while editing a row (a copy of that med's flags).
    const [draft, setDraft] = useState({});

    // Enter edit mode for a med: remember its id and copy its current schedule.
    const startEdit = (med) => {
        setEditingId(med._id);
        setDraft({
            morning: !!med.morning,
            afternoon: !!med.afternoon,
            evening: !!med.evening,
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
        let headerElement = ['title', 'morning', 'afternoon', 'evening', 'night', 'weekly', 'as needed', 'actions'];
        return headerElement.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>;
        });
    };

    // Builds the table body: one row per medication.
    const displayMeds = () => {
        // Nothing saved yet (or the list hasn't loaded) -> show a friendly message.
        if (!medlist || medlist.length === 0) {
            return (<tr><td colSpan="8"><h2>no meds!</h2></td></tr>);
        }

        return medlist.map((med) => {
            const isEditing = editingId === med._id; // is THIS row being edited?

            // A single schedule checkbox cell. While editing it's toggleable and
            // bound to the draft; otherwise it's read-only and shows the saved value.
            const scheduleCell = (field) => (
                <td>
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
                    {/* Medication name, plus a pill image thumbnail when one is available. */}
                    <td>
                        {med.title}
                        {images[med.title] && (
                            <img
                                src={images[med.title]}
                                alt={`${med.title} pill`}
                                style={{ height: '40px', marginLeft: '8px', verticalAlign: 'middle' }}
                            />
                        )}
                    </td>
                    {/* The five schedule checkboxes */}
                    {SCHEDULE_FIELDS.map((field) => (
                        <React.Fragment key={field}>{scheduleCell(field)}</React.Fragment>
                    ))}
                    {/* Actions: Edit/Remove normally, or Save/Cancel while editing this row. */}
                    <td>
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm me-2"
                                    onClick={() => saveEdit(med._id)}
                                    aria-label={`Save schedule for ${med.title}`}
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
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
                                    className="btn btn-outline-primary btn-sm me-2"
                                    onClick={() => startEdit(med)}
                                    aria-label={`Edit schedule for ${med.title}`}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
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

    return (
        <table className="table table-striped">
            <thead>
                <tr>{renderHeader()}</tr>
            </thead>
            <tbody>
                {displayMeds()}
            </tbody>
        </table>
    );
}
