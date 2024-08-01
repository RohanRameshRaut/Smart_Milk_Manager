const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');
const bcrypt = require('bcrypt');

const app = express();
const port = 4000; // Set the port
const server = http.createServer(app);
const io = socketIo(server);

// Set Socket.IO instance to be accessible in routers
app.set('socketIo', io);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Generate a secret key
const secretKey = crypto.randomBytes(64).toString('hex');

// MySQL connection
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

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true in production if using HTTPS
}));

// Import the routers
const inventoryRouter = require('./routers/inventory');
const orderRouter = require('./routers/order');
const customerRouter = require('./routers/customer');
const customerListRouter = require('./routers/customerList');
const staffRouter = require('./routers/staff');
const homeRouter = require('./routers/home');
const purchaseRouter = require('./routers/purchase');
const billRouter = require('./routers/bill');

// Regestration
app.get('/register-customer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});

// Route to handle customer registration
app.post('/register-customer', async (req, res) => {
    try {
        const { customerName, email, customerMobileNumber, password, confirmPassword, milkType, defaultQuantity, address, userId } = req.body;

        if (!customerName || !email || !customerMobileNumber || !password || !confirmPassword || !milkType || !defaultQuantity || !address || !userId) {
            return res.status(400).send('All fields are required.');
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO customers (customer_name, email, customer_mobile_number, password, milk_type, default_quantity, address, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

        connection.query(query, [customerName, email, customerMobileNumber, hashedPassword, milkType, defaultQuantity, address, userId], (err, result) => {
            if (err) {
                console.error('Error inserting data: ' + err.stack);
                return res.status(500).send('Error registering customer.');
            }
            // res.status(200).send('Customer registered successfully.');
            res.redirect('/login'); // Redirect to login page after successful sign-up

        });
    } catch (err) {
        console.error('Error: ' + err.stack);
        res.status(500).send('Server error.');
    }
});

// Login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
// const bcrypt = require('bcrypt'); // Ensure bcrypt is required at the top of your file

app.post('/login', (req, res) => {
    const { username, password, user_type } = req.body;
    
    // Log input values for debugging
    // console.log('Email:', username);
    // console.log('Password:', password);
    // console.log('User Type:', user_type);

    connection.query(
        'SELECT * FROM customers WHERE email = ? AND user_type = ?',
        [username, user_type],
        (error, results) => {
            if (error) {
                console.error('Error in login query:', error);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            // Check if results array has at least one row
            if (results.length > 0) {
                const user = results[0];

                // Compare the provided password with the hashed password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        res.status(500).json({ error: 'Internal server error' });
                        return;
                    }

                    if (isMatch) {
                        req.session.loggedIn = true;
                        req.session.username = username;

                        if (user_type === 'admin') {
                            res.redirect('/home'); // Redirect admin to home page
                        } else if (user_type === 'customer') {
                            res.redirect('/customer'); // Redirect customer to customer page
                        } else {
                            res.redirect('/login'); // Redirect back to login if userType is neither admin nor customer
                        }
                    } else {
                        console.log('Invalid credentials'); // Log if password does not match
                        res.redirect('/login'); // Redirect back to login page if credentials are invalid
                    }
                });
            } else {
                console.log('No user found'); // Log if no results were found
                res.redirect('/login'); // Redirect back to login page if no user found
            }
        }
    );
});


// Routes for authenticated users
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/customer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

app.get('/inventory', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inventory.html'));
});

app.get('/bills', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bills.html'));
});

app.get('/customerList', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customerList.html'));
});

app.get('/staff', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'staff.html'));
});

app.get('/purchase', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'purchase.html'));
});


// Use the routers
app.use('/inventory', inventoryRouter);
app.use('/order', orderRouter);
app.use('/customer', customerRouter);
app.use('/customerList', customerListRouter);
app.use('/staff', staffRouter);
app.use('/home', homeRouter);
app.use('/purchase', purchaseRouter);
app.use('/bill', billRouter);


// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


