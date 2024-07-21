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
    console.log('Connected to MySQL');
});

// Route to get all customer data
router.get('/customerData', (req, res) => {
    connection.query('SELECT * FROM customers', (error, results) => {
        if (error) {
            console.error('Error fetching customer data:', error);
            res.status(500).json({ error: 'Error fetching customer data' });
            return;
        }
        res.json(results);
    });
});

// Route to get a specific customer's data
router.get('/customerData/:id', (req, res) => {
    const customerId = req.params.id;
    connection.query('SELECT * FROM customers WHERE customer_id = ?', [customerId], (error, results) => {
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

// Route to delete a customer
router.delete('/customerData/:id', (req, res) => {
    const customerId = req.params.id;
    connection.query('DELETE FROM customers WHERE customer_id = ?', [customerId], (error, results) => {
        if (error) {
            console.error('Error deleting customer:', error);
            res.status(500).json({ error: 'Error deleting customer' });
            return;
        }
        res.json({ message: 'Customer deleted successfully' });
    });
});

// Route to update a customer
router.put('/customerData/:id', (req, res) => {
    const customerId = req.params.id;
    const { customerName, customerMobileNumber, milkType, defaultQuantity, address } = req.body;

    const query = 'UPDATE customers SET customer_name = ?, customer_mobile_number = ?, milk_type = ?, default_quantity = ?, address = ? WHERE customer_id = ?';
    const values = [customerName, customerMobileNumber, milkType, defaultQuantity, address, customerId];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error updating customer:', error);
            res.status(500).json({ error: 'Error updating customer' });
            return;
        }
        res.json({ message: 'Customer updated successfully' });
    });
});

module.exports = router;
