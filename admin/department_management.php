<?php
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
        $id = $_POST['delete_id'];
        
        try 
        {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees WHERE department_id = ?");
            $stmt->execute([$id]);
            $employeeCount = $stmt->fetchColumn();
            
            if ($employeeCount > 0) 
            {
                $error = "Cannot delete department with employees. Please reassign or remove employees first.";
            } 
            else 
            {
                $stmt = $pdo->prepare("DELETE FROM departments WHERE id = ?");
                $stmt->execute([$id]);
                $success = "Department deleted successfully";
            }
        } 
        catch (PDOException $e) 
        {
            $error = "Error deleting department: " . $e->getMessage();
        }
    } 
    else 
    {
        $id = $_POST['id'] ?? null;
        $name = $_POST['name'];
        $description = $_POST['description'];
        $shiftRequired = isset($_POST['shift_required']) ? 1 : 0;
        $manager = $_POST['manager'] ?? null;
        
        try 
        {
            if (!empty($manager)) 
            {
                $stmt = $pdo->prepare("SELECT d.id, d.name 
                                      FROM departments d
                                      JOIN employees e ON d.id = e.department_id
                                      WHERE e.name = ? AND e.user_type = 'manager'");
                $stmt->execute([$manager]);
                $existingAssignment = $stmt->fetch();
                
                if ($existingAssignment && (empty($id) || $existingAssignment['id'] != $id)) 
                {
                    $error = "Manager is already assigned to the " . htmlspecialchars($existingAssignment['name']) . " department";
                    throw new Exception($error);
                }
            }

            if (!empty($id)) 
            {
                $stmt = $pdo->prepare("UPDATE departments SET name = ?, description = ?, shift_required = ? WHERE id = ?");
                $stmt->execute([$name, $description, $shiftRequired, $id]);
                
               
                if (!empty($manager)) 
                {
                    $stmt = $pdo->prepare("UPDATE employees SET department_id = NULL WHERE department_id = ? AND user_type = 'manager'");
                    $stmt->execute([$id]);
        
                    $stmt = $pdo->prepare("UPDATE employees SET department_id = ? WHERE name = ? AND user_type = 'manager'");
                    $stmt->execute([$id, $manager]);
                }
                else
                {
                    $stmt = $pdo->prepare("UPDATE employees SET department_id = NULL WHERE department_id = ? AND user_type = 'manager'");
                    $stmt->execute([$id]);
                }
                
                $success = "Department updated successfully";
            } 
            else
            {
                $stmt = $pdo->prepare("INSERT INTO departments (name, description, shift_required) VALUES (?, ?, ?)");
                $stmt->execute([$name, $description, $shiftRequired]);
                $id = $pdo->lastInsertId();
                
                if (!empty($manager)) 
                {
                    $stmt = $pdo->prepare("UPDATE employees SET user_type = 'manager' WHERE name = ? AND department_id = ?");
                    $stmt->execute([$manager, $id]);
                }
                
                $success = "Department added successfully";
            }
        } 
        catch (Exception $e) 
        {
            if (!isset($error)) 
            {
                $error = "Error saving department: " . $e->getMessage();
            }
        }
    }
}

