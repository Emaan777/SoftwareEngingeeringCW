// Import express.js
const express = require("express");
const path = require("path");

// Create express app
var app = express();

// Set up Pug as the view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Dummy user data (Replace this with database query later)
const user = {
    FirstName: "John",
    LastName: "Doe",
    DateOfBirth: "1990-01-01",
    Email: "john.doe@example.com",
    ExercisePreference: "Cardio",
    Expertise: "Beginner",
    Bio: "I love running and staying active!"
};

// Create a route for the profile page
app.get("/profile", function(req, res) {
    res.render("profile", { user: user }); // Render profile.pug and pass user data
});

// Start server on port 3000
app.listen(3000, function() {
    console.log(`Server running at http://127.0.0.1:3000/`);
});
