const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// MySQL connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'inventory_db'
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Create Inventory table
app.get('/createTable', (req, res) => {
  const sql = `CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    product_name VARCHAR(255),
    stock_status VARCHAR(255),
    in_stock VARCHAR(255),
    quantity VARCHAR(255)
  )`;

  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send('Inventory table created');
  });
});

// Get all inventory items
app.get('/inventory', (req, res) => {
  const sql = 'SELECT * FROM inventory';

  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Get single inventory item
app.get('/inventory/:id', (req, res) => {
  const sql = 'SELECT * FROM inventory WHERE id = ?';
  const { id } = req.params;

  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Create new inventory item
app.post('/inventory', (req, res) => {
  const { date, product_name, stock_status, in_stock, quantity } = req.body;
  const sql = 'INSERT INTO inventory (date, product_name, stock_status, in_stock, quantity) VALUES (?, ?, ?, ?, ?)';

  db.query(sql, [date, product_name, stock_status, in_stock, quantity], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId });
  });
});

// Update inventory item
app.put('/inventory/:id', (req, res) => {
  const { id } = req.params;
  const { date, product_name, stock_status, in_stock, quantity } = req.body;
  const sql = 'UPDATE inventory SET date = ?, product_name = ?, stock_status = ?, in_stock = ?, quantity = ? WHERE id = ?';

  db.query(sql, [date, product_name, stock_status, in_stock, quantity, id], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Delete inventory item
app.delete('/inventory/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM inventory WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
