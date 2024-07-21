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
     document.getElementById('cancelAddProduct').addEventListener('click', function() {
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
            const inventoryTableBody = document.getElementById('inventory-table-body');
            inventoryTableBody.innerHTML = ''; // Clear existing rows
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.date}</td>
                    <td>${item.product_name}</td>
                    <td>${item.stock_status}</td>
                    <td>${item.in_stock}</td>
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

function fetchCardData() {
    fetch('/inventory/cardData') // Your backend endpoint to get card data
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Assuming `data` is an object with properties `todayUse`, `todayStock`, `outOfStock`, and `runningOut`
            document.getElementById('todays-use').textContent = `${data.todayUse}ltr`;
            document.getElementById('todays-stock').textContent = `${data.todayStock}ltr`;
            document.getElementById('out-of-stock').textContent = `${data.outOfStock} ITEMS`;
            document.getElementById('running-out').textContent = `${data.runningOut} ITEMS`;
        })
        .catch(error => {
            console.error('Error fetching card data:', error);
        });
}

function addProduct() {
    const formData = new FormData(document.getElementById('inventory-form'));

    fetch('/inventory/addProduct', { // Updated path
        method: 'POST',
        body: JSON.stringify({
            date: formData.get('date'),
            productName: formData.get('product_name'),
            stockStatus: formData.get('stock_status'),
            inStock: formData.get('in_stock'),
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
