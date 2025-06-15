
window.onload = function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    });
};
// Employee Profile Management
class EmployeeProfile {
    constructor() {
        this.employeeData = {
            name: 'John Smith',
            position: 'Software Developer',
            employeeId: '-',
            department: '-',
            email: 'john.smith@company.com',
            phone: '+1 (555) 123-4567',
            hireDate: 'January 15, 2022',
            manager: 'Sarah Johnson',
            profileImage: '-'
        };
        
        this.init();
    }

    init() {
        this.loadProfileData();
        this.addInteractivity();
    }

    loadProfileData() {
        // Load employee data (from API in real application)
        console.log('Employee profile loaded:', this.employeeData);
    }

    addInteractivity() {
        // Add hover effect to profile image
        const profileImage = document.querySelector('.profile-image');
        if (profileImage) {
            profileImage.addEventListener('mouseenter', () => {
                profileImage.style.transform = 'scale(1.05)';
                profileImage.style.transition = 'transform 0.3s ease';
            });
            
            profileImage.addEventListener('mouseleave', () => {
                profileImage.style.transform = 'scale(1)';
            });
        }

        // Add click effect to info items
        const infoItems = document.querySelectorAll('.info-item');
        infoItems.forEach(item => {
            item.addEventListener('click', () => {
                item.style.backgroundColor = '#f8f9fa';
                setTimeout(() => {
                    item.style.backgroundColor = '';
                }, 300);
            });
        });
    }

    // Method to update profile data
    updateProfile(newData) {
        Object.assign(this.employeeData, newData);
        this.renderProfile();
    }

    renderProfile() {
        // Update DOM elements with new data
        const nameElement = document.querySelector('.employee-name');
        const positionElement = document.querySelector('.employee-position');
        const imageElement = document.querySelector('.profile-image');

        if (nameElement) nameElement.textContent = this.employeeData.name;
        if (positionElement) positionElement.textContent = this.employeeData.position;
        if (imageElement) imageElement.src = this.employeeData.profileImage;
    }

    // Get current profile data
    getProfileData() {
        return this.employeeData;
    }
}

// Initialize profile when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.employeeProfile = new EmployeeProfile();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmployeeProfile;
}