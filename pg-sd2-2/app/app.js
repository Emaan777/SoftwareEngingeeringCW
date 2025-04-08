// Import express.js
const express = require("express");
const path = require('path');
const fs = require('fs').promises;

// Create express app
var app = express();
app.set('view engine', 'pug');
app.set('views', './app/views');

// Add static files location
app.use(express.static("static"));

// Serve CSS files dynamically
app.get('/styles/:name.css', async (req, res) => {
    const cssPath = path.join(__dirname, 'styles', `${req.params.name}.css`);
    try {
        const css = await fs.readFile(cssPath, 'utf8');
        res.type('text/css').send(css);
    } catch (err) {
        res.status(404).send('Style not found');
    }
});

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", function(req, res) {
    res.render('home', { 
        title: 'Welcome to Sport Buddy',
        description: 'Find your perfect workout partner!'
    });
});

// Create a route for testing the db
app.get("/db_test", function(req, res) {
    sql = 'select * from User';
    db.query(sql).then(results => {
        console.log('DB Test Results:', results);
        res.send(results)
    }).catch(err => {
        console.error('DB Test Error:', err);
        res.status(500).send('Database error: ' + err.message);
    });
});

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

app.get("/userlist", async function(req, res) {
    try {
        console.log('Fetching users from database...');
        const sql = 'SELECT * FROM User';
        const results = await db.query(sql);
        console.log('Query results:', results);
        
        if (!results || results.length === 0) {
            console.log('No users found in database');
            return res.render('userlist', { data: [] });
        }
        
        console.log(`Found ${results.length} users`);
        res.render('userlist', { data: results });
    } catch (err) {
        console.error('Error in userlist route:', err);
        res.status(500).send('Database error: ' + err.message);
    }
});

// Add user profile route
app.get("/user-single/:id", function(req, res) {
    var sql = 'select * from User where UserID = ?';
    db.query(sql, [req.params.id]).then(results => {
        if (results.length > 0) {
            res.render('user-profile', {user: results[0]});
        } else {
            res.status(404).send('User not found');
        }
    }).catch(err => {
        console.error(err);
        res.status(500).send('Database error');
    });
});

// Start server on port 3000
app.listen(3000, '0.0.0.0', function(){
    console.log(`Server running at http://localhost:3000/`);
});