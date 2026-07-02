// ---------------------------------------------------------------------------
// rxcuiapi.js
// ---------------------------------------------------------------------------
// WHAT THIS FILE DOES:
//   A small helper that looks up a medication BY NAME in the external RxNav
//   drug database. The response contains the drug's rxcui code(s) -- the ID
//   numbers that the interaction check (interactionapi.js) needs later.
//   Like the interaction helper, it returns the fetch Promise and lets the
//   caller read the response.
//
// WHO USES IT:
//   Called from the About component (see the note below: "About.js line 47").
//
// A SAMPLE of the JSON this API returns is written out (commented) at the
// bottom of this file to show the shape of the data (drugGroup -> conceptGroup
// -> conceptProperties -> rxcui, name, etc.).
// ---------------------------------------------------------------------------

// called from About.js line 47
//
// getRxcui(query):
//   PARAMETER:
//     query - the medication NAME to look up (the comment calls it "MedOne").
//   WHAT IT CALLS:
//     The RxNav "drugs" endpoint:
//        https://rxnav.nlm.nih.gov/REST/drugs.json
//     ...passing the drug name as the "?name=" query parameter.
//   RETURNS:
//     A fetch() Promise that resolves to the HTTP Response. The caller reads
//     the JSON from it to get the drug's details (including its rxcui code).
const getRxcui = (query) => {
    // query contains MedOne
    // Prints the drug name to the browser's developer console. This is only a
    // debugging aid -- it does not affect what the function returns.
    console.log("Variable Check: " + query);
    // Build the request URL with a template string (backticks ``) and insert
    // the drug name after "?name=", then send the request with fetch().
    return fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${query}`);
};

// Make getRxcui available to other files that import this module.
export default getRxcui

// Sample Data
// {
//     drugGroup: {
//          name: "singulair",
//          conceptGroup: [
//              { // conceptGroup Item 1
//                  tty: "BPCK"
//              }, // end of conceptGroup Item 1

//              { //conceptGroup Item 2
//                  tty: "SBD",
//                  conceptProperties: [
//                       {
//                          rxcui: "153892",
//                          name: "montelukast 10 MG Oral Tablet [Singulair]",
//                          synonym: "Singulair 10 MG Oral Tablet",
//                          tty: "SBD",
//                          language: "ENG",
//                          suppress: "N",
//                          umlscui: ""
//                      },

//                      {
//                          rxcui: "153893",
//                          name: "montelukast 5 MG Chewable Tablet [Singulair]",
//                          synonym: "Singulair 5 MG Chewable Tablet",
//                          tty: "SBD",
//                          language: "ENG",
//                          suppress: "N",
//                          umlscui: ""
//                       },

//                       {
//                          rxcui: "261367",
//                          name: "montelukast 4 MG Chewable Tablet [Singulair]",
//                          synonym: "Singulair 4 MG Chewable Tablet",
//                          tty: "SBD",
//                          language: "ENG",
//                          suppress: "N",
//                          umlscui: ""
//                       },

//                       {
//                          rxcui: "404406",
//                          name: "montelukast 4 MG Oral Granules [Singulair]",
//                          synonym: "Singulair 4 MG Oral Granules",
//                          tty: "SBD",
//                          language: "ENG",
//                          suppress: "N",
//                          umlscui: ""
//                       }
//                  ] // end of conceptProperties
//              }// end of conceptGroup Item 2
//          ]// end of conceptGroup Array
//     }// end of drugGroup object
// } end of object