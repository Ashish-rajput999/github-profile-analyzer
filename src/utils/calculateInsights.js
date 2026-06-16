// src/utils/calculateInsights.js
// This is a PURE utility function — it only does math.
// It receives raw data from the GitHub API and returns calculated insights.
// No API calls, no database calls — just arithmetic.

/**
 * calculateInsights
 * @param {Object} githubData - Raw response object from the GitHub API
 * @returns {Object} - An object containing all calculated insight values
 */
const calculateInsights = (githubData) => {
  const { followers, following, public_repos, created_at } = githubData;

  // ─────────────────────────────────────────────
  // 1. ACCOUNT AGE IN YEARS
  // Formula: (today - account_created) / milliseconds_in_a_year
  // We use 365.25 to account for leap years
  // ─────────────────────────────────────────────
  const accountAgeMs = Date.now() - new Date(created_at).getTime();
  const msInAYear = 1000 * 60 * 60 * 24 * 365.25;
  const account_age_years = parseFloat((accountAgeMs / msInAYear).toFixed(2));

  // ─────────────────────────────────────────────
  // 2. POPULARITY SCORE
  // Formula: (followers * 2) + public_repos - following
  // Minimum value is 0 (we use Math.max to enforce this floor)
  // ─────────────────────────────────────────────
  const rawPopularity = followers * 2 + public_repos - following;
  const popularity_score = Math.max(0, rawPopularity);

  // ─────────────────────────────────────────────
  // 3. FOLLOWERS / FOLLOWING RATIO
  // Formula: followers / following
  // Special case: if following is 0, we avoid division by zero
  //   and just return the raw followers count as the ratio
  // ─────────────────────────────────────────────
  let followers_following_ratio;
  if (following === 0) {
    followers_following_ratio = followers; // avoid divide-by-zero
  } else {
    followers_following_ratio = parseFloat((followers / following).toFixed(2));
  }

  // ─────────────────────────────────────────────
  // 4. REPOS PER YEAR
  // Formula: public_repos / account_age_years
  // Special case: if account is brand new (age rounds to 0), return public_repos directly
  // ─────────────────────────────────────────────
  let repos_per_year;
  if (account_age_years === 0) {
    repos_per_year = public_repos; // avoid divide-by-zero
  } else {
    repos_per_year = parseFloat((public_repos / account_age_years).toFixed(2));
  }

  // ─────────────────────────────────────────────
  // 5. ANALYZED AT
  // The exact time the analysis was performed
  // Stored as a JavaScript Date object (mysql2 converts it to DATETIME automatically)
  // ─────────────────────────────────────────────
  const analyzed_at = new Date();

  // Return all calculated values as a plain object
  return {
    account_age_years,
    popularity_score,
    followers_following_ratio,
    repos_per_year,
    analyzed_at,
  };
};

module.exports = calculateInsights;
