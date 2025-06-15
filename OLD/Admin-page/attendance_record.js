window.onload = function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    });
};

// Mock attendance data for all 6 departments
const attendanceData = [
  {
    id: "EMP001",
    name: "John Smith",
    department: "Sales & Customer Service",
    date: "2025-05-23",
    clockIn: "08:45",
    clockOut: "17:30",
    hours: "8.75h",
    overtime: "+0.75h",
    status: "Present",
    shift: "Morning Shift"
  },
  {
    id: "EMP002",
    name: "Sarah Johnson",
    department: "Sales & Customer Service",
    date: "2025-05-23",
    clockIn: "14:15",
    clockOut: "22:45",
    hours: "8.5h",
    overtime: "+0.5h",
    status: "Present",
    shift: "Evening Shift"
  },
  {
    id: "EMP003",
    name: "Mike Wilson",
    department: "IT & E-Commerce",
    date: "2025-05-23",
    clockIn: "22:00",
    clockOut: "06:15",
    hours: "8.25h",
    overtime: "+0.25h",
    status: "Present",
    shift: "Night Shift"
  },
  {
    id: "EMP004",
    name: "Lisa Brown",
    department: "Inventory & Supply Chain Management",
    date: "2025-05-23",
    clockIn: "07:30",
    clockOut: "16:00",
    hours: "8.5h",
    overtime: "+0.5h",
    status: "Present",
    shift: "Morning Shift"
  },
  {
    id: "EMP005",
    name: "David Garcia",
    department: "Marketing & Merchandising",
    date: "2025-05-23",
    clockIn: "09:00",
    clockOut: "18:00",
    hours: "9h",
    overtime: "+1h",
    status: "Present",
    shift: "Standard Hours"
  },
  {
    id: "EMP006",
    name: "Emily Davis",
    department: "Human Resources",
    date: "2025-05-23",
    clockIn: "--",
    clockOut: "--",
    hours: "0h",
    overtime: "0h",
    status: "Absent",
    shift: "Standard Hours"
  },
  {
    id: "EMP007",
    name: "Robert Chen",
    department: "Finance & Accounting",
    date: "2025-05-23",
    clockIn: "08:30",
    clockOut: "17:15",
    hours: "8.75h",
    overtime: "+0.75h",
    status: "Present",
    shift: "Standard Hours"
  },
  {
    id: "EMP008",
    name: "Amanda Rodriguez",
    department: "IT & E-Commerce",
    date: "2025-05-23",
    clockIn: "15:00",
    clockOut: "23:30",
    hours: "8.5h",
    overtime: "+0.5h",
    status: "Present",
    shift: "Evening Shift"
  },
  {
    id: "EMP009",
    name: "James Lee",
    department: "Inventory & Supply Chain Management",
    date: "2025-05-23",
    clockIn: "23:00",
    clockOut: "07:30",
    hours: "8.5h",
    overtime: "+0.5h",
    status: "Present",
    shift: "Night Shift"
  },
  {
    id: "EMP010",
    name: "Maria Santos",
    department: "Sales & Customer Service",
    date: "2025-05-23",
    clockIn: "09:00",
    clockOut: "13:00",
    hours: "4h",
    overtime: "0h",
    status: "Half Day",
    shift: "Morning Shift"
  }
];

let filteredData = [...attendanceData];

// Tab switching functionality
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabId = btn.getAttribute("data-tab");

    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(tabId).classList.add("active");
  });
});

