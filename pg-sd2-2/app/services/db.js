require("dotenv").config();

const mysql = require('mysql2/promise');

const config = {
  db: {
    host: process.env.DB_HOST || 'db',  // Use the Docker service name
    port: process.env.DB_PORT || 3306,       // Use the internal Docker port
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'sd2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  },
};
  
const pool = mysql.createPool(config.db);

// Function to test database connection
async function testConnection() {
  let retries = 5;
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      console.log('Successfully connected to the database');
      connection.release();
      return;
    } catch (error) {
      console.error('Database connection failed:', error);
      retries--;
      if (retries === 0) throw error;
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Test connection on startup
testConnection().catch(console.error);

// Utility function to query the database
async function query(sql, params) {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = {
  query,
  testConnection
}