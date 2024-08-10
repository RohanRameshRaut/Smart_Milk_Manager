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
router.get('/billData', (req, res) => {
    const month = req.query.month;
    const year = req.query.year;
    const customerId = req.query.customer_id;

    if (!month || !year || !customerId) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    // Fetch customer name, milk type, and sales data
    const query = `
        SELECT cs.customer_name, cs.milk_type, ds.sale_date, ds.quantity
        FROM daily_sales ds
        JOIN customers cs ON ds.customer_id = cs.customer_id
        WHERE ds.customer_id = ? AND ds.sale_date BETWEEN ? AND ?
    `;

    connection.query(query, [customerId, startDate, endDate], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }

        // Extract customer name, milk type, and sales data
        const customerName = results[0].customer_name;
        const milkType = results[0].milk_type;
        const salesData = results.map(row => ({
            sale_date: row.sale_date,
            quantity: row.quantity
        }));

        res.json({ customerName, milkType, salesData });
    });
});

module.exports = router;
