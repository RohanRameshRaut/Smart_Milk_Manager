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
    // console.log('Connected to MySQL');
});


// Route to get purchase data
router.get('/purchaseData', (req, res) => {
    const query = 'SELECT * FROM purchase';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

// Route to add a new purchase
router.post('/add', (req, res) => {
    const { date, productName, quantity, price, totalPrice } = req.body;
    const query = 'INSERT INTO purchase (date, product_name, quantity, price) VALUES (?, ?, ?, ?)';
    
    connection.query(query, [date, productName, quantity, price, totalPrice], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database insert failed' });
        }
        res.status(201).json({ message: 'Purchase added successfully' });
    });
});

// Route to delete a product by ID
router.delete('/deleteProduct/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM purchase WHERE id = ?';
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
