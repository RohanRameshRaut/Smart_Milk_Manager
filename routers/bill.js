const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const moment = require('moment');

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

// Function to insert daily sales records
function insertDailySales() {
    // Get today's date
    const today = moment().format('YYYY-MM-DD');

    // Query to get all permanent customers
    const getCustomersQuery = 'SELECT customer_id, default_quantity FROM customers';

    connection.query(getCustomersQuery, (error, results) => {
        if (error) {
            console.error('Error fetching customers:', error);
            return;
        }

        // Loop through each customer and insert a record for today
        results.forEach(customer => {
            const insertQuery = `
                INSERT INTO daily_sales (sale_date, customer_id, quantity)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
            `;

            connection.query(insertQuery, [today, customer.customer_id, customer.default_quantity], (err) => {
                if (err) {
                    console.error('Error inserting sales record:', err);
                } else {
                    console.log(`Sales record inserted for customer ID ${customer.customer_id}`);
                }
            });
        });
    });
}

// Endpoint to trigger daily sales insertion
router.get('/insert-daily-sales', (req, res) => {
    insertDailySales();
    res.send('Daily sales records inserted successfully!');
});

router.get('/billData/:customerId', (req, res) => {
    const customerId = req.params.customerId;

    const query = `
        SELECT 
            ds1.sale_date AS date1, ds1.quantity AS qty1, 
            ds2.sale_date AS date2, ds2.quantity AS qty2
        FROM daily_sales ds1
        LEFT JOIN daily_sales ds2 ON ds1.customer_id = ds2.customer_id 
            AND ds1.sale_date < ds2.sale_date
        WHERE ds1.customer_id = ?
        ORDER BY ds1.sale_date
    `;

    connection.query(query, [customerId], (err, results) => {
        if (err) {
            console.error('Error fetching sales data:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ sales: results });
    });
});

// Export the router
module.exports = router;
