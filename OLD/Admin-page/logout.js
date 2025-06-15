window.onload = function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    });
};

// Sample user data
const currentUser = {
    name: "John Doe",
    position: "Admin",
    initials: "JD",
    positionTitle: "Admin"
};

// Function to show logout modal
function showLogoutModal() {
    updateLogoutModal();
    document.getElementById('logoutModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Function to hide logout modal
function hideLogoutModal() {
    document.getElementById('logoutModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Function to update modal with user info
function updateLogoutModal() {
    document.getElementById('modalUserName').textContent = currentUser.name;
    document.getElementById('modalUserAvatar').textContent = currentUser.initials;
    document.getElementById('modalUserType').textContent = currentUser.position;
    document.getElementById('modalUserPosition').textContent = currentUser.positionTitle;
    
    // Update last login time
    const now = new Date();
    const lastLoginTime = now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    }) + ', ' + now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
    document.getElementById('lastLogin').textContent = `Last login: ${lastLoginTime}`;
}

// Function to handle sign out
function signOut() {
    alert('Signing out... (This would redirect to login page)');
    // Add your logout logic here:
    // 1. Clear user session/tokens
    // 2. Redirect to login page
    // 3. Clear any stored user data
    hideLogoutModal();
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('logoutModal');
    if (event.target === modal) {
        hideLogoutModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hideLogoutModal();
    }
});

// Show the logout modal automatically when the page loads
window.onload = function() {
    showLogoutModal();
};

