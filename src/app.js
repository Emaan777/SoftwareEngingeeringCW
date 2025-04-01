/**
 * Sport Buddy Application
 * Main application setup and configuration
 */
const express = require("express");
const path = require("path");
const session = require("express-session");

// Import database connection
const db = require('./models/db');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

// Import middleware
const { requireAuth } = require('./middleware/auth');

// Create express app
const app = express();

// For debugging - print all request paths to console
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.path}`);
    next();
});

// Setup session middleware with secure configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'sport-buddy-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 3600000, // 1 hour
        httpOnly: true,  // Prevent client-side JS from reading
        secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
    }
}));

// Make session available to all templates
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Pug template engine setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Request body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets without authentication (CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, "public/css")));
app.use('/js', express.static(path.join(__dirname, "public/js")));
app.use('/images', express.static(path.join(__dirname, "public/images")));

// Register auth routes before authentication check
app.use('/', authRoutes);

// API debug endpoint - accessible without auth
app.use('/api/debug', (req, res, next) => {
    if (req.path === '/api/debug') {
        return apiRoutes(req, res, next);
    }
    next();
});

// Authentication middleware for protected routes
app.use(requireAuth);

// Register protected routes
app.use('/', pageRoutes);
app.use('/api', apiRoutes);

// Serve HTML files from public directory (after authentication)
app.use(express.static(path.join(__dirname, "public")));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Application error:', err);
    
    if (req.accepts('html')) {
        res.status(500).send(`
            <html>
                <head><title>Error - Sport Buddy</title></head>
                <body>
                    <h1>Something went wrong</h1>
                    <p>The application encountered an error. Please try again later.</p>
                    <a href="/">Return to Home</a>
                </body>
            </html>
        `);
    } else {
        res.status(500).json({ 
            error: 'Server error', 
            message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
        });
    }
});

// 404 handler
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).send(`
            <html>
                <head><title>Page Not Found - Sport Buddy</title></head>
                <body>
                    <h1>Page Not Found</h1>
                    <p>The requested page could not be found.</p>
                    <a href="/">Return to Home</a>
                </body>
            </html>
        `);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// Export the app for use in other files
module.exports = app;
