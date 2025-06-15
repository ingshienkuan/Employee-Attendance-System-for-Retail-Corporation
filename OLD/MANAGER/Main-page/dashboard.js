document.addEventListener("DOMContentLoaded", function () {
    // Sidebar Toggle
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    // Toggle sidebar collapse on button click
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
        });
    }



    // Update Statistics with Animation
    updateStatistics();
    
    function updateStatistics() {
        const stats = [
            { id: 'presentCount', value: 18, element: document.querySelector('.overview-card.present .card-number') },
            { id: 'absentCount', value: 2, element: document.querySelector('.overview-card.absent .card-number') },
            { id: 'lateCount', value: 3, element: document.querySelector('.overview-card.late .card-number') },
            { id: 'leaveCount', value: 1, element: document.querySelector('.overview-card.leave .card-number') }
        ];

        stats.forEach(stat => {
            if (stat.element) {
                animateNumber(stat.element, 0, stat.value, 1000);
            }
        });
    }

    // Number animation function
    function animateNumber(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    // Report Generation Functionality
    const generateReportBtn = document.getElementById("generateReportBtn");
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    const reportType = document.getElementById("reportType");
    const department = document.getElementById("department");
    const fromDate = document.getElementById("fromDate");
    const toDate = document.getElementById("toDate");

    // Set default dates
    if (fromDate && toDate) {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        fromDate.valueAsDate = lastWeek;
        toDate.valueAsDate = today;
    }

    // Generate Report functionality
    if (generateReportBtn) {
        generateReportBtn.addEventListener("click", function () {
            const reportData = {
                type: reportType ? reportType.value : 'daily',
                dept: department ? department.value : 'all',
                from: fromDate ? fromDate.value : '',
                to: toDate ? toDate.value : ''
            };

            // Validate date range
            if (reportData.from && reportData.to && new Date(reportData.from) > new Date(reportData.to)) {
                showErrorMessage("From date cannot be later than To date");
                return;
            }

            // Show loading state
            const originalText = generateReportBtn.innerHTML;
            generateReportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            generateReportBtn.disabled = true;
            generateReportBtn.classList.add('btn-loading');

            // Simulate report generation
            setTimeout(() => {
                generateReport(reportData);
                generateReportBtn.innerHTML = originalText;
                generateReportBtn.disabled = false;
                generateReportBtn.classList.remove('btn-loading');
            }, 2000);
        });
    }

    // Export PDF functionality
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener("click", function () {
            const reportData = {
                type: reportType ? reportType.value : 'daily',
                dept: department ? department.value : 'all',
                from: fromDate ? fromDate.value : '',
                to: toDate ? toDate.value : ''
            };

            // Show loading state
            const originalText = exportPdfBtn.innerHTML;
            exportPdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            exportPdfBtn.disabled = true;
            exportPdfBtn.classList.add('btn-loading');

            // Simulate PDF export
            setTimeout(() => {
                exportToPDF(reportData);
                exportPdfBtn.innerHTML = originalText;
                exportPdfBtn.disabled = false;
                exportPdfBtn.classList.remove('btn-loading');
            }, 1500);
        });
    }

    function generateReport(data) {
        console.log('Generating report with data:', data);
        showSuccessMessage(`${data.type.charAt(0).toUpperCase() + data.type.slice(1)} report generated successfully for ${data.dept === 'all' ? 'All Departments' : data.dept}`);
        
        // Here you would typically make an API call to generate the report
        // Example: fetch('/api/reports/generate', { method: 'POST', body: JSON.stringify(data) })
    }

    function exportToPDF(data) {
        console.log('Exporting PDF with data:', data);
        showSuccessMessage('PDF report has been downloaded successfully');
        
        // Here you would typically trigger a PDF download
        // Example: window.open('/api/reports/pdf?' + new URLSearchParams(data));
    }

    // Fetch Dashboard Data (API Integration)
    fetchDashboardData();
    
    function fetchDashboardData() {
        // Simulated API call - replace with actual endpoint
        const mockApiCall = new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    present: 18,
                    absent: 2,
                    late: 3,
                    leave: 1,
                    activities: [
                        {
                            id: 1,
                            user: 'Sarah Miller',
                            action: 'requested sick leave',
                            details: 'Nov 22-23, 2023 - Pending approval',
                            time: '10 min ago',
                            avatar: 'SM',
                            type: 'leave'
                        },
                        {
                            id: 2,
                            user: "Robert Johnson's",
                            action: 'shift changed',
                            details: 'From Evening to Morning shift on Nov 25, 2023',
                            time: '1 hour ago',
                            avatar: 'RJ',
                            type: 'shift'
                        },
                        {
                            id: 3,
                            user: 'Emily Wilson',
                            action: 'arrived late',
                            details: 'Clocked in at 9:15 AM (15 min late)',
                            time: 'Today',
                            avatar: 'EW',
                            type: 'late'
                        },
                        {
                            id: 4,
                            user: 'Michael Brown',
                            action: 'is absent',
                            details: 'No call, no show',
                            time: 'Today',
                            avatar: 'MB',
                            type: 'absent'
                        },
                        {
                            id: 5,
                            user: "Jessica Taylor's",
                            action: 'leave approved',
                            details: 'Vacation leave for Dec 10-15, 2023',
                            time: 'Yesterday',
                            avatar: 'JT',
                            type: 'approved'
                        }
                    ],
                    scheduleData: [
                        { shift: 'Morning', time: '08:00 - 16:00', scheduled: 10, present: 8, absent: 1, late: 1 },
                        { shift: 'Evening', time: '16:00 - 00:00', scheduled: 8, present: 6, absent: 1, late: 1 },
                        { shift: 'Night', time: '00:00 - 08:00', scheduled: 6, present: 4, absent: 0, late: 2 }
                    ]
                });
            }, 1000);
        });

        mockApiCall
            .then(data => {
                updateDashboardData(data);
            })
            .catch(error => {
                console.error('Error fetching dashboard data:', error);
                showErrorMessage('Failed to load dashboard data');
            });
    }

    function updateDashboardData(data) {
        // Update statistics
        const presentElement = document.querySelector('.overview-card.present .card-number');
        const absentElement = document.querySelector('.overview-card.absent .card-number');
        const lateElement = document.querySelector('.overview-card.late .card-number');
        const leaveElement = document.querySelector('.overview-card.leave .card-number');

        if (presentElement) presentElement.textContent = data.present;
        if (absentElement) absentElement.textContent = data.absent;
        if (lateElement) lateElement.textContent = data.late;
        if (leaveElement) leaveElement.textContent = data.leave;

        // Update activities if data is provided
        if (data.activities) {
            updateRecentActivities(data.activities);
        }

        // Update schedule data if provided
        if (data.scheduleData) {
            updateScheduleTable(data.scheduleData);
        }
    }

    function updateRecentActivities(activities) {
        const activitiesList = document.getElementById('activitiesList');
        if (!activitiesList) return;

        // Clear existing activities
        activitiesList.innerHTML = '';

        // Add new activities
        activities.forEach(activity => {
            const activityElement = createActivityElement(activity);
            activitiesList.appendChild(activityElement);
        });
    }

    function createActivityElement(activity) {
        const div = document.createElement('div');
        div.className = 'activity-item';
        
        const avatarClass = getAvatarClass(activity.type);
        
        div.innerHTML = `
            <div class="activity-avatar ${avatarClass}">${activity.avatar}</div>
            <div class="activity-content">
                <div class="activity-main">
                    <strong>${activity.user}</strong> ${activity.action}
                </div>
                <div class="activity-details">${activity.details}</div>
            </div>
            <div class="activity-time">${activity.time}</div>
        `;
        
        return div;
    }

    function getAvatarClass(type) {
        const typeMapping = {
            'leave': 'sm',
            'shift': 'rj',
            'late': 'ew',
            'absent': 'mb',
            'approved': 'jt'
        };
        return typeMapping[type] || 'sm';
    }

    function updateScheduleTable(scheduleData) {
        const scheduleTableBody = document.querySelector('#scheduleTable tbody');
        if (!scheduleTableBody) return;

        scheduleTableBody.innerHTML = '';

        scheduleData.forEach(shift => {
            const row = document.createElement('tr');
            const shiftClass = shift.shift.toLowerCase();
            
            row.innerHTML = `
                <td>
                    <span class="shift-label ${shiftClass}">${shift.shift}</span>
                </td>
                <td>${shift.time}</td>
                <td>${shift.scheduled}</td>
                <td>${shift.present}</td>
                <td>${shift.absent}</td>
                <td>${shift.late}</td>
            `;
            
            scheduleTableBody.appendChild(row);
        });
    }

    // Highlight Active Sidebar Link
    highlightActiveSidebarLink();
    
    function highlightActiveSidebarLink() {
        // Wait for sidebar to load
        setTimeout(() => {
            const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
            sidebarLinks.forEach(link => {
                if (link.href === window.location.href || link.href.includes('dashboard')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }, 500);
    }

    // Schedule Navigation
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    let currentDate = new Date();
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() - 1);
            updateScheduleDate();
            fetchScheduleData(currentDate);
        });
        
        nextBtn.addEventListener('click', () => {
            currentDate.setDate(currentDate.getDate() + 1);
            updateScheduleDate();
            fetchScheduleData(currentDate);
        });
    }

    function updateScheduleDate() {
        const scheduleHeader = document.querySelector('.schedule-header h3');
        if (scheduleHeader) {
            const dateStr = currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            scheduleHeader.textContent = `${dateStr}'s Schedule`;
        }
    }

    function fetchScheduleData(date) {
        console.log('Fetching schedule data for:', date.toDateString());
        // Here you would make an API call to fetch schedule data for the specific date
        // For now, we'll simulate with the existing data
    }


    // Initialize chart placeholder
    initializeChart();

    // Auto-refresh dashboard data every 5 minutes
    setInterval(fetchDashboardData, 5 * 60 * 1000);

    // Real-time updates simulation
    simulateRealTimeUpdates();
    
    function simulateRealTimeUpdates() {
        // Simulate periodic updates
        setInterval(() => {
            const cards = document.querySelectorAll('.overview-card');
            cards.forEach(card => {
                card.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 200);
            });
        }, 30000); // Every 30 seconds
    }

    // Success message function
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dcfce7;
            color: #166534;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #bbf7d0;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove success message after 4 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 4000);
    }

    // Error handling
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #fecaca;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove error message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Initialize tooltips for cards
    initializeTooltips();
    
    function initializeTooltips() {
        const cards = document.querySelectorAll('.overview-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const title = this.querySelector('.card-title').textContent;
                const number = this.querySelector('.card-number').textContent;
                console.log(`${title}: ${number} employees`);
            });
        });
    }

    // Report type change handler
    if (reportType) {
        reportType.addEventListener('change', function() {
            const customDateFields = document.querySelectorAll('#fromDate, #toDate');
            if (this.value === 'custom') {
                customDateFields.forEach(field => {
                    field.style.display = 'block';
                    field.required = true;
                });
            } else {
                customDateFields.forEach(field => {
                    field.required = false;
                });
            }
        });
    }

    // Handle window resize for responsive adjustments
    window.addEventListener('resize', handleWindowResize);
    
    function handleWindowResize() {
        const mainContent = document.querySelector('.main-content');
        if (window.innerWidth <= 768) {
            if (mainContent) mainContent.style.marginLeft = '0';
        } else {
            if (mainContent) mainContent.style.marginLeft = '250px';
        }
    }

    // Initial call to set correct layout
    handleWindowResize();

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl + E for export
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            if (exportBtn) exportBtn.click();
        }
        
        // Ctrl + R for refresh (prevent default and use our refresh)
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            fetchDashboardData();
            showSuccessMessage('Dashboard data refreshed');
        }
    });

    // Add smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Performance monitoring
    const performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
                console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart, 'ms');
            }
        }
    });
    performanceObserver.observe({entryTypes: ['navigation']});

    console.log('Dashboard initialized successfully');
});