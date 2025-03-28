/**
 * Database connection configuration file
 * This file handles MySQL connection pooling with proper error handling and retries
 */
const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables from the correct path
// Ensure path is resolved properly whether running in Docker or locally
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../config/.env'),
  override: false  // Don't override existing env vars (Docker takes precedence)
});

// Log database connection parameters (without sensitive info)
console.log(`Connecting to database ${process.env.MYSQL_DATABASE} at ${process.env.MYSQL_HOST}`);

// Create connection pool with retry logic
const createPool = async () => {
  // Production safe connection config
  const connectionConfig = {
    host: process.env.MYSQL_HOST || 'db',  // Default to 'db' Docker service name
    port: process.env.DB_PORT || 3306,     // Add explicit port
    user: process.env.MYSQL_USER || 'admin',
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DATABASE || 'Sport_Buddy',
    
    // Connection pool optimization
    waitForConnections: true,
    connectionLimit: process.env.NODE_ENV === 'production' ? 20 : 10, // More connections for production
    queueLimit: 0,
    connectTimeout: 30000,  // Increased timeout for Docker startup
    
    // Enable SSL for production environments
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: true
    } : undefined,
    
    // Connection acquisition timeout
    acquireTimeout: 15000,
    
    // Enhanced debugging in development mode
    debug: process.env.NODE_ENV === 'development' ? 
      ['ComQueryPacket', 'RowDataPacket'] : false,
      
    // Timezone settings to avoid date/time issues
    timezone: '+00:00',
    
    // Automatically handle disconnects
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  };

  // Log connection details for troubleshooting (without password)
  const safeConfig = { ...connectionConfig };
  delete safeConfig.password;
  console.log(`DB Connection config: ${JSON.stringify(safeConfig)}`);

  try {
    // Create the database connection pool
    const pool = mysql.createPool(connectionConfig);
    
    // Exponential backoff retry settings
    const maxRetries = process.env.NODE_ENV === 'production' ? 10 : 5;
    let retries = maxRetries;
    
    while (retries > 0) {
      try {
        // Test the connection
        const connection = await pool.getConnection();
        
        // Verify database is properly set up
        const [rows] = await connection.query('SHOW TABLES');
        const tableCount = rows.length;
        
        console.log(`✅ Database connection established successfully! Found ${tableCount} tables.`);
        
        // Setup ping to keep connections alive
        setInterval(async () => {
          try {
            const pingConn = await pool.getConnection();
            await pingConn.query('SELECT 1');
            pingConn.release();
          } catch (err) {
            console.warn('Connection ping failed:', err.message);
          }
        }, 60000); // Ping every minute
        
        // Release test connection
        connection.release();
        return pool;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        
        const waitTime = (maxRetries - retries) * 2000; // Exponential backoff
        console.log(`⚠️ Database connection attempt failed. Retrying in ${waitTime/1000}s... (${retries} attempts left)`);
        console.error(`Connection error: ${error.message}`);
        
        // Wait before retry (exponential backoff)
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
  } catch (error) {
    console.error('❌ Failed to create database connection:', error.message);
    console.error('Connection config:', { 
      host: connectionConfig.host, 
      user: connectionConfig.user, 
      database: connectionConfig.database,
      port: connectionConfig.port
    });
    
    // For development, create a mock pool when the actual connection fails
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Creating mock database connection for development testing');
      
      return {
        query: async (sql, params) => {
          console.log(`MOCK QUERY: ${sql}`, params);
          return [[]];
        },
        execute: async (sql, params) => {
          console.log(`MOCK EXECUTE: ${sql}`, params);
          return [{ affectedRows: 0 }];
        },
        getConnection: async () => ({ 
          query: async (sql, params) => {
            console.log(`MOCK CONNECTION QUERY: ${sql}`, params);
            return [[]];
          },
          execute: async (sql, params) => {
            console.log(`MOCK CONNECTION EXECUTE: ${sql}`, params);
            return [{ affectedRows: 0 }];
          },
          release: () => console.log('MOCK CONNECTION RELEASED') 
        })
      };
    }
    
    throw error;
  }
};

// Export a promise that resolves to the pool
// IMPORTANT: This pattern allows the app to start even if DB isn't ready yet
const poolPromise = createPool();

// Add error handling for pool
poolPromise.then(pool => {
  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
    // In production, this might trigger a notification or restart
  });
}).catch(err => {
  console.error('Error initializing database pool:', err);
});

module.exports = poolPromise; 