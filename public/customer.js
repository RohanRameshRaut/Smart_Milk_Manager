document.addEventListener('DOMContentLoaded', (event) => {
    displayMessage("Welcome! Please type your order. Options: 0L, 0.5L, 1L, 2L, 3L, 4L etc.");
    fetchCustomerData();
});

function fetchCustomerData() {
    fetch('/customer/customerData')
        .then(response => response.json())
        .then(data => {
            document.getElementById('customer-name').textContent = data.customer_name;
            document.getElementById('customer-id').textContent = data.customer_id;
            document.getElementById('customer-email').textContent = data.email;
            document.getElementById('customer-mobile').textContent = data.customer_mobile_number;
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
    fetch('/order', {
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
