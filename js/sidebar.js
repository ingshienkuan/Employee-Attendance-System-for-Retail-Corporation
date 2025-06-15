function updateDateTime() 
{
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', 
    {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const timeString = now.toLocaleTimeString('en-US', 
    {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    
    document.getElementById('date').textContent = dateString;
    document.getElementById('time').textContent = timeString;
}

setInterval(updateDateTime, 1000);
updateDateTime();