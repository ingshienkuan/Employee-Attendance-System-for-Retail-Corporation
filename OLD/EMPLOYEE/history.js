// Load sidebar on page load
window.onload = function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    })
    .catch(error => {
      console.log('Sidebar not found, continuing without sidebar');
    });
};

// Sample attendance data
const attendanceData = [
  {
    date: "June 10, 2024",
    clockIn: "08:30 AM",
    clockOut: "--:-- --",
    breakIn: "12:00 PM",
    breakOut: "01:00 PM",
    totalHours: "In progress",
    status: "Present",
    isInProgress: true
  },
  {
    date: "June 9, 2024",
    clockIn: "--:-- --",
    clockOut: "--:-- --",
    breakIn: "--:-- --",
    breakOut: "--:-- --",
    totalHours: "0.0",
    status: "Weekend"
  },
  {
    date: "June 8, 2024",
    clockIn: "--:-- --",
    clockOut: "--:-- --",
    breakIn: "--:-- --",
    breakOut: "--:-- --",
    totalHours: "0.0",
    status: "Weekend"
  },
  {
    date: "June 7, 2024",
    clockIn: "08:32 AM",
    clockOut: "05:45 PM",
    breakIn: "12:15 PM",
    breakOut: "01:15 PM",
    totalHours: "9.2",
    status: "Present"
  },
  {
    date: "June 6, 2024",
    clockIn: "08:45 AM",
    clockOut: "05:30 PM",
    breakIn: "12:00 PM",
    breakOut: "01:00 PM",
    totalHours: "8.75",
    status: "Late"
  },
  {
    date: "June 5, 2024",
    clockIn: "08:28 AM",
    clockOut: "05:35 PM",
    breakIn: "12:30 PM",
    breakOut: "01:30 PM",
    totalHours: "9.1",
    status: "Present"
  },
  {
    date: "June 4, 2024",
    clockIn: "--:-- --",
    clockOut: "--:-- --",
    breakIn: "--:-- --",
    breakOut: "--:-- --",
    totalHours: "0.0",
    status: "Sick Leave"
  },
  {
    date: "June 3, 2024",
    clockIn: "08:15 AM",
    clockOut: "05:20 PM",
    breakIn: "12:00 PM",
    breakOut: "01:00 PM",
    totalHours: "9.0",
    status: "Present"
  },
  {
    date: "June 2, 2024",
    clockIn: "--:-- --",
    clockOut: "--:-- --",
    breakIn: "--:-- --",
    breakOut: "--:-- --",
    totalHours: "0.0",
    status: "Weekend"
  },
  {
    date: "June 1, 2024",
    clockIn: "--:-- --",
    clockOut: "--:-- --",
    breakIn: "--:-- --",
    breakOut: "--:-- --",
    totalHours: "0.0",
    status: "Weekend"
  },
  // Additional sample data for pagination testing
  {
    date: "May 31, 2024",
    clockIn: "08:25 AM",
    clockOut: "05:40 PM",
    breakIn: "12:00 PM",
    breakOut: "01:00 PM",
    totalHours: "9.25",
    status: "Present"
  },
  {
    date: "May 30, 2024",
    clockIn: "08:50 AM",
    clockOut: "05:15 PM",
    breakIn: "12:30 PM",
    breakOut: "01:30 PM",
    totalHours: "8.4",
    status: "Late"
  }
];

// Pagination settings
let currentPage = 1;
const itemsPerPage = 7;
let currentData = [...attendanceData];

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  renderAttendanceTable(currentData, currentPage);
  setupEventListeners();
});

