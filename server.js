const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = 4000; // Set the port

// Import the inventory router
const inventoryRouter = require('./routers/inventory');

// Import the order router
const orderRouter = require('./routers/order');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Generate a secret key
const secretKey = crypto.randomBytes(64).toString('hex');

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Root@123',
    database: 'nodejs'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Note: for production, set secure: true if using HTTPS
}));

// Middleware to protect routes
function requireLogin(req, res, next) {
    if (req.session.loggedIn) {
        next(); // Allow access to the route
    } else {
        res.redirect("/"); // Redirect to login page
    }
}

// Login route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post("/", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    connection.query("SELECT * FROM loginuser WHERE user_name = ? AND user_pass = ?", [username, password], (error, results) => {
        if (error) {
            console.error('Error in login query:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (results.length > 0) {
            req.session.loggedIn = true;
            req.session.username = username;
            const userType = results[0].user_type; // Get the user type from the query results
            console.log(userType);
            if (userType === 'admin') {
                res.redirect("/home");
            } else if (userType === 'customer') {
                res.redirect("/customer");
            } else {
                res.redirect("/");
            }
        } else {
            res.redirect("/");
        }
    });
});

// Routes for authenticated users
app.get('/login', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/home', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/customer', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

app.get('/inventory', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inventory.html'));
});

app.get('/bills', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bills.html'));
});

// Use the inventory router with a prefix
app.use(inventoryRouter);

// Use the order router with a prefix
app.use(orderRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});




