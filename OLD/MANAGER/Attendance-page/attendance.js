document.addEventListener('DOMContentLoaded', () => {
    // Sample data for attendance records
    const attendanceData = [
        { id: "EMP001", name: "John Smith", department: "Sales & Customer Service", date: "2025-05-23", clockIn: "08:45", clockOut: "17:30", hours: "8.75h", overtime: "+0.75h", status: "present" },
        { id: "EMP002", name: "Sarah Johnson", department: "Sales & Customer Service", date: "2025-05-23", clockIn: "14:15", clockOut: "22:45", hours: "8.5h", overtime: "+0.5h", status: "present" },
        { id: "EMP003", name: "Mike Wilson", department: "IT & E-commerce", date: "2025-05-23", clockIn: "22:00", clockOut: "06:15", hours: "8.25h", overtime: "+0.25h", status: "present" },
        { id: "EMP004", name: "Lisa Brown", department: "Inventory & Supply Chain Management", date: "2025-05-23", clockIn: "07:30", clockOut: "16:00", hours: "8.5h", overtime: "+0.5h", status: "present" },
        { id: "EMP005", name: "David Garcia", department: "Marketing & Merchandising", date: "2025-05-23", clockIn: "09:00", clockOut: "18:00", hours: "9h", overtime: "+1h", status: "present" },
        { id: "EMP006", name: "Emily Rodriguez", department: "Sales & Customer Service", date: "2025-05-23", clockIn: "10:15", clockOut: "19:00", hours: "8.75h", overtime: "+0.75h", status: "late" },
        { id: "EMP007", name: "James Wilson", department: "IT & E-commerce", date: "2025-05-23", clockIn: "-", clockOut: "-", hours: "0h", overtime: "0h", status: "absent" },
        { id: "EMP008", name: "Maria Lopez", department: "Marketing & Merchandising", date: "2025-05-23", clockIn: "08:30", clockOut: "17:15", hours: "8.75h", overtime: "+0.75h", status: "present" }
    ];

    let currentData = [...attendanceData];

    // Initialize the page
    initializePage();

    function initializePage() {
        renderTable(currentData);
        updateRecordCount(currentData.length);
        setupEventListeners();
    }

    function setupEventListeners() {
        // Filter toggle functionality
        const toggleFiltersBtn = document.getElementById('toggleFilters');
        const showFiltersBtn = document.getElementById('showFiltersBtn');
        const filterContent = document.getElementById('filterContent');
        const toggleIcon = document.getElementById('toggleIcon');
        const toggleText = document.getElementById('toggleText');

        toggleFiltersBtn.addEventListener('click', () => {
            toggleFilterSection();
        });

        showFiltersBtn.addEventListener('click', () => {
            toggleFilterSection();
        });

        // Auto-apply filters when inputs change
        const filterInputs = ['filterDate', 'filterEmployee', 'filterDepartment', 'filterStatus'];
        filterInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', applyFilters);
                input.addEventListener('change', applyFilters);
            }
        });

        // Initial filter application
        applyFilters();
    }

    function toggleFilterSection() {
        const filterContent = document.getElementById('filterContent');
        const toggleIcon = document.getElementById('toggleIcon');
        const toggleText = document.getElementById('toggleText');
        const showFiltersBtn = document.getElementById('showFiltersBtn');
        
        const isCollapsed = filterContent.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Show filters
            filterContent.classList.remove('collapsed');
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-up');
            toggleText.textContent = 'Hide Filters';
            if (showFiltersBtn) {
                showFiltersBtn.querySelector('span').textContent = 'Hide Filters';
                showFiltersBtn.querySelector('i:last-child').classList.remove('fa-chevron-down');
                showFiltersBtn.querySelector('i:last-child').classList.add('fa-chevron-up');
            }
        } else {
            // Hide filters
            filterContent.classList.add('collapsed');
            toggleIcon.classList.remove('fa-chevron-up');
            toggleIcon.classList.add('fa-chevron-down');
            toggleText.textContent = 'Show Filters';
            if (showFiltersBtn) {
                showFiltersBtn.querySelector('span').textContent = 'Show Filters';
                showFiltersBtn.querySelector('i:last-child').classList.remove('fa-chevron-up');
                showFiltersBtn.querySelector('i:last-child').classList.add('fa-chevron-down');
            }
        }
    }

    function applyFilters() {
        const filterDate = document.getElementById('filterDate').value;
        const filterEmployee = document.getElementById('filterEmployee').value.toLowerCase();
        const filterDepartment = document.getElementById('filterDepartment').value;
        const filterStatus = document.getElementById('filterStatus').value;

        let filteredData = attendanceData.filter(item => {
            const matchesDate = !filterDate || item.date === filterDate;
            const matchesEmployee = !filterEmployee || 
                item.name.toLowerCase().includes(filterEmployee) || 
                item.id.toLowerCase().includes(filterEmployee);
            const matchesDepartment = !filterDepartment || item.department === filterDepartment;
            const matchesStatus = !filterStatus || item.status === filterStatus;

            return matchesDate && matchesEmployee && matchesDepartment && matchesStatus;
        });

        currentData = filteredData;
        renderTable(currentData);
        updateRecordCount(currentData.length);
    }

    function renderTable(data) {
        const tableBody = document.querySelector('#attendanceLogs');
        tableBody.innerHTML = '';

        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="8" style="text-align: center; padding: 40px; color: #718096;">
                    <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    No records found matching your criteria
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }

        data.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="employee-info">
                        <div class="employee-name">${entry.name}</div>
                        <div class="employee-id">${entry.id}</div>
                    </div>
                </td>
                <td>${entry.department}</td>
                <td>${formatDate(entry.date)}</td>
                <td class="time-cell">${entry.clockIn}</td>
                <td class="time-cell">${entry.clockOut}</td>
                <td class="time-cell">${entry.hours}</td>
                <td class="time-cell ${getOvertimeClass(entry.overtime)}">${entry.overtime}</td>
                <td>
                    <span class="status-badge ${entry.status}">
                        ${entry.status}
                    </span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    function getOvertimeClass(overtime) {
        if (overtime.startsWith('+')) {
            return 'overtime-positive';
        } else if (overtime.startsWith('-')) {
            return 'overtime-negative';
        }
        return '';
    }

    function updateRecordCount(count) {
        const recordCountElement = document.getElementById('recordCount');
        if (recordCountElement) {
            recordCountElement.textContent = count;
        }
    }

    // Export functionality (placeholder)
    function exportData() {
        const dataToExport = currentData.map(item => ({
            ID: item.id,
            Name: item.name,
            Department: item.department,
            Date: item.date,
            ClockIn: item.clockIn,
            ClockOut: item.clockOut,
            Hours: item.hours,
            Overtime: item.overtime,
            Status: item.status,
        }));
        
        console.log("Exporting Data:", dataToExport);
        
        // Create CSV content
        const headers = Object.keys(dataToExport[0]).join(',');
        const csvContent = [headers, ...dataToExport.map(row => Object.values(row).join(','))].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-records-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Make export function available globally if needed
    window.exportAttendanceData = exportData;
});