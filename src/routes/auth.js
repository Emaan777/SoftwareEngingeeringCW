/**
 * Authentication routes
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../models/database');

// Helper function to hash passwords securely using scrypt
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

// Helper function to verify password
function verifyPassword(password, hashedPassword) {
    const [salt, hash] = hashedPassword.split(':');
    const hashVerify = crypto.scryptSync(password, salt, 64).toString('hex');
    return hash === hashVerify;
}

// Route for registration page
router.get("/register", function (req, res) {
    console.log("Serving registration page");
    res.render("registrationpage", { authRequired: false });
});

// Route for login page
router.get("/login", function (req, res) {
    console.log("Serving login page");
    res.render("login", { loginError: req.query.error === 'true' });
});

// Process login form
router.post("/login", async function (req, res) {
    const { email, password } = req.body;
    
    try {
        const pool = await db;
        const [rows] = await pool.query(
            'SELECT * FROM User WHERE Email = ?', 
            [email]
        );
        
        const user = rows[0];
        
        // Check if user exists and password matches
        if (user && (user.UserPasword.includes(':') ? 
            verifyPassword(password, user.UserPasword) : 
            // Legacy password support
            hashPassword(password) === user.UserPasword)) {
            console.log("User logged in:", email);
            
            // Set session data
            req.session.isLoggedIn = true;
            req.session.userId = user.UserID;
            req.session.userEmail = user.Email;
            req.session.userName = user.FirstName;
            
            res.redirect('/');
        } else {
            console.log("Login failed for:", email);
            res.redirect('/login?error=true');
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).render('login', { 
            loginError: true, 
            errorMessage: 'Database error occurred. Please try again later.' 
        });
    }
});

// Save new user to MySQL (from registration form)
router.post("/register", async (req, res) => {
    const {
        firstName,
        surname,
        dob,
        email,
        password,
        exercisePreference,
        expertise
    } = req.body;

    try {
        const pool = await db;
        
        // Check if email is already registered
        const [existingUsers] = await pool.query(
            'SELECT * FROM User WHERE Email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.render('registrationpage', { 
                authRequired: false,
                error: 'Email already registered. Please use a different email or login.' 
            });
        }
        
        // Generate a unique user ID (simple implementation)
        const userID = Math.floor(Math.random() * 10000).toString();
        
        // Hash the password before storing
        const hashedPassword = hashPassword(password);
        
        // Insert user into database
        await pool.query(
            'INSERT INTO User (UserID, FirstName, LastName, Email, UserPasword, DateOfBirth, ExercisePreference, Expertise) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userID, firstName, surname, email, hashedPassword, dob, exercisePreference, expertise]
        );
        
        console.log("User registered:", { firstName, surname, email });
        
        // Set session data after registration
        req.session.isLoggedIn = true;
        req.session.userId = userID;
        req.session.userEmail = email;
        req.session.userName = firstName;
        
        // Redirect to home page
        res.redirect('/');
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).render('registrationpage', { 
            authRequired: false,
            error: 'Registration failed. Please try again later.'
        });
    }
});

// Logout route
router.get("/logout", function(req, res) {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect('/login');
    });
});

module.exports = router; 