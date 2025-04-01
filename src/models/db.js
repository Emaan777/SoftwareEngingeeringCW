/**
 * Database connection management
 * Creates a MySQL connection pool and exports it for use in the application
 */
const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../config/.env'),
  override: false  // Don't override existing env vars (Docker takes precedence)
});

// Log database connection parameters (without sensitive info)
console.log(`Connecting to database ${process.env.MYSQL_DATABASE} at ${process.env.MYSQL_HOST}`);

// Database connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || 'db',  // Default to 'db' Docker service name
  port: process.env.DB_PORT || 3306,     // Default MySQL port
  user: process.env.MYSQL_USER || 'admin',
  password: process.env.MYSQL_PASS || 'password',
  database: process.env.MYSQL_DATABASE || 'Sport_Buddy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,  // Increased timeout for Docker startup
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

// Safe config for logging (without password)
const safeConfig = { ...dbConfig };
delete safeConfig.password;
console.log(`DB Connection config: ${JSON.stringify(safeConfig)}`);

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection with retry logic
const testConnection = async () => {
  // Exponential backoff retry settings
  const maxRetries = 5;
  let retries = maxRetries;
  
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connection established successfully!');
      
      // Verify database has tables
      const [rows] = await connection.query('SHOW TABLES');
      console.log(`Found ${rows.length} tables in database.`);
      
      connection.release();
      return true;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('❌ Failed to connect to the database after multiple attempts:', error.message);
        console.error('Check database container status and configuration.');
        return false;
      }
      
      const waitTime = (maxRetries - retries) * 2000; // Exponential backoff
      console.log(`⚠️ Database connection attempt failed. Retrying in ${waitTime/1000}s... (${retries} attempts left)`);
      console.error(`Connection error: ${error.message}`);
      
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
};

// Execute query with connection from pool
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', error.message);
    console.error('Query:', sql);
    console.error('Parameters:', params);
    throw error;
  }
};

// Execute transaction
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Keep connection alive
setInterval(async () => {
  try {
    await query('SELECT 1');
  } catch (err) {
    console.warn('Connection ping failed:', err.message);
  }
}, 60000);

// Initialize connection test
testConnection().catch(err => {
  console.error('Error during connection test:', err.message);
});

// Export functions
module.exports = {
  query,
  transaction,
  testConnection,
  pool
}; 