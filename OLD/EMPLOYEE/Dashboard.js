
window.onload = function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    });
};
// Employee Dashboard JavaScript

// DOM Elements
const markAllReadBtn = document.querySelector('.mark-all-read');
const clockOutBtn = document.querySelector('.clock-out-btn');
const requestLeaveBtn = document.querySelector('.request-leave-btn');
const viewScheduleBtn = document.querySelector('.view-schedule-btn');
const notificationItems = document.querySelectorAll('.notification-item');

// State Management
let dashboardState = {
    clockedIn: true,
    clockInTime: '06:30 AM',
    notifications: [
        {
            id: 1,
            type: 'approved',
            message: 'Your leave request for June 20-22 has been approved',
            time: '2 hours ago',
            read: false
        },
        {
            id: 2,
            type: 'reminder',
            message: 'Reminder: Team meeting tomorrow at 10:00 AM',
            time: 'Yesterday',
            read: false
        },
        {
            id: 3,
            type: 'updated',
            message: 'Your shift schedule for next week has been updated',
            time: '2 days ago',
            read: false
        }
    ],
    attendanceStats: {
        thisWeek: { present: 4, total: 5 },
        thisMonth: { present: 18, total: 22 },
        averageHours: 7.8,
        punctualityRate: 95
    },
    leaveBalance: {
        annual: 12,
        sick: 5
    },
    upcomingShifts: [
        {
            date: 'Tomorrow',
            time: '8:30 AM - 5:30 PM',
            location: 'Main Floor'
        },
        {
            date: 'Wednesday, June 12',
            time: '9:00 AM - 6:00 PM',
            location: 'East Wing'
        },
        {
            date: 'Thursday, June 13',
            time: '8:30 AM - 5:30 PM',
            location: 'Main Floor'
        }
    ]
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    attachEventListeners();
    updateClock();
    setInterval(updateClock, 60000); // Update every minute
});

// Initialize Dashboard Data
function initializeDashboard() {
    updateNotificationCount();
    updateAttendanceDisplay();
    updateLeaveDisplay();
    updateShiftsDisplay();
}

// Event Listeners
function attachEventListeners() {
    // Mark all notifications as read
    markAllReadBtn.addEventListener('click', function() {
        markAllNotificationsRead();
    });

    // Clock out functionality
    clockOutBtn.addEventListener('click', function() {
        handleClockOut();
    });

    // Request leave functionality
    requestLeaveBtn.addEventListener('click', function() {
        handleLeaveRequest();
    });

    // View schedule functionality
    viewScheduleBtn.addEventListener('click', function() {
        handleViewSchedule();
    });

    // Individual notification click handlers
    notificationItems.forEach(item => {
        item.addEventListener('click', function() {
            markNotificationRead(this);
        });
    });
}


// Attendance Functions
function handleClockOut() {
    if (dashboardState.clockedIn) {
        const currentTime = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        dashboardState.clockedIn = false;
        
        // Update UI
        const statusValue = document.querySelector('.status-value');
        const clockTime = document.querySelector('.clock-time');
        
        statusValue.innerHTML = '<span class="status-dot" style="background-color: #e53e3e;"></span>Clocked Out';
        statusValue.className = 'status-value clocked-out';
        statusValue.style.color = '#e53e3e';
        
        clockTime.textContent = currentTime;
        
        clockOutBtn.textContent = 'Clock In';
        clockOutBtn.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        
        showToast(`Successfully clocked out at ${currentTime}`, 'success');
        
        // Update attendance stats
        updateAttendanceStats();
    } else {
        handleClockIn();
    }
}

function handleClockIn() {
    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    dashboardState.clockedIn = true;
    dashboardState.clockInTime = currentTime;
    
    // Update UI
    const statusValue = document.querySelector('.status-value');
    const clockTime = document.querySelector('.clock-time');
    
    statusValue.innerHTML = '<span class="status-dot"></span>Clocked In';
    statusValue.className = 'status-value clocked-in';
    statusValue.style.color = '#48bb78';
    
    clockTime.textContent = currentTime;
    
    clockOutBtn.textContent = 'Clock Out';
    clockOutBtn.style.background = 'linear-gradient(135deg, #e53e3e, #c53030)';
    
    showToast(`Successfully clocked in at ${currentTime}`, 'success');
}

function updateAttendanceDisplay() {
    // This would typically fetch real data from an API
    console.log('Attendance data updated');
}

function updateAttendanceStats() {
    // Simulate updating attendance statistics
    const stats = dashboardState.attendanceStats;
    
    // Update weekly attendance if clocked out
    if (!dashboardState.clockedIn) {
        stats.thisWeek.present = Math.min(stats.thisWeek.present + 0.5, stats.thisWeek.total);
    }
    
    // Update display
    const weekStat = document.querySelector('.stat-item:first-child .stat-value');
    if (weekStat) {
        weekStat.textContent = `${Math.floor(stats.thisWeek.present)}/${stats.thisWeek.total} days`;
    }
}

// Leave Functions
function handleLeaveRequest() {
    showModal('Leave Request', 'Leave request form would open here. This would typically redirect to a dedicated leave request page or open a modal form.');
}

function updateLeaveDisplay() {
    // This would typically fetch real leave balance data
    console.log('Leave balance updated');
}

// Schedule Functions
function handleViewSchedule() {
    showModal('Full Schedule', 'Full schedule view would open here. This would typically redirect to a detailed schedule page or calendar view.');
}

function updateShiftsDisplay() {
    // This would typically fetch updated shift data
    console.log('Shifts data updated');
}

// Utility Functions
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Update any clock displays if needed
    console.log(`Current time: ${timeString}`);
}

function showToast(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });
    
    // Set background color based on type
    const colors = {
        success: '#48bb78',
        error: '#e53e3e',
        warning: '#ed8936',
        info: '#4299e1'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function showModal(title, content) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    Object.assign(backdrop.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000'
    });
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'modal';
    Object.assign(modal.style, {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80%',
        overflow: 'auto'
    });
    
    modal.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: #1a202c;">${title}</h3>
        <p style="color: #718096; margin-bottom: 2rem;">${content}</p>
        <button class="modal-close" style="
            background: #4299e1;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            float: right;
        ">Close</button>
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    const closeModal = () => {
        document.body.removeChild(backdrop);
    };
    
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            closeModal();
        }
    });
}

// Data refresh functions
function refreshDashboardData() {
    // Simulate API calls to refresh data
    setTimeout(() => {
        updateAttendanceDisplay();
        updateLeaveDisplay();
        updateShiftsDisplay();
        showToast('Dashboard data refreshed', 'success');
    }, 1000);
}

// Auto-refresh dashboard data every 5 minutes
setInterval(refreshDashboardData, 300000);

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page became visible, refresh data
        refreshDashboardData();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + C for clock in/out
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        clockOutBtn.click();
    }
    
    // Alt + L for leave request
    if (e.altKey && e.key === 'l') {
        e.preventDefault();
        requestLeaveBtn.click();
    }
    
    // Alt + S for schedule
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        viewScheduleBtn.click();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            document.body.removeChild(backdrop);
        }
    }
});

// Export functions for potential external use
window.EmployeeDashboard = {
    refreshData: refreshDashboardData,
    clockOut: handleClockOut,
    requestLeave: handleLeaveRequest,
    viewSchedule: handleViewSchedule,
    markAllRead: markAllNotificationsRead
};