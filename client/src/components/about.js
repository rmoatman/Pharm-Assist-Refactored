// about.js
// The home/landing page ("About Pharm-Assist"). Besides the welcome text, its
// key feature is a form that checks for drug interactions between two medications.
// When submitted, it calls external medical APIs (via helper functions) to:
//   1. Look up each drug's RXCUI id (a standard medication identifier).
//   2. Ask an interaction API whether those two drugs interact.
// It then shows the result to the user with a browser alert() popup.

import React, { useState } from "react"; // useState = local state for the two medication inputs.
import { Link } from "react-router-dom"; // Link = navigate to another route (e.g. the sign-up page).
import { Form } from "react-bootstrap"; // Pre-styled Bootstrap form components.
import getRxcui from "../utils/rxcuiapi.js" // Helper that fetches a drug's RXCUI id from an external API.
import getInteraction from "../utils/interactionapi.js"; // Helper that fetches interaction info between two RXCUI ids.

// Called from src/app.js
export default function About() {
  // Create state to hold saved mediation information
  const [medicationOne, setMedicationOne] = useState(""); // Text typed into the first medication field.
  const [medicationTwo, setMedicationTwo] = useState(""); // Text typed into the second medication field.

  // Create state for an alert if compare button selected without meds
  const [showAlert, setShowAlert] = useState(false); // (Declared but not actively used to drive UI here.)

  // Create event handler for Compare Button
  // Runs when the "Compare" form is submitted. Checks the two meds for interactions.
  const handleFormSubmit = async (event) => {

    event.preventDefault(); // Prevent the default page reload on submit.
    // Compare button is working
    console.log("Compare Button Pressed");

    const MedOne = medicationOne; // Grab the current value of the first input.
    const MedTwo = medicationTwo; // Grab the current value of the second input.
    // MedOne and MedTwo are being assigned a value from the form
    console.log("The first med to compare is: " + MedOne);
    console.log("The second med to compare is: " + MedTwo);

    try {
      // Ask the external API for each drug's lookup data (used to find its RXCUI id).
      const response = await getRxcui(MedOne);
      const response2 = await getRxcui(MedTwo)
      // console.log("Variable Check 2: " + MedOne);

      // If the first request wasn't successful, stop and jump to the catch block.
      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      // Parse both responses from JSON into usable JavaScript objects.
      const drug1  = await response.json();
      const drug2 = await response2.json();

      const drug1name = drug1.drugGroup.name // Human-readable name of the first drug.
      const drug2name = drug2.drugGroup.name  // Human-readable name of the second drug.

      // Pick the last conceptGroup entry (its index = length - 1) for each drug.
      const drugarray1 = drug1.drugGroup.conceptGroup.length-1
      const drugarray2 = drug2.drugGroup.conceptGroup.length-1

      console.log(drugarray1)
      console.log(drugarray2)

      // Dig into the response to pull out each drug's RXCUI id (a numeric identifier).
      const drug1num = drug1.drugGroup.conceptGroup[drugarray1].conceptProperties[0].rxcui
      const drug2num = drug2.drugGroup.conceptGroup[drugarray2].conceptProperties[0].rxcui

      console.log("The RXCUI number for " + drug1name + " is: " + drug1num);
      console.log("The RXCUI number for " + drug2name + " is: " + drug2num);

      // Ask the interaction API whether these two RXCUI ids interact, then parse the JSON result.
      const interactionCheck = await getInteraction(drug1num, drug2num)
      const intResponse = await interactionCheck.json();

      // Detect whether a real interaction was returned by checking for a specific DrugBank disclaimer
      // string in the response (its presence indicates an actual interaction record was included).
      const exists = JSON.stringify(intResponse).includes("DrugBank is intended for educational and scientific research purposes only and you expressly acknowledge and agree that use of DrugBank is at your sole risk.");
      console.log(exists)

      // console.log(description)
      // If no interaction record was found, reassure the user; otherwise show the interaction description.
      if (exists == false) {
        alert("No negative interactions found!")
      } else{
        // Pull the human-readable interaction description out of the nested response.
        const description =  intResponse.fullInteractionTypeGroup[0].fullInteractionType[0].interactionPair[0].description
        alert(description + " Consult a medical professional.")
      }

      // Clear comparison Form
      setMedicationOne(''); // Reset the first input.
      setMedicationTwo(''); // Reset the second input.

    } catch (err) {
      console.error(err); // Log any error (failed request, unexpected data shape, etc.).
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

          </div>
          {/* End of div Holding Two Medication Input Fields */}

          {/* Good RX Widget: empty container that an external GoodRx script fills in with a price-search widget */}
          <div className="col-md-6 pt-5">
            <div id="goodrx_search_widget"> </div>
          </div>

        </div>
        {/* End of div Row Holding Compare From and Good RX Widget */}

      </div>
      {/* End of div Container that Holds the Medication to Compare Form */}

      {/* Bottom colored banner. Note: { alert } renders the browser's built-in alert function reference, */}
      {/* not the popup text -- the actual interaction results are shown via alert() in handleFormSubmit above. */}
      <div className="container-fluid">
        <div className="row">
          <div
            className="col-lg-12 text-center pt-3 pb-4"
            style={{ backgroundColor: "#A2C4C9" }}
          >
            <p>{ alert }</p>
          </div>
        </div>
      </div>


    </main>
  );
}
// End of About()