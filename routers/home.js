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
            DATE_FORMAT(ds.sale_date, '%b') AS month, 
            SUM(ds.quantity * 
                CASE 
                    WHEN c.milk_type = 'Buffalo milk' THEN 68
                    WHEN c.milk_type = 'Cow milk' THEN 55
                    WHEN c.milk_type = 'Gir milk' THEN 75
                    ELSE 0
                END
            ) AS total_earnings
        FROM 
            daily_sales ds
        JOIN 
            customers c ON ds.customer_id = c.customer_id
        GROUP BY 
            YEAR(ds.sale_date), MONTH(ds.sale_date), month
        ORDER BY 
            YEAR(ds.sale_date), MONTH(ds.sale_date);
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

// Endpoint to fetch milk data
router.get('/milk-data', (req, res) => {
    const purchaseSql = `
        SELECT SUM(quantity) AS purchase
        FROM inventory
        WHERE DATE(date) = DATE(date);
    `;

    const saleSql = `
        SELECT 
            SUM(ds.quantity) AS todaysSalesInLiters
        FROM 
            daily_sales ds
        WHERE 
            DATE(ds.sale_date) = DATE(ds.sale_date);
    `;

    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(purchaseSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]?.purchase || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(saleSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]?.todaysSalesInLiters || 0);
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
        SELECT 
            SUM(ds.quantity * 
                CASE 
                    WHEN c.milk_type = 'Buffalo milk' THEN 68
                    WHEN c.milk_type = 'Cow milk' THEN 55
                    WHEN c.milk_type = 'Gir milk' THEN 75
                    ELSE 0
                END
            ) AS todaysSalesInRupees
        FROM 
            daily_sales ds
        JOIN 
            customers c ON ds.customer_id = c.customer_id
        WHERE 
            DATE(ds.sale_date) = CURDATE();
    `;

    const monthlySalesSql = `
        SELECT 
            SUM(ds.quantity * 
                CASE 
                    WHEN c.milk_type = 'Buffalo milk' THEN 68
                    WHEN c.milk_type = 'Cow milk' THEN 55
                    WHEN c.milk_type = 'Gir milk' THEN 75
                    ELSE 0
                END
            ) AS monthlySalesInRupees
        FROM 
            daily_sales ds
        JOIN 
            customers c ON ds.customer_id = c.customer_id
        WHERE 
            MONTH(ds.sale_date) = MONTH(CURDATE()) 
            AND YEAR(ds.sale_date) = YEAR(CURDATE());
    `;

    const todaysPurchaseSql = `
      SELECT 
    -- Today's sales in rupees based on milk type and quantity sold
    COALESCE(SUM(ds.quantity * 
        CASE 
            WHEN c.milk_type = 'Buffalo milk' THEN 56
            WHEN c.milk_type = 'Cow milk' THEN 42
            WHEN c.milk_type = 'Gir milk' THEN 62
            ELSE 0
        END), 0) AS todaysSalesInRupees,

    -- Total inventory quantity
    COALESCE((SELECT SUM(quantity) FROM inventory), 0) AS totalInventoryQuantity,

    -- Today's purchase calculated as today's inventory quantity + today's daily sales quantity
    COALESCE((SELECT SUM(quantity) FROM inventory), 0) - 
    COALESCE(SUM(ds.quantity), 0) AS todaysPurchase

FROM 
    daily_sales ds
JOIN 
    customers c ON ds.customer_id = c.customer_id
WHERE 
    DATE(ds.sale_date) = CURDATE();


    `;

    const monthlyPurchaseSql = `
       SELECT 
    COALESCE(SUM(ds.quantity * 
        CASE 
            WHEN c.milk_type = 'Buffalo milk' THEN 68
            WHEN c.milk_type = 'Cow milk' THEN 55
            WHEN c.milk_type = 'Gir milk' THEN 75
            ELSE 0
        END), 0) AS todaysSalesInRupees,
        
    COALESCE((SELECT SUM(quantity) FROM inventory), 0) AS totalInventoryQuantity,

    -- Today's Purchase
    COALESCE(SUM(ds.quantity * 
        CASE 
            WHEN c.milk_type = 'Buffalo milk' THEN 68
            WHEN c.milk_type = 'Cow milk' THEN 55
            WHEN c.milk_type = 'Gir milk' THEN 75
            ELSE 0
        END), 0) + COALESCE((SELECT SUM(quantity) FROM inventory), 0) AS todaysPurchase,

    -- Monthly Purchase
    COALESCE(SUM(ds.quantity * 
        CASE 
            WHEN c.milk_type = 'Buffalo milk' THEN 68
            WHEN c.milk_type = 'Cow milk' THEN 55
            WHEN c.milk_type = 'Gir milk' THEN 75
            ELSE 0
        END), 0) + COALESCE((SELECT SUM(quantity) FROM inventory), 0) AS monthlyPurchase
FROM 
    daily_sales ds
JOIN 
    customers c ON ds.customer_id = c.customer_id
WHERE 
    DATE(ds.sale_date) >= DATE_FORMAT(CURDATE() ,'%Y-%m-01')  -- From the start of the current month
AND 
    DATE(ds.sale_date) <= CURDATE();  -- Up to today

    `;

    const todaysRequestsSql = `
        SELECT COUNT(id) AS todaysRequests
        FROM orders
        WHERE DATE(created_at) = CURDATE();
    `;

    const requestsFulfilledSql = `
        SELECT COUNT(bot_reply) AS requestsFulfilled
        FROM orders
        WHERE DATE(created_at) = CURDATE() AND bot_reply IS NOT NULL;
    `;

    Promise.all([
        new Promise((resolve, reject) => {
            connection.query(todaysSalesSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]?.todaysSalesInRupees || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(monthlySalesSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]?.monthlySalesInRupees || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(todaysPurchaseSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]?.todaysPurchase || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(monthlyPurchaseSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]?.monthlyPurchase || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(todaysRequestsSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]?.todaysRequests || 0);
                }
            });
        }),
        new Promise((resolve, reject) => {
            connection.query(requestsFulfilledSql, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]?.requestsFulfilled || 0);
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
