// app.js
// Creates and configures the Express application.
// We separate app configuration (this file) from server startup (server.js).
// This separation makes it easy to test the app without actually starting a server.

const express = require('express');
const cors = require('cors');        // Allows cross-origin requests (needed for frontend apps)
const helmet = require('helmet');    // Adds security-related HTTP headers automatically
const morgan = require('morgan');    // Logs every incoming HTTP request to the console

const githubRoutes = require('./src/routes/githubRoutes');   // Our API routes
const errorHandler = require('./src/middleware/errorHandler'); // Centralized error handler

const app = express(); // Create the Express application instance

// ─────────────────────────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// Middleware runs on EVERY request, in the order they are registered.
// ─────────────────────────────────────────────────────────────────

// helmet() adds ~15 security headers (e.g., X-Content-Type-Options, X-Frame-Options)
// to protect against common web attacks. Always use in production.
app.use(helmet());

// cors() allows other origins (e.g., a React frontend on port 5173) to call this API.
// Without this, browsers block cross-origin API calls.
app.use(cors());

// morgan('dev') logs each request in a colored, compact format:
// e.g.: POST /api/profile/torvalds 200 142ms
app.use(morgan('dev'));

// express.json() parses incoming requests with JSON bodies.
// Without this, req.body would always be undefined for POST/PUT requests.
app.use(express.json());

// ─────────────────────────────────────────────────────────────────
// HEALTH CHECK ENDPOINT
// Simple endpoint to verify the server is running.
// Useful for deployment platforms (Render, Railway) and monitoring tools.
// ─────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(), // e.g. "2024-03-15T10:30:00.000Z"
  });
});

// ─────────────────────────────────────────────────────────────────
// API ROUTES
// All our GitHub routes are mounted under the /api prefix.
// So /profile/:username in the router becomes /api/profile/:username here.
// ─────────────────────────────────────────────────────────────────
app.use('/api', githubRoutes);

// ─────────────────────────────────────────────────────────────────
// 404 HANDLER FOR UNKNOWN ROUTES
// If no route above matched, this catches the request.
// ─────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// ─────────────────────────────────────────────────────────────────
// CENTRALIZED ERROR HANDLER
// MUST be registered LAST, after all routes and middleware.
// Express identifies this as an error handler because it has 4 parameters.
// ─────────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app; // Export app so server.js can use it
