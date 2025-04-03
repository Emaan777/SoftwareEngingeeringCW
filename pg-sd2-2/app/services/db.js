require("dotenv").config();

const mysql = require('mysql2/promise');

const config = {
  db: {
    host: '127.0.0.1',       // Use explicit IPv4 instead of localhost
    port: 3308,              // Use the mapped port 3308
    user: 'root',            // Use root user
    password: 'password',    // Use the password from docker-compose
    database: 'Sport_Buddy',  // Use the Sport_Buddy database instead of sd2
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
  },
};
  
const pool = mysql.createPool(config.db);

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
}