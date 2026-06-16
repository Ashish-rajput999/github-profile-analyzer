// src/models/profileModel.js
// The MODEL layer — the ONLY place in the app that runs SQL queries.
// All other layers (controller, service) must go through these functions.
// We use raw SQL with mysql2 — no ORM, no magic.

const pool = require('../config/db'); // Import the connection pool

/**
 * upsertProfile
 * Inserts a new profile OR updates an existing one if the username already exists.
 * "Upsert" = Update + Insert combined into one operation.
 *
 * We use MySQL's "INSERT ... ON DUPLICATE KEY UPDATE" which:
 * - Tries to INSERT a new row
 * - If the username already exists (UNIQUE constraint), it UPDATE that row instead
 *
 * The ? placeholders prevent SQL injection — mysql2 safely escapes all values.
 *
 * @param {Object} profileData - All fields to store in the database
 * @returns {Object} - MySQL result object (contains insertId, affectedRows, etc.)
 */
const upsertProfile = async (profileData) => {
  const sql = `
    INSERT INTO github_profiles (
      username, name, avatar_url, bio,
      followers, following, public_repos, public_gists,
      profile_url, account_created,
      account_age_years, followers_following_ratio,
      repos_per_year, popularity_score, analyzed_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      avatar_url = VALUES(avatar_url),
      bio = VALUES(bio),
      followers = VALUES(followers),
      following = VALUES(following),
      public_repos = VALUES(public_repos),
      public_gists = VALUES(public_gists),
      profile_url = VALUES(profile_url),
      account_created = VALUES(account_created),
      account_age_years = VALUES(account_age_years),
      followers_following_ratio = VALUES(followers_following_ratio),
      repos_per_year = VALUES(repos_per_year),
      popularity_score = VALUES(popularity_score),
      analyzed_at = VALUES(analyzed_at)
  `;

  // Array of values — must be in the SAME ORDER as the ? placeholders above
  const values = [
    profileData.username,
    profileData.name,
    profileData.avatar_url,
    profileData.bio,
    profileData.followers,
    profileData.following,
    profileData.public_repos,
    profileData.public_gists,
    profileData.profile_url,
    profileData.account_created,
    profileData.account_age_years,
    profileData.followers_following_ratio,
    profileData.repos_per_year,
    profileData.popularity_score,
    profileData.analyzed_at,
  ];

  // pool.query() executes the SQL and returns [rows, fields]
  // We only need the first item (result/rows), so we destructure with [result]
  const [result] = await pool.query(sql, values);
  return result;
};

/**
 * getAllProfiles
 * Fetches every row from github_profiles, ordered by most recently analyzed.
 *
 * @returns {Array} - Array of profile objects
 */
const getAllProfiles = async () => {
  const sql = `SELECT * FROM github_profiles ORDER BY analyzed_at DESC`;
  const [rows] = await pool.query(sql);
  return rows; // rows is an array of plain JavaScript objects
};

/**
 * getProfileByUsername
 * Fetches a single profile by exact username match.
 *
 * @param {string} username - The GitHub username to look up
 * @returns {Object|undefined} - The profile object, or undefined if not found
 */
const getProfileByUsername = async (username) => {
  const sql = `SELECT * FROM github_profiles WHERE username = ?`;
  const [rows] = await pool.query(sql, [username]);
  return rows[0]; // rows[0] is the first (and only) match, or undefined if none
};

// Export all three functions so controllers/services can use them
module.exports = {
  upsertProfile,
  getAllProfiles,
  getProfileByUsername,
};
