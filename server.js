// server.js
// The ENTRY POINT of the application.
// This is the file you run with: node server.js  OR  npm start
//
// It's intentionally simple — its ONLY job is to:
//   1. Load environment variables
//   2. Import the configured Express app
//   3. Start listening on the specified port
//
// All app configuration lives in app.js.
// This separation makes testing easier (import app without starting a server).

require('dotenv').config(); // Must be first — loads .env variables into process.env

const app = require('./app'); // Import the configured Express app

const PORT = process.env.PORT || 3000; // Use PORT from .env, or default to 3000

// app.listen() starts the HTTP server and makes it listen for incoming requests
app.listen(PORT, () => {
  // This callback runs once the server is ready
  console.log('─────────────────────────────────────────');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log('─────────────────────────────────────────');
});
