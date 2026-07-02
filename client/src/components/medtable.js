// medtable.js
// A presentational table that displays the user's medications.
// It receives two props from its parent (MedList):
//   - medlist: the array of medication objects to show
//   - onDelete: a function to call when a "Remove" button is clicked
// It does NOT fetch or delete data itself -- it just displays rows and reports
// clicks back up to the parent via onDelete.

import React from 'react'

// Note: "props" holds the data passed in from the parent component (MedList).
export default function medTable(props) {

    // (Old delete logic, left commented out -- deletion is now handled by the parent via onDelete.)
    // const handleDeleteMed = async (event) => {
    //     event.preventDefault();
    //     try{
    //         await axios.delete('http://localhost:3001/api/users/deleteMed',)
    //     } catch (err){
    //         console.error(err)
    //     }
    // };
    // console.log('THIS IS PROPS')

    // Builds the table's header row (<th> cells) from a fixed list of column names.
    const renderHeader = () => {
        let headerElement = ['title', 'morning', 'afternoon', 'evening', 'night', 'as needed', 'remove']

        // Turn each column name into an uppercase <th>. "key" helps React track list items.
        return headerElement.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })
    }

    // Builds the table's body rows, one per medication.
    const displayMeds = (props) => {
        const {medlist, onDelete} = props // Pull the medications array and delete callback out of props.

        // If there is at least one medication, render a row for each.
        if (medlist.length>0){
            return(
                // Loop over each medication object and return a table row for it.
                medlist.map((med) => {
                    return (
                                // Each row needs a unique "key" -- here we use the med's database _id.
                                <tr key={med._id}>
                                    {/* Medication name */}
                                    <td>{med.title}</td>
                                    {/* Read-only checkboxes showing which times of day this med is scheduled. */}
                                    {/* checked={!!med.morning} converts the value to a true/false; readOnly = display only, not editable. */}
                                    <td><input type="checkbox" id={`medication_${med._id}_morning`} checked={!!med.morning} readOnly aria-label={`Checkbox for ${med.title} in the morning`} /></td>
                                    <td><input type="checkbox" id={`medication_${med._id}_afternoon`} checked={!!med.afternoon} readOnly aria-label={`Checkbox for ${med.title} in the afternoon`} /></td>
                                    <td><input type="checkbox" id={`medication_${med._id}_evening`} checked={!!med.evening} readOnly aria-label={`Checkbox for ${med.title} in the evening`} /></td>
                                    <td><input type="checkbox" id={`medication_${med._id}_night`} checked={!!med.night} readOnly aria-label={`Checkbox for ${med.title} in the night`} /></td>
                                    <td><input type="checkbox" id={`medication_${med._id}_as_needed`} checked={!!med.as_needed} readOnly aria-label={`Checkbox for ${med.title} as needed`} /></td>
                                    {/* Remove button: clicking calls onDelete(med.title), which the parent uses to delete this med. */}
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => onDelete(med.title)}
                                            aria-label={`Remove ${med.title}`}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                    )
                })
            )
        }else {
            // If there are no medications, show a simple message instead of rows.
            return (<h2>no meds!</h2>)
        }
    }
    return (
        // The overall table. renderHeader() fills the header; displayMeds() fills the body.
        <table className="table table-striped">
            <thead>
                {/* Header row of column titles */}
                <tr>{renderHeader()}</tr>
            </thead>
            <tbody>
                {/* One row per medication (or a "no meds!" message if the list is empty) */}
                {displayMeds(props)}
            </tbody>
        </table>
    )
}