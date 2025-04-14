// Import express.js
const express = require("express");
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');  // Add this line for password hashing
const session = require('express-session');

// Create express app
var app = express();
app.set('view engine', 'pug');
app.set('views', './app/views');

// Add session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Add middleware to pass user login status and current path to all views
app.use((req, res, next) => {
    res.locals.isLoggedIn = !!req.session.userId;
    res.locals.path = req.path;
    next();
});

// Add static files location
app.use(express.static(path.join(__dirname, 'public')));

// Add middleware to parse POST data
app.use(express.urlencoded({ extended: true }));

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
app.get("/", async function(req, res) {
    // Check if user is logged in
    const isLoggedIn = !!req.session?.userId;
    console.log('Home route - User logged in:', isLoggedIn, 'User ID:', req.session?.userId);
    
    let userData = null;
    if (isLoggedIn) {
        try {
            // Get user data from database
            const sql = 'SELECT * FROM User WHERE UserID = ?';
            const results = await db.query(sql, [req.session.userId]);
            
            if (results.length > 0) {
                userData = results[0];
                console.log('User data retrieved for home page');
            }
        } catch (err) {
            console.error('Error fetching user data for home page:', err);
        }
    }
    
    res.render('home', { 
        title: 'Welcome to Sport Buddy',
        description: 'Find your perfect workout partner!',
        user: userData
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
    // Check if user is logged in
    if (!req.session?.userId) {
        return res.redirect('/register');
    }

    try {
        console.log('Fetching users from database...');
        
        // Get current user's data for matching
        const currentUserSql = 'SELECT * FROM User WHERE UserID = ?';
        const currentUserResults = await db.query(currentUserSql, [req.session.userId]);
        
        if (!currentUserResults || currentUserResults.length === 0) {
            return res.status(404).send('User not found');
        }
        
        const currentUser = currentUserResults[0];
        
        // Get all other users
        const sql = 'SELECT * FROM User WHERE UserID != ?';
        const results = await db.query(sql, [req.session.userId]);
        
        if (!results || results.length === 0) {
            console.log('No other users found in database');
            return res.render('userlist', { 
                data: [], 
                suggestedBuddies: [],
                currentUser: currentUser
            });
        }
        
        // Calculate match scores for each user
        const usersWithScores = results.map(user => {
            let score = 0;
            
            // Match based on location (exact match gives higher score)
            if (currentUser.Location && user.Location) {
                if (currentUser.Location.toLowerCase() === user.Location.toLowerCase()) {
                    score += 5; // Exact location match
                } else if (currentUser.Location.toLowerCase().includes(user.Location.toLowerCase()) ||
                           user.Location.toLowerCase().includes(currentUser.Location.toLowerCase())) {
                    score += 3; // Partial location match
                }
            }
            
            // Match based on exercise preference
            if (currentUser.ExercisePreference && user.ExercisePreference) {
                if (currentUser.ExercisePreference.toLowerCase() === user.ExercisePreference.toLowerCase()) {
                    score += 5; // Exact exercise preference match
                }
            }
            
            // Match based on expertise level
            if (currentUser.Expertise && user.Expertise) {
                if (currentUser.Expertise.toLowerCase() === user.Expertise.toLowerCase()) {
                    score += 3; // Same expertise level
                }
            }
            
            return {
                ...user,
                matchScore: score
            };
        });
        
        // Sort all users by match score (highest first)
        usersWithScores.sort((a, b) => b.matchScore - a.matchScore);
        
        // Get top matches (include at least some users even if score is 0)
        let suggestedBuddies = usersWithScores
            .filter(user => user.matchScore > 0)
            .slice(0, 4); // Limit to top 4 matches
            
        // If no matches with score > 0, just take the first few users
        if (suggestedBuddies.length === 0 && usersWithScores.length > 0) {
            suggestedBuddies = usersWithScores.slice(0, 4);
        }
        
        console.log(`Found ${results.length} users, ${suggestedBuddies.length} suggested matches`);
        console.log('First user in results:', results[0] ? results[0].FirstName : 'No users');
        console.log('Current user ID:', req.session.userId);
        
        res.render('userlist', { 
            data: results, 
            suggestedBuddies: suggestedBuddies,
            currentUser: currentUser
        });
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
            // Check if the profile being viewed is the logged-in user's profile
            const isOwnProfile = req.session.userId === req.params.id;
            
            // Create a copy of the user object to avoid modifying the original data
            const userProfile = {...results[0]};
            
            // If not viewing own profile, remove sensitive information
            if (!isOwnProfile) {
                // Hide sensitive information (UserID and DateOfBirth)
                delete userProfile.UserID;
                delete userProfile.DateOfBirth;
            }
            
            res.render('user-profile', {
                user: userProfile,
                isOwnProfile: isOwnProfile
            });
        } else {
            res.status(404).send('User not found');
        }
    }).catch(err => {
        console.error(err);
        res.status(500).send('Database error');
    });
});

