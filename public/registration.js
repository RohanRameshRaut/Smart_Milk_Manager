// registration.js

document.getElementById('registrationForm').addEventListener('submit', function (e) {
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;

    if (password !== confirmPassword) {
        e.preventDefault();
        alert('Passwords do not match.');
    }
});
