// Import express.js
const express = require("express");

// Create express app
var app = express();
app.set('view engine', 'pug');
app.set('views', './app/views');

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Add middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Create a route for root - /
app.get("/", function(req, res) {
    res.send("Hello world! <a href='/userlist'>View User List</a>");
});

// Create a route for testing the db
app.get("/db_test", function(req, res) {
    sql = 'select * from User';
    db.query(sql).then(results => {
        console.log('Database test results:', results);
        res.send(results)
    }).catch(err => {
        console.error('Database error in /db_test:', err);
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

app.get("/userlist", function(req, res) {
    try {
        console.log('Accessing userlist route');
        var sql = 'select * from User';
        db.query(sql).then(results => { 
            console.log('User query results:', results);
            // Send the results rows to the userlist template
            // The rows will be in a variable called data
            res.render('userlist', {data: results});
        }).catch(err => {
            console.error('Database error in userlist:', err);
            res.status(500).send('Database error: ' + err.message);
        });
    } catch (error) {
        console.error('Unexpected error in userlist route:', error);
        res.status(500).send('Server error: ' + error.message);
    }
});

// Add user profile route
app.get("/user-single/:id", function(req, res) {
    try {
        console.log(`Accessing user profile for id: ${req.params.id}`);
        var sql = 'select * from User where UserID = ?';
        db.query(sql, [req.params.id]).then(results => {
            console.log('User profile query results:', results);
            if (results.length > 0) {
                res.render('user-profile', {user: results[0]});
            } else {
                res.status(404).send('User not found');
            }
        }).catch(err => {
            console.error('Database error in user-single:', err);
            res.status(500).send('Database error: ' + err.message);
        });
    } catch (error) {
        console.error('Unexpected error in user-single route:', error);
        res.status(500).send('Server error: ' + error.message);
    }
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});