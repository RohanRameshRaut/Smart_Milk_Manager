// Set current month and year
document.addEventListener("DOMContentLoaded", () => {
    const monthSelect = document.getElementById("month-select");
    const yearSelect = document.getElementById("year-select");

    // Populate month dropdown
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    monthNames.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index + 1; // Months are 1-based
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    // Populate year dropdown
    const now = new Date();
    const currentYear = now.getFullYear();
    for (let i = currentYear - 10; i <= currentYear; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    // Set default values
    monthSelect.value = now.getMonth() + 1; // Current month
    yearSelect.value = currentYear; // Current year

    // Fetch data when the button is clicked
    document.getElementById("fetch-data").addEventListener("click", () => {
        const customerId = document.getElementById("customer-id").value;
        const selectedMonth = monthSelect.value;
        const selectedYear = yearSelect.value;
        if (customerId) {
            fetchData(customerId, selectedMonth, selectedYear);
        } else {
            alert("Please enter a customer ID.");
        }
    });
});
// Function to fetch data from the server
function fetchData(customerId, month, year) {
    fetch(`/bill/billData/${customerId}?month=${month}&year=${year}`, {
        method: 'GET',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateData(data);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

// Function to populate data in the table
function populateData(data) {
    const salesDataElement = document.getElementById("sales-data");
    salesDataElement.innerHTML = "";

    // Display customer name
    document.getElementById("customer-name").textContent = data.customerName;

    // Initialize rows for days 1-31
    const rows = Array.from({ length: 31 }, (_, index) => ({
        day: index + 1,
        date1: '',
        qty1: 0,
        date2: '',
        qty2: 0
    }));

    // Process days 1-15
    data.days1To15.forEach(entry => {
        const day = parseInt(entry.date);
        if (day <= 15) {  // Ensure it only covers the first 15 days
            rows[day - 1].date1 = `Day ${day}`;
            rows[day - 1].qty1 = parseFloat(entry.qty) || 0;
        }
    });

    // Process days 16-31
    data.days16ToEnd.forEach(entry => {
        const day = parseInt(entry.date);
        if (day >= 16) {  // Ensure it only covers from day 16 to the end
            rows[day - 1].date2 = `Day ${day}`;
            rows[day - 1].qty2 = parseFloat(entry.qty) || 0;
        }
    });

    // Create and append rows to the table
    rows.forEach((rowData, index) => {
        const row = document.createElement("tr");

        // Day 1-15 (Date 1) cell
        const date1Cell = document.createElement("td");
        date1Cell.textContent = rowData.day <= 15 ? rowData.date1 : '';
        row.appendChild(date1Cell);

        // Quantity 1 cell
        const qty1Cell = document.createElement("td");
        qty1Cell.textContent = rowData.day <= 15 ? rowData.qty1.toFixed(2) : '';
        row.appendChild(qty1Cell);

        // Day 16-31 (Date 2) cell
        const date2Cell = document.createElement("td");
        date2Cell.textContent = rowData.day >= 16 ? rowData.date2 : '';
        row.appendChild(date2Cell);

        // Populate the table
        // const tableBody = document.getElementById('sales-data');
        // tableBody.innerHTML = `
        //     <tr>
        //         <td>${rowData.day}</td>
        //         <td>${row.qty2}</td>
        //     </tr>
        // `;

        // Quantity 2 cell
        const qty2Cell = document.createElement("td");
        qty2Cell.textContent = rowData.day >= 16 ? rowData.qty2.toFixed(2) : '';
        row.appendChild(qty2Cell);

        salesDataElement.appendChild(row);
    });

    // Calculate total liters
    const totalLiters = rows.reduce((sum, row) => sum + row.qty1 + row.qty2, 0);
    document.getElementById("total-liters").textContent = totalLiters.toFixed(2);

    // Calculate total amount
    const rate = 66; // Set the rate per liter
    const serviceCharge = 20;
    const totalAmount = (totalLiters * rate) + serviceCharge;

    document.getElementById("total-amount").textContent = `₹${totalAmount.toFixed(2)}`;
    document.getElementById("total-bill-amt").textContent = `₹${totalAmount.toFixed(2)}`;
}

// *****************************************************************************************
const socket = io();

// Function to get notifications from Local Storage
function getStoredNotifications() {
    const storedData = localStorage.getItem('notifications');
    if (storedData) {
        return JSON.parse(storedData);
    }
    return [];
}

// Function to save notifications to Local Storage
function saveNotifications(notifications) {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Load stored notifications on page load
window.onload = function () {
    const notificationsDiv = document.getElementById('notifications');
    const storedNotifications = getStoredNotifications();

    // Filter out old notifications that are older than 24 hours
    const validNotifications = storedNotifications.filter(notification => {
        const timeElapsed = Date.now() - notification.timestamp;
        return timeElapsed < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    });

    // Display valid notifications
    validNotifications.forEach(notification => {
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('notification');
        orderDiv.innerHTML = `
                <p><strong>Customer Name:</strong> ${notification.customer_name}</p>
                <p><strong>Customer ID:</strong> ${notification.customer_id}</p>
                <p><strong>Customer Mobile:</strong> ${notification.customer_mobile_number}</p>
                <p><strong>Quantity:</strong> ${notification.quantity}</p>
            `;
        notificationsDiv.prepend(orderDiv);
    });

    // Save only valid notifications
    saveNotifications(validNotifications);
};

socket.on('newOrder', function (data) {
    const notificationsDiv = document.getElementById('notifications');
    const orderDiv = document.createElement('div');
    orderDiv.classList.add('notification');
    orderDiv.innerHTML = `
            <p><strong>Customer Name:</strong> ${data.customer_name}</p>
            <p><strong>Customer ID:</strong> ${data.customer_id}</p>
            <p><strong>Customer Mobile:</strong> ${data.customer_mobile_number}</p>
            <p><strong>Quantity:</strong> ${data.quantity}</p>
        `;

    // Add new order to DOM
    notificationsDiv.prepend(orderDiv);

    // Store new notification with a timestamp
    const storedNotifications = getStoredNotifications();
    const newNotification = {
        ...data,
        timestamp: Date.now()
    };
    storedNotifications.push(newNotification);

    // Save updated notifications list
    saveNotifications(storedNotifications);
});

function fetchCustomerData(customerId) {
    fetch(`/customer/customerData`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('customer-info').innerHTML = `
                    <p><strong>Name:</strong> ${data.customer_name}</p>
                    <p><strong>ID:</strong> ${data.customer_id}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Mobile:</strong> ${data.customer_mobile_number}</p>
                `;
        })
        .catch(error => console.error('Error fetching customer data:', error));
}

