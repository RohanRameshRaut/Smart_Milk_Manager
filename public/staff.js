document.addEventListener('DOMContentLoaded', () => {
    fetchStaffData();

    // Add event listener to the Add Staff button
    document.getElementById('addStaffBtn').addEventListener('click', () => {
        document.getElementById('addstaffForm').style.display = 'block';
    });

       // Event listener for Cancel button in Add Staff form
       document.getElementById('cancelAddStaff').addEventListener('click', function() {
        const addStaffForm = document.getElementById('addstaffForm');
        addStaffForm.style.display = 'none'; // Hide the form
        document.getElementById('addStaffForm').reset(); // Reset form values
    });

       // Event listener for Cancel button in Add Staff form
       document.getElementById('cancelUpdateStaff').addEventListener('click', function() {
        const addStaffForm = document.getElementById('editstaffForm');
        addStaffForm.style.display = 'none'; // Hide the form
        document.getElementById('editstaffForm').reset(); // Reset form values
    });

    // Add event listener to the Add Staff form submission
    document.getElementById('addForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const staffName = document.getElementById('addstaffName').value;
        const staffAge = document.getElementById('addstaffAge').value;
        const mobile_number = document.getElementById('addstaffMobileNumber').value;
        const address = document.getElementById('addstaffAddress').value;
        const designation = document.getElementById('addDesignation').value;
        const salary = document.getElementById('addSalary').value;
        const joiningDate = document.getElementById('addJoiningDate').value;

        fetch('/staff/staffData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: staffName,
                age: staffAge,
                mobile_number: mobile_number,
                address: address,
                designation: designation,
                salary: salary,
                joining_date: joiningDate,
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('staff added:', data);
            document.getElementById('addstaffForm').style.display = 'none';
            fetchStaffData(); // Refresh the staff list
        })
        .catch(error => console.error('Error adding staff:', error));
    });

    // Add event listener to the Edit Staff form submission
    document.getElementById('editForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const staffId = document.getElementById('editstaffId').value;
        const staffName = document.getElementById('editstaffName').value;
        const staffAge = document.getElementById('editstaffAge').value;
        const mobile_number = document.getElementById('editstaffMobileNumber').value;
        const address = document.getElementById('editstaffAddress').value;
        const designation = document.getElementById('editstaffDesignation').value;
        const salary = document.getElementById('editstaffSalary').value;
        const joiningDate = document.getElementById('editstaffJoiningDate').value;

        fetch(`/staff/staffData/${staffId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: staffId,
                name: staffName,
                age: staffAge,
                mobile_number: mobile_number,
                address: address,
                designation: designation,
                salary: salary,
                joining_date: joiningDate,
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('staff updated:', data);
            document.getElementById('editstaffForm').style.display = 'none';
            fetchStaffData(); // Refresh the staff list
        })
        .catch(error => console.error('Error updating staff:', error));
    });
});

function fetchStaffData() {
    fetch('/staff/staffData')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('staff Data:', data);
            const staffTableBody = document.getElementById('staffList-table-body');
            staffTableBody.innerHTML = '';

            data.forEach(staff => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${staff.id}</td>
                    <td>${staff.name}</td>
                    <td>${staff.age}</td>
                    <td>${staff.mobile_number}</td>
                    <td>${staff.address}</td>
                    <td>${staff.designation}</td>
                    <td>${staff.salary}</td>
                    <td>${staff.joining_date}</td>
                    <td>
                        <button class="edit-btn" data-id="${staff.id}">Edit</button>
                        <button class="delete-btn" data-id="${staff.id}">Delete</button>
                    </td>
                `;
                staffTableBody.appendChild(row);
            });

            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const staffId = e.target.getAttribute('data-id');
                    deleteStaff(staffId);
                });
            });

            // Add event listeners for edit buttons
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const staffId = e.target.getAttribute('data-id');
                    editStaff(staffId);
                });
            });
        })
        .catch(error => console.error('Error fetching staff data:', error));
}

function deleteStaff(staffId) {
    fetch(`/staff/staffData/${staffId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('staff deleted:', data);
        fetchStaffData(); // Refresh the staff list
    })
    .catch(error => console.error('Error deleting staff:', error));
}

function editStaff(staffId) {
    // Fetch the existing staff data to populate the edit form
    fetch(`/staff/staffData/${staffId}`)
        .then(response => response.json())
        .then(staff => {
            // Populate the edit form with the existing staff data
            document.getElementById('editstaffId').value = staff.id;
            document.getElementById('editstaffName').value = staff.name;
            document.getElementById('editstaffAge').value = staff.age;
            document.getElementById('editstaffMobileNumber').value = staff.mobile_number;
            document.getElementById('editstaffAddress').value = staff.address;
            document.getElementById('editstaffDesignation').value = staff.designation;
            document.getElementById('editstaffSalary').value = staff.salary;
            document.getElementById('editstaffJoiningDate').value = staff.joining_date;

            // Show the edit form
            document.getElementById('editstaffForm').style.display = 'block';
        })
        .catch(error => console.error('Error fetching staff data for editing:', error));
}
