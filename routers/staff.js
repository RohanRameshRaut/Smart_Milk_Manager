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
    // console.log('Connected to MySQL');
});

// Route to get all staff data
router.get('/staffData', (req, res) => {
    connection.query('SELECT * FROM staff', (error, results) => {
        if (error) {
            console.error('Error fetching staff data:', error);
            res.status(500).json({ error: 'Error fetching staff data' });
            return;
        }
        res.json(results);
    });
});

// Route to get a specific staff member's data
router.get('/staffData/:id', (req, res) => {
    const staffId = req.params.id;
    connection.query('SELECT * FROM staff WHERE id = ?', [staffId], (error, results) => {
        if (error) {
            console.error('Error fetching staff data:', error);
            res.status(500).json({ error: 'Error fetching staff data' });
            return;
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    });
});

// Route to delete a staff member
router.delete('/staffData/:id', (req, res) => {
    const staffId = req.params.id;
    connection.query('DELETE FROM staff WHERE id = ?', [staffId], (error, results) => {
        if (error) {
            console.error('Error deleting staff member:', error);
            res.status(500).json({ error: 'Error deleting staff member' });
            return;
        }
        res.json({ message: 'Staff member deleted successfully' });
    });
});

// Route to update a staff member
router.put('/staffData/:id', (req, res) => {
    const staffId = req.params.id;
    const { name, age, mobile_number, address, designation, salary, joining_date } = req.body;

    const query = 'UPDATE staff SET name = ?, age = ?, mobile_number = ?, address = ?, designation = ?, salary = ?, joining_date = ? WHERE id = ?';
    const values = [name, age, mobile_number, address, designation, salary, joining_date, staffId];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error updating staff member:', error);
            res.status(500).json({ error: 'Error updating staff member' });
            return;
        }
        res.json({ message: 'Staff member updated successfully' });
    });
});


// Route to add a new staff member
router.post('/staffData', (req, res) => {
    const { name, age, mobile_number, address, designation, salary, joining_date } = req.body;

    const query = 'INSERT INTO staff (name, age, mobile_number, address, designation, salary, joining_date) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [name, age, mobile_number, address, designation, salary, joining_date];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error adding staff member:', error);
            res.status(500).json({ error: 'Error adding staff member' });
            return;
        }
        res.json({ message: 'Staff member added successfully', id: results.insertId });
    });
});

module.exports = router;