// Show registration form
app.get("/register", function(req, res) {
    res.render('register');
});

// Handle registration form submission
app.post("/register", async function(req, res) {
    try {
        // Check if terms were accepted
        if (!req.body.terms) {
            // In a real app, you'd want to show an error message
            return res.redirect('/register');
        }

        // Get form data
        const { userID, firstName, lastName, email, password, dob, exercise, expertise, location } = req.body;
        
        // Hash the password (simple version with 10 rounds)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user with hashed password
        const sql = `
            INSERT INTO User (UserID, FirstName, LastName, Email, UserPasword, DateOfBirth, ExercisePreference, Expertise, Location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.query(sql, [userID, firstName, lastName, email, hashedPassword, dob, exercise, expertise, location]);
        
        // Set session
        req.session.userId = userID;
        
        // Redirect to userlist page
        res.redirect('/userlist');
    } catch (err) {
        console.error('Registration error:', err);
        // In a real app, you'd want to show the error on the form
        res.redirect('/register');
    }
});

// Show login form
app.get("/login", function(req, res) {
    res.render('login');
});

// Handle login form submission
app.post("/login", async function(req, res) {
    try {
        console.log('Login attempt with:', req.body.email);
        const { email, password } = req.body;
        
        // Server-side validation
        const errors = {};
        
        // Validate email format
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailPattern.test(email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        // Validate password length
        if (!password || password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        
        // If validation errors, render login page with errors
        if (Object.keys(errors).length > 0) {
            console.log('Validation errors:', errors);
            return res.render('login', { errors });
        }
        
        // Find user by email
        const sql = 'SELECT * FROM User WHERE Email = ?';
        const results = await db.query(sql, [email]);
        
        if (results.length === 0) {
            console.log('User not found with email:', email);
            return res.render('login', { errors: { form: 'Invalid email or password' } });
        }
        
        const user = results[0];
        console.log('User found:', user.UserID);
        
        // Check password
        const match = await bcrypt.compare(password, user.UserPasword);
        console.log('Password match:', match);
        
        if (match) {
            // Set session
            req.session.userId = user.UserID;
            console.log('Session set, userId:', req.session.userId);
            
            // Redirect to home page instead of userlist
            res.redirect('/');
        } else {
            console.log('Password did not match');
            return res.render('login', { errors: { form: 'Invalid email or password' } });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.render('login', { errors: { form: 'An error occurred. Please try again.' } });
    }
});

// Add logout route
app.get("/logout", function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

// Add profile route for viewing/editing own profile
app.get("/profile", async function(req, res) {
    // Check if user is logged in
    if (!req.session?.userId) {
        return res.redirect('/login');
    }

    try {
        // Get user data from database
        const sql = 'SELECT * FROM User WHERE UserID = ?';
        const results = await db.query(sql, [req.session.userId]);
        
        if (results.length === 0) {
            return res.status(404).send('User not found');
        }
        
        // Render profile page with user data
        res.render('profile', {user: results[0]});
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).send('Database error: ' + err.message);
    }
});

// Handle profile update
app.post("/profile/update", async function(req, res) {
    // Check if user is logged in
    if (!req.session?.userId) {
        return res.redirect('/login');
    }

    try {
        // Get form data
        const { firstName, lastName, email, dob, exercise, expertise } = req.body;
        
        // Update user in database
        const sql = `
            UPDATE User 
            SET FirstName = ?, LastName = ?, Email = ?, 
                DateOfBirth = ?, ExercisePreference = ?, Expertise = ? 
            WHERE UserID = ?
        `;
        
        await db.query(sql, [
            firstName, 
            lastName, 
            email, 
            dob || null, 
            exercise || null, 
            expertise || null, 
            req.session.userId
        ]);
        
        // Redirect back to profile page
        res.redirect('/profile');
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).send('Database error: ' + err.message);
    }
});

// Routes page - show map with nearby places for exercise
app.get("/routes", async function(req, res) {
    // Check if user is logged in
    if (!req.session?.userId) {
        return res.redirect('/login');
    }

    try {
        // Sample places data - in a real app, this would come from a database or external API
        const samplePlaces = [
            // Parks
            { id: 'p1', name: "Hyde Park", type: "Park", latitude: 51.5073, longitude: -0.1657, address: "Hyde Park, London", suitableFor: ["running", "cycling"] },
            { id: 'p2', name: "Regent's Park", type: "Park", latitude: 51.5313, longitude: -0.1534, address: "Regent's Park, London", suitableFor: ["running", "cycling"] },
            { id: 'p3', name: "Victoria Park", type: "Park", latitude: 51.5362, longitude: -0.0372, address: "Victoria Park, London", suitableFor: ["running", "cycling"] },
            
            // Trails
            { id: 't1', name: "Thames Path", type: "Trail", latitude: 51.5080, longitude: -0.1195, address: "Thames Path, London", suitableFor: ["running", "cycling"] },
            { id: 't2', name: "Parkland Walk", type: "Trail", latitude: 51.5785, longitude: -0.1382, address: "Parkland Walk, London", suitableFor: ["running"] },
            
            // Gyms
            { id: 'g1', name: "PureGym London", type: "Gym", latitude: 51.5100, longitude: -0.1280, address: "123 Oxford St, London", suitableFor: ["running"] },
            
            // Sports Centers
            { id: 's1', name: "Westway Sports Centre", type: "Sports Center", latitude: 51.5169, longitude: -0.2159, address: "1 Crowthorne Rd, London", suitableFor: ["running", "cycling"] }
        ];
        
        // In a real app, we would filter these based on user preferences or search criteria
        console.log(`Showing ${samplePlaces.length} sample places for exercise`);
        
        res.render('routes', { 
            places: samplePlaces
        });
    } catch (err) {
        console.error('Error in places page:', err);
        res.status(500).send('Error: ' + err.message);
    }
});

// API endpoint to get user's routes
app.get("/api/routes", async function(req, res) {
    // Check if user is logged in
    if (!req.session?.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    try {
        // Get user's saved routes
        const routesSql = 'SELECT * FROM Route WHERE UserID = ? ORDER BY ActivityDate DESC';
        const routes = await db.query(routesSql, [req.session.userId]);
        
        // Parse route data JSON
        routes.forEach(route => {
            if (route.RouteData && typeof route.RouteData === 'string') {
                try {
                    route.RouteData = JSON.parse(route.RouteData);
                } catch (e) {
                    console.error('Error parsing route data:', e);
                    route.RouteData = [];
                }
            }
        });
        
        res.json({
            success: true,
            routes: routes
        });
    } catch (err) {
        console.error('Error getting routes:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Helper function to calculate distance between two points using the Haversine formula
function calculateDistance(point1, point2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (point2[1] - point1[1]) * Math.PI / 180;
    const dLon = (point2[0] - point1[0]) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1[1] * Math.PI / 180) * Math.cos(point2[1] * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
}

// Save a new route
app.post("/routes/save", async function(req, res) {
    // Check if user is logged in
    if (!req.session?.userId) {
        console.error('Route save attempt without login');
        return res.status(401).json({ error: 'Not logged in' });
    }

    try {
        console.log('Route save request received from user:', req.session.userId);
        
        const { coordinates, distance, duration, activityType, date } = req.body;
        
        console.log('Received route data:');
        console.log('- Activity type:', activityType);
        console.log('- Distance:', distance);
        console.log('- Duration:', duration);
        console.log('- Date:', date);
        console.log('- Coordinates count:', coordinates ? coordinates.length : 0);
        
        // Basic validation
        if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
            console.error('Invalid coordinates data');
            return res.status(400).json({ error: 'Invalid coordinates data' });
        }
        
        // Save route to database
        const sql = `
            INSERT INTO Route (UserID, ActivityType, ActivityDate, Distance, Duration, RouteData)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            req.session.userId,
            activityType || 'Running',
            new Date(date || Date.now()),
            parseFloat(distance) || 1.0,
            duration || '00:10:00',
            JSON.stringify({ coordinates })
        ];
        
        console.log('Executing SQL with params:', params.slice(0, 5));
        
        const result = await db.query(sql, params);
        
        console.log('Route saved successfully for user:', req.session.userId);
        
        res.status(201).json({ 
            success: true, 
            message: 'Route saved successfully',
            routeId: result.insertId
        });
    } catch (err) {
        console.error('Save route error:', err);
        res.status(500).json({ error: `Failed to save route: ${err.message}` });
    }
});

