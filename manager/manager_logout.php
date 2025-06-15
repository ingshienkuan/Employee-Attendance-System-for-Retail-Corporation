<?php
session_start();
require_once '../component/connection.php';
date_default_timezone_set('Asia/Kuala_Lumpur');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'manager') 
{
    header("Location: ../login.php");
    exit;
}

if (isset($_GET['confirm']) && $_GET['confirm'] === 'true') 
{
    session_unset();
    session_destroy();
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

$userData = 
[
    'name' => $user['name'] ?? 'User',
    'position' => $_SESSION['user_type'] ?? 'Manager',
    'department' => $user['department_name'] ?? 'Department',
    'initials' => isset($user['name']) ? getInitials($user['name']) : 'JD',
    'last_login' => $_SESSION['last_login'] ?? date('M j, g:i A')
];

function getInitials($name) 
{
    $names = explode(' ', $name);
    $initials = '';
    foreach ($names as $n) 
    {
        $initials .= strtoupper(substr($n, 0, 1));
    }
    return substr($initials, 0, 2);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logout - RetailCorp Employee Attendance System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="../css/manager_logout.css">
</head>
<body>
    <?php include 'manager_sidebar.php'; ?>
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

    <div class="main-content">
        <div class="logout-container">
            <div class="logout-card">
                <div class="logout-icon">
                    <i class="fas fa-sign-out-alt"></i>
                </div>
                <h2>Sign Out</h2>
                <p class="logout-message">
                    Are you sure you want to sign out of your RetailCorp Manager account?
                </p>
                <div class="user-info">
                    <div class="user-avatar">
                        <div class="avatar-initials"><?= htmlspecialchars($userData['initials']) ?></div>
                    </div>
                    <div class="user-details">
                        <p class="user-name"><?= htmlspecialchars($userData['name']) ?></p>
                        <p class="user-role"><?= htmlspecialchars($userData['department']) ?> Manager</p>
                        <p class="last-login">Last login: <span id="last-login-time"><?= htmlspecialchars($userData['last_login']) ?></span></p>
                    </div>
                </div>
                <div class="logout-actions">
                    <button class="btn btn-cancel" id="cancel-btn">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                    <a href="manager_logout.php?confirm=true" class="btn btn-logout" id="logout-btn">
                        <i class="fas fa-sign-out-alt"></i>
                        Sign Out
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="loading-overlay" id="loading-screen">
        <div class="loading-content">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>Signing out...</p>
        </div>
    </div>

    <script src="../js/manager_sidebar.js"></script>
    <script src="../js/manager_logout.js"></script>
    <script>
        const userData = 
        {
            name: "<?= addslashes($userData['name']) ?>",
            position: "<?= addslashes($userData['position']) ?>",
            department: "<?= addslashes($userData['department']) ?>",
            initials: "<?= addslashes($userData['initials']) ?>",
            lastLogin: "<?= addslashes($userData['last_login']) ?>"
        };
    </script>
</body>
</html>