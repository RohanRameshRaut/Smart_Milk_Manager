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

// Route to fetch inventory data
router.get('/inventoryData', (req, res) => {
    const sql = 'SELECT * FROM inventory';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching inventory data:', error);
            res.status(500).json({ error: 'Error fetching inventory data' });
            return;
        }
        res.json(results);
    });
});

// Route to handle product addition
router.post('/addProduct', (req, res) => {
    const { date, productName, stockStatus, inStock, quantity } = req.body;

    // Log received data to check for issues
    console.log('Received data:', req.body);

    const sql = 'INSERT INTO inventory (date, product_name, stock_status, in_stock, quantity) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [date, productName, stockStatus, inStock, quantity], (error, results) => {
        if (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ error: 'Error adding product' });
            return;
        }
        console.log('Product added successfully');
        res.status(200).json({ message: 'Product added successfully' });
    });
});

// Route to delete a product by ID
router.delete('/deleteProduct/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM inventory WHERE id = ?';
    connection.query(sql, [productId], (error, results) => {
        if (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ error: 'Error deleting product' });
            return;
        }
        console.log('Product deleted successfully');
        res.status(200).json({ message: 'Product deleted successfully' });
    });
});

module.exports = router;
