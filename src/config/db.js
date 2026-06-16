// src/config/db.js
// This file creates a connection pool to our MySQL database.
// A "pool" is a set of reusable connections — much more efficient than
// opening a new connection for every single database request.
//
// NOTE: SSL is enabled because Aiven cloud MySQL requires encrypted connections.
// rejectUnauthorized: false — accepts Aiven's self-signed certificate.

const mysql = require('mysql2/promise'); // mysql2 with Promise support for async/await
require('dotenv').config(); // Load environment variables from .env file

// Create the connection pool using values from .env
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // Aiven MySQL host
  port: process.env.DB_PORT,         // Aiven uses a custom port (e.g. 17636)
  user: process.env.DB_USER,         // e.g. "avnadmin"
  password: process.env.DB_PASSWORD, // your Aiven MySQL password
  database: process.env.DB_NAME,     // e.g. "defaultdb"
  ssl: {
    rejectUnauthorized: false,        // Required for Aiven's SSL certificate
  },
  waitForConnections: true,          // Wait if all connections are busy (don't throw error)
  connectionLimit: 10,               // Maximum 10 simultaneous connections in the pool
  queueLimit: 0,                     // No limit on queued requests (0 = unlimited)
});

module.exports = pool; // Export the pool so other files can use it
