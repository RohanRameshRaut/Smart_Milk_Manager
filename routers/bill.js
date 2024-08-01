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


// Create an endpoint to fetch data for a specific customer
router.get('/billData/:customerId', (req, res) => {
    const customerId = req.params.customerId;
    const month = parseInt(req.query.month); // Get month from query parameters
    const year = parseInt(req.query.year);   // Get year from query parameters

    // SQL query to fetch data for the selected month and year
    const sql = `
        SELECT 
            c.customer_name AS customer_name,
            DATE_FORMAT(ds.sale_date, '%d') AS date,
            ds.quantity 
        FROM 
            daily_sales ds
        JOIN
            customers c ON ds.customer_id = c.customer_id
        WHERE 
            ds.customer_id = ? AND
            MONTH(ds.sale_date) = ? AND
            YEAR(ds.sale_date) = ?
        ORDER BY 
            ds.sale_date ASC
    `;

    connection.query(sql, [customerId, month, year], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).send('Error fetching data');
        }

        // Create arrays for days 1-15 and days 16-31
        const days1To15 = Array.from({ length: 15 }, (_, index) => ({
            date: (index + 1).toString().padStart(2, '0'),
            qty: 0
        }));

        const days16ToEnd = Array.from({ length: 16 }, (_, index) => ({
            date: (index + 16).toString().padStart(2, '0'),
            qty: 0
        }));

        // Fill in the actual data
        results.forEach(row => {
            const day = parseInt(row.date);

            if (day >= 1 && day <= 15) {
                days1To15[day - 1].qty = row.quantity;
            } else if (day >= 16 && day <= 31) {
                days16ToEnd[day - 16].qty = row.quantity;
            }
        });

        res.json({
            customerName: results.length > 0 ? results[0].customer_name : 'No Data',
            days1To15,
            days16ToEnd
        });
    });
});

module.exports = router;
