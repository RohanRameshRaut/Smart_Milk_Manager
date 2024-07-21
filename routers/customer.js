const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Use the database connection from the main server
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
    // console.log('Connected to MySQL');
});


// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Route to get logged-in customer data
router.get('/customerData', isAuthenticated, (req, res) => {
    const username = req.session.username;
    connection.query('SELECT * FROM customers WHERE email = ? ', [username], (error, results) => {
        if (error) {
            console.error('Error fetching customer data:', error);
            res.status(500).json({ error: 'Error fetching customer data' });
            return;
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    });
});

module.exports = router;
