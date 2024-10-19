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

// Route to handle product addition or update
router.post('/addProduct', (req, res) => {
    const { date, product_name, price, quantity } = req.body;

    // Log received data to check for issues
    console.log('Received data:', req.body);

    // First, check if the product already exists in the inventory
    const checkProductQuery = 'SELECT * FROM inventory WHERE product_name = ?';
    connection.query(checkProductQuery, [product_name], (error, results) => {
        if (error) {
            console.error('Error checking product:', error);
            res.status(500).json({ error: 'Error checking product' });
            return;
        }

        if (results.length > 0) {
            // Product exists, update the record
            const updateProductQuery = `
                UPDATE inventory 
                SET date = ?, price = ?, quantity = quantity + ?
                WHERE product_name = ?
            `;
            connection.query(updateProductQuery, [date, price, quantity, product_name], (updateError) => {
                if (updateError) {
                    console.error('Error updating product:', updateError);
                    res.status(500).json({ error: 'Error updating product' });
                    return;
                }
                console.log('Product updated successfully');
                res.status(200).json({ message: 'Product updated successfully' });
            });
        } else {
            // Product doesn't exist, insert new record
            const insertProductQuery = `
                INSERT INTO inventory (date, product_name, price, quantity) 
                VALUES (?, ?, ?, ?, ?)
            `;
            connection.query(insertProductQuery, [date, product_name, price, quantity], (insertError) => {
                if (insertError) {
                    console.error('Error adding product:', insertError);
                    res.status(500).json({ error: 'Error adding product' });
                    return;
                }
                console.log('Product added successfully');
                res.status(200).json({ message: 'Product added successfully' });
            });
        }
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

// New route to fetch milk data for the chart
router.get('/milkData', (req, res) => {
    const sql = `
        SELECT product_name AS type, SUM(quantity) AS quantity
        FROM inventory
        WHERE product_name IN ('Buffalo Milk', 'Cow Milk', 'Gir Milk')
        GROUP BY product_name
    `;
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching milk data:', error);
            res.status(500).json({ error: 'Error fetching milk data' });
            return;
        }
        res.json(results);
    });
});

router.get('/dashboard-container', (req, res) => {
    const todaysUseSql = `
        SELECT SUM(quantity) AS todaysUse
        FROM inventory
        WHERE DATE(date) = DATE(date) 
    `;

    const todaysStockSql = `
        SELECT SUM(quantity) AS todaysStock
        FROM inventory
    `;

    const outOfStockSql = `
        SELECT COUNT(*) AS outOfStock
        FROM inventory
        WHERE quantity = 0
    `;

    const runningOutSql = `
        SELECT COUNT(*) AS runningOut
        FROM inventory
        WHERE quantity < 50 AND quantity > 0
    `;

    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(todaysUseSql, (error, results) => {
                if (error) {
                    console.error('Error fetching today\'s use:', error);
                    reject(error);
                } else {
                    console.log('Today\'s Use:', results[0].todaysUse);
                    resolve(results[0].todaysUse || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(todaysStockSql, (error, results) => {
                if (error) {
                    console.error('Error fetching today\'s stock:', error);
                    reject(error);
                } else {
                    console.log('Today\'s Stock:', results[0].todaysStock);
                    resolve(results[0].todaysStock || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(outOfStockSql, (error, results) => {
                if (error) {
                    console.error('Error fetching out of stock:', error);
                    reject(error);
                } else {
                    console.log('Out of Stock:', results[0].outOfStock);
                    resolve(results[0].outOfStock || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(runningOutSql, (error, results) => {
                if (error) {
                    console.error('Error fetching running out:', error);
                    reject(error);
                } else {
                    console.log('Running Out:', results[0].runningOut);
                    resolve(results[0].runningOut || 0);
                }
            });
        })
    ])
    .then(([todaysUse, todaysStock, outOfStock, runningOut]) => {
        console.log('Dashboard Data:', { todaysUse, todaysStock, outOfStock, runningOut });
        res.json({ todaysUse, todaysStock, outOfStock, runningOut });
    })
    .catch(error => {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Error fetching dashboard data' });
    });
});







module.exports = router;
