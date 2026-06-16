// src/routes/githubRoutes.js
// The ROUTES layer — maps URLs + HTTP methods to controller functions.
// This is the "switchboard" of the API.
// No logic here — just connect routes to their controllers.

const express = require('express');
const router = express.Router(); // Express mini-app for grouping routes

const {
  analyzeProfile,
  getAllProfiles,
  getProfileByUsername,
} = require('../controllers/githubController');

// POST /api/profile/:username  →  Analyze a GitHub user and store in DB
// :username is a URL parameter (e.g., /api/profile/torvalds)
router.post('/profile/:username', analyzeProfile);

// GET /api/profiles  →  Get ALL stored profiles from DB
router.get('/profiles', getAllProfiles);

// GET /api/profile/:username  →  Get ONE stored profile from DB
router.get('/profile/:username', getProfileByUsername);

module.exports = router;
