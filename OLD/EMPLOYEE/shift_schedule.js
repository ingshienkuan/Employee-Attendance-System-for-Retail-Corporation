
window.onload = function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    });
};

// Mock employee data - only departments that require shifts
const currentEmployee = {
    id: 1,
    name: "John Doe",
    department: "Sales & Customer Service", // Can be changed to test different departments
    role: "employee"
};

// Departments that require shifts
const shiftRequiredDepartments = [
    "Sales & Customer Service",
    "Inventory & Supply Chain Management", 
    "IT & E-Commerce"
];

// Check if current employee's department requires shifts
const requiresShifts = shiftRequiredDepartments.includes(currentEmployee.department);

// Mock shift data
let upcomingShifts = [
    {
        date: '2024-01-08',
        time: '8:00 AM - 4:00 PM',
        department: 'Sales & Customer Service'
    },
    {
        date: '2024-01-09',
        time: '8:00 AM - 4:00 PM',
        department: 'Sales & Customer Service'
    },
    {
        date: '2024-01-12',
        time: '12:00 PM - 8:00 PM',
        department: 'Sales & Customer Service'
    },
    {
        date: '2024-01-13',
        time: '12:00 PM - 8:00 PM',
        department: 'Sales & Customer Service'
    }
];

let shiftHistory = [
    {
        date: 'Aug 6, 2023',
        time: '12:00 PM - 8:00 PM',
        department: 'Sales & Customer Service',
        clockIn: '11:55 AM'
    },
    {
        date: 'Aug 5, 2023',
        time: '12:00 PM - 8:00 PM',
        department: 'Sales & Customer Service',
        clockIn: '11:50 AM'
    },
    {
        date: 'Aug 2, 2023',
        time: '8:00 AM - 4:00 PM',
        department: 'Sales & Customer Service',
        clockIn: '7:55 AM'
    },
    {
        date: 'Aug 1, 2023',
        time: '8:00 AM - 4:00 PM',
        department: 'Sales & Customer Service',
        clockIn: '8:05 AM'
    },
    {
        date: 'Jul 31, 2023',
        time: '8:00 AM - 4:00 PM',
        department: 'Sales & Customer Service',
        clockIn: '7:50 AM'
    }
];

// Calendar variables
let currentWeekStart = new Date();
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Start from Monday

// Pagination variables
let currentPage = 1;
let itemsPerPage = 5;
let filteredHistory = [...shiftHistory];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    checkShiftRequirement();
    generateCalendar();
    renderShiftHistory();
    updatePagination();
});

function checkShiftRequirement() {
    if (!requiresShifts) {
        // Show message that this department doesn't require shifts
        document.querySelector('.container').innerHTML = `
            <div class="section">
                <div class="no-shifts-message">
                    <h3>No Shift Schedule Required</h3>
                    <p>Your department (${currentEmployee.department}) does not require shift scheduling.</p>
                    <p>Only the following departments require shifts:</p>
                    <ul style="list-style: none; margin-top: 15px;">
                        ${shiftRequiredDepartments.map(dept => `<li>• ${dept}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        return;
    }
}

function generateCalendar() {
    if (!requiresShifts) return;

    const calendarGrid = document.getElementById('calendarGrid');
    const weekDisplay = document.getElementById('currentWeekDisplay');
    
    calendarGrid.innerHTML = '';
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDate = new Date(currentWeekStart);
    
    // Update week display
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    weekDisplay.textContent = `${formatDateShort(currentWeekStart)} - ${formatDateShort(endDate)}`;
    
    for (let i = 0; i < 7; i++) {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = dayNames[i];
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = currentDate.getDate();
        
        dayHeader.appendChild(dayName);
        dayHeader.appendChild(dayNumber);
        dayColumn.appendChild(dayHeader);
        
        // Check for shifts on this date
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayShifts = upcomingShifts.filter(shift => shift.date === dateStr);
        
        if (dayShifts.length > 0) {
            dayShifts.forEach(shift => {
                const shiftCard = document.createElement('div');
                shiftCard.className = 'shift-card';
                
                const shiftTime = document.createElement('div');
                shiftTime.className = 'shift-time';
                shiftTime.textContent = shift.time;
                
                const shiftDept = document.createElement('div');
                shiftDept.className = 'shift-department';
                shiftDept.textContent = shift.department;
                
                shiftCard.appendChild(shiftTime);
                shiftCard.appendChild(shiftDept);
                dayColumn.appendChild(shiftCard);
            });
        } else {
            const noShift = document.createElement('div');
            noShift.className = 'no-shift';
            noShift.textContent = 'No shifts';
            dayColumn.appendChild(noShift);
        }
        
        calendarGrid.appendChild(dayColumn);
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

function renderShiftHistory() {
    if (!requiresShifts) return;

    const tbody = document.getElementById('shiftHistoryTable');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredHistory.length);
    const pageData = filteredHistory.slice(startIndex, endIndex);
    
    pageData.forEach(shift => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${shift.date}</td>
            <td>${shift.time}</td>
            <td><span class="department-badge">${shift.department}</span></td>
            <td><span class="clock-in-time">${shift.clockIn}</span></td>
        `;
        tbody.appendChild(row);
    });
    
    if (pageData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" style="text-align: center; padding: 40px; color: #6c757d;">
                No shift history found for the selected month.
            </td>
        `;
        tbody.appendChild(row);
    }
}

function previousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    generateCalendar();
}

function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    generateCalendar();
}

function filterByMonth() {
    const selectedMonth = document.getElementById('monthFilter').value;
    
    // Filter history based on selected month
    filteredHistory = shiftHistory.filter(shift => {
        const shiftDate = new Date(shift.date + ', 2023');
        const shiftMonth = shiftDate.toISOString().substring(0, 7);
        return shiftMonth === selectedMonth;
    });
    
    currentPage = 1;
    renderShiftHistory();
    updatePagination();
}

function updatePagination() {
    if (!requiresShifts) return;

    const totalItems = filteredHistory.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('paginationInfo').textContent = 
        `Showing ${startItem} to ${endItem} of ${totalItems} shifts`;
    
    // Update pagination buttons
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
    
    // Update active page button
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const pageButtons = document.querySelectorAll('.pagination-btn:not(#prevBtn):not(#nextBtn)');
    pageButtons.forEach((btn, index) => {
        if (index + 1 === currentPage) {
            btn.classList.add('active');
        }
    });
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderShiftHistory();
        updatePagination();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderShiftHistory();
        updatePagination();
    }
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderShiftHistory();
        updatePagination();
    }
}

function formatDateShort(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize calendar with current week
generateCalendar();