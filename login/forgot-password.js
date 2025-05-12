// Function to handle OTP validation
function resetPassword() {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Clear any previous messages
    errorMessage.textContent = '';
    successMessage.textContent = '';

    // Basic validation for empty fields
    if (email === '' || otp === '') {
        errorMessage.textContent = 'Please fill in both fields.';
        return;
    }

    // Simulate OTP verification (in a real app, you would validate this on the server)
    if (otp === '123456') {
        // OTP is correct
        successMessage.textContent = 'OTP validated successfully! You can now reset your password.';
    } else {
        // OTP is incorrect
        errorMessage.textContent = 'Invalid OTP. Please try again.';
    }
}

// Optional: Validate email format
function validateEmail() {
    const email = document.getElementById('email').value;
    const errorMessage = document.getElementById('error-message');

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (email && !email.match(emailPattern)) {
        errorMessage.textContent = 'Please enter a valid email address.';
    } else {
        errorMessage.textContent = ''; // Clear error if valid email
    }
}

// Optional: Event listener for email validation
document.getElementById('email').addEventListener('input', validateEmail);