// Notifications page - show user notifications
app.get("/notifications", async function(req, res) {
    // Check if user is logged in
    if (!req.session?.userId) {
        return res.redirect('/login');
    }

    try {
        // Get user's notifications
        const notificationsSql = `
            SELECT * FROM Notification 
            WHERE UserID = ? 
            ORDER BY CreatedTime DESC
        `;
        const notifications = await db.query(notificationsSql, [req.session.userId]);
        
        res.render('notifications', { notifications });
    } catch (err) {
        console.error('Notifications error:', err);
        res.status(500).send('Error loading notifications: ' + err.message);
    }
});

// Mark notification as read
app.post("/notifications/mark-read", async function(req, res) {
    // Check if user is logged in
    if (!req.session?.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    try {
        const notificationId = req.body.notificationId;
        
        // Update notification to mark as read
        const markReadSql = `
            UPDATE Notification 
            SET IsRead = TRUE 
            WHERE NotificationID = ? AND UserID = ?
        `;
        
        await db.query(markReadSql, [notificationId, req.session.userId]);
        
        res.redirect('/notifications');
    } catch (err) {
        console.error('Mark notification read error:', err);
        res.status(500).send('Error updating notification: ' + err.message);
    }
});

// Messages page - show conversations
app.get("/messages", async function(req, res) {
    // Check if user is logged in
    if (!req.session?.userId) {
        return res.redirect('/login');
    }

    try {
        // Get user's conversations
        const conversationsSql = `
            SELECT DISTINCT 
                u.UserID, u.FirstName, u.LastName,
                (SELECT COUNT(*) FROM Message 
                 WHERE SenderID = u.UserID 
                 AND ReceiverID = ? 
                 AND IsRead = FALSE) AS UnreadCount
            FROM User u
            JOIN Message m ON (m.SenderID = u.UserID AND m.ReceiverID = ?)
                          OR (m.ReceiverID = u.UserID AND m.SenderID = ?)
            WHERE u.UserID != ?
            ORDER BY UnreadCount DESC, u.FirstName, u.LastName
        `;
        
        const conversations = await db.query(conversationsSql, [
            req.session.userId,
            req.session.userId,
            req.session.userId,
            req.session.userId
        ]);
        
        res.render('messages', { 
            conversations,
            userId: req.session.userId,
            currentUser: null,
            currentUserName: null,
            messages: []
        });
    } catch (err) {
        console.error('Messages error:', err);
        res.status(500).send('Error loading messages: ' + err.message);
    }
});

// View conversation with specific user
app.get("/messages/:userId", async function(req, res) {
    // Check if user is logged in
    if (!req.session?.userId) {
        return res.redirect('/login');
    }

    try {
        const otherUserId = req.params.userId;
        
        // Get user's conversations for sidebar
        const conversationsSql = `
            SELECT DISTINCT 
                u.UserID, u.FirstName, u.LastName,
                (SELECT COUNT(*) FROM Message 
                 WHERE SenderID = u.UserID 
                 AND ReceiverID = ? 
                 AND IsRead = FALSE) AS UnreadCount
            FROM User u
            JOIN Message m ON (m.SenderID = u.UserID AND m.ReceiverID = ?)
                          OR (m.ReceiverID = u.UserID AND m.SenderID = ?)
            WHERE u.UserID != ?
            ORDER BY UnreadCount DESC, u.FirstName, u.LastName
        `;
        
        const conversations = await db.query(conversationsSql, [
            req.session.userId,
            req.session.userId,
            req.session.userId,
            req.session.userId
        ]);
        
        // Get other user's name
        const userSql = 'SELECT FirstName, LastName FROM User WHERE UserID = ?';
        const userResult = await db.query(userSql, [otherUserId]);
        
        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }
        
        const otherUserName = `${userResult[0].FirstName} ${userResult[0].LastName}`;
        
        // Get messages between users
        const messagesSql = `
            SELECT * FROM Message 
            WHERE (SenderID = ? AND ReceiverID = ?)
               OR (SenderID = ? AND ReceiverID = ?)
            ORDER BY SentTime ASC
        `;
        
        const messages = await db.query(messagesSql, [
            req.session.userId, otherUserId,
            otherUserId, req.session.userId
        ]);
        
        // Mark messages from other user as read
        const markReadSql = `
            UPDATE Message 
            SET IsRead = TRUE 
            WHERE SenderID = ? AND ReceiverID = ? AND IsRead = FALSE
        `;
        
        await db.query(markReadSql, [otherUserId, req.session.userId]);
        
        res.render('messages', { 
            conversations,
            userId: req.session.userId,
            currentUser: otherUserId,
            currentUserName: otherUserName,
            messages
        });
    } catch (err) {
        console.error('View conversation error:', err);
        res.status(500).send('Error loading conversation: ' + err.message);
    }
});