// Render attendance table
function renderAttendanceTable(data, page = 1) {
  const tbody = document.getElementById("attendance-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = data.slice(startIndex, endIndex);

  pageData.forEach((record) => {
    const row = document.createElement("tr");
    
    // Format hours display
    const hoursDisplay = formatHours(record.totalHours, record.isInProgress);
    
    row.innerHTML = `
      <td class="date-cell">${record.date}</td>
      <td class="time-cell">${record.clockIn}</td>
      <td class="time-cell">${record.clockOut}</td>
      <td class="time-cell">${record.breakIn}</td>
      <td class="time-cell">${record.breakOut}</td>
      <td class="hours-cell ${hoursDisplay.class}">${hoursDisplay.text}</td>
      <td>
        <span class="status-badge ${getStatusClass(record.status)}">
          ${record.status}
        </span>
      </td>
    `;

    tbody.appendChild(row);
  });

  updatePaginationInfo(data.length, page);
}

// Get status class for styling
function getStatusClass(status) {
  const statusMap = {
    'present': 'status-present',
    'weekend': 'status-weekend',
    'late': 'status-late',
    'sick leave': 'status-sick-leave',
    'in progress': 'status-in-progress'
  };
  
  return statusMap[status.toLowerCase()] || 'status-present';
}

// Format hours display
function formatHours(hours, isInProgress = false) {
  if (isInProgress) {
    return { text: 'In progress', class: 'hours-progress' };
  } else if (hours === '0.0') {
    return { text: '0.0', class: 'hours-zero' };
  } else {
    return { text: hours, class: '' };
  }
}

// Update pagination info and controls
function updatePaginationInfo(totalItems, currentPage) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  const showingStartEl = document.getElementById('showing-start');
  const showingEndEl = document.getElementById('showing-end');
  const totalCountEl = document.getElementById('total-count');
  
  if (showingStartEl) showingStartEl.textContent = startItem;
  if (showingEndEl) showingEndEl.textContent = endItem;
  if (totalCountEl) totalCountEl.textContent = totalItems;

  // Update pagination buttons
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  updatePaginationButtons(currentPage, totalPages);
}

// Update pagination buttons
function updatePaginationButtons(current, total) {
  const buttons = document.querySelectorAll('.pagination-btn[data-page]');
  buttons.forEach(btn => {
    const page = parseInt(btn.getAttribute('data-page'));
    btn.classList.toggle('active', page === current);
  });

  // Update prev/next buttons
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  if (prevBtn) prevBtn.disabled = current === 1;
  if (nextBtn) nextBtn.disabled = current === total || total === 0;
}

// Handle pagination clicks
function handlePaginationClick(page) {
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderAttendanceTable(currentData, currentPage);
}

// Export report function
function exportReport() {
  const monthFilter = document.getElementById('month-filter');
  const monthName = monthFilter ? monthFilter.selectedOptions[0].text : 'attendance-data';
  
  // Create CSV content
  let csvContent = "Date,Clock In,Clock Out,Break In,Break Out,Total Hours,Status\n";
  
  currentData.forEach(record => {
    const row = [
      record.date,
      record.clockIn,
      record.clockOut,
      record.breakIn,
      record.breakOut,
      record.totalHours,
      record.status
    ].map(field => `"${field}"`).join(',');
    
    csvContent += row + "\n";
  });

  // Create and download file
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

// Filter data by month
function filterByMonth(month) {
  // In a real application, you would filter based on the actual month
  // For this demo, we'll use the same data but you can implement filtering logic here
  currentData = [...attendanceData];
  currentPage = 1;
  renderAttendanceTable(currentData, currentPage);
}

// Setup event listeners
function setupEventListeners() {
  // Month filter
  const monthFilter = document.getElementById('month-filter');
  if (monthFilter) {
    monthFilter.addEventListener('change', (e) => {
      filterByMonth(e.target.value);
    });
  }

  // Export button
  const exportBtn = document.querySelector('.export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportReport);
  }

  // Pagination event listeners
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      handlePaginationClick(currentPage - 1);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      handlePaginationClick(currentPage + 1);
    });
  }

  // Page number buttons
  document.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.getAttribute('data-page'));
      handlePaginationClick(page);
    });
  });
}