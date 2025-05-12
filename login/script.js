// Function to handle login and redirect based on user role
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('user-type').value;
    const errorMessage = document.getElementById('error-message');

    // Basic validation (for demo purposes)
    if (username === "" || password === "") {
        errorMessage.textContent = "Please fill in both fields.";
        return;
    }

    // Example login logic for demonstration (In a real app, you'd verify the credentials with the backend)
    if (username === "admin" && password === "admin123" && userType === "admin") {
        window.location.href = "admin-dashboard.html"; // Redirect to Admin Dashboard
    } else if (username === "manager" && password === "manager123" && userType === "manager") {
        window.location.href = "manager-dashboard.html"; // Redirect to Manager Dashboard
    } else if (username === "employee" && password === "employee123" && userType === "employee") {
        window.location.href = "employee-dashboard.html"; // Redirect to Employee Dashboard
    } else {
        errorMessage.textContent = "Invalid login credentials or user type.";
    }
}
