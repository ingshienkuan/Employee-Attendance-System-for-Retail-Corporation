function initLogoutModal() 
{
    document.getElementById('modalUserName').textContent = userData.name;
    document.getElementById('modalUserAvatar').textContent = userData.initials;
    document.getElementById('modalUserType').textContent = userData.position;
    document.getElementById('modalUserPosition').textContent = userData.positionTitle;
    
    updateLastLoginTime();
    showLogoutModal();
}

function showLogoutModal() 
{
    document.getElementById('logoutModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideLogoutModal() 
{
    document.getElementById('logoutModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    window.history.back();
}

function updateLastLoginTime() 
{
    const now = new Date();
    const lastLoginTime = now.toLocaleDateString('en-US', 
    { 
        month: 'short', 
        day: 'numeric' 
    }) 
    + ', ' + now.toLocaleTimeString('en-US', 
    { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
    document.getElementById('lastLogin').textContent = `Last login: ${lastLoginTime}`;
}

document.addEventListener('click', function(event) 
{
    const modal = document.getElementById('logoutModal');
    if (event.target === modal) 
    {
        hideLogoutModal();
    }
});

document.addEventListener('keydown', function(event) 
{
    if (event.key === 'Escape') 
    {
        hideLogoutModal();
    }
});

document.addEventListener('DOMContentLoaded', initLogoutModal);