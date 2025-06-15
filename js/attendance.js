document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebarContainer');
    if (sidebarContainer) {
        fetch('manager_sidebar.php')
            .then(response => response.text())
            .then(data => {
                sidebarContainer.innerHTML = data;
            })
            .catch(error => console.log('Error loading sidebar:', error));
    } else {
        console.log('Sidebar container not found.');
    }

    const toggleFiltersBtn = document.getElementById('toggleFilters');
    const showFiltersBtn = document.getElementById('showFiltersBtn');
    const filterContent = document.getElementById('filterContent');
    const attendanceLogs = document.getElementById('attendanceLogs');
    
    // Replace initialRecords with attendanceRecords
    let currentRecords = attendanceRecords; 
    renderTable(currentRecords);
    updateRecordCount(currentRecords.length);

    if (toggleFiltersBtn) toggleFiltersBtn.addEventListener('click', toggleFilterSection);
    if (showFiltersBtn) showFiltersBtn.addEventListener('click', toggleFilterSection);
    
    const filterInputs = ['filterDate', 'filterEmployee', 'filterDepartment', 'filterStatus'];
    filterInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', applyFilters);
            input.addEventListener('change', applyFilters);
        }
    });

    if (managerDepartment && managerDepartment !== 'all') {
        const deptFilter = document.getElementById('filterDepartment');
        if (deptFilter) {
            deptFilter.value = managerDepartment;
            deptFilter.disabled = true; 
        }
    }

    function toggleFilterSection() {
        const isCollapsed = filterContent.classList.contains('collapsed');
        
        if (isCollapsed) {
            filterContent.classList.remove('collapsed');
            document.getElementById('toggleIcon').classList.replace('fa-chevron-down', 'fa-chevron-up');
            document.getElementById('toggleText').textContent = 'Hide Filters';
            if (showFiltersBtn) {
                showFiltersBtn.querySelector('span').textContent = 'Hide Filters';
                showFiltersBtn.querySelector('i:last-child').classList.replace('fa-chevron-down', 'fa-chevron-up');
            }
        } else {
            filterContent.classList.add('collapsed');
            document.getElementById('toggleIcon').classList.replace('fa-chevron-up', 'fa-chevron-down');
            document.getElementById('toggleText').textContent = 'Show Filters';
            if (showFiltersBtn) {
                showFiltersBtn.querySelector('span').textContent = 'Show Filters';
                showFiltersBtn.querySelector('i:last-child').classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        }
    }

    function applyFilters() {
        const filterDate = document.getElementById('filterDate').value;
        const filterEmployee = document.getElementById('filterEmployee').value.toLowerCase();
        const filterDepartment = document.getElementById('filterDepartment').value;
        const filterStatus = document.getElementById('filterStatus').value;

        const filteredRecords = currentRecords.filter(record => {
            const recordDate = record.date;
            const matchesDate = !filterDate || recordDate === filterDate;
            const matchesEmployee = !filterEmployee || 
                record.name.toLowerCase().includes(filterEmployee) || 
                record.id.toLowerCase().includes(filterEmployee);
            const matchesDepartment = !filterDepartment || record.department === filterDepartment;
            const matchesStatus = !filterStatus || record.status === filterStatus;

            return matchesDate && matchesEmployee && matchesDepartment && matchesStatus;
        });

        renderTable(filteredRecords);
        updateRecordCount(filteredRecords.length);
    }

    function renderTable(records) {
        if (!attendanceLogs) return;

        attendanceLogs.innerHTML = '';

        if (records.length === 0) {
            attendanceLogs.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: #718096;">
                        <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                        No records found matching your criteria
                    </td>
                </tr>`;
            return;
        }

        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="employee-info">
                        <div class="employee-name">${escapeHtml(record.name)}</div>
                        <div class="employee-id">${escapeHtml(record.id)}</div>
                    </div>
                </td>
                <td>${escapeHtml(record.department)}</td>
                <td>${escapeHtml(record.date)}</td>
                <td class="time-cell">${escapeHtml(record.clockIn)}</td>
                <td class="time-cell">${escapeHtml(record.clockOut)}</td>
                <td class="time-cell">${escapeHtml(record.hours)}</td>
                <td class="time-cell ${getOvertimeClass(record.overtime)}">${escapeHtml(record.overtime)}</td>
                <td>
                    <span class="status-badge ${getStatusClass(record.status)}">
                        ${escapeHtml(record.status)}
                    </span>
                </td>
                <td>${escapeHtml(record.shift)}</td>
            `;
            attendanceLogs.appendChild(row);
        });
    }

    function getStatusClass(status) {
        switch(status) {
            case 'Present': return 'status-present';
            case 'Absent': return 'status-absent';
            case 'Half Day': return 'status-half-day';
            case 'Late': return 'status-late';
            default: return '';
        }
    }

    function getOvertimeClass(overtime) {
        if (overtime.startsWith('+')) return 'overtime-positive';
        if (overtime.startsWith('-')) return 'overtime-negative';
        return '';
    }

    function updateRecordCount(count) {
        const recordCountElement = document.getElementById('recordCount');
        if (recordCountElement) {
            recordCountElement.textContent = count;
        }
    }

    function escapeHtml(unsafe) {
        if (unsafe == null) return '';
        return unsafe
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
