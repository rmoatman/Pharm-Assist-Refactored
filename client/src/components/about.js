// about.js
// The home/landing page ("About Pharm-Assist"). Besides the welcome text, its
// key feature is a PUBLIC interaction checker (no login required): enter two
// medications and see whether they may interact. It posts the two names to our
// own /api/interactions endpoint and shows the result using the shared
// InteractionWarnings component (the same one the med list uses).

import React, { useState } from "react"; // useState = local state for the inputs and results.
import { Link } from "react-router-dom"; // Link = navigate to another route (e.g. the sign-up page).
import { Form } from "react-bootstrap"; // Pre-styled Bootstrap form components.
import axios from "axios"; // HTTP client used to call our interaction API.
import InteractionWarnings from "./interactionwarnings"; // Shared component that displays the interaction result.
import { goodRxUrl, singleCareUrl } from "../utils/discounts"; // Links to prescription-discount sites.

// Called from src/app.js
export default function About() {
  // Create state to hold saved mediation information
  const [medicationOne, setMedicationOne] = useState(""); // Text typed into the first medication field.
  const [medicationTwo, setMedicationTwo] = useState(""); // Text typed into the second medication field.

  // State for the interaction check result.
  const [interactions, setInteractions] = useState([]); // Flagged pairs returned by the API.
  const [loading, setLoading] = useState(false);        // True while the check is running.
  const [checked, setChecked] = useState(false);        // True once a check has completed (so we show a result).
  const [priceDrug, setPriceDrug] = useState("");       // Medication name typed into the price-check box.

  // Create event handler for Compare Button
  // Runs when the "Compare" form is submitted. Posts the two medication names to
  // our own /api/interactions endpoint (public — no login required) and stores
  // the result so InteractionWarnings can display it.
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent the default page reload on submit.

    try {
      setLoading(true);  // show the "checking…" state
      setChecked(true);  // from now on, render the result area
      const res = await axios.post(
        "http://localhost:3001/api/interactions",
        { meds: [medicationOne, medicationTwo] }
      );
      setInteractions(res.data.interactions || []);
    } catch (err) {
      console.error(err);   // Log any error (failed request, server down, etc.).
      setInteractions([]);  // Don't show stale/false results on error.
    } finally {
      setLoading(false);
    }
  }; // End of handleFormSubmit

  return (
    <main>
      {/* Welcome / intro section: static marketing text describing the app */}
      <div className="container">
        <div className="row">
          <div className="col-md-12 m-5">
            <h1>Hello and welcome to Pharm-Assist!</h1>
            <p>
              Pharm-Assist is a visual directory to help you recognize and
              organize your medications.
            </p>
            <ul>
              <li>Do you take a variety of medications every day?</li>
              <li>
                Do you want an easily accessible, printable list to share with
                your providers?
              </li>
              <li>
                Are you concerned that your medications will negatively interact
                with each other?{" "}
              </li>
            </ul>
            <p>
              It provides your daily medication schedule and can alert you when
              you may need to contact a professional about medication
              interaction.
            </p>
          </div>
        </div>
      </div>
      {/* Colored call-to-action banner with a link to the sign-up page */}
      <div className="container-fluid">
        <div className="row">
          <div
            className="col-lg-12 text-center p-3"
            style={{ backgroundColor: "#A2C4C9" }}
          >
            <Link to="/sign-up">Sign up</Link> to customize your medication
            schedule!
          </div>
        </div>
      </div>

      {/* Div Container that Holds the Mediation to Compare Form */}
      <div className="container">

        {/* div Row Holding Compare From and Good RX Widget */}
        <div className="row">

          {/* div Holding Two Medication Input Fields */}
          <div className="col-md-6 pt-5">

            <h3>Check Interactions between Medications</h3>

{/* handleFormSubmit is defined above -- it runs the interaction check when this form is submitted */}
            {/* Medication to Compare Form */}
            <Form onSubmit={handleFormSubmit}>

              {/* Medication 1 to Compare */}
              <Form.Group>

                <Form.Label htmlFor="medicationOne"></Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Medication 1"
                  name="medicationOne"
                  onChange={(e) => {
                    setMedicationOne(e.target.value);
                  }}
                  value={medicationOne}
                  required
                />

              </Form.Group>
              {/* End of Medication 1 to Compare */}

              {/* Medication 2 to Compare */}
              <Form.Group>
                <Form.Label htmlFor="medicationTwo"></Form.Label>

                <Form.Control
                  type="text"
                  placeholder="Medication 2"
                  name="medicationTwo"
                  onChange={(e) => {
                    setMedicationTwo(e.target.value);
                  }}
                  value={medicationTwo}
                  required
                />

              </Form.Group>
              {/* End of Mediation 2 to Compare Form */}

              <button className="btn btn-outline-info mb-2 mt-2" type="submit">
                Compare
              </button>

            </Form>
            {/* End of Compare Med Form */}

            {/* Show the interaction result once a check has run (Phase 3). */}
            {checked && (
              <div className="mt-3">
                <InteractionWarnings interactions={interactions} loading={loading} medCount={2} />
              </div>
            )}

          </div>
          {/* End of div Holding Two Medication Input Fields */}

          {/* Prescription price check — public, no sign-in needed. */}
          <div className="col-md-6 pt-5">
            <h3>Check Prescription Prices</h3>
            <p>Look up discount prices for a medication — no account needed.</p>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Medication name (e.g. lisinopril)"
              value={priceDrug}
              onChange={(e) => setPriceDrug(e.target.value)}
            />
            {/* Links appear once a name is entered; each opens that drug's price page. */}
            {priceDrug.trim() && (
              <div>
                <a className="btn btn-outline-info me-2" href={goodRxUrl(priceDrug)} target="_blank" rel="noopener noreferrer">
                  GoodRx
                </a>
                <a className="btn btn-outline-info" href={singleCareUrl(priceDrug)} target="_blank" rel="noopener noreferrer">
                  SingleCare
                </a>
              </div>
            )}
          </div>

        </div>
        {/* End of div Row Holding Compare From and Good RX Widget */}

      </div>
      {/* End of div Container that Holds the Medication to Compare Form */}

    </main>
  );
}
// End of About()