window.onload = function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    });
};

// Mock employee data
let employees = [
    {
        id: 1,
        name: "John Doe",
        employeeId: "E123",  
        department: "Sales & Customer Service",
        position: "Sales Manager",
        role: "Manager",
        employmentType: "Full-time",
        status: "Present"
    },
    {
        id: 2,
        name: "Jane Smith",
        employeeId: "E124", 
        department: "Marketing & Merchandising",
        position: "Marketing Specialist",
        role: "Employee",
        employmentType: "Full-time",
        status: "Present"
    },
    {
        id: 3,
        name: "Robert Johnson",
        employeeId: "E125",  
        department: "IT & E-Commerce",
        position: "System Administrator",
        role: "Admin",
        employmentType: "Full-time",
        status: "Present"
    },
    {
        id: 4,
        name: "Emily Williams",
        employeeId: "E126",  
        department: "Human Resources",
        position: "HR Coordinator",
        role: "Employee",
        employmentType: "Part-time",
        status: "On Leave"
    },
    {
        id: 5,
        name: "Michael Brown",
        employeeId: "E127",  
        department: "Finance & Accounting",
        position: "Financial Analyst",
        role: "Employee",
        employmentType: "Full-time",
        status: "Absent"
    },
    {
        id: 6,
        name: "Sarah Davis",
        employeeId: "E128",  
        department: "Inventory & Supply Chain Management",
        position: "Inventory Manager",
        role: "Manager",
        employmentType: "Full-time",
        status: "Present"
    },
    {
        id: 7,
        name: "David Miller",
        employeeId: "E129",  
        department: "Sales & Customer Service",
        position: "Customer Service Rep",
        role: "Employee",
        employmentType: "Part-time",
        status: "Present"
    }
];


let currentEditId = null;

// Generate initials for avatar
function getInitials(name) {
    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

// Get badge class for different statuses
function getBadgeClass(type, value) {
    const classes = {
        role: {
            Manager: "manager",
            Employee: "employee",
            Admin: "admin",
        },
        employmentType: {
            "Full-time": "full-time",
            "Part-time": "part-time",
            Intern: "intern",
        },
        status: {
            Present: "present",
            Absent: "absent",
            "On Leave": "on-leave",
        },
    };
    return classes[type][value] || "";
}

// Render employees table
function renderEmployees(employeeList = employees) {
    const tbody = document.getElementById("employeeTableBody");
    tbody.innerHTML = employeeList
        .map(
            (employee) => `
        <tr>
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${getInitials(employee.name)}</div>
                    <div class="employee-details">
                        <h4>${employee.name}</h4>
                        <div class="employee-id">${employee.employeeId}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="department-info">
                    <h4>${employee.department}</h4>
                    <div class="department-role">${employee.position}</div>
                </div>
            </td>
            <td>
                <span class="badge ${getBadgeClass("role", employee.role)}">${employee.role}</span>
            </td>
            <td>
                <span class="badge ${getBadgeClass(
                    "employmentType",
                    employee.employmentType
                )}">${employee.employmentType}</span>
            </td>
            <td>
                <span class="badge ${getBadgeClass("status", employee.status)}">${employee.status}</span>
            </td>
            <td>
                <div class="actions">
                    <button class="action-btn edit-btn" onclick="editEmployee(${employee.id})" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteEmployee(${employee.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `
        )
        .join("");
}

// Filter employees
function filterEmployees() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const departmentFilter = document.getElementById("departmentFilter").value;
    const roleFilter = document.getElementById("roleFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;

    const filtered = employees.filter((employee) => {
        const matchesSearch =
            employee.name.toLowerCase().includes(searchTerm) ||
            employee.id.toLowerCase().includes(searchTerm) ||
            employee.position.toLowerCase().includes(searchTerm);

        const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
        const matchesRole = !roleFilter || employee.role === roleFilter;
        const matchesStatus = !statusFilter || employee.status === statusFilter;

        return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });

    renderEmployees(filtered);
}

// Open add modal
function openAddModal() {
    currentEditId = null;
    document.getElementById("modalTitle").textContent = "Add Employee";
    document.getElementById("employeeForm").reset();
    document.getElementById("employeeModal").style.display = "block";
}

// Open edit modal
function editEmployee(id) {
    const employee = employees.find((emp) => emp.id === id);
    if (!employee) return;

    currentEditId = id;
    document.getElementById("modalTitle").textContent = "Edit Employee";
    document.getElementById("employeeName").value = employee.name;
    document.getElementById("employeeid").value = employee.id;
    document.getElementById("employeeDepartment").value = employee.department;
    document.getElementById("employeePosition").value = employee.position;
    document.getElementById("employeeRole").value = employee.role;
    document.getElementById("employmentType").value = employee.employmentType;
    document.getElementById("employeeStatus").value = employee.status;
    document.getElementById("employeeModal").style.display = "block";
}

// Close modal
function closeModal() {
    document.getElementById("employeeModal").style.display = "none";
    currentEditId = null;
}

// Delete employee
function deleteEmployee(id) {
    if (confirm("Are you sure you want to delete this employee?")) {
        employees = employees.filter((emp) => emp.id !== id);
        renderEmployees();
        filterEmployees();
    }
}

// Handle form submission
document.getElementById("employeeForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById("employeeName").value,
        id: document.getElementById("employeeID").value,
        department: document.getElementById("employeeDepartment").value,
        position: document.getElementById("employeePosition").value,
        role: document.getElementById("employeeRole").value,
        employmentType: document.getElementById("employmentType").value,
        status: document.getElementById("employeeStatus").value,
    };

    if (currentEditId) {
        // Edit existing employee
        const index = employees.findIndex((emp) => emp.id === currentEditId);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...formData };
        }
    } else {
        // Add new employee
        const newEmployee = {
            id: Math.max(...employees.map((emp) => emp.id)) + 1,
            ...formData,
        };
        employees.push(newEmployee);
    }

    closeModal();
    renderEmployees();
    filterEmployees();
});

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById("employeeModal");
    if (event.target === modal) {
        closeModal();
    }
};

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
    renderEmployees();
});