// Render attendance table
function renderAttendanceTable(data) {
  const tbody = document.getElementById("attendance-tbody");
  tbody.innerHTML = "";

  data.forEach((record) => {
    const row = document.createElement("tr");

    const statusClass =
      record.status === "Present"
        ? "status-present"
        : record.status === "Absent"
        ? "status-absent"
        : "status-half-day";

    const overtimeClass =
      record.overtime.includes("+") ? "overtime-positive" : record.overtime === "0h" ? "" : "overtime-negative";

    row.innerHTML = `
      <td>
        <div class="employee-info">
          <div class="employee-name">${record.name}</div>
          <div class="employee-id">${record.id}</div>
        </div>
      </td>
      <td>${record.department}</td>
      <td>${record.date}</td>
      <td>${record.clockIn}</td>
      <td>${record.clockOut}</td>
      <td>${record.hours}</td>
      <td class="${overtimeClass}">${record.overtime}</td>
      <td>
        <span class="status-badge ${statusClass}">
          ${record.status}
        </span>
      </td>
      <td>${record.shift}</td>
    `;

    tbody.appendChild(row);
  });

  document.getElementById("record-count").textContent = data.length;
}

// Filter functionality
function applyFilters() {
  const searchTerm = document.getElementById("search-employee").value.toLowerCase();
  const departmentFilter = document.getElementById("filter-department").value;
  const statusFilter = document.getElementById("filter-status").value;
  const dateFilter = document.getElementById("filter-date").value;

  filteredData = attendanceData.filter((record) => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm) || record.id.toLowerCase().includes(searchTerm);
    const matchesDepartment = !departmentFilter || record.department === departmentFilter;
    const matchesStatus = !statusFilter || record.status === statusFilter;
    const matchesDate = !dateFilter || record.date === dateFilter;

    return matchesSearch && matchesDepartment && matchesStatus && matchesDate;
  });

  renderAttendanceTable(filteredData);
}

// Add event listeners for filters
document.getElementById("search-employee").addEventListener("input", applyFilters);
document.getElementById("filter-department").addEventListener("change", applyFilters);
document.getElementById("filter-status").addEventListener("change", applyFilters);
document.getElementById("filter-date").addEventListener("change", applyFilters);

// Report type radio button functionality
document.querySelectorAll('input[name="report-type"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const customDateRange = document.getElementById("custom-date-range");
    if (radio.value === "custom") {
      customDateRange.style.display = "flex";
    } else {
      customDateRange.style.display = "none";
    }
    updateReportPreview();
  });
});

// Update report preview
function updateReportPreview() {
  const reportType = document.querySelector('input[name="report-type"]:checked').value;
  const department = document.getElementById("report-department").value;
  const format = document.getElementById("report-format").value;

  document.getElementById("preview-type").textContent =
    reportType === "weekly"
      ? "Weekly Report"
      : reportType === "monthly"
      ? "Monthly Report"
      : "Custom Date Range";

  document.getElementById("preview-department").textContent =
    department === "all" ? "All Departments" : department;

  document.getElementById("preview-format").textContent = format.toUpperCase();

  // Calculate summary statistics
  const relevantData = department === "all" ? attendanceData : attendanceData.filter((record) => record.department === department);

  const present = relevantData.filter((r) => r.status === "Present").length;
  const absent = relevantData.filter((r) => r.status === "Absent").length;
  const halfDay = relevantData.filter((r) => r.status === "Half Day").length;

  document.getElementById("summary-present").textContent = present;
  document.getElementById("summary-absent").textContent = absent;
  document.getElementById("summary-half-day").textContent = halfDay;
  document.getElementById("preview-records").textContent = `${relevantData.length} entries`;
}

// Add event listeners for report form
document.getElementById("report-department").addEventListener("change", updateReportPreview);
document.getElementById("report-format").addEventListener("change", updateReportPreview);

// Generate report function
function generateReport() {
  const reportType = document.querySelector('input[name="report-type"]:checked').value;
  const department = document.getElementById("report-department").value;
  const format = document.getElementById("report-format").value;

  alert(
    `Generating ${reportType} report for ${
      department === "all" ? "All Departments" : department
    } in ${format.toUpperCase()} format...`
  );
}

// Preview report function
function previewReport() {
  alert("Opening report preview...");
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  renderAttendanceTable(filteredData);
  updateReportPreview();

  // Set today's date as default filter
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("filter-date").value = today;
});