// Send message to user
app.post("/messages/:userId/send", async function(req, res) {
    // Check if user is logged in
    if (!req.session?.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    try {
        const receiverId = req.params.userId;
        const { messageContent } = req.body;
        
        if (!messageContent || messageContent.trim() === '') {
            return res.redirect(`/messages/${receiverId}`);
        }
        
        // Insert message
        const insertMessageSql = `
            INSERT INTO Message (SenderID, ReceiverID, MessageContent)
            VALUES (?, ?, ?)
        `;
        
        await db.query(insertMessageSql, [
            req.session.userId,
            receiverId,
            messageContent.trim()
        ]);
        
        // Create notification for receiver
        const userSql = 'SELECT FirstName, LastName FROM User WHERE UserID = ?';
        const userResult = await db.query(userSql, [req.session.userId]);
        const senderName = `${userResult[0].FirstName} ${userResult[0].LastName}`;
        
        const insertNotificationSql = `
            INSERT INTO Notification (UserID, NotificationType, Content)
            VALUES (?, 'message', ?)
        `;
        
        await db.query(insertNotificationSql, [
            receiverId,
            `You received a new message from ${senderName}`
        ]);
        
        res.redirect(`/messages/${receiverId}`);
    } catch (err) {
        console.error('Send message error:', err);
        res.status(500).send('Error sending message: ' + err.message);
    }
});

// Start server on port 3000
app.listen(3000, '0.0.0.0', function(){
    console.log(`Server running at http://localhost:3000/`);
});