function updateDateTime() 
{
    const dateElement = document.getElementById('real-time-date');
    const now = new Date();
    const options = 
    { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
    };
    const formattedDate = now.toLocaleDateString('en-GB', options);
    dateElement.innerHTML = formattedDate;
}
      
updateDateTime();
      
document.addEventListener('DOMContentLoaded', function() 
{
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, index) => 
    {
        setTimeout(() => 
        {
            bar.style.transform = 'scaleY(1)';
            bar.style.transformOrigin = 'bottom';
        }, index * 100);
    });
});