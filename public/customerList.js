document.addEventListener('DOMContentLoaded', () => {
    fetchCustomerData();
});

function fetchCustomerData() {
    fetch('/customerList/customerData')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Customer Data:', data);
            const customerList = document.getElementById('customerList-table-body');
            customerList.innerHTML = '';

            data.forEach(customer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${customer.customer_id}</td>
                    <td>${customer.customer_name}</td>
                    <td>${customer.customer_mobile_number}</td>
                    <td>${customer.milk_type}</td>
                    <td>${customer.default_quantity}</td>
                    <td>${customer.address}</td>
                    <td>
                        <button class="edit-btn" data-id="${customer.customer_id}">Edit</button>
                        <button class="delete-btn" data-id="${customer.customer_id}">Delete</button>
                    </td>
                `;
                customerList.appendChild(row);
            });

            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const customerId = e.target.getAttribute('data-id');
                    deleteCustomer(customerId);
                });
            });

            // Add event listeners for edit buttons
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const customerId = e.target.getAttribute('data-id');
                    editCustomer(customerId);
                });
            });
        })
        .catch(error => console.error('Error fetching customer data:', error));
}

function deleteCustomer(customerId) {
    fetch(`/customerList/customerData/${customerId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Customer deleted:', data);
        fetchCustomerData(); // Refresh the customer list
    })
    .catch(error => console.error('Error deleting customer:', error));
}

function editCustomer(customerId) {
    // Fetch the existing customer data to populate the edit form
    fetch(`/customerList/customerData/${customerId}`)
        .then(response => response.json())
        .then(customer => {
            // Populate the edit form with the existing customer data
            document.getElementById('editCustomerId').value = customer.customer_id;
            document.getElementById('editCustomerName').value = customer.customer_name;
            document.getElementById('editCustomerMobileNumber').value = customer.customer_mobile_number;
            document.getElementById('editMilkType').value = customer.milk_type;
            document.getElementById('editDefaultQuantity').value = customer.default_quantity;
            document.getElementById('editAddress').value = customer.address;

            // Show the edit form
            document.getElementById('editCustomerForm').style.display = 'block';
        })
        .catch(error => console.error('Error fetching customer data for editing:', error));
}

document.getElementById('editCustomerForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const customerId = document.getElementById('editCustomerId').value;
    const customerName = document.getElementById('editCustomerName').value;
    const customerMobileNumber = document.getElementById('editCustomerMobileNumber').value;
    const milkType = document.getElementById('editMilkType').value;
    const defaultQuantity = document.getElementById('editDefaultQuantity').value;
    const address = document.getElementById('editAddress').value;

    fetch(`/customerList/customerData/${customerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            customerName,
            customerMobileNumber,
            milkType,
            defaultQuantity,
            address,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Customer updated:', data);
        document.getElementById('editCustomerForm').style.display = 'none';
        fetchCustomerData(); // Refresh the customer list
    })
    .catch(error => console.error('Error updating customer:', error));
});
