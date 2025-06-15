document.addEventListener('DOMContentLoaded', () => 
{
    const employeeIdInput = document.getElementById('employeeId');
    const locationInput = document.getElementById('location');
    const locationInfo = document.getElementById('locationInfo');
    const form = document.querySelector('form');
    const messageDiv = document.getElementById('message');

    if (document.getElementById('employeeDetails')) 
    {
        tryGetLocation();
    }


    // Update location info when user manually changes location
    locationInput?.addEventListener('input', () => 
    {
        if (locationInput.value.trim() !== '') 
        {
            locationInfo.textContent = 'Location manually entered';
        } 
        else 
        {
            locationInfo.textContent = 'Please enter your location manually.';
        }
  });

  function showMessage(text, type) 
  {
    if (!messageDiv) return;

    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove('hidden');
  }

  function tryGetLocation() 
  {
    if (!navigator.geolocation) 
    {
        locationInfo.textContent = 'Your browser does not support geolocation.';
        locationInput.value = '';
        return;
    }

    locationInfo.textContent = 'Detecting location...';

    navigator.geolocation.getCurrentPosition(
        (position) => 
        {
            const { latitude, longitude } = position.coords;
            // For demo: Just fill location input with a dummy address and show coords
            locationInput.value = 'Office HQ, 123 Business Street';
            locationInfo.textContent = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        },
        (error) => 
        {
            locationInfo.textContent = 'Please enter your location manually.';
            locationInput.value = '';
            // Not blocking submit on location error
        }
    );
  }
});
