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
    if (otp === '123456') {  // In a real app, replace this with actual OTP validation logic
        // OTP is correct
        successMessage.textContent = 'OTP validated successfully! You can now reset your password.';
        
        // Redirect to the reset password page after OTP validation
        setTimeout(function() {
            window.location.href = 'reset-password.html';  // Redirects to reset password page
        }, 2000); // Delay the redirection by 2 seconds for a smooth experience
    } else {
        // OTP is incorrect
        errorMessage.textContent = 'Invalid OTP. Please try again.';
    }
}
