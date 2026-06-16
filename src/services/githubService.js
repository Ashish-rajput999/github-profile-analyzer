// src/services/githubService.js
// The SERVICE layer — contains all business logic.
// This is where the actual "work" happens:
//   1. Call the GitHub API
//   2. Calculate insights
//   3. Save to the database
// The controller just calls these functions and handles the HTTP response.

const axios = require('axios');           // HTTP client to call the GitHub API
require('dotenv').config();               // Load .env variables

const calculateInsights = require('../utils/calculateInsights'); // Our math utility
const profileModel = require('../models/profileModel');          // Our DB layer

/**
 * analyzeAndStoreProfile
 * The main service function for the POST /api/profile/:username endpoint.
 *
 * Steps:
 * 1. Call https://api.github.com/users/:username
 * 2. If GitHub returns 404, throw a custom "not found" error
 * 3. If GitHub returns 403, throw a "rate limited" error
 * 4. Calculate insights from the raw data
 * 5. Build a combined profile object (raw fields + calculated insights)
 * 6. Upsert into the database (insert if new, update if exists)
 * 7. Return the full profile object
 *
 * @param {string} username - The GitHub username to analyze
 * @returns {Object} - The complete profile data including insights
 */
const analyzeAndStoreProfile = async (username) => {
  // ─── STEP 1: Call GitHub API ───────────────────────────────────────
  // We use try/catch specifically here to handle GitHub-specific HTTP errors
  let githubData;
  try {
    const response = await axios.get(
      `${process.env.GITHUB_API_BASE}/users/${username}`
    );
    githubData = response.data; // The actual user object from GitHub
  } catch (error) {
    // axios throws an error for any non-2xx response
    // error.response contains the actual HTTP response details
    if (error.response) {
      if (error.response.status === 404) {
        // GitHub couldn't find this username
        const notFoundError = new Error('GitHub user not found');
        notFoundError.statusCode = 404; // Attach custom status code for errorHandler
        throw notFoundError;
      }
      if (error.response.status === 403) {
        // GitHub API rate limit exceeded (60 requests/hour for unauthenticated)
        const rateLimitError = new Error(
          'GitHub API rate limit exceeded. Try again later.'
        );
        rateLimitError.statusCode = 429; // 429 = Too Many Requests
        throw rateLimitError;
      }
    }
    // Any other unexpected error — rethrow and let the global handler catch it
    throw error;
  }

  // ─── STEP 2: Calculate Insights ────────────────────────────────────
  const insights = calculateInsights(githubData);
  // insights now contains: account_age_years, popularity_score,
  //   followers_following_ratio, repos_per_year, analyzed_at

  // ─── STEP 3: Build the Profile Object ──────────────────────────────
  // Combine raw GitHub fields with calculated insights into one flat object
  const profileData = {
    username: githubData.login,                              // GitHub login/handle
    name: githubData.name || null,                           // Full name (may be null)
    avatar_url: githubData.avatar_url || null,               // Profile picture URL
    bio: githubData.bio || null,                             // Bio text (may be null)
    followers: githubData.followers || 0,
    following: githubData.following || 0,
    public_repos: githubData.public_repos || 0,
    public_gists: githubData.public_gists || 0,
    profile_url: githubData.html_url || null,                // e.g. https://github.com/torvalds
    account_created: new Date(githubData.created_at)         // Convert ISO string to Date
      .toISOString()
      .split('T')[0],                                        // Format as "YYYY-MM-DD" for MySQL DATE type
    ...insights,                                             // Spread in all calculated values
  };

  // ─── STEP 4: Save to Database ───────────────────────────────────────
  await profileModel.upsertProfile(profileData);

  // ─── STEP 5: Return the Full Profile ────────────────────────────────
  return profileData;
};

/**
 * fetchAllProfiles
 * Retrieves all stored profiles from the database.
 *
 * @returns {Array} - Array of profile objects
 */
const fetchAllProfiles = async () => {
  return await profileModel.getAllProfiles();
};

/**
 * fetchProfileByUsername
 * Retrieves a single stored profile from the database (no GitHub API call).
 *
 * @param {string} username - The GitHub username to look up
 * @returns {Object|null} - The profile object, or null if not found
 */
const fetchProfileByUsername = async (username) => {
  return await profileModel.getProfileByUsername(username);
};

module.exports = {
  analyzeAndStoreProfile,
  fetchAllProfiles,
  fetchProfileByUsername,
};
