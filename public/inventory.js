// Fetch inventory data from the server
document.addEventListener('DOMContentLoaded', function () {
    setTodayDate(); // Set today's date in the date input field
    fetchInventoryData();

    // Add event listener to the Add Product button
    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('addForm').style.display = 'block';
    });

    // Add event listener to the inventory form
    document.getElementById('inventory-form').addEventListener('submit', function (e) {
        e.preventDefault();
        addProduct();
    });

    // Add event listener to the Cancel button
    document.getElementById('cancelAddProduct').addEventListener('click', function () {
        const addForm = document.getElementById('addForm');
        addForm.style.display = 'none'; // Hide the form
        document.getElementById('inventory-form').reset(); // Reset form values
    });
});

function setTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    document.getElementById('date').value = formattedDate;
}

function fetchInventoryData() {
    fetch('/inventory/inventoryData') // Updated path
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched Inventory Data:', data); // Log the fetched data

            const inventoryTableBody = document.getElementById('inventory-table-body');
            inventoryTableBody.innerHTML = ''; // Clear existing rows
            
            data.forEach(item => {
                console.log('Inventory Item:', item); // Log each item for debugging
                
                // Format date if necessary
                const formattedDate = item.date ? new Date(item.date).toISOString().split('T')[0] : 'N/A';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${formattedDate}</td>
                    <td>${item.product_name}</td>
                    <td>${item.price}</td>
                    <td>${item.quantity}</td>
                    <td><button onclick="deleteProduct(${item.id})">Delete</button></td>
                `;
                inventoryTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching inventory data:', error);
        });
}

// cardData
// Function to insert the initial HTML structure into the dashboard container
function insertHTML() {
    const htmlContent = `
        <div class="cards">
            <div class="card">
                <div class="card-content">
                    <div class="card-name">TODAY'S USE</div>
                    <div class="number" id="todays-use">Loading...</div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <div class="card-name">TODAY'S STOCK</div>
                    <div class="number" id="todays-stock">Loading...</div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <div class="card-name">OUT OF STOCK</div>
                    <div class="number" id="out-of-stock">Loading...</div>
                </div>
            </div>
            <div class="card">
                <div class="card-content">
                    <div class="card-name">RUNNING OUT</div>
                    <div class="number" id="running-out">Loading...</div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('dashboard-container').innerHTML = htmlContent;
}

// Function to fetch data from the server and update the dashboard
function fetchData() {
    fetch('/inventory/dashboard-container')
        .then(response => response.json())
        .then(data => {
            // Update HTML elements with the fetched data
            document.getElementById('todays-use').textContent = data.todaysUse || 'N/A';
            document.getElementById('todays-stock').textContent = data.todaysStock || 'N/A';
            document.getElementById('out-of-stock').textContent = data.outOfStock || 'N/A';
            document.getElementById('running-out').textContent = data.runningOut || 'N/A';
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

// Call initializeDashboard to set up the dashboard when the page loads
window.onload = initializeDashboard;



function addProduct() {
    const formData = new FormData(document.getElementById('inventory-form'));

    fetch('/inventory/addProduct', { // Updated path
        method: 'POST',
        body: JSON.stringify({
            date: formData.get('date'),
            product_name: formData.get('product_name'),
            price: formData.get('price'),
            // in_stock: formData.get('in_stock'),
            quantity: formData.get('quantity')
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error adding product:', data.error);
            } else {
                console.log('Product added successfully');
                document.getElementById('addForm').style.display = 'none'; // Hide the form
                fetchInventoryData(); // Refresh inventory data
            }
        })
        .catch(error => {
            console.error('Error adding product:', error);
        });
}

function deleteProduct(productId) {
    fetch(`/inventory/deleteProduct/${productId}`, { // Updated path
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                fetchInventoryData(); // Refresh inventory data
            } else {
                console.error('Error deleting product:', data.error);
            }
        })
        .catch(error => {
            console.error('Error deleting product:', error);
        });
}
