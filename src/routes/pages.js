/**
 * Basic page routes
 */
const express = require('express');
const router = express.Router();
const path = require('path');

// Create a route for the homepage (requires authentication)
router.get("/", function (req, res) {
    console.log("Serving index page");
    res.render("index", { authRequired: true });
});

// Route for registration form
router.get("/register.html", function (req, res) {
    console.log("Serving registration page");
    res.render("registrationpage", { authRequired: false });
});

// Main route for user-list page (Pug template)
router.get("/user-list", function (req, res) {
    console.log("Serving user-list page");
    res.render("user-list", { authRequired: true });
});

// Alternate route for user-list via HTML redirect
router.get("/user-list.html", function (req, res) {
    console.log("Redirecting to user-list");
    res.redirect("/user-list");
});

// Profile page route using Pug template
router.get("/profile", function(req, res) {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render("profile", { 
        user: null, // Will be populated by client-side JavaScript
        authRequired: true 
    });
});

// Route for listing page (uses listing.pug)
router.get("/listing.html", function (req, res) {
    console.log("Serving listing page");
    res.render("listing", { authRequired: true });
});

module.exports = router; 