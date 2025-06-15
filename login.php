<?php
session_start();
require 'component/connection.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{
    $employeeId = $_POST['employee_id'] ?? '';
    $password = $_POST['password'] ?? '';
    $userType = $_POST['user_type'] ?? '';

    if ($employeeId && $password && $userType) 
    {
        $stmt = $pdo->prepare("SELECT * FROM employees WHERE employee_id = ? AND user_type = ?");
        $stmt->execute([$employeeId, $userType]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && $user['password_hash'] === md5($password))
        {
            $_SESSION['employee_id'] = $user['employee_id'];
            $_SESSION['user_type'] = $user['user_type'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['department'] = $user['department'];
            
            $nameParts = explode(' ', $user['name']);
            $_SESSION['initials'] = strtoupper
            (
                substr($nameParts[0], 0, 1) . 
                (count($nameParts) > 1 ? substr(end($nameParts), 0, 1) : '')
            );

            switch ($user['user_type']) 
            {
                case 'admin':
                    header("Location: admin/admin-dashboard.php");
                    exit;
                case 'manager':
                    header("Location: manager/manager-dashboard.php");
                    exit;
                case 'employee':
                    header("Location: employee/employee-dashboard.php");
                    exit;
            }
        } 
        else 
        {
            $error = 'Invalid login credentials or user type.';
        }
    } 
    else 
    {
        $error = 'Please fill in all fields.';
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Attendance System</title>
    <link rel="stylesheet" href="css/login.css">
    <script type="text/javascript" src="js/login.js"></script>
</head>
<body>
<div class="login-link">
    <a href="clocking.php">Back to Clocking</a>
</div>

<div class="login-container">
    <div class="login-form">
        <div class="login-header">
            <h1>Login</h1>
        </div>

        <form method="POST" action="login.php">
            <div class="form-group">
                <label for="employee_id">Staff ID</label>
                <input type="text" id="employee_id" name="employee_id" placeholder="Enter your ID" required>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <div class="password-wrapper">
                    <input type="password" id="password" name="password" placeholder="Enter your password" required>
                    <span class="toggle-password" onclick="togglePasswordVisibility(event)">&#128274;</span>
                </div>
            </div>

            <div class="form-group">
                <label for="user_type">User Type</label>
                <select id="user_type" name="user_type" required>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <button type="submit" class="btn btn-primary">Login</button>

            <div class="forgot-password">
                <a href="forgot-password.php">Forgot Password?</a>
            </div>

            <?php if ($error): ?>
                <div id="error-message" class="error-message"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
        </form>
    </div>
</div>
</body>
</html>