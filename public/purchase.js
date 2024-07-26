document.addEventListener('DOMContentLoaded', function () {
    setTodayDate(); // Set today's date in the date input field

    const fetchPurchaseData = () => {
        fetch('/purchase/purchaseData')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('purchase-table-body');
                tbody.innerHTML = '';
                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.id}</td>
                        <td>${item.date}</td>
                        <td>${item.product_name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price}</td>
                        <td>${item.total_price}</td>
                        <td><button class="delete-btn" data-id="${item.id}">Delete</button></td>
                    `;
                    tbody.appendChild(row);
                });
                attachDeleteEventListeners();
            })
            .catch(error => console.error('Error fetching purchase data:', error));
    };

    function setTodayDate() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        document.getElementById('date').value = formattedDate;
    }

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

    const attachDeleteEventListeners = () => {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                fetch(`/purchase/delete/${id}`, { method: 'DELETE' })
                    .then(() => fetchPurchaseData())
                    .catch(error => console.error('Error deleting purchase data:', error));
            });
        });
    };

    const addProductForm = document.getElementById('inventory-form');
    addProductForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(this);
        const data = {
            date: formData.get('date'),
            productName: formData.get('productName'),
            quantity: formData.get('quantity'),
            price: formData.get('price'),
            totalPrice: formData.get('totalPrice')
        };

        fetch('/purchase/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(() => {
                fetchPurchaseData();
                document.getElementById('addForm').style.display = 'none';
            })
            .catch(error => console.error('Error adding product:', error));
    });

    fetchPurchaseData(); // Initial fetch
});
