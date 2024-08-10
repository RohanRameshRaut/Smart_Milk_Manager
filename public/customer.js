document.addEventListener('DOMContentLoaded', (event) => {
    displayMessage("Welcome! Please type your order. Options: 0L, 0.5L, 1L, 2L, 3L, 4L etc.");
    fetchCustomerData();
});

function fetchCustomerData() {
    fetch('/customer/customerData')
        .then(response => response.json())
        .then(data => {
            document.getElementById('customer_name').textContent = data.customer_name;
            document.getElementById('customer-name').textContent = data.customer_name;
            document.getElementById('customer_id').textContent = data.customer_id;
            document.getElementById('customer-id').textContent = data.customer_id;
            document.getElementById('customer-email').textContent = data.email;
            document.getElementById('customer-mobile').textContent = data.customer_mobile_number;

            const monthSelect = document.getElementById('month-select');
            const yearSelect = document.getElementById('year-select');
            const fetchDataButton = document.getElementById('fetch-data');
            const customerIdInput = data.customer_id;
            const customerNameElement = data.customer_name;
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
                const customerId = customerIdInput;

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
        })
        .catch(error => {
            console.error('Error fetching customer data:', error);
        });
}

function displayMessage(message, isBot = false) {
    const messageContainer = document.createElement('div');
    messageContainer.textContent = message;
    if (isBot) {
        messageContainer.style.color = "blue"; // Style bot messages differently if needed
    } else {
        messageContainer.style.color = "black";
    }
    document.getElementById('messages').appendChild(messageContainer);
    messageContainer.scrollIntoView();
}

function sendMessage(order) {
    const userInput = order.trim();
    if (userInput === '') return;

    displayMessage("You: " + userInput);

    // Send message to server
    fetch('/order/orderData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
    })
        .then(response => response.json())
        .then(data => {
            displayMessage("Bot: " + data.reply, true);
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage("Bot: Sorry, something went wrong. Please try again.", true);
        });
}

// Add event listeners to each order button
document.getElementById('order0L').addEventListener('click', () => {
    sendMessage('Order 0L');
    // io.emit('newOrder', { orderId, quantity });
});

document.getElementById('order0.5L').addEventListener('click', () => {
    sendMessage('Order 0.5L');
});

document.getElementById('order1L').addEventListener('click', () => {
    sendMessage('Order 1L');
});

document.getElementById('order2L').addEventListener('click', () => {
    sendMessage('Order 2L');
});

document.getElementById('order3L').addEventListener('click', () => {
    sendMessage('Order 3L');
});

document.getElementById('order4L').addEventListener('click', () => {
    sendMessage('Order 4L');
});

