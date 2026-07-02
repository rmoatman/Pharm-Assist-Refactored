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
import MedNameInput from "./mednameinput"; // Reusable medication-name autocomplete input.

// Schedule groups used when building the plain-text list for the email.
const EMAIL_GROUPS = [
  ['morning', 'Morning'],
  ['afternoon', 'Afternoon'],
  ['night', 'Night'],
  ['weekly', 'Weekly'],
  ['as_needed', 'As needed'],
];

// Order of times of day, used to sort by "time taken" (earliest first).
const TIME_ORDER = ['morning', 'afternoon', 'night', 'weekly', 'as_needed'];


export default function MedList() {

    // --- State for the "Add a Medication" form fields ---
    const [ title, setTitle ] = useState('');              // The medication's name.
    const [ morning, setMorning ] = useState(false);       // Checkbox: take in the morning?
    const [ afternoon, setAfternoon ] = useState(false);   // Checkbox: take in the afternoon?
    const [ night, setNight ] = useState(false);           // Checkbox: take at night?
    const [ weekly, setWeekly ] = useState(false);         // Checkbox: take once a week?
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
                night,
                weekly,
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
        setNight(false);
        setWeekly(false);
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
    const [firstName, setFirstName] = useState('');                // Logged-in user's first name (for the printout heading).
    const [lastName, setLastName] = useState('');                  // Logged-in user's last name (for the printout heading).
    const [email, setEmail] = useState('');                        // Logged-in user's email on file (for the Email button).
    const [sortBy, setSortBy] = useState('added');                 // How to sort the on-screen list: 'added' | 'name' | 'time'.
    const [emailProvider, setEmailProvider] = useState('gmail');   // Which email service the "Email My List" button opens.
    const [info, setInfo] = useState({});                          // Map of med title -> { use, description } from the drug-info API.

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

    // Looks up drug info (what it's used for + appearance description) for each
    // medication title and stores them as a { title: { use, description } } map.
    // The server caches results, so repeat calls are cheap.
    const fetchInfo = async (meds) => {
        const titles = [...new Set((meds || []).map((m) => m.title).filter(Boolean))];
        const entries = await Promise.all(
            titles.map(async (t) => {
                try {
                    const r = await axios.get(`http://localhost:3001/api/druginfo?name=${encodeURIComponent(t)}`);
                    return [t, { use: r.data.use, description: r.data.description }];
                } catch (err) {
                    return [t, { use: null, description: null }];
                }
            })
        );
        setInfo(Object.fromEntries(entries));
    };

    // Fetches the logged-in user's saved medications from the API and stores them in "medlist".
        const getUserData = () => {
        return axios.get("http://localhost:3001/api/users/getSingleUser")
        .then((response) => {
            const medlist = response.data.medList // The user's medication array from the server.
            console.log(medlist)                  // Log it for debugging.
            getMedList(medlist);                  // Save it into state so the table re-renders.
            setFirstName(response.data.firstName || ''); // Remember the user's name for the printout.
            setLastName(response.data.lastName || '');
            setEmail(response.data.email || '');         // Remember the email on file for the Email button.
            checkMedInteractions(medlist);        // Re-check the updated list for interactions.
            fetchInfo(medlist);                   // Look up use + description for each medication.
        })
        .catch(error => console.log(error));      // Log any request error.
      }

    // Builds the medication list as plain text (grouped by time of day) for the email body.
    const buildEmailListText = () => {
        const list = Array.isArray(medlist) ? medlist : [];
        const lastInitial = lastName ? `${lastName.charAt(0).toUpperCase()}.` : '';
        const owner = `${firstName} ${lastInitial}`.trim();

        const lines = [];
        lines.push(`Medication List${owner ? ` for ${owner}` : ''}`);
        lines.push(`Generated: ${new Date().toLocaleDateString()}`);
        lines.push('');

        const groups = EMAIL_GROUPS.map(([field, label]) => [label, list.filter((m) => m[field])]);
        const unscheduled = list.filter((m) => EMAIL_GROUPS.every(([field]) => !m[field]));
        if (unscheduled.length) groups.push(['Not scheduled', unscheduled]);

        let any = false;
        groups.forEach(([label, meds]) => {
            if (!meds.length) return;
            any = true;
            lines.push(label.toUpperCase());
            meds.forEach((m) => lines.push(`- ${m.title}`));
            lines.push('');
        });
        if (!any) lines.push('No medications.');

        lines.push('Informational only — not medical advice. Please review with a healthcare professional or pharmacist.');
        return lines.join('\r\n');
    };

    // Opens a new-message window for the chosen email provider, pre-filled with the
    // list and addressed to the email on file. Web providers (Gmail/Outlook/Yahoo)
    // open in a new tab; "Other" falls back to the computer's default mail app.
    const emailMedList = () => {
        const to = encodeURIComponent(email);
        const su = encodeURIComponent('My Medication List');
        const body = encodeURIComponent(buildEmailListText());

        let url;
        switch (emailProvider) {
            case 'outlook':
                url = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}&body=${body}`;
                break;
            case 'yahoo':
                url = `https://compose.mail.yahoo.com/?to=${to}&subject=${su}&body=${body}`;
                break;
            case 'mailto':
                window.location.href = `mailto:${to}?subject=${su}&body=${body}`;
                return;
            case 'gmail':
            default:
                url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
        }
        window.open(url, '_blank', 'noopener');
    };

        // Helper that returns the "Add a Medication" form JSX.
        const renderForm = () => {
            return (
                    <>
                    <h3 className="mb-4">Add a Medication to your List</h3>

                        {/* This form runs handlenewMedSubmit when submitted */}
                        <form onSubmit={handlenewMedSubmit}>
                            {/* Medication name text input -- updates the "title" state */}
                            <div className="form-group row mb-3">
                                <label htmlFor="title" className="col-sm-2 col-form-label">Medication Name</label>
                                <div className="col-sm-10">
                                    <MedNameInput id="title" placeholder="Start typing, e.g. warfarin" value={title} onChange={setTitle} />
                                </div>
                            </div>
                            {/* Schedule checkboxes: each toggles its own true/false state */}
                            <div className="form-group row mb-3">
                                <div className="col-sm-2">
                                    Schedule
                                </div>
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
                                    {/* Night checkbox -- updates "night" state */}
                                    <div className="form-check">
                                        <input type="checkbox"  className="form-check-input" id="setNight" checked={night} onChange={(e) => setNight(e.target.checked)} value={night} />
                                        <label htmlFor="inputEmail4" className="form-check-label">Night</label>
                                    </div>
                                    {/* Weekly checkbox -- updates "weekly" state */}
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="setWeekly" checked={weekly} onChange={(e) => setWeekly(e.target.checked)} value={weekly} />
                                        <label htmlFor="setWeekly" className="form-check-label">Weekly</label>
                                    </div>
                                    {/* As Needed checkbox -- updates "as_needed" state */}
                                    <div className="form-check">
                                        <input type="checkbox" className="form-check-input" id="setAsNeeded" checked={as_needed} onChange={(e) => setAsNeeded(e.target.checked)} value={as_needed} />
                                        <label htmlFor="setAsNeeded" className="form-check-label">As Needed</label>
                                    </div>
                                </div>
                            </div>
                            {/* Submit button (its own row) that triggers handlenewMedSubmit to save the medication */}
                            <div className="row">
                                <div className="col-12">
                                    <button className="btn btn-outline-info" type="submit">
                                        Add Medication
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
        )}

    // Sort the medications for on-screen display based on the selected option.
    const rows = Array.isArray(medlist) ? [...medlist] : [];
    if (sortBy === 'name') {
        rows.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
    } else if (sortBy === 'time') {
        // A med's sort key is the EARLIEST time it's taken, so a med taken more
        // than once a day appears once, at its earliest time.
        const earliest = (m) => {
            for (let i = 0; i < TIME_ORDER.length; i++) if (m[TIME_ORDER[i]]) return i;
            return TIME_ORDER.length; // unscheduled -> after the scheduled meds
        };
        rows.sort((a, b) => (earliest(a) - earliest(b)) || (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
    }

    return (
        <>
            <div className="container">
                {/* Top section: the medication table. */}
                <div className="row">
                    <div className="col-md-12">
                        <h1 className="mt-4 mb-4">Your Medication List</h1>
                        {/* Print + Email buttons on the left, "Add a Medication" button on the right. */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                {/* Print / Save-as-PDF button: prints the off-screen PrintableMedList below. */}
                                <ReactToPrint
                                    trigger={() => (
                                        <button type="button" className="btn btn-outline-secondary mb-3" style={{ verticalAlign: 'middle' }}>
                                            Print / Save as PDF
                                        </button>
                                    )}
                                    content={() => printRef.current}
                                    documentTitle="Medication List"
                                />
                                {/* Opens the mail app with the list pre-filled to the email on file. */}
                                <button type="button" className="btn mb-3" style={{ marginLeft: '0.3in', verticalAlign: 'middle', backgroundColor: '#fff', color: '#212529', border: '1px solid #000' }} onClick={emailMedList}>
                                    Email My List
                                </button>
                                {/* Which email service the button opens. */}
                                <select
                                    className="form-select d-inline-block w-auto mb-3"
                                    style={{ marginLeft: '0.075in', height: 'calc(1.5em + 0.75rem + 2px)', verticalAlign: 'middle' }}
                                    value={emailProvider}
                                    onChange={(e) => setEmailProvider(e.target.value)}
                                    aria-label="Email provider"
                                >
                                    <option value="gmail">Gmail</option>
                                    <option value="outlook">Outlook.com</option>
                                    <option value="yahoo">Yahoo</option>
                                    <option value="mailto">Other (default app)</option>
                                </select>
                            </div>
                            {/* Right-aligned: smooth-scrolls down to the Add a Medication section. */}
                            <button
                                type="button"
                                className="btn btn-outline-info mb-3"
                                onClick={() => document.getElementById('add-medication')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Add a Medication
                            </button>
                        </div>
                        {/* Interaction warnings for the current list (Phase 2). */}
                        <InteractionWarnings interactions={interactions} loading={checkingInteractions} medCount={medlist.length} />
                        {/* Sort control for the on-screen list (shown when there's more than one med). */}
                        {Array.isArray(medlist) && medlist.length > 1 && (
                            <div className="mb-2">
                                <label htmlFor="sortBy" style={{ marginRight: '0.15in' }}>Sort by:</label>
                                <select
                                    id="sortBy"
                                    className="form-select d-inline-block w-auto"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="added">Added order</option>
                                    <option value="name">Name (A–Z)</option>
                                    <option value="time">Time taken</option>
                                </select>
                            </div>
                        )}
                        {/* Medtable displays the (sorted) meds; onDelete/onUpdate let it remove or edit-schedule a med. */}
                        <Medtable medlist={rows} onDelete={handleDeleteMed} onUpdate={handleUpdateMed} info={info} />
                        {/* Off-screen clean copy used only for printing (kept in the DOM so react-to-print can capture it). */}
                        <div style={{ position: "absolute", left: "-9999px", top: 0 }} aria-hidden="true">
                            <PrintableMedList ref={printRef} meds={Array.isArray(medlist) ? medlist : []} interactions={interactions} firstName={firstName} lastName={lastName} />
                        </div>
                    </div>
                </div>
                {/* Bottom section: the "Add a Medication" form, in a bordered box with
                    extra space above it (and the scroll target for the "Add a Medication" button). */}
                <div className="row">
                    <div className="col-md-12">
                        <div id="add-medication" className="rounded p-4 mt-5" style={{ border: '1px solid #333' }}>
                            {renderForm()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}