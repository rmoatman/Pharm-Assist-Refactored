// ===========================================================================
// server/controllers/interaction-controller.js
// Handles the PUBLIC "check these medications for interactions" request.
// It validates the input, calls the interaction provider service, and returns
// the flagged pairs plus a medical disclaimer. No login is required — this powers
// both the logged-in med list AND the public homepage two-drug checker.
// ===========================================================================

const { checkInteractions } = require('../services/interactionProvider');

module.exports = {
  // check: POST /api/interactions  body: { meds: ["warfarin", "aspirin", ...] }
  async check({ body }, res) {
    // Keep only non-empty strings from the submitted list.
    const meds = Array.isArray(body?.meds)
      ? body.meds.filter((m) => typeof m === 'string' && m.trim())
      : [];

    // Need at least two medications to have something to compare.
    if (meds.length < 2) {
      return res.status(400).json({ errorMessage: 'Please provide at least two medication names.' });
    }

    try {
      const result = await checkInteractions(meds);
      return res.json({
        ...result,
        disclaimer:
          'Informational only — not medical advice. Interaction data comes from FDA drug labels and may be incomplete. Always consult a healthcare professional or pharmacist.',
      });
    } catch (err) {
      // The external drug API failed or timed out.
      console.log('interaction check failed:', err);
      return res.status(502).json({ errorMessage: 'Could not check interactions right now. Please try again later.' });
    }
  },
};
