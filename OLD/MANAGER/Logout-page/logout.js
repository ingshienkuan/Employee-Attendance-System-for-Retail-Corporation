// Logout Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize elements
    const logoutBtn = document.getElementById('logout-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const logoutModal = document.getElementById('logout-modal');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const loadingScreen = document.getElementById('loading-screen');
    const lastLoginTime = document.getElementById('last-login-time');
    
    // Set last login time (simulate from localStorage or session)
    setLastLoginTime();
    
    // Event Listeners
    logoutBtn.addEventListener('click', showLogoutModal);
    cancelBtn.addEventListener('click', goBack);
    modalCancel.addEventListener('click', hideLogoutModal);
    modalConfirm.addEventListener('click', performLogout);
    
    // Close modal when clicking outside
    logoutModal.addEventListener('click', function(event) {
        if (event.target === logoutModal) {
            hideLogoutModal();
        }
    });
    
    // Handle ESC key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && logoutModal.classList.contains('active')) {
            hideLogoutModal();
        }
    });
    
    // Functions
    function showLogoutModal() {
        logoutModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Add animation delay for better UX
        setTimeout(() => {
            modalConfirm.focus();
        }, 300);
    }
    
    function hideLogoutModal() {
        logoutModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
    
    function goBack() {
        // Go back to dashboard or previous page
        window.history.back();
        
        // If no history, go to dashboard
        setTimeout(() => {
            if (window.location.href === window.location.href) {
                window.location.href = '../Main-page/dashboard.html';
            }
        }, 100);
    }
    
    function performLogout() {
        // Hide modal and show loading screen
        hideLogoutModal();
        showLoadingScreen();
        
        // Simulate logout process (API call, cleanup, etc.)
        setTimeout(() => {
            // Clear any stored session data
            clearSessionData();
            
            // Redirect to login page
            redirectToLogin();
        }, 2000); // 2 second delay for better UX
    }
    
    function showLoadingScreen() {
        loadingScreen.classList.add('active');
    }
    
    function hideLoadingScreen() {
        loadingScreen.classList.remove('active');
    }
    
    function clearSessionData() {
        // Clear localStorage (if using localStorage in the actual app)
        // localStorage.clear();
        
        // Clear sessionStorage (if using sessionStorage in the actual app)
        // sessionStorage.clear();
        
        // Clear any authentication tokens
        // This would typically involve making an API call to invalidate server-side sessions
        console.log('Session data cleared');
        
        // You can add additional cleanup here:
        // - Clear cached user data
        // - Reset application state
        // - Cancel any ongoing requests
    }
    
    function redirectToLogin() {
        // In a real application, this would redirect to your login page
        // For demo purposes, we'll show an alert and redirect to a placeholder
        
        hideLoadingScreen();
        
        // Show success message
        showSuccessMessage();
        
        // Redirect after showing the success message
        setTimeout(() => {
            // Replace with your actual login page URL
            window.location.href = '../login/login.html';
            
            // If login page doesn't exist, redirect to index
            setTimeout(() => {
                if (window.location.href.includes('login.html')) {
                    window.location.href = '../index.html';
                }
            }, 1000);
        }, 2000);
    }
    
    function showSuccessMessage() {
        // Create and show a success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>Successfully Signed Out</h3>
                <p>You have been logged out securely. Redirecting to login page...</p>
            </div>
        `;
        
        // Add success message styles
        successMessage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(39, 174, 96, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1002;
            color: white;
            text-align: center;
        `;
        
        const successContent = successMessage.querySelector('.success-content');
        successContent.style.cssText = `
            animation: successSlideUp 0.6s ease-out;
        `;
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes successSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .success-content i {
                font-size: 64px;
                margin-bottom: 20px;
            }
            .success-content h3 {
                font-size: 28px;
                margin-bottom: 15px;
                font-weight: 700;
            }
            .success-content p {
                font-size: 16px;
                opacity: 0.9;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(successMessage);
    }
    
    function setLastLoginTime() {
        // In a real application, this would come from your authentication system
        // For demo purposes, we'll use the current time minus some hours
        const now = new Date();
        const lastLogin = new Date(now.getTime() - (2 * 60 * 60 * 1000)); // 2 hours ago
        
        const lastLoginString = lastLogin.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        lastLoginTime.textContent = lastLoginString;
    }
    
    // Additional security measures
    function handleBeforeUnload() {
        // Clear sensitive data when user tries to close/reload the page
        clearSessionData();
    }
    
    // Add event listener for page unload (optional security measure)
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Auto-logout after extended inactivity (optional security feature)
    let inactivityTimer;
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            showInactivityWarning();
        }, INACTIVITY_TIMEOUT);
    }
    
    function showInactivityWarning() {
        const warning = confirm('You have been inactive for a while. Do you want to stay logged in?');
        if (!warning) {
            performLogout();
        } else {
            resetInactivityTimer();
        }
    }
    
    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
    
    // Initialize inactivity timer
    resetInactivityTimer();
});