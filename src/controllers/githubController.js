// src/controllers/githubController.js
// The CONTROLLER layer — the bridge between HTTP and business logic.
// Controllers:
//   - Read from req (request params, body, query)
//   - Call the appropriate service function
//   - Send the correct HTTP response
//   - Pass errors to next() for centralized error handling
// Controllers do NOT talk to the database directly.
// Controllers do NOT contain calculation logic.

const githubService = require('../services/githubService');

/**
 * analyzeProfile
 * Handler for: POST /api/profile/:username
 *
 * Calls the GitHub API, calculates insights, saves to DB, returns result.
 */
const analyzeProfile = async (req, res, next) => {
  try {
    const { username } = req.params; // Extract :username from the URL

    const data = await githubService.analyzeAndStoreProfile(username);

    // Send success response with the full profile + insights
    return res.status(200).json({
      success: true,
      message: 'Profile analyzed successfully',
      data,
    });
  } catch (err) {
    // Pass the error to the next middleware (our errorHandler)
    // This avoids duplicating error-handling code in every controller
    next(err);
  }
};

/**
 * getAllProfiles
 * Handler for: GET /api/profiles
 *
 * Fetches all stored profiles from MySQL.
 */
const getAllProfiles = async (req, res, next) => {
  try {
    const profiles = await githubService.fetchAllProfiles();

    return res.status(200).json({
      success: true,
      count: profiles.length, // Helpful for the client to know how many records exist
      data: profiles,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * getProfileByUsername
 * Handler for: GET /api/profile/:username
 *
 * Fetches a single profile from MySQL (does NOT call GitHub API).
 */
const getProfileByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const profile = await githubService.fetchProfileByUsername(username);

    // If the profile isn't in our DB, tell the user to analyze it first
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: `Profile not found. Use POST /api/profile/${username} to analyze it first.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeProfile,
  getAllProfiles,
  getProfileByUsername,
};