$stmt = $pdo->prepare("SELECT d.*, COUNT(e.employee_id) as employee_count, 
                       GROUP_CONCAT(CASE WHEN e.user_type = 'manager' THEN e.name END) as manager_name
                       FROM departments d
                       LEFT JOIN employees e ON d.id = e.department_id
                       GROUP BY d.id");
$stmt->execute();
$departments = $stmt->fetchAll(PDO::FETCH_ASSOC);

$managerStmt = $pdo->prepare("SELECT name FROM employees WHERE user_type = 'manager'");
$managerStmt->execute();
$managers = $managerStmt->fetchAll(PDO::FETCH_COLUMN);

$showModal = isset($_GET['edit']) || isset($_GET['add']);
$editId = $_GET['edit'] ?? null;

$currentDept = null;
if ($editId) 
{
    $key = array_search($editId, array_column($departments, 'id'));
    if ($key !== false) 
    {
        $currentDept = $departments[$key];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Department Management- Employee Attendance System</title>
  <link rel="stylesheet" href="../css/department_management.css" />
  <!-- Font Awesome CDN for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</head>

<body>
  <?php include 'sidebar.php'; ?>
  
  <div class="container">
    <?php if (isset($success)): ?>
      <div class="alert success"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>
    <?php if (isset($error)): ?>
      <div class="alert error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <div class="department_management-header">
      <h1>Department Management</h1>
      <button class="add-department-btn" onclick="window.location.href='?add=1'">
        + Add Department
      </button>
    </div>

    <div class="departments-grid" id="departmentsGrid">
      <?php foreach ($departments as $dept): 
        $manager = !empty($dept['manager_name']) ? $dept['manager_name'] : null;
      ?>
      <div class="department-card">
        <div class="department-header">
          <h3 class="department-title"><?= htmlspecialchars($dept['name']) ?></h3>
          <div class="department-actions">
            <button class="action-btn edit-btn" onclick="window.location.href='?edit=<?= $dept['id'] ?>'" title="Edit Department">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <form method="post" style="display:inline;">
              <input type="hidden" name="delete_id" value="<?= $dept['id'] ?>">
              <button type="submit" class="action-btn delete-btn" title="Delete Department" onclick="return confirm('Are you sure you want to delete this department?')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </form>
          </div>
        </div>
        <p class="department-description"><?= htmlspecialchars($dept['description'] ?? 'No description') ?></p>
        <div class="department-info">
          <div class="info-row">
            <span class="info-label">Manager:</span>
            <span class="info-value <?= !$manager ? 'no-manager' : '' ?>">
              <?= $manager ? htmlspecialchars($manager) : 'Not Assigned' ?>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Employees:</span>
            <span class="employee-count">
              <?= $dept['employee_count'] ?> Employee<?= $dept['employee_count'] != 1 ? 's' : '' ?>
            </span>
          </div>
        </div>
        <?php if ($dept['shift_required']): ?>
          <span class="shift-required">Requires Shift Work</span>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>
  </div>

  <!-- Add/Edit Department Modal -->
  <div id="departmentModal" class="modal" style="<?= $showModal ? 'display: block;' : 'display: none;' ?>">
    <div class="modal-content">
      <div class="modal-header">
        <h2 id="modalTitle"><?= $editId ? 'Edit Department' : 'Add Department' ?></h2>
        <button class="close" onclick="window.location.href='?'">&times;</button>
      </div>
      <form method="post">
        <input type="hidden" name="id" value="<?= $editId ?>">
        <div class="form-group">
          <label for="departmentName">Department Name</label>
          <input type="text" id="departmentName" name="name" value="<?= htmlspecialchars($currentDept['name'] ?? '') ?>" required>
        </div>
        <div class="form-group">
          <label for="departmentDescription">Description</label>
          <textarea id="departmentDescription" name="description" placeholder="Describe the department's responsibilities..." required><?= htmlspecialchars($currentDept['description'] ?? '') ?></textarea>
        </div>
        <div class="form-group">
          <label for="departmentManager">Manager</label>
          <select id="departmentManager" name="manager">
            <option value="">No Manager Assigned</option>
            <?php foreach ($managers as $manager): ?>
              <option value="<?= htmlspecialchars($manager) ?>" <?= ($currentDept['manager_name'] ?? null) === $manager ? 'selected' : '' ?>>
                <?= htmlspecialchars($manager) ?>
              </option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="form-group">
          <div class="checkbox-group">
            <input type="checkbox" id="shiftRequired" name="shift_required" <?= ($currentDept['shift_required'] ?? false) ? 'checked' : '' ?>>
            <label for="shiftRequired">Requires Shift Work</label>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="window.location.href='?'">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Department</button>
        </div>
      </form>
    </div>
  </div>

  <script src="../js/department_management.js"></script>
  <script src="../js/sidebar.js"></script>
</body>
</html>