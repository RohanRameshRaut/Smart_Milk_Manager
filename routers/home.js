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

// Assuming you have already set up your Express app and MySQL connection

router.get('/milk-data', (req, res) => {
    const purchaseSql = `
        SELECT SUM(quantity) AS purchase
        FROM inventory
        WHERE DATE(date) = DATE(date) 
    `;

    const saleSql = `
        SELECT SUM(quantity-in_stock) AS sale
        FROM inventory
        WHERE DATE(date) = DATE(date) 
    `;

    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(purchaseSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].purchase || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(saleSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].sale || 0);
                }
            });
        })
    ])
        .then(([purchase, sale]) => {
            res.json({ purchase, sale });
        })
        .catch(error => {
            console.error('Error fetching milk data:', error);
            res.status(500).json({ error: 'Error fetching milk data' });
        });
});

// Backend endpoint to provide the necessary dashboard data
router.get('/dashboard-container', (req, res) => {
    const todaysSalesSql = `
        SELECT SUM((quantity - in_stock) * price) AS todaysSales
        FROM inventory
        WHERE DATE(date) = DATE(date)
    `;

    const monthlySalesSql = `
        SELECT SUM(amount) AS monthlySales
        FROM inventory
        WHERE MONTH(updated_at) = MONTH(CURDATE())
    `;

    const todaysPurchaseSql = `
        SELECT SUM(amount) AS todaysPurchase
        FROM purchases
        WHERE DATE(updated_at) = CURDATE()
    `;

    const monthlyPurchaseSql = `
        SELECT SUM(amount) AS monthlyPurchase
        FROM purchases
        WHERE MONTH(updated_at) = MONTH(CURDATE())
    `;

    const todaysRequestsSql = `
        SELECT COUNT(*) AS todaysRequests
        FROM requests
        WHERE DATE(requested_at) = CURDATE()
    `;

    const requestsFulfilledSql = `
        SELECT COUNT(*) AS requestsFulfilled
        FROM requests
        WHERE DATE(fulfilled_at) = CURDATE()
    `;

    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(todaysSalesSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].todaysSales || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(monthlySalesSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].monthlySales || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(todaysPurchaseSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].todaysPurchase || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(monthlyPurchaseSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].monthlyPurchase || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(todaysRequestsSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].todaysRequests || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(requestsFulfilledSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].requestsFulfilled || 0);
                }
            });
        })
    ])
        .then(([todaysSales, monthlySales, todaysPurchase, monthlyPurchase, todaysRequests, requestsFulfilled]) => {
            res.json({
                todaysSales,
                monthlySales,
                todaysPurchase,
                monthlyPurchase,
                todaysRequests,
                requestsFulfilled
            });
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
            res.status(500).json({ error: 'Error fetching dashboard data' });
        });
});


module.exports = router;
