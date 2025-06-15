<?php
require 'component/connection.php';
session_start();

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') 
{
    $email = trim($_POST['email'] ?? '');
    $otp = trim($_POST['otp'] ?? '');
    $generated_otp = trim($_POST['generated_otp'] ?? '');

    if (empty($email) || empty($otp)) 
    {
        $error = 'Please fill in both fields.';
    } 
    else 
    {
        if ($otp !== $generated_otp) 
        {
            $error = 'Invalid OTP. Please try again.';
        } 
        else 
        {
            $stmt = $pdo->prepare("SELECT employee_id FROM employees WHERE email = ?");
            $stmt->execute([$email]);
            $employee = $stmt->fetch();

            if ($employee) 
            {
                $_SESSION['reset_employee_id'] = $employee['employee_id'];
                header("Location: reset-password.php");
                exit;
            } 
            else 
            {
                $error = 'Email not found in the system.';
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password - Employee Management System</title>
    <link rel="stylesheet" href="css/forgot-password.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script type="text/javascript" src="https://cdn.emailjs.com/dist/email.min.js"></script>
</head>
<body>
    <div class="forgot-password-container">
        <div class="forgot-password-form">
            <div class="forgot-password-header">
                <h1>Forgot Password</h1>
            </div>

            <form method="POST" action="forgot-password.php" id="otpForm">
                <div class="form-group">
                    <label for="email">Enter your email address</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" required>
                </div>

                <div class="form-group">
                    <label for="otp">OTP Code</label>
                    <input type="hidden" id="generated_otp" name="generated_otp">
                    <div class="otp-input-container">
                        <div class="otp-wrapper">
                            <input type="text" id="otp" name="otp" placeholder="Enter OTP" required>
                            <button type="button" class="otp-send-btn" id="sendOtpBtn">Send</button>
                        </div>

                    </div>
            </div>

                <button type="submit" class="btn btn-primary">Validate OTP</button>

                <?php if ($error): ?>
                    <div class="error-message"><?= htmlspecialchars($error) ?></div>
                <?php endif; ?>

                <?php if ($success): ?>
                    <div class="success-message"><?= htmlspecialchars($success) ?></div>
                <?php endif; ?>
            </form>
        </div>
    </div>

    <script src="js/reset-password.js"></script>
</body>
</html>