/**
 * API routes for the Sport Buddy application
 */
const express = require('express');
const router = express.Router();
const db = require('../models/database');

// API endpoint for users (requires authentication)
router.get("/users", async (req, res) => {
    try {
        const pool = await db;
        
        // Apply filters if provided in query params
        const activity = req.query.activity || '';
        const expertise = req.query.expertise || '';
        const search = req.query.search || '';
        
        let query = 'SELECT UserID, FirstName, LastName, Email, ExercisePreference, Expertise FROM User WHERE 1=1';
        let params = [];
        
        if (activity && activity !== 'all') {
            query += ' AND ExercisePreference = ?';
            params.push(activity);
        }
        
        if (expertise && expertise !== 'all') {
            query += ' AND Expertise = ?';
            params.push(expertise);
        }
        
        if (search) {
            query += ' AND (FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        const [rows] = await pool.query(query, params);
        
        // Don't expose the currently logged-in user in the results
        const filteredUsers = rows.filter(user => user.UserID !== req.session.userId);
        
        res.json(filteredUsers);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Database query failed", details: err.message });
    }
});

// User profile API endpoint
router.get("/profile", async function(req, res) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        
        const pool = await db;
        const [rows] = await pool.query(
            'SELECT UserID, FirstName, LastName, Email, DateOfBirth, ExercisePreference, Expertise FROM User WHERE UserID = ?',
            [req.session.userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ error: "Database query failed" });
    }
});

// Debug route to check if server is responsive
router.get("/debug", async (req, res) => {
    try {
        // Check if the database is connected
        let dbStatus = "Not connected";
        let userCount = 0;
        try {
            if (db) {
                const pool = await db;
                const connection = await pool.getConnection();
                connection.release();
                dbStatus = "Connected";
                
                // Get user count from database
                const [countResult] = await pool.query('SELECT COUNT(*) as count FROM User');
                userCount = countResult && countResult[0] && countResult[0].count ? countResult[0].count : 0;
            }
        } catch (err) {
            dbStatus = `Error: ${err.message}`;
        }

        // Return debug information
        res.json({
            status: "OK",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            database: {
                host: process.env.MYSQL_HOST,
                database: process.env.MYSQL_DATABASE,
                status: dbStatus,
                userCount: userCount
            },
            session: {
                isLoggedIn: req.session.isLoggedIn || false,
                userId: req.session.userId,
                userEmail: req.session.userEmail
            },
            routes: {
                register: "/register",
                login: "/login",
                home: "/",
                userList: "/listing.html",
                profile: "/profile.html",
                api: "/api/users"
            },
            nodeVersion: process.version
        });
    } catch (error) {
        res.status(500).json({
            status: "Error",
            message: error.message
        });
    }
});

module.exports = router; 