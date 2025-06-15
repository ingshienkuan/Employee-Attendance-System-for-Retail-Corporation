function showLogoutModal() 
{
    updateLogoutModal();
    document.getElementById('logoutModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideLogoutModal() 
{
    document.getElementById('logoutModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function updateLogoutModal() 
{
    document.getElementById('modalUserName').textContent = currentUser.name;
    document.getElementById('modalUserAvatar').textContent = currentUser.initials;
    document.getElementById('modalUserType').textContent = currentUser.position;
    document.getElementById('modalUserPosition').textContent = currentUser.positionTitle;
    
    const now = new Date();
    const lastLoginTime = now.toLocaleDateString('en-US', 
    { 
        month: 'short', 
        day: 'numeric' 
    }) + ', ' + now.toLocaleTimeString('en-US', 
    { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
    document.getElementById('lastLogin').textContent = `Last login: ${lastLoginTime}`;
}

function signOut() 
{
    window.location.href = logoutUrl;
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

window.onload = function() 
{
    showLogoutModal();
};