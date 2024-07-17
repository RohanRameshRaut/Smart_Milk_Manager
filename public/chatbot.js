document.addEventListener('DOMContentLoaded', (event) => {
    displayMessage("Welcome! Please type your order. Options: 0.5L, 1L, 2L, 3L, 4L etc.");
});

function displayMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.textContent = message;
    document.getElementById('messages').appendChild(messageContainer);
}

function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    displayMessage("You: " + userInput);
    document.getElementById('user-input').value = '';

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
        displayMessage("Bot: " + data.reply);
    });
}
