// ---------------------------------------------------------------------------
// druginfo.js
// ---------------------------------------------------------------------------
// WHAT THIS FILE DOES:
//   This is a small helper that turns the drug/interaction data (already fetched
//   from the external drug-info API) into a piece of UI (JSX) to show the user.
//   Unlike the other two util files, this one does NOT call any API itself --
//   it only DISPLAYS results that were passed in to it.
//
// WHO USES IT:
//   It is imported and called from withListLoading.js (see the note below),
//   which is part of the flow that started in the About component.
// ---------------------------------------------------------------------------

// We need React here because this helper returns JSX (the <p> and <div> tags
// below). Any file that uses JSX must import React.
import React from 'react';

// called from withListLoading.js
//
// getRxcuiInfo(props):
//   PARAMETER:
//     props - an object that is expected to contain two things:
//               props.drugs        -> data describing the medication(s)
//               props.interactions -> data describing any interactions found
//   RETURNS:
//     A React element (JSX) -- either a warning paragraph if an interaction
//     exists, or a "No interaction exists" message if it does not.
const getRxcuiInfo = (props) => {
  // Pull the "drugs" and "interactions" values out of the props object so we
  // can use them directly by name (this is called "destructuring").
  const { drugs, interactions } = props;

  // The interactions API only includes a "fullInteractionTypeGroup" property
  // when it actually found an interaction. So if that property exists (is
  // truthy), we know there's an interaction and we return the warning message
  // right away -- the code below this line is skipped.
  if (interactions.fullInteractionTypeGroup) return <p>An interaction exists between your medications.  Please contact a medical professional for more information.</p>;

  // If we reach this point, no interaction was found, so we build and return
  // the "No interaction exists" UI below.
  return (

    <div>
        {/* The lines below are commented-out JSX (wrapped in curly-brace and
            slash-star markers, which is how you comment things out inside JSX).
            They were probably used for testing/debugging to print the drug name
            and its rxcui code, but they are currently disabled and do NOT
            render. */}
        {/* <p> {drugs.drugGroup.name} </p>
        <p> {drugs.drugGroup.conceptGroup[1].conceptProperties[0].rxcui} </p> */}


        {/* This is the only visible text: shown when no interaction was found. */}
        <p> No interaction exists</p>
        {/* Another disabled debug line (commented-out JSX, does not render). */}
        {/* <p> {interactions.userInput.rxcuis[0]} </p> */}



    </div>
  );
};
// Make getRxcuiInfo available to other files that import this module.
export default getRxcuiInfo;