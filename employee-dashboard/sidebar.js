// Function to get real-time location and fetch address
function getLocation() {
    locationInfo.textContent = 'Detecting location...';
    locationInput.value = ''; // Clear any previous data

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Success callback
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Fetch address using reverse geocoding
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

// Function to fetch address from coordinates using reverse geocoding
function fetchLocationAddress(latitude, longitude) {
    const apiKey = 'YOUR_API_KEY'; // Replace with your Geocoding API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const address = data.results[0].formatted;
                locationInput.value = address;
                locationInfo.textContent = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            } else {
                locationInput.value = 'Address not found';
                locationInfo.textContent = 'Unable to find an address for your location.';
            }
        })
        .catch(error => {
            console.error('Error fetching address:', error);
            locationInput.value = 'Error retrieving address';
            locationInfo.textContent = 'Please try again later.';
        });
}
