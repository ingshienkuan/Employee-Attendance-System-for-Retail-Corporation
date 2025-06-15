window.onload = function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    });
};


document.addEventListener('DOMContentLoaded', function() {
    const dateTime = document.getElementById('date-time');
    const totalEmployees = document.getElementById('total-employees');
    const presentToday = document.getElementById('present-today');
    const absentToday = document.getElementById('absent-today');
    const lateArrivals = document.getElementById('late-arrivals');
    const departmentStats = document.getElementById('department-stats');
    const attendanceWeek = document.getElementById('attendance-week');
    const attendanceLastWeek = document.getElementById('attendance-last-week');

    // Display current date and time
    setInterval(() => {
        const now = new Date();
        dateTime.innerText = now.toLocaleString();
    }, 1000);

    // Fetch real-time data from the backend
    fetch('dashboard-data.php')
        .then(response => response.json())
        .then(data => {
            // Populate the dashboard with data
            totalEmployees.innerText = data.totalEmployees;
            presentToday.innerText = data.presentToday;
            absentToday.innerText = data.absentToday;
            lateArrivals.innerText = data.lateArrivals;
            attendanceWeek.innerText = `${data.attendanceTrend.thisWeek}%`;
            attendanceLastWeek.innerText = `${data.attendanceTrend.lastWeek}%`;

            // Fill department stats
            let departmentHTML = '';
            data.departments.forEach(department => {
                departmentHTML += `
                    <p>${department.name}: ${department.attendance}%</p>
                `;
            });
            departmentStats.innerHTML = departmentHTML;
        })
        .catch(error => console.error('Error fetching data:', error));
});

// Configuration
const API_BASE_URL = 'http://localhost/employee-dashboard/api'; // Change this to your actual API URL

// Global variables
let currentPeriod = 'day';
let isLoading = false;

// Sample data for demonstration (replace with API call)
const sampleData = {
    day: [
        { name: 'Sales', percentage: 95 },
        { name: 'Inventory', percentage: 90 },
        { name: 'Marketing', percentage: 88 },
        { name: 'HR', percentage: 100 },
        { name: 'Finance', percentage: 92 },
        { name: 'IT', percentage: 95 }
    ],
    week: [
        { name: 'Sales', percentage: 92 },
        { name: 'Inventory', percentage: 88 },
        { name: 'Marketing', percentage: 85 },
        { name: 'HR', percentage: 98 },
        { name: 'Finance', percentage: 90 },
        { name: 'IT', percentage: 93 }
    ],
    month: [
        { name: 'Sales', percentage: 89 },
        { name: 'Inventory', percentage: 85 },
        { name: 'Marketing', percentage: 82 },
        { name: 'HR', percentage: 96 },
        { name: 'Finance', percentage: 87 },
        { name: 'IT', percentage: 91 }
    ]
};

// Initialize chart
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadChartData();
});

// Setup event listeners
function setupEventListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update current period and reload data
            currentPeriod = this.dataset.period;
            loadChartData();
        });
    });
}

// Load chart data
async function loadChartData() {
    if (isLoading) return;
    
    setLoadingState(true);
    
    try {
        // Make API call to get real data
        const response = await fetch(`${API_BASE_URL}/department_attendance.php?period=${currentPeriod}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            renderChart(result.data.departments);
        } else {
            throw new Error(result.message || 'Failed to load data');
        }
        
    } catch (error) {
        console.error('Error loading chart data:', error);
        // Fallback to sample data for demonstration
        console.log('Falling back to sample data...');
        const data = sampleData[currentPeriod];
        renderChart(data);
    } finally {
        setLoadingState(false);
    }
}

// Render chart with data
function renderChart(data) {
    const maxPercentage = Math.max(...data.map(d => d.percentage));
    
    const chartHTML = `
        <div class="chart-bars">
            ${data.map(dept => `
                <div class="bar-group">
                    <div class="bar" style="height: ${(dept.percentage / maxPercentage) * 180}px;">
                        <div class="bar-value">${dept.percentage}%</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="department-labels">
            ${data.map(dept => `
                <div class="department-item">
                    <div class="department-name">${dept.name}</div>
                    <div class="department-percentage">${dept.percentage}%</div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('chartContent').innerHTML = chartHTML;
    
    // Add animation
    setTimeout(() => {
        const bars = document.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.transform = 'scaleY(1)';
                bar.style.transformOrigin = 'bottom';
            }, index * 100);
        });
    }, 100);
}

// Set loading state
function setLoadingState(loading) {
    isLoading = loading;
    
    if (loading) {
        document.getElementById('chartContent').innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                Loading...
            </div>
        `;
    }
}

 // Function to update the date in real-time
function updateDateTime() {
    const dateElement = document.getElementById('real-time-date');
    const now = new Date();

    // Options for date formatting (you can customize this format)
    const options = { 

        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
    };

    // Update the date and time
    const formattedDate = now.toLocaleDateString('en-GB', options); // Format as "Monday, 30 May 2025"
    dateElement.innerHTML = formattedDate;
}


// Initial call to display the date immediately when the page loads
updateDateTime();


// Show error state
function showError() {
    document.getElementById('chartContent').innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <div>Failed to load data</div>
            <button class="retry-btn" onclick="loadChartData()">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

// Add initial animation styles
const style = document.createElement('style');
style.textContent = `
    .bar {
        transform: scaleY(0);
        transform-origin: bottom;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;
document.head.appendChild(style);
