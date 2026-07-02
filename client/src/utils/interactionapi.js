// ---------------------------------------------------------------------------
// interactionapi.js
// ---------------------------------------------------------------------------
// WHAT THIS FILE DOES:
//   A small helper that asks the external RxNav drug database whether two
//   medications interact with each other. It sends the request but does NOT
//   read the answer here -- it hands back the fetch Promise so the caller can
//   read the response (usually with .then(...) or await).
//
// WHO USES IT:
//   Part of the medication-interaction check that begins in the About
//   component. (The comment below says the app is "called from index.js".)
// ---------------------------------------------------------------------------

// start here-- app called from index.js
//
// getInteraction(query, query2):
//   PARAMETERS:
//     query  - the rxcui ID (a number code the API uses to identify a drug)
//              for the first medication ("MedOne").
//     query2 - the rxcui ID for the second medication.
//   WHAT IT CALLS:
//     The RxNav "interaction list" endpoint:
//        https://rxnav.nlm.nih.gov/REST/interaction/list.json
//     ...asking it to check interactions between the two rxcui codes.
//   RETURNS:
//     A fetch() Promise that resolves to the HTTP Response. The caller is
//     responsible for turning that Response into JSON and reading it.
const getInteraction = (query, query2) => {
        // query contains MedOne
        // The URL is built with a template string (the backticks ``). The
        // "?rxcuis=" part is a query parameter that lists the drug codes.
        // Note the "+" between the two codes: this is how the API expects
        // multiple rxcui values to be joined (e.g. rxcuis=111+222).
        return fetch(`https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${query}+${query2}`);
    };

// Make getInteraction available to other files that import this module.
export default getInteraction;
