<?php
if (session_status() === PHP_SESSION_NONE) 
{
    session_start();
}

require_once '../component/connection.php';

if (!isset($_SESSION['user_type'])) 
{
    header("Location: ../login.php");
    exit;
}

if ($_SESSION['user_type'] !== 'manager') 
{
    header("Location: ../login.php");
    exit;
}

$employee_id = $_SESSION['employee_id'];
$stmt = $pdo->prepare("SELECT e.*, d.name AS department_name 
                      FROM employees e 
                      JOIN departments d ON e.department_id = d.id 
                      WHERE e.employee_id = ?");
$stmt->execute([$employee_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

$initials = '';
if (!empty($user['name'])) 
{
    $names = explode(' ', $user['name']);
    $initials = strtoupper(substr($names[0], 0, 1));
    if (count($names) > 1) 
    {
        $initials .= strtoupper(substr(end($names), 0, 1));
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RetailCorp Employee Attendance System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="../css/manager_sidebar.css">
</head>
<body>
    <div class="header">
        <div class="left-header">
            <h1>Retail Corp</h1>
            <p>Manager Attendance System</p>
        </div>
        <div class="right-header">
            <div class="date" id="date"></div>
            <div class="time" id="time"></div>
        </div>
    </div>

    <label>
        <input type="checkbox" id="sidebar-toggle">
        <div class="toggle">
            <span class="top_line common"></span>
            <span class="middle_line common"></span>
            <span class="bottom_line common"></span>
        </div>

        <div class="slide">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <i class="fas fa-building"></i>
                    <span class="logo-text">RetailHQ Manager</span>
                </div>
            </div>

            <div class="profile">
                <div class="profile-img-container">
                    <div class="profile-initials"><?php echo htmlspecialchars($initials); ?></div>
                </div>
                <div class="profile-text">
                    <p class="username"><?php echo htmlspecialchars($user['name'] ?? 'User'); ?></p>
                    <p class="department"><?php echo htmlspecialchars($user['department_name'] ?? 'Department'); ?></p>
                </div>
            </div>

            <ul class="sidebar-menu">
                <li><a href="manager-dashboard.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'dashboard.php' ? 'active' : ''; ?>"><i class="fas fa-tachometer-alt"></i><span class="menu-text">Dashboard</span></a></li>
                <li><a href="attendance.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'attendance.php' ? 'active' : ''; ?>"><i class="fas fa-users"></i><span class="menu-text">Attendance Monitoring</span></a></li>
                <li><a href="shift.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'shift.php' ? 'active' : ''; ?>"><i class="fas fa-clock"></i><span class="menu-text">Shift Management</span></a></li>
                <li><a href="manager_logout.php"><i class="fas fa-sign-out-alt"></i><span class="menu-text">Logout</span></a></li>
            </ul>
        </div>
    </label>

    <script src="../js/manager_sidebar.js"></script>
</body>
</html>