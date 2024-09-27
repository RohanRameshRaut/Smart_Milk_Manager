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
// Endpoint to get earnings data from daily_sales
router.get('/earnings', (req, res) => {
    const query = `
      SELECT 
        DATE_FORMAT(date, '%b') AS month, 
        SUM((quantity - in_stock) * price) AS total_earnings
      FROM inventory
      GROUP BY DATE_FORMAT(date, '%m'), month
      ORDER BY DATE_FORMAT(date, '%m');
    `;

    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database query failed' });
            return;
        }

        const labels = results.map(row => row.month);
        const data = results.map(row => row.total_earnings);

        res.json({ labels, data });
    });
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
        SELECT SUM((quantity - in_stock) * price) AS monthlySales
        FROM inventory
        WHERE DATE(date) >= DATE_FORMAT(date, '%Y-%m-01')
        AND DATE(date) < DATE_FORMAT(date + INTERVAL 1 MONTH, '%Y-%m-01');

    `;

    const todaysPurchaseSql = `
        SELECT SUM(total_price) AS todaysPurchase
        FROM purchase
        WHERE DATE(date) = DATE(date)
    `;

    const monthlyPurchaseSql = `
        SELECT SUM(total_price) AS monthlyPurchase
        FROM purchase
        WHERE DATE(date) >= DATE_FORMAT(date, '%Y-%m-01')
        AND DATE(date) < DATE_FORMAT(date + INTERVAL 1 MONTH, '%Y-%m-01');
    `;

    const todaysRequestsSql = `
        SELECT COUNT(id) AS todaysRequests
        FROM orders
        WHERE DATE(created_at) = CURDATE()
    `;


    const requestsFulfilledSql = `
        SELECT COUNT(bot_reply) AS requestsFulfilled
        FROM orders
        WHERE DATE(created_at) = CURDATE()
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