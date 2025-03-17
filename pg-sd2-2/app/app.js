// Import express.js
const express = require("express");
const path = require("path");
// Temporarily comment out the DB connection to prevent errors
// const db = require("./db");

// Create express app
var app = express();

// Set up Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Add static files location
app.use(express.static(path.join(__dirname, "static")));

// Create a route for the homepage
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "static", "listing.html"));
});

// API endpoint for users (using hardcoded data for now)
app.get("/api/users", function (req, res) {
    // Hardcoded sample data
    const sampleUsers = [
        {
            FirstName: "Sunjog",
            LastName: "Singh",
            Email: "sunjog.singh@example.com",
            ExercisePreference: "Running",
            Expertise: "Advanced",
            Bio: "Hi, I'm Sunjog! I love running marathons and helping others achieve their fitness goals. Looking for running partners for morning sessions.",
            ProfilePicture: null,
            Location: "Edinburgh City Center",
            PreferredTime: "Morning (6-8 AM)",
            LastActive: "2 days ago"
        },
        {
            FirstName: "Harbajsd",
            LastName: "Kaur",
            Email: "harbajsd.kaur@example.com",
            ExercisePreference: "Cycling",
            Expertise: "Average",
            Bio: "Cycling enthusiast looking for weekend riding partners. Enjoy both city rides and trail adventures.",
            ProfilePicture: null,
            Location: "Leith, Edinburgh",
            PreferredTime: "Weekend afternoons",
            LastActive: "1 week ago"
        },
        {
            FirstName: "Emaan",
            LastName: "Ahmed",
            Email: "emaan.ahmed@example.com",
            ExercisePreference: "Running",
            Expertise: "Beginner",
            Bio: "Just started my fitness journey! Looking for friendly running partners who can help me improve my technique.",
            ProfilePicture: null,
            Location: "Bruntsfield, Edinburgh",
            PreferredTime: "Evenings (after 6 PM)",
            LastActive: "Just now"
        },
        {
            FirstName: "Naha",
            LastName: "Patel",
            Email: "naha.patel@example.com",
            ExercisePreference: "Cycling",
            Expertise: "Advanced",
            Bio: "Experienced cyclist passionate about mountain biking. Happy to mentor beginners and join group rides!",
            ProfilePicture: null,
            Location: "Portobello, Edinburgh",
            PreferredTime: "Early mornings and weekends",
            LastActive: "3 hours ago"
        }
    ];

    // Get query parameters for filtering
    const activity = req.query.activity || '';
    const expertise = req.query.expertise || '';
    const search = req.query.search || '';

    // Filter users based on parameters
    const filteredUsers = sampleUsers.filter(user => {
        const matchesSearch = !search || 
            user.FirstName.toLowerCase().includes(search.toLowerCase()) ||
            user.LastName.toLowerCase().includes(search.toLowerCase()) ||
            user.Email.toLowerCase().includes(search.toLowerCase()) ||
            user.Location.toLowerCase().includes(search.toLowerCase());

        const matchesActivity = !activity || 
            user.ExercisePreference === activity;

        const matchesExpertise = !expertise || 
            user.Expertise === expertise;

        return matchesSearch && matchesActivity && matchesExpertise;
    });

    res.json(filteredUsers);
});

// Profile route
app.get("/profile/:email", function (req, res) {
    res.sendFile(path.join(__dirname, "static", "profile.html"));
});

//  UPDATED PROFILE ROUTE (NO SESSION, JUST STATIC EMAIL FOR TESTING)
app.get("/profile", function (req, res) {
    // Use hardcoded sample data since we're having database connection issues
    const sampleUser = {
        FirstName: "John",
        LastName: "Smith",
        Email: "john.smith@gmail.com",
        ExercisePreference: "Running",
        Expertise: "Beginner",
        DateOfBirth: "1990-05-15",
        Location: "Edinburgh City Center",
        PreferredTime: "Morning (6-8 AM)"
    };

    res.render("profile", { user: sampleUser });
});

// Start server on port 3001, explicitly listening on all interfaces
app.listen(3001, '0.0.0.0', function () {
    console.log(`Server running at http://localhost:3001/`);
    console.log(`Also accessible at http://127.0.0.1:3001/`);
});
