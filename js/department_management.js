window.onload = function() 
{
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => 
    {
      document.getElementById('sidebar').innerHTML = data;
    });
};

window.onclick = function(event) 
{
  const modal = document.getElementById('departmentModal');
  if (event.target === modal) 
  {
    window.location.href = '?';
  }
}