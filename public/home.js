// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the dashboard by inserting HTML and fetching data
    initializeDashboard();
});

// Function to insert the initial HTML structure into the dashboard container
function insertHTML() {
    const htmlContent = `
        <div class="cards">
            <div class="card">
                <div class="card-content">
                    <div class="card-name">Today's Sales</div>
                    <div class="number" id="todays-sales">Loading...</div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <div class="card-name">Monthly Sale</div>
                    <div class="number" id="monthly-sales">Loading...</div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <div class="card-name">Today's Purchase</div>
                    <div class="number" id="todays-purchase">Loading...</div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <div class="card-name">Monthly Purchase</div>
                    <div class="number" id="monthly-purchase">Loading...</div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <div class="card-name">Today's Requests</div>
                    <div class="number" id="todays-requests">Loading...</div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <div class="card-name">Requests Fulfilled</div>
                    <div class="number" id="requests-fulfilled">Loading...</div>
                </div>
            </div>
        </div>
    `;

    // Insert the HTML structure into the dashboard container
    document.getElementById('dashboard-container').innerHTML = htmlContent;
}

// Function to fetch data from the server and update the dashboard
function fetchData() {
    fetch('/home/dashboard-container')
        .then(response => response.json())
        .then(data => {
            // Update HTML elements with the fetched data
            document.getElementById('todays-sales').textContent = `Rs. ${data.todaysSales || 'N/A'}`;
            document.getElementById('monthly-sales').textContent = `Rs. ${data.monthlySales || 'N/A'}`;
            document.getElementById('todays-purchase').textContent = `Rs. ${data.todaysPurchase || 'N/A'}`;
            document.getElementById('monthly-purchase').textContent = `Rs. ${data.monthlyPurchase || 'N/A'}`;
            document.getElementById('todays-requests').textContent = data.todaysRequests || 'N/A';
            document.getElementById('requests-fulfilled').textContent = data.requestsFulfilled || 'N/A';
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Initialize the dashboard by inserting HTML and fetching data
function initializeDashboard() {
    insertHTML(); // Insert the HTML structure
    fetchData();  // Fetch and display the data
}
