const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const moment = require('moment');

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

// POST request to handle orders
router.post('/', (req, res) => {
    const { message } = req.body;
    let reply = "Sorry, I didn't understand that.";

    // Simple logic to handle orders
    let quantity = 0;
    if (message.includes('0L')) {
        reply = "You have ordered 0L liters of milk.";
    } else if (message.includes('0.5L')) {
        reply = "You have ordered 0.5 liter of milk.";
        quantity = 0.50;
    } else if (message.includes('1L')) {
        reply = "You have ordered 1 liter of milk.";
        quantity = 1.00;
    } else if (message.includes('2L')) {
        reply = "You have ordered 2 liters of milk.";
        quantity = 2.00;
    } else if (message.includes('3L')) {
        reply = "You have ordered 3 liters of milk.";
        quantity = 3.00;
    } else if (message.includes('4L')) {
        reply = "You have ordered 4 liters of milk.";
        quantity = 4.00;
    } else {
        return res.json({ reply });
    }

    // Get customer data first
    getCustomerData(req.session.username, (err, customerData) => {
        if (err) {
            console.error('Error fetching customer data:', err);
            return res.status(500).json({ reply: "Internal server error" });
        }

        saveOrder({ quantity, customerId: customerData.customer_id }, (err, orderId) => {
            if (err) {
                console.error('Error saving order:', err);
                return res.status(500).json({ reply: "Internal server error" });
            }

            console.log('Order saved:', orderId, quantity);
            res.json({ reply });
            req.app.get('socketIo').emit('newOrder', {
                customer_id: customerData.customer_id,
                customer_name: customerData.customer_name,
                customer_mobile_number: customerData.customer_mobile_number,
                quantity
            });
        });
    });
});

// Function to get customer data
function getCustomerData(username, callback) {
    const query = 'SELECT * FROM customers WHERE email = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching customer data:', err);
            callback(err);
            return;
        }
        if (results.length > 0) {
            callback(null, results[0]);
        } else {
            callback(new Error('Customer not found'));
        }
    });
}

// Function to save order to MySQL
function saveOrder(orderDetails, callback) {
    const { quantity, customerId } = orderDetails;
    const sale_date = moment().format('YYYY-MM-DD'); // Get today's date for the sale

    if (quantity && customerId) {
        // Insert into orders table
        const insertOrderQuery = 'INSERT INTO orders (quantity, bot_reply, customer_id) VALUES (?, "Order received", ?)';
        connection.query(insertOrderQuery, [quantity, customerId], (err, results) => {
            if (err) {
                console.error('Error saving order:', err);
                callback(err);
                return;
            }
            console.log('Order saved with ID:', results.insertId);
            callback(null, results.insertId);

            // Update the daily_sales table with the ordered quantity
            const updateDailySalesQuery = `
                INSERT INTO daily_sales (sale_date, customer_id, quantity)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
            `;
            connection.query(updateDailySalesQuery, [sale_date, customerId, quantity], (err) => {
                if (err) {
                    console.error('Error updating daily sales:', err);
                    // You might want to handle this error as well
                }
            });
        });
    } else {
        callback(new Error('Invalid order details provided'));
    }
}

module.exports = router;
