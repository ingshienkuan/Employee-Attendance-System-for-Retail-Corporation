<?php
if (session_status() === PHP_SESSION_NONE) session_start();

if (!isset($_SESSION['user_type'])) 
{
    header("Location: ../login.php");
    exit;
}

$positionClass = strtolower($_SESSION['user_type']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RetailCorp Employee Attendance System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"/>
    <link rel="stylesheet" href="../css/sidebar.css" />
    <script type="text/javascript" src="../css/sidebar.js"></script>
</head>
<body>
    <div class="header">
        <div class="left-header">
            <h1>Retail Corp</h1>
            <p>Employee Attendance System</p>
        </div>
        <div class="right-header">
            <div class="date" id="date"></div>
            <div class="time" id="time"></div>
        </div>
    </div>

    <label>
        <input type="checkbox" />
        <div class="toggle">
            <span class="top_line common"></span>
            <span class="middle_line common"></span>
            <span class="bottom_line common"></span>
        </div>

        <div class="slide">
            <h1>Retail Corp</h1>
            <p>Employee Attendance System</p>

            <div class="user-profile">
                <div class="user-avatar"><?= htmlspecialchars($_SESSION['initials'] ?? substr($_SESSION['name'], 0, 2)) ?></div>
                <div class="user-info">
                    <div class="user-name"><?= htmlspecialchars($_SESSION['name']) ?></div>
                    <div class="user-position <?= $positionClass ?>">
                        <?= htmlspecialchars(ucfirst($_SESSION['user_type'])) ?>
                    </div>
                </div>
            </div>

            <ul>
                <?php if ($_SESSION['user_type'] === 'admin'): ?>
                    <li><a href="admin-dashboard.php"><i class="fa-solid fa-chart-bar"></i>Dashboard</a></li>
                    <li><a href="employee_management.php"><i class="fa-solid fa-users"></i>Employee Management</a></li>
                    <li><a href="department_management.php"><i class="fa-solid fa-building"></i>Department Management</a></li>
                <?php elseif ($_SESSION['user_type'] === 'manager'): ?>
                    <li><a href="manager-dashboard.php"><i class="fa-solid fa-chart-bar"></i>Dashboard</a></li>
                <?php else: ?>
                    <li><a href="employee-dashboard.php"><i class="fa-solid fa-chart-bar"></i>Dashboard</a></li>
                <?php endif; ?>
                <li><a href="attendance_record.php"><i class="fa-solid fa-calendar-days"></i>Attendance Record</a></li>
                <li><a href="admin_logout.php"><i class="fa-solid fa-right-from-bracket"></i>Logout</a></li>
            </ul>
        </div>
    </label>
    
</body>
</html>