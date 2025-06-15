<?php
require 'component/connection.php';
session_start();

$error = '';
$success = '';

$employeeId = $_SESSION['reset_employee_id'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';

    if ($newPassword && $confirmPassword) 
    {
        if ($newPassword !== $confirmPassword) 
        {
            $error = 'Passwords do not match.';
        } 
        elseif (!$employeeId) 
        {
            $error = 'Invalid or missing employee ID.';
        } 
        else 
        {
            $hashedPassword = md5($newPassword); 

            $stmt = $pdo->prepare("UPDATE employees SET password_hash = ? WHERE employee_id = ?");
            if ($stmt->execute([$hashedPassword, $employeeId])) 
            {
                $success = 'Password successfully updated. You may now <a href="login.php">login</a>.';
            } 
            else 
            {
                $error = 'Failed to update password.';
            }
        }
    } 
    else 
    {
        $error = 'Please fill in all fields.';
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Employee Management System</title>
    <link rel="stylesheet" href="css/reset-password.css">
</head>
<body>
    <div class="reset-password-container">
        <div class="reset-password-form">
            <div class="reset-password-header">
                <h1>Reset Password</h1>
            </div>

            <form method="POST" action="">
                <div class="form-group">
                    <label for="new-password">Enter new password</label>
                    <div class="password-wrapper">
                        <input type="password" id="new-password" name="new_password" required>
                        <span class="toggle-password" onclick="togglePasswordVisibility_1(event)">&#128274;</span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirm-password">Confirm new password</label>
                    <div class="password-wrapper">
                        <input type="password" id="confirm-password" name="confirm_password" required>
                        <span class="toggle-password" onclick="togglePasswordVisibility_2(event)">&#128274;</span>
                    </div>
                </div>

                <button class="btn btn-primary" type="submit">Submit New Password</button>
            </form>

            <?php if ($error): ?>
                <div id="error-message" class="error-message"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div id="success-message" class="success-message"><?= $success ?></div>
            <?php endif; ?>
        </div>
    </div>
    <script src="js/reset-password.js"></script>
</body>
</html>
