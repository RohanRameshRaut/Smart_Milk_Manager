const express = require('express');
const router = express.Router();
const mysql = require('mysql');

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


// POST request to handle orders
router.post('/order', (req, res) => {
    const { message } = req.body;
    let reply = "Sorry, I didn't understand that.";

    // Simple logic to handle orders
    if (message.includes('0.5L')) {
        reply = "You have ordered 0.5 liters of milk.";
        saveOrder({ quantity: '0.5L' }, (err, orderId) => {
            if (err) {
                console.error('Error saving order:', err);
                res.status(500).json({ reply: "Internal server error" });
                return;
            }
            console.log('Order saved:', orderId);
            res.json({ reply });
        });
    } else if (message.includes('1L')) {
        reply = "You have ordered 1 liter of milk.";
        saveOrder({ quantity: '1L' }, (err, orderId) => {
            if (err) {
                console.error('Error saving order:', err);
                res.status(500).json({ reply: "Internal server error" });
                return;
            }
            console.log('Order saved:', orderId);
            res.json({ reply });
        });
    } else if (message.includes('2L')) {
        reply = "You have ordered 2 liters of milk.";
        saveOrder({ quantity: '2L' }, (err, orderId) => {
            if (err) {
                console.error('Error saving order:', err);
                res.status(500).json({ reply: "Internal server error" });
                return;
            }
            console.log('Order saved:', orderId);
            res.json({ reply });
        });
    } else if (message.includes('3L')) {
        reply = "You have ordered 3 liters of milk.";
        saveOrder({ quantity: '3L' }, (err, orderId) => {
            if (err) {
                console.error('Error saving order:', err);
                res.status(500).json({ reply: "Internal server error" });
                return;
            }
            console.log('Order saved:', orderId);
            res.json({ reply });
        });
    } else if (message.includes('4L')) {
        reply = "You have ordered 4 liters of milk.";
        saveOrder({ quantity: '4L' }, (err, orderId) => {
            if (err) {
                console.error('Error saving order:', err);
                res.status(500).json({ reply: "Internal server error" });
                return;
            }
            console.log('Order saved:', orderId);
            res.json({ reply });
        });
    } else {
        res.json({ reply });
    }
});

// Function to save order to MySQL
function saveOrder(orderDetails, callback) {
    const { quantity } = orderDetails;

    if (quantity) {
        // If quantity is provided, insert into orders table
        const query = 'INSERT INTO orders (quantity, bot_reply) VALUES (?, "Order received")';
        connection.query(query, [quantity], (err, results) => {
            if (err) {
                console.error('Error saving order:', err);
                callback(err);
                return;
            }
            console.log('Order saved with ID:', results.insertId);
            callback(null, results.insertId);
        });
    } else {
        callback(new Error('Invalid order details provided'));
    }
}

module.exports = router;

