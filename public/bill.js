document.addEventListener('DOMContentLoaded', function () {
        const customerIdInput = document.getElementById('customer-id');
        const billDataContainer = document.getElementById('bill-data');
        const totalLiters = document.getElementById('total-liters');
        
        customerIdInput.addEventListener('change', function () {
            const customerId = customerIdInput.value.trim();
            if (customerId) {
                fetch(`/bill/billData/${customerId}`)
                    .then(response => response.json())
                    .then(data => {
                        billDataContainer.innerHTML = ''; // Clear previous data
                        let totalQty = 0;
    
                        data.sales.forEach(entry => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${entry.date1}</td>
                                <td>${entry.qty1}</td>
                                <td>${entry.date2}</td>
                                <td>${entry.qty2}</td>
                            `;
                            billDataContainer.appendChild(row);
                            totalQty += entry.qty1 + entry.qty2;
                        });
    
                        totalLiters.textContent = totalQty.toFixed(2);
                        // Update other totals and calculations if needed
                    })
                    .catch(error => console.error('Error fetching bill data:', error));
            } else {
                billDataContainer.innerHTML = ''; // Clear the table if no customer ID is entered
                totalLiters.textContent = '0';
            }
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
    window.onload = function() {
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

