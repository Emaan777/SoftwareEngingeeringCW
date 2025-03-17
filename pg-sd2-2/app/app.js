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
const db = require("./services/db");

// Create a route for the homepage
app.get("/", function (req, res) {
    res.send("Welcome! Go to <a href='/profile'>Profile</a>");
});

//  UPDATED PROFILE ROUTE (NO SESSION, JUST STATIC EMAIL FOR TESTING)
app.get("/profile", async function (req, res) {
    try {
        const userEmail = "john.smith@gmail.com"; 

       var sql = 'SELECT * FROM `User` WHERE `Email` = ? '; 
       var params = [userEmail]
        //const result = await db.query("SELECT * FROM User WHERE Email = ?", [userEmail]);
        var result = await db.query(sql,params)
        console.log(result);
        
        //console.log("Database Query Result:", result); //  Log the actual query result

        if (result.length === 0) {
            return res.status(404).send("User not found");
        }

        res.render("profile", { user: result[0] }); // Pass user data to Pug template
    } catch (error) {
        console.error("Database Query Error:", error); //  Log actual error
        res.status(500).send(`Error retrieving user data: ${error.message}`); // Show real error
    }
});

// Start server on port 3000
app.listen(3000, function () {
    console.log(`Server running at http://127.0.0.1:3000/`);
});
