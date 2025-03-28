"use strict";

/**
 * Sport Buddy Application - Entry Point
 * This file bootstraps the Express application
 */

// Load environment variables
require('dotenv').config({ path: './config/.env' });

// Import dependencies
const app = require("./app.js");
const http = require('http');

// Get port from environment
const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Add proper error handling for server
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Start the server
server.listen(PORT, () => {
  console.log(`
========================================
🚀 Sport Buddy Server Started
========================================
📡 Server running at http://localhost:${PORT}/
🔒 Environment: ${process.env.NODE_ENV || 'development'}
⏱️ Started at: ${new Date().toISOString()}
========================================
  `);
});

// Handle graceful shutdown for Docker/Kubernetes environments
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if server doesn't close gracefully
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });
});

// Unhandled promise rejections should not crash the application
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // We log but don't exit to keep the application running
});