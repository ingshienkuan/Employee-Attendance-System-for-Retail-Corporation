document.addEventListener("DOMContentLoaded", () => 
{
    setupEventListeners();
});

function setupEventListeners() 
{
    const monthFilter = document.getElementById('month-filter');
    if (monthFilter) 
    {
        monthFilter.addEventListener('change', (e) => 
        {
            window.location.href = `../employee/employee_history.php?month=${e.target.value}`;
        });
    }

    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) 
    {
        exportBtn.addEventListener('click', exportReport);
    }

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) 
    {
        prevBtn.addEventListener('click', () => 
        {
            const urlParams = new URLSearchParams(window.location.search);
            const currentPage = parseInt(urlParams.get('page')) || 1;
            const month = urlParams.get('month') || '';
            
            if (currentPage > 1) 
            {
                window.location.href = `../employee/employee_history.php?month=${month}&page=${currentPage - 1}`;
            }
        });
    }
    
    if (nextBtn) 
    {
        nextBtn.addEventListener('click', () => 
        {
            const urlParams = new URLSearchParams(window.location.search);
            const currentPage = parseInt(urlParams.get('page')) || 1;
            const month = urlParams.get('month') || '';
            const totalCount = parseInt(document.getElementById('total-count').textContent) || 0;
            const itemsPerPage = 7;
            const totalPages = Math.ceil(totalCount / itemsPerPage);
            
            if (currentPage < totalPages) 
            {
                window.location.href = `../employee/employee_history.php?month=${month}&page=${currentPage + 1}`;
            }
        });
    }

    document.querySelectorAll('.pagination-btn[data-page]').forEach(btn => 
    {
        btn.addEventListener('click', () => 
        {
            const page = parseInt(btn.getAttribute('data-page'));
            const urlParams = new URLSearchParams(window.location.search);
            const month = urlParams.get('month') || '';
            window.location.href = `../employee/employee_history.php?month=${month}&page=${page}`;
        });
    });
}

function exportReport() 
{
    const monthFilter = document.getElementById('month-filter');
    const monthName = monthFilter ? monthFilter.selectedOptions[0].text : 'attendance-data';
    
    const rows = document.querySelectorAll('#attendance-tbody tr');
    
    let csvContent = "Date,Clock In,Clock Out,Total Hours,Status\n";
    
    rows.forEach(row => 
    {
        const cells = row.querySelectorAll('td');
        const date = cells[0].textContent;
        const clockIn = cells[1].textContent;
        const clockOut = cells[2].textContent;
        const totalHours = cells[3].textContent;
        const status = cells[4].querySelector('.status-badge').textContent;
        
        csvContent += `"${date}","${clockIn}","${clockOut}","${totalHours}","${status}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-report-${monthName.replace(/\s+/g, '-').toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
