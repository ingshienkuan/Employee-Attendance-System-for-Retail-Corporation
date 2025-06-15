window.onload = function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    });
};

// Mock department data
let departments = [
    {
        id: 1,
        name: "Sales & Customer Service",
        description: "Handles all sales operations and customer service inquiries",
        manager: "John Doe",
        employeeCount: 5,
        shiftRequired: true
    },
    {
        id: 2,
        name: "Inventory & Supply Chain Management",
        description: "Manages inventory levels and supply chain logistics",
        manager: "Sarah Davis",
        employeeCount: 1,
        shiftRequired: true
    },
    {
        id: 3,
        name: "Marketing & Merchandising",
        description: "Responsible for marketing campaigns and store merchandising",
        manager: null,
        employeeCount: 2,
        shiftRequired: false
    },
    {
        id: 4,
        name: "Human Resources",
        description: "Handles recruitment, employee relations, and HR policies",
        manager: "Lisa Anderson",
        employeeCount: 2,
        shiftRequired: false
    },
    {
        id: 5,
        name: "Finance & Accounting",
        description: "Manages financial operations, budgeting, and accounting processes",
        manager: null,
        employeeCount: 3,
        shiftRequired: false
    },
    {
        id: 6,
        name: "IT & E-Commerce",
        description: "Maintains IT infrastructure and manages e-commerce platforms",
        manager: "Michael Johnson",
        employeeCount: 4,
        shiftRequired: true
    }
];

let currentEditId = null;

// Render departments
function renderDepartments() {
    const grid = document.getElementById('departmentsGrid');
    grid.innerHTML = departments.map(dept => `
        <div class="department-card">
            <div class="department-header">
                <h3 class="department-title">${dept.name}</h3>
                <div class="department-actions">
                    <button class="action-btn edit-btn" onclick="editDepartment(${dept.id})" title="Edit Department"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteDepartment(${dept.id})" title="Delete Department"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <p class="department-description">${dept.description}</p>
            <div class="department-info">
                <div class="info-row">
                    <span class="info-label">Manager:</span>
                    <span class="info-value ${!dept.manager ? 'no-manager' : ''}">${dept.manager || 'Not Assigned'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Employees:</span>
                    <span class="employee-count">${dept.employeeCount} Employee${dept.employeeCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
            ${dept.shiftRequired ? '<span class="shift-required">Requires Shift Work</span>' : ''}
        </div>
    `).join('');
}

// Open add modal
function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Add Department';
    document.getElementById('departmentForm').reset();
    document.getElementById('departmentModal').style.display = 'block';
}

// Open edit modal
function editDepartment(id) {
    const department = departments.find(dept => dept.id === id);
    if (!department) return;

    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Edit Department';
    document.getElementById('departmentName').value = department.name;
    document.getElementById('departmentDescription').value = department.description;
    document.getElementById('departmentManager').value = department.manager || '';
    document.getElementById('shiftRequired').checked = department.shiftRequired;
    document.getElementById('departmentModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('departmentModal').style.display = 'none';
    currentEditId = null;
}

// Delete department
function deleteDepartment(id) {
    const department = departments.find(dept => dept.id === id);
    if (!department) return;

    if (confirm(`Are you sure you want to delete the "${department.name}" department?`)) {
        departments = departments.filter(dept => dept.id !== id);
        renderDepartments();
    }
}

// Handle form submission
document.getElementById('departmentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('departmentName').value,
        description: document.getElementById('departmentDescription').value,
        manager: document.getElementById('departmentManager').value || null,
        shiftRequired: document.getElementById('shiftRequired').checked,
        employeeCount: 0 // New departments start with 0 employees
    };

    if (currentEditId) {
        // Edit existing department
        const index = departments.findIndex(dept => dept.id === currentEditId);
        if (index !== -1) {
            departments[index] = { 
                ...departments[index], 
                ...formData 
            };
        }
    } else {
        // Add new department
        const newDepartment = {
            id: Math.max(...departments.map(dept => dept.id)) + 1,
            ...formData
        };
        departments.push(newDepartment);
    }

    closeModal();
    renderDepartments();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('departmentModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderDepartments();
});
