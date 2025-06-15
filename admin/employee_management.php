<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
require '../component/connection.php';

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') 
{
    header("Location: ../login.php");
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{
    if (isset($_POST['delete_id'])) 
    {
        $stmt = $pdo->prepare("DELETE FROM employees WHERE employee_id = ?");
        $stmt->execute([$_POST['delete_id']]);
    } 
    else 
    {
        $employee_id = $_POST['employee_id'];
        $original_employee_id = $_POST['original_employee_id'] ?? $employee_id;
        $email = $_POST['email'];

        $stmt = $pdo->prepare("SELECT * FROM employees WHERE employee_id = ?");
        $stmt->execute([$original_employee_id]);
        $employee = $stmt->fetch();

        if ($employee) 
        {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE email = ? AND employee_id != ?");
            $stmt->execute([$email, $original_employee_id]);
            if ($stmt->fetchColumn()) 
            {
                die("Error: Email already exists for another employee.");
            }

            $deptStmt = $pdo->prepare("SELECT id FROM departments WHERE name = ?");
            $deptStmt->execute([$_POST['department']]);
            $department_id = $deptStmt->fetchColumn();

            if (!$department_id) {
                die("Error: Invalid department selected.");
            }

            $data = 
            [
                'employee_id' => $employee_id,
                'name' => $_POST['name'],
                'department_id' => $department_id,
                'user_type' => $_POST['user_type'],
                'email' => $email,
                'original_employee_id' => $original_employee_id
            ];

            $sql = "UPDATE employees SET 
                    employee_id = :employee_id,
                    name = :name, 
                    department_id = :department_id, 
                    user_type = :user_type, 
                    email = :email";

            if (!empty($_POST['password'])) 
            {
                $data['password_hash'] = md5($_POST['password']);
            }

            $sql .= " WHERE employee_id = :original_employee_id";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($data);
        } 
        else 
        {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetchColumn()) 
            {
                die("Error: Email already exists.");
            }

            if (empty($_POST['password'])) 
            {
                die("Error: Password is required for new employees.");
            }

            $deptStmt = $pdo->prepare("SELECT id FROM departments WHERE name = ?");
            $deptStmt->execute([$_POST['department']]);
            $department_id = $deptStmt->fetchColumn();

            if (!$department_id) 
            {
                die("Error: Invalid department selected.");
            }

            $data = 
            [
                'employee_id' => $employee_id,
                'name' => $_POST['name'],
                'department_id' => $department_id,
                'user_type' => $_POST['user_type'],
                'email' => $email,
                'password_hash' => md5($_POST['password'])
            ];

            $stmt = $pdo->prepare("INSERT INTO employees 
                (employee_id, name, department_id, user_type, email, password_hash) 
                VALUES 
                (:employee_id, :name, :department_id, :user_type, :email, :password_hash)");
            $stmt->execute($data);
        }
    }
}

$stmt = $pdo->query
("
    SELECT e.*, d.name AS department_name 
    FROM employees e 
    LEFT JOIN departments d ON e.department_id = d.id
");
$employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

$deptStmt = $pdo->query("SELECT name FROM departments");
$departments = $deptStmt->fetchAll(PDO::FETCH_COLUMN);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Employee Management</title>
  <link rel="stylesheet" href="../css/employee_management.css" />
  <script src="../js/employee_management.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</head>
<body>
  <?php include 'sidebar.php'; ?>
  
  <div class="container">
    <div class="employee_management-header">
        <h1>Employee Management</h1>
        <button class="add-employee-btn" onclick="openAddModal()">+ Add Employee</button>
    </div>

    <div class="filters">
        <div class="search-box">
            <span class="search-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
            <input type="text" id="searchInput" placeholder="Search employees..." onkeyup="filterEmployees()" />
        </div>
        <select class="filter-select" id="departmentFilter" onchange="filterEmployees()">
            <option value="">All Departments</option>
            <?php foreach ($departments as $dept): ?>
                <option value="<?= htmlspecialchars($dept) ?>"><?= htmlspecialchars($dept) ?></option>
            <?php endforeach; ?>
        </select>
        <select class="filter-select" id="roleFilter" onchange="filterEmployees()">
            <option value="">All Roles</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
        </select>
    </div>

    <div class="employee-table">
        <table>
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="employeeTableBody">
                <?php foreach ($employees as $employee): ?>
                <tr>
                    <td>
                        <div class="employee-info">
                            <div class="employee-avatar"><?= strtoupper(substr($employee['name'], 0, 1)) ?></div>
                            <div class="employee-details">
                                <h4><?= htmlspecialchars($employee['name']) ?></h4>
                                <div class="employee-id"><?= htmlspecialchars($employee['employee_id']) ?></div>
                            </div>
                        </div>
                    </td>
                    <td><?= htmlspecialchars($employee['department_name'] ?? 'N/A') ?></td>
                    <td>
                        <span class="badge <?= $employee['user_type'] ?>">
                            <?= ucfirst($employee['user_type']) ?>
                        </span>
                    </td>
                    <td><?= htmlspecialchars($employee['email']) ?></td>
                    <td>
                        <div class="actions">
                            <button class="action-btn edit-btn" onclick="editEmployee(
                                '<?= $employee['employee_id'] ?>',
                                '<?= htmlspecialchars($employee['name'], ENT_QUOTES) ?>',
                                '<?= htmlspecialchars($employee['department_name'] ?? '', ENT_QUOTES) ?>',
                                '<?= $employee['user_type'] ?>',
                                '<?= htmlspecialchars($employee['email'], ENT_QUOTES) ?>'
                            )" title="Edit">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <form method="POST" style="display:inline" onsubmit="return confirm('Are you sure you want to delete this employee?')">
                                <input type="hidden" name="delete_id" value="<?= $employee['employee_id'] ?>">
                                <button type="submit" class="action-btn delete-btn" title="Delete">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
  </div>

  <div id="employeeModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="modalTitle">Add Employee</h2>
            <button class="close" onclick="closeModal()">&times;</button>
        </div>
        <form id="employeeForm" method="POST">
            <input type="hidden" id="employeeId" name="employee_id">
            <input type="hidden" id="originalEmployeeId" name="original_employee_id">
            <div class="form-group">
                <label for="employeeName">Full Name</label>
                <input type="text" id="employeeName" name="name" required />
            </div>
            <div class="form-group">
                <label for="employeeID">Employee ID</label>
                <input type="text" id="employeeID" name="employee_id" required />
            </div>
            <div class="form-group">
                <label for="employeeDepartment">Department</label>
                <select id="employeeDepartment" name="department" required>
                    <option value="">Select Department</option>
                    <?php foreach ($departments as $dept): ?>
                        <option value="<?= htmlspecialchars($dept) ?>"><?= htmlspecialchars($dept) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group">
                <label for="employeeRole">Role</label>
                <select id="employeeRole" name="user_type" required>
                    <option value="">Select Role</option>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div class="form-group">
                <label for="employeeEmail">Email</label>
                <input type="email" id="employeeEmail" name="email" required />
            </div>
            <div class="form-group">
                <label for="employeePassword">Password</label>
                <input type="password" id="employeePassword" name="password" required />
                <small id="passwordHelp" style="display:none;"><em>*Leave blank to keep current password</em></small>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Employee</button>
            </div>
        </form>
    </div>
  </div>
</body>
</html>