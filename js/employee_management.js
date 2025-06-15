function openAddModal() 
{
    document.getElementById("modalTitle").textContent = "Add Employee";
    document.getElementById("employeeForm").reset();
    document.getElementById("employeeId").value = "";
    document.getElementById("originalEmployeeId").value = "";
    document.getElementById("employeePassword").required = true;
    document.getElementById("passwordHelp").style.display = "none";
    document.getElementById("employeeModal").style.display = "block";
}

function editEmployee(id, name, department, role, email) 
{
    document.getElementById("modalTitle").textContent = "Edit Employee";
    document.getElementById("employeeId").value = id;
    document.getElementById("employeeName").value = name;
    document.getElementById("employeeID").value = id;
    document.getElementById("originalEmployeeId").value = id;
    document.getElementById("employeeDepartment").value = department;
    document.getElementById("employeeRole").value = role;
    document.getElementById("employeeEmail").value = email;
    document.getElementById("employeePassword").required = false;
    document.getElementById("passwordHelp").style.display = "block";
    document.getElementById("employeeModal").style.display = "block";
}

function closeModal() 
{
    document.getElementById("employeeModal").style.display = "none";
}

function filterEmployees() 
{
    const search = document.getElementById("searchInput").value.toLowerCase();
    const department = document.getElementById("departmentFilter").value.toLowerCase();
    const role = document.getElementById("roleFilter").value.toLowerCase();

    const rows = document.querySelectorAll("#employeeTableBody tr");

    rows.forEach(row => 
    {
        const name = row.querySelector(".employee-details h4")?.textContent?.toLowerCase() || "";
        const empId = row.querySelector(".employee-id")?.textContent?.toLowerCase() || "";
        
        const deptCell = row.querySelector("td:nth-child(2)"); 
        const dept = deptCell?.textContent?.toLowerCase() || "";
        
        const roleCell = row.querySelector("td:nth-child(3)");
        const badge = roleCell?.querySelector(".badge");
        const userType = badge?.textContent?.toLowerCase()?.trim() || "";

        const matchesSearch = name.includes(search) || empId.includes(search);
        const matchesDept = !department || dept === department;
        const matchesRole = !role || userType === role;

        row.style.display = (matchesSearch && matchesDept && matchesRole) ? "" : "none";
    });
}

window.onclick = function(event) 
{
    const modal = document.getElementById("employeeModal");
    if (event.target === modal) 
    {
        closeModal();
    }
};

document.addEventListener('DOMContentLoaded', function() 
{
    filterEmployees();
});