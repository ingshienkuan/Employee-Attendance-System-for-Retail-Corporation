// Simulated employee database
const employees = {
    "EMP001": { name: "John Smith", department: "IT" },
    "EMP002": { name: "Sarah Johnson", department: "HR" },
    "EMP003": { name: "Michael Brown", department: "Finance" },
    "EMP004": { name: "Emily Davis", department: "Marketing" },
    "EMP005": { name: "David Wilson", department: "Operations" }
};

// DOM Elements
const employeeIdInput = document.getElementById('employeeId');
const employeeNameInput = document.getElementById('employeeName');
const departmentInput = document.getElementById('department');
const locationInput = document.getElementById('location');
const locationInfo = document.getElementById('locationInfo');
const employeeDetails = document.getElementById('employeeDetails');
const checkInBtn = document.getElementById('checkInBtn');
const checkOutBtn = document.getElementById('checkOutBtn');
const messageDiv = document.getElementById('message');
const scanBtn = document.getElementById('scanBtn');

// Event listeners
employeeIdInput.addEventListener('input', handleEmployeeIdInput);
checkInBtn.addEventListener('click', () => handleAttendance('in'));
checkOutBtn.addEventListener('click', () => handleAttendance('out'));
scanBtn.addEventListener('click', simulateScan);

// Function to handle employee ID input
function handleEmployeeIdInput() {
    const employeeId = employeeIdInput.value.trim();
    
    if (employeeId && employees[employeeId]) {
        // Employee found, show details
        employeeNameInput.value = employees[employeeId].name;
        departmentInput.value = employees[employeeId].department;
        employeeDetails.classList.remove('hidden');
        getLocation();
        hideMessage();
    } else if (employeeId) {
        // Invalid employee ID
        employeeDetails.classList.add('hidden');
        showMessage('Employee ID not found. Please try again.', 'error');
    } else {
        // Empty input
        employeeDetails.classList.add('hidden');
        hideMessage();
    }
}

// Function to get location
function getLocation() {
    locationInfo.textContent = 'Detecting location...';
    locationInput.value = '';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Success callback
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                // Reverse geocoding to get address from coordinates
                fetchLocationAddress(latitude, longitude);
            },
            // Error callback
            (error) => {
                console.error('Geolocation error:', error);
                locationInput.value = 'Unable to detect location';
                locationInfo.textContent = 'Please enable location access in your browser.';
            }
        );
    } else {
        locationInput.value = 'Geolocation not supported';
        locationInfo.textContent = 'Your browser does not support geolocation.';
    }
}

// Function to fetch address from coordinates (simulated)
function fetchLocationAddress(latitude, longitude) {
    // In a real app, you would use a geocoding service API here
    // For demo purposes, we'll simulate a location
    
    setTimeout(() => {
        locationInput.value = `Office HQ, 123 Business Street`;
        locationInfo.textContent = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }, 1000);
}

// Function to handle attendance
function handleAttendance(type) {
    const employeeId = employeeIdInput.value.trim();
    const employeeName = employeeNameInput.value;
    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();
    
    if (type === 'in') {
        showMessage(`${employeeName} checked in successfully at ${currentTime} on ${currentDate}`, 'success');
    } else {
        showMessage(`${employeeName} checked out successfully at ${currentTime} on ${currentDate}`, 'success');
    }
    
    // In a real app, you would send this data to a server
    console.log({
        employeeId,
        name: employeeName,
        department: departmentInput.value,
        location: locationInput.value,
        action: type === 'in' ? 'Check In' : 'Check Out',
        timestamp: new Date().toISOString()
    });
}

// Function to show a message
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove('hidden');
}

// Function to hide the message
function hideMessage() {
    messageDiv.classList.add('hidden');
}

// Function to simulate QR code scanning
function simulateScan() {
    // Simulate a successful scan
    const randomEmployee = Object.keys(employees)[Math.floor(Math.random() * Object.keys(employees).length)];
    employeeIdInput.value = randomEmployee;
    handleEmployeeIdInput();
}

// Simulate location if user provides one manually
locationInput.addEventListener('change', function() {
    if (this.value.trim() !== '') {
        locationInfo.textContent = 'Location manually entered';
    }
});
