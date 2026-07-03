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
import MedNameInput from "./mednameinput"; // Reusable medication-name autocomplete input.

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
        "/api/interactions",
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
          <div className="col-md-12 m-3 m-md-5">
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
              <li>Do you want to look for discounts?</li>
            </ul>
            <p>
              Pharm-Assist provides your daily medication schedule and can alert you when
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
            <strong>
              <Link to="/sign-up">Sign up</Link> to customize your medication
              schedule!
            </strong>
          </div>
        </div>
      </div>

      {/* Div Container that Holds the Mediation to Compare Form */}
      <div className="container">

        {/* div Row Holding Compare From and Good RX Widget */}
        <div className="row">

          {/* div Holding Two Medication Input Fields */}
          <div className="col-md-6 pt-5" id="interactions">

            {/* Equal-height header so the first input lines up with the other section. */}
            <div style={{ minHeight: '90px' }}>
              <h3>Check Drug Interactions</h3>
              <p>Enter two medications to check for interactions.</p>
            </div>

{/* handleFormSubmit is defined above -- it runs the interaction check when this form is submitted */}
            {/* Medication to Compare Form */}
            <Form onSubmit={handleFormSubmit}>

              {/* Medication 1 to Compare */}
              <Form.Group className="mb-3">
                <MedNameInput
                  id="medicationOne"
                  placeholder="Medication 1"
                  value={medicationOne}
                  onChange={setMedicationOne}
                  required
                />
              </Form.Group>
              {/* End of Medication 1 to Compare */}

              {/* Medication 2 to Compare */}
              <Form.Group className="mb-3">
                <MedNameInput
                  id="medicationTwo"
                  placeholder="Medication 2"
                  value={medicationTwo}
                  onChange={setMedicationTwo}
                  required
                />
              </Form.Group>
              {/* End of Mediation 2 to Compare Form */}

              <button className="btn btn-outline-info mb-2" type="submit">
                Check for Interactions!
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
          <div className="col-md-6 pt-5" id="prices">
            {/* Equal-height header so the input lines up with the other section. */}
            <div style={{ minHeight: '90px' }}>
              <h3>Check Prescription Prices</h3>
              <p>Enter a medication to find discount prices.</p>
            </div>
            <div className="mb-3">
              <MedNameInput
                placeholder="Medication name (e.g. lisinopril)"
                value={priceDrug}
                onChange={setPriceDrug}
              />
            </div>
            {/* Spacer aligns the buttons with the other section's button on wide (md+) screens.
                Hidden on phones (where the sections stack) so the input sits right above the buttons. */}
            <div className="mb-3 d-none d-md-block" style={{ height: '38px' }} aria-hidden="true"></div>
            {/* Two buttons that open the drug's price page on each site. Side by side with a
                0.3in gap on wide screens; when they stack on phones, the vertical gap is 1rem
                to match the space above the first button. */}
            <div className="d-flex flex-wrap mb-2 mt-2" style={{ columnGap: '0.3in', rowGap: '1rem' }}>
              <button
                type="button"
                className="btn btn-outline-info"
                onClick={() => priceDrug.trim() && window.open(goodRxUrl(priceDrug), '_blank', 'noopener')}
              >
                Search GoodRX!
              </button>
              <button
                type="button"
                className="btn btn-outline-info"
                onClick={() => priceDrug.trim() && window.open(singleCareUrl(priceDrug), '_blank', 'noopener')}
              >
                Search SingleCare!
              </button>
            </div>
          </div>

        </div>
        {/* End of div Row Holding Compare From and Good RX Widget */}

      </div>
      {/* End of div Container that Holds the Medication to Compare Form */}

    </main>
  );
}
// End of About()