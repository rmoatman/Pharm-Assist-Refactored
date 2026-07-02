// medlist.js
// The main "Your Medication List" page (shown to logged-in users).
// It does three things:
//   1. Loads the current user's medications from the API on first render.
//   2. Shows them in a table (the imported Medtable component).
//   3. Provides a form to add a new medication, and delete handling for removing one.
// After any add or delete it re-fetches the list so the table stays up to date.

import React from "react";
import { useState, useEffect, useRef } from "react"; // useState = local state; useEffect = run after render; useRef = point at the printable DOM node.
import axios from "axios"; // HTTP client used to call the REST API.
import ReactToPrint from "react-to-print"; // Adds a "print this element" trigger.
import Medtable from "./medtable"; // Child component that renders the medications as a table.
import InteractionWarnings from "./interactionwarnings"; // Shows any drug-interaction warnings for the list.
import PrintableMedList from "./printablemedlist"; // Clean print-only version of the list.


export default function MedList() {

    // --- State for the "Add a Medication" form fields ---
    const [ title, setTitle ] = useState('');              // The medication's name.
    const [ morning, setMorning ] = useState(false);       // Checkbox: take in the morning?
    const [ afternoon, setAfternoon ] = useState(false);   // Checkbox: take in the afternoon?
    const [ evening, setEvening ] = useState(false);       // Checkbox: take in the evening?
    const [ night, setNight ] = useState(false);           // Checkbox: take at night?
    const [ as_needed, setAsNeeded] = useState(false);     // Checkbox: take as needed?

    // Runs when the "Add Medication" form is submitted.
    const handlenewMedSubmit = async (event) => {
        event.preventDefault(); // Prevent the default page reload.

        try {
            // Gather all form fields into one object to send to the server.
            const medicineData = {
                title,
                morning,
                afternoon,
                evening,
                night,
                as_needed,
            }

            // POST the new medication to the saveMed endpoint.
            await axios.post(
                "http://localhost:3001/api/users/saveMed",
                medicineData
            );

            // refresh the table so the new medication shows up immediately
            await getUserData();
        } catch (err) {
              console.error(err); // Log any error for debugging.
            }

        // Reset all the form fields back to empty/unchecked after submitting.
        setTitle('');
        setMorning(false);
        setAfternoon(false);
        setEvening(false);
        setNight(false);
        setAsNeeded(false);
    };

    // Runs when a medication's "Remove" button is clicked (passed down to Medtable as onDelete).
    // Receives the medication's title and deletes it.
    const handleDeleteMed = async (title) => {
        try {
            // GET the deleteMed endpoint, passing the title as a URL query parameter (encoded for safety).
            await axios.get(
                `http://localhost:3001/api/users/deleteMed?title=${encodeURIComponent(title)}`
            );
            // refresh the table so the removed medication disappears immediately
            await getUserData();
        } catch (err){
            console.error(err) // Log any error for debugging.
        }
    };

    // Runs when an edited schedule is saved in the table (passed down as onUpdate).
    // medId identifies which medication; schedule is the new time-of-day flags.
    const handleUpdateMed = async (medId, schedule) => {
        try {
            await axios.post(
                "http://localhost:3001/api/users/updateMed",
                { medId, ...schedule }
            );
            // refresh so the updated schedule (and interaction check) reflect the change
            await getUserData();
        } catch (err) {
            console.error(err);
        }
    };

    const [medications, setMedications] = React.useState([]) // (Present but effectively unused for display.)
    const [medlist, getMedList] = useState('');              // Holds the array of medications shown in the table.
    const [interactions, setInteractions] = useState([]);          // Flagged interaction pairs from the API.
    const [checkingInteractions, setCheckingInteractions] = useState(false); // True while the interaction check runs.
    const printRef = useRef();                                     // Points at the off-screen printable list for react-to-print.

    // useEffect with an empty [] dependency array runs ONCE, right after the first render.
    // Here it loads the user's medication data when the page first appears.
    useEffect(() => {
        getData()
        getUserData();
    }, [])

    // Resets the "medications" state (note: called with no argument, so it sets it to undefined).
    const getData = async () => {
        setMedications()
    }

    // Sends the current medication titles to the interaction checker and stores
    // any flagged pairs. Needs at least two meds to have anything to compare.
    const checkMedInteractions = async (meds) => {
        const titles = (meds || []).map((m) => m.title).filter(Boolean);
        if (titles.length < 2) {
            setInteractions([]); // fewer than 2 meds -> nothing to flag
            return;
        }
        try {
            setCheckingInteractions(true);
            const res = await axios.post("http://localhost:3001/api/interactions", { meds: titles });
            setInteractions(res.data.interactions || []);
        } catch (err) {
            console.error(err);
            setInteractions([]); // on error, don't show stale/false warnings
        } finally {
            setCheckingInteractions(false);
        }
    };

    // Fetches the logged-in user's saved medications from the API and stores them in "medlist".
        const getUserData = () => {
        return axios.get("http://localhost:3001/api/users/getSingleUser")
        .then((response) => {
            const medlist = response.data.medList // The user's medication array from the server.
            console.log(medlist)                  // Log it for debugging.
            getMedList(medlist);                  // Save it into state so the table re-renders.
            checkMedInteractions(medlist);        // Re-check the updated list for interactions.
        })
        .catch(error => console.log(error));      // Log any request error.
      }

        // Helper that returns the "Add a Medication" form JSX.
        const renderForm = () => {
            return (
                    <>
                    <h3 className="mt-4 mb-4">Add a Medication to your List</h3>

                        {/* This form runs handlenewMedSubmit when submitted */}
                        <form onSubmit={handlenewMedSubmit}>
                            {/* Medication name text input -- updates the "title" state */}
                            <div className="form-group row">
                                <label htmlFor="title" className="col-sm-2 col-form-label">Medication Name</label>
                                <div className="col-sm-10">
                                    <input type="text" className="form-control" id="title" placeholder="Medication Name" onChange={(e) => setTitle(e.target.value)} value={title} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <div className="col-sm-2">
                                    Schedule
                                </div>
                                {/* Schedule checkboxes: each toggles its own true/false state */}
                                <div className="col-sm-10">
                                    {/* Morning checkbox -- updates "morning" state */}
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="setMorning" checked={morning} onChange={(e) => setMorning(e.target.checked)} value={morning} />
                                        <label htmlFor="setMorning" className="form-check-label">Morning</label>
                                    </div>
                                    {/* Afternoon checkbox -- updates "afternoon" state */}
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="setAfternoon" checked={afternoon} onChange={(e) => setAfternoon(e.target.checked)} value={afternoon} />
                                        <label htmlFor="setAfternoon" className="form-check-label">Afternoon</label>
                                    </div>
                                    {/* Evening checkbox -- updates "evening" state */}
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="setEvening" checked={evening} onChange={(e) => setEvening(e.target.checked)} value={evening} />
                                        <label htmlFor="setEvening" className="form-check-label">Evening</label>
                                    </div>
                                    {/* Night checkbox -- updates "night" state */}
                                    <div className="form-check">
                                        <input type="checkbox"  className="form-check-input" id="setNight" checked={night} onChange={(e) => setNight(e.target.checked)} value={night} />
                                        <label htmlFor="inputEmail4" className="form-check-label">Night</label>
                                    </div>
                                    {/* As Needed checkbox -- updates "as_needed" state */}
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="setAsNeeded" checked={as_needed} onChange={(e) => setAsNeeded(e.target.checked)} value={as_needed} />
                                        <label htmlFor="setAsNeeded" className="form-check-label">As Needed</label>
                                    </div>
                                </div>
                                {/* Submit button that triggers handlenewMedSubmit to save the medication */}
                                <div className="form-group row">
                                    <div className="col-12">
                                        <button className="mt-3 btn btn-outline-info" type="submit">
                                            Add Medication
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </>
        )}

    return (
        <>
            <div className="container">
                {/* Top section: the medication table. */}
                <div className="row">
                    <div className="col-md-12">
                        <h1 className="mt-4 mb-4">Your Medication List</h1>
                        {/* Print / Save-as-PDF button: prints the off-screen PrintableMedList below. */}
                        <ReactToPrint
                            trigger={() => (
                                <button type="button" className="btn btn-outline-secondary mb-3">
                                    Print / Save as PDF
                                </button>
                            )}
                            content={() => printRef.current}
                            documentTitle="Medication List"
                        />
                        {/* Interaction warnings for the current list (Phase 2). */}
                        <InteractionWarnings interactions={interactions} loading={checkingInteractions} medCount={medlist.length} />
                        {/* Medtable displays the meds; onDelete/onUpdate let it remove or edit-schedule a med. */}
                        <Medtable medlist={medlist} onDelete={handleDeleteMed} onUpdate={handleUpdateMed} />
                        {/* Off-screen clean copy used only for printing (kept in the DOM so react-to-print can capture it). */}
                        <div style={{ position: "absolute", left: "-9999px", top: 0 }} aria-hidden="true">
                            <PrintableMedList ref={printRef} meds={Array.isArray(medlist) ? medlist : []} />
                        </div>
                    </div>
                </div>
                {/* Bottom section: the "Add a Medication" form (built by renderForm above). */}
                <div className="row">
                    <div className="col-md-12">
                        <hr />
                        {renderForm()}
                    </div>
                </div>
            </div>
        </>
    )
}