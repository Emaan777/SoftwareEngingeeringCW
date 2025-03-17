const mysql = require("mysql2/promise");

// Create connection pool
const pool = mysql.createPool({
    host: "localhost", // Change this if needed
    user: "root",
    password: "password",
    database: "pg-sd2-2"
});

// Function to run queries
async function query(sql, params) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

module.exports = { query };
