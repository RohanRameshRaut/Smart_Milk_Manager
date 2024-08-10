document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    const fetchDataButton = document.getElementById('fetch-data');
    const customerIdInput = document.getElementById('customer-id');
    const customerNameElement = document.getElementById('customer-name');
    const totalLitersElement = document.getElementById('total-liters');
    const totalAmountElement = document.getElementById('total-amount');
    const totalBillAmtElement = document.getElementById('total-bill-amt');
    const rateElement = document.getElementById('rate'); // Element to display the rate

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed

    // Populate month and year selects
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    for (let year = currentYear; year >= currentYear - 10; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // Set default values for month and year
    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;

    fetchDataButton.addEventListener('click', async () => {
        const month = monthSelect.value;
        const year = yearSelect.value;
        const customerId = customerIdInput.value;

        if (!month || !year || !customerId) {
            alert('Please select month, year, and enter customer ID.');
            return;
        }

        const response = await fetch(`/bill/billData?month=${month}&year=${year}&customer_id=${customerId}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        // Update customer name
        customerNameElement.textContent = data.customerName || 'Customer Name Not Found';

        // Determine the rate based on milk type
        let ratePerLiter;
        switch (data.milkType) {
            case 'Buffalo milk':
                ratePerLiter = 68;
                break;
            case 'Cow milk':
                ratePerLiter = 55;
                break;
            case 'Gir milk':
                ratePerLiter = 75;
                break;
            default:
                ratePerLiter = 0; // Default to 0 if milk type is unknown
        }

        // Display the rate on the page
        rateElement.textContent = `₹${ratePerLiter}`;

        // Reset the table rows for the given month
        const rows = document.querySelectorAll('table tbody tr');

        // Initialize total liters
        let totalLiters = 0;

        // Map sales data to table rows
        rows.forEach(row => {
            const dateCell1 = row.children[0];
            const qtyCell1 = row.children[1];
            const dateCell2 = row.children[2];
            const qtyCell2 = row.children[3];

            const date1 = parseInt(dateCell1.textContent);
            const date2 = parseInt(dateCell2.textContent);

            // Initialize quantities for both cells
            qtyCell1.textContent = '0';
            qtyCell2.textContent = '0';

            if (data.salesData) {
                // Check if the sales data matches the first date cell
                if (date1) {
                    const entry1 = data.salesData.find(e => {
                        const entryDate = new Date(e.sale_date);
                        return entryDate.getDate() === date1 && entryDate.getMonth() + 1 === parseInt(month);
                    });
                    if (entry1) {
                        qtyCell1.textContent = entry1.quantity;
                        totalLiters += entry1.quantity;
                    }
                }

                // Check if the sales data matches the second date cell
                if (date2) {
                    const entry2 = data.salesData.find(e => {
                        const entryDate = new Date(e.sale_date);
                        return entryDate.getDate() === date2 && entryDate.getMonth() + 1 === parseInt(month);
                    });
                    if (entry2) {
                        qtyCell2.textContent = entry2.quantity;
                        totalLiters += entry2.quantity;
                    }
                }
            }
        });

        // Calculate total amount based on total liters and rate
        totalLitersElement.textContent = totalLiters.toFixed(2);
        const totalAmount = totalLiters * ratePerLiter + 50; // Assuming delivery charge ₹50
        totalAmountElement.textContent = `₹${totalAmount.toFixed(2)}`;
        totalBillAmtElement.textContent = totalAmountElement.textContent;
    });
});


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

