<?php

if (session_status() === PHP_SESSION_NONE) session_start();
require_once '../component/connection.php';
date_default_timezone_set('Asia/Kuala_Lumpur');

if (!isset($_SESSION['user_type'])) 
{
    header("Location: ../login.php");
    exit;
}

$employee_id = $_SESSION['employee_id'];

try 
{
    $stmt = $pdo->prepare("
        SELECT e.name, e.user_type, d.name AS department_name 
        FROM employees e 
        LEFT JOIN departments d ON e.department_id = d.id 
        WHERE e.employee_id = ?
    ");
    $stmt->execute([$employee_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) 
    {
        echo "User not found.";
        exit;
    }

    $name = $user['name'];
    $user_type = $user['user_type'];
    $department = $user['department_name'];

    $initials = '';
    foreach (explode(' ', $name) as $part) 
    {
        $initials .= strtoupper($part[0]);
    }
} 
catch (PDOException $e) 
{
    echo "Error: " . $e->getMessage();
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RetailCorp Employee Attendance System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"/>
    <link rel="stylesheet" href="../css/employee_sidebar.css" />
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
            <div class="user-profile">
                <div class="user-avatar" id="userAvatar"><?php echo htmlspecialchars($initials); ?></div>
                <div class="user-info">
                    <div class="user-name" id="userName"><?php echo htmlspecialchars($name); ?></div>
                    <div class="user-position <?php echo htmlspecialchars($user_type); ?>" id="userPosition">
                        <?php echo ucfirst($user_type); ?>
                    </div>
                </div>
            </div>

            <ul>
                <li><a href="employee-dashboard.php"><i class="fa-solid fa-chart-bar"></i>Dashboard</a></li>
                <li><a href="employee_history.php"><i class="fa-solid fa-calendar-days"></i>Attendance History</a></li>
                <li><a href="employee_shift_schedule.php"><i class="fa-solid fa-business-time"></i>Shift Schedule</a></li>
                <li><a href="employee_logout.php"><i class="fa-solid fa-right-from-bracket"></i>Logout</a></li>
            </ul>
        </div>
    </label>

    <script src="../js/employee_sidebar.js"></script>
</body>
</html>
