// Date and Time Update Function
function updateDateTime() {
    const now = new Date();

    // Get the current date in the format: Day, Month Date, Year
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Get the current time in the format: hh:mm:ss AM/PM
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    // Update the content of the date and time elements
    const dateElement = document.getElementById('date');
    const timeElement = document.getElementById('time');
    
    if (dateElement) {
        dateElement.textContent = dateString;
    }
    
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Initialize the date and time when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date and time immediately
    updateDateTime();
    
    // Call the update function every second to keep the time updated
    setInterval(updateDateTime, 1000);
    
    // Add click event listener to sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.slide');
    
    // Optional: Close sidebar when clicking outside of it
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar && sidebar.contains(event.target);
        const isClickOnToggle = event.target.closest('.toggle') || event.target.closest('label');
        
        if (!isClickInsideSidebar && !isClickOnToggle && sidebarToggle && sidebarToggle.checked) {
            sidebarToggle.checked = false;
        }
    });
    
    // Add smooth scrolling for sidebar menu items
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all items
            menuItems.forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Optional: Close sidebar on mobile after clicking a menu item
            if (window.innerWidth <= 768 && sidebarToggle) {
                setTimeout(() => {
                    sidebarToggle.checked = false;
                }, 300);
            }
        });
    });
});

// Handle window resize
window.addEventListener('resize', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    // Close sidebar on larger screens
    if (window.innerWidth > 768 && sidebarToggle && sidebarToggle.checked) {
        sidebarToggle.checked = false;
    }
});

// Ensure the time updates even if the page becomes inactive and active again
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateDateTime();
    }
});