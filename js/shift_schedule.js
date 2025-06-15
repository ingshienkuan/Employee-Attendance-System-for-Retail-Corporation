let currentWeekStart, currentWeekEnd;
let currentPage = 1;
const itemsPerPage = 5;
let filteredHistory = [];

document.addEventListener('DOMContentLoaded', function() 
{
    currentWeekStart = new Date(window.currentWeekStart);
    currentWeekEnd = new Date(window.currentWeekEnd);
    filteredHistory = [...window.shiftHistory];

    document.getElementById('monthFilter').addEventListener('change', filterByMonth);
    document.getElementById('prevBtn').addEventListener('click', previousPage);
    document.getElementById('nextBtn').addEventListener('click', nextPage);
    
    document.querySelectorAll('.pagination-btn').forEach((btn, index) => 
    {
        if (index > 0 && index < 4) 
        { 
            btn.addEventListener('click', () => goToPage(parseInt(btn.textContent)));
        }
    });

    generateCalendar();
    renderShiftHistory();
    updatePagination();
});

// Add the missing formatDateForComparison function
function formatDateForComparison(date) 
{
    if (!(date instanceof Date) || isNaN(date.getTime())) 
    {
        date = new Date();
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateShort(date) 
{
    if (!(date instanceof Date)) 
    {
        date = new Date(date);
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateLong(dateStr) 
{
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateTimeStr) 
{
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function generateCalendar() 
{
    const calendarGrid = document.getElementById('calendarGrid');
    const weekDisplay = document.getElementById('currentWeekDisplay');
    
    if (!calendarGrid || !weekDisplay) return;
    
    calendarGrid.innerHTML = '';
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDate = new Date(currentWeekStart);
    const today = new Date();
    
    // Adjust display to show from today if current week starts before today
    if (currentDate < today) {
        currentDate.setDate(today.getDate());
        currentWeekStart = new Date(currentDate);
        currentWeekEnd = new Date(currentDate);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
    }
    
    weekDisplay.textContent = `${formatDateShort(currentWeekStart)} - ${formatDateShort(currentWeekEnd)}`;
    
    for (let i = 0; i < 7; i++) 
    {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = dayNames[currentDate.getDay()];
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = currentDate.getDate();
        
        // Highlight today's date
        if (currentDate.toDateString() === today.toDateString()) {
            dayNumber.classList.add('today');
        }
        
        dayHeader.appendChild(dayName);
        dayHeader.appendChild(dayNumber);
        dayColumn.appendChild(dayHeader);
        
        const dateStr = formatDateForComparison(currentDate);
        const dayShifts = window.upcomingShifts.filter(shift => 
        {
            return formatDateForComparison(new Date(shift.assignment_date)) === dateStr;
        });
        
        if (dayShifts.length > 0) 
        {
            dayShifts.forEach(shift => 
            {
                const shiftCard = document.createElement('div');
                shiftCard.className = 'shift-card';
                
                const shiftTime = document.createElement('div');
                shiftTime.className = 'shift-time';
                shiftTime.textContent = `${shift.start_time} - ${shift.end_time}`;
                
                const shiftDept = document.createElement('div');
                shiftDept.className = 'shift-department';
                shiftDept.textContent = shift.department_name;
                
                shiftCard.appendChild(shiftTime);
                shiftCard.appendChild(shiftDept);
                dayColumn.appendChild(shiftCard);
            });
        } 
        else 
        {
            const noShift = document.createElement('div');
            noShift.className = 'no-shift';
            noShift.textContent = (currentDate.getDay() === 0 || currentDate.getDay() === 6) ? 'Weekend' : 'No shifts';
            dayColumn.appendChild(noShift);
        }
        
        calendarGrid.appendChild(dayColumn);
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

function renderShiftHistory() 
{
    const tbody = document.getElementById('shiftHistoryTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredHistory.length);
    const pageData = filteredHistory.slice(startIndex, endIndex);
    
    pageData.forEach(shift => 
    {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateLong(shift.assignment_date)}</td>
            <td>${shift.start_time} - ${shift.end_time}</td>
            <td><span class="department-badge">${shift.department_name}</span></td>
            <td><span class="clock-in-time">${shift.clock_in_time ? formatTime(shift.clock_in_time) : 'N/A'}</span></td>
        `;
        tbody.appendChild(row);
    });
    
    if (pageData.length === 0) 
    {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" style="text-align: center; padding: 40px; color: #6c757d;">
                No shift history found for the selected month.
            </td>
        `;
        tbody.appendChild(row);
    }
}

function previousWeek() 
{
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    currentWeekEnd.setDate(currentWeekEnd.getDate() - 7);
    generateCalendar();
}

function nextWeek() 
{
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);
    generateCalendar();
}

function filterByMonth() 
{
    const selectedMonth = document.getElementById('monthFilter').value;
    
    filteredHistory = window.shiftHistory.filter(shift => 
    {
        const shiftDate = new Date(shift.assignment_date);
        const shiftMonth = shiftDate.toISOString().substring(0, 7);
        return shiftMonth === selectedMonth;
    });
    
    currentPage = 1;
    renderShiftHistory();
    updatePagination();
}

function updatePagination() 
{
    const totalItems = filteredHistory.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('paginationInfo').textContent = 
        `Showing ${startItem} to ${endItem} of ${totalItems} shifts`;
    
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
    
    const buttons = document.querySelectorAll('.pagination-btn');
    buttons.forEach((btn, index) => 
    {
        if (index > 0 && index < 4) 
        {
            const pageNum = parseInt(btn.textContent);
            btn.classList.toggle('active', pageNum === currentPage);
            btn.style.display = (pageNum <= totalPages) ? '' : 'none';
        }
    });
}

function previousPage() 
{
    if (currentPage > 1) 
    {
        currentPage--;
        renderShiftHistory();
        updatePagination();
    }
}

function nextPage() 
{
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    if (currentPage < totalPages) 
    {
        currentPage++;
        renderShiftHistory();
        updatePagination();
    }
}

function goToPage(page) 
{
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) 
    {
        currentPage = page;
        renderShiftHistory();
        updatePagination();
    }
}

function formatDateShort(date) 
{
    if (!(date instanceof Date)) 
    {
        date = new Date(date);
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateLong(dateStr) 
{
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateTimeStr) 
{
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

window.nextWeek = nextWeek;
window.previousWeek = previousWeek;