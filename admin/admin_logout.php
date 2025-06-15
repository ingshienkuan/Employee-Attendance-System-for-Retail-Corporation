<?php
if (session_status() === PHP_SESSION_NONE) session_start();

if (isset($_GET['confirm']) && $_GET['confirm'] === 'true') 
{
    session_unset();
    session_destroy();
    header("Location: ../login.php");
    exit;
}

$userData = 
[
    'name' => $_SESSION['name'] ?? 'User',
    'position' => $_SESSION['user_type'] ?? 'Admin',
    'initials' => $_SESSION['initials'] ?? substr($_SESSION['name'] ?? 'U', 0, 1),
    'positionTitle' => $_SESSION['user_type'] ?? 'Admin'
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dashboard - Employee Attendance System</title>
  <link rel="stylesheet" href="../css/logout.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</head>
<body>
  <div id="sidebar"></div>
    <div class="modal-overlay active" id="logoutModal">
        <div class="modal-content">
            <div class="logout-icon">
                <i class="fa-solid fa-right-from-bracket"></i>
            </div>
            <h2 class="modal-title">Sign Out</h2>
            <p class="modal-message">Are you sure you want to sign out of your RetailCorp <span id="modalUserType"><?= htmlspecialchars(ucfirst($userData['position'])) ?></span> account?</p>
            
            <div class="user-info-modal">
                <div class="user-avatar-modal" id="modalUserAvatar"><?= htmlspecialchars($userData['initials']) ?></div>
                <div class="user-details-modal">
                    <div class="user-name-modal" id="modalUserName"><?= htmlspecialchars($userData['name']) ?></div>
                    <div class="user-position-modal" id="modalUserPosition"><?= htmlspecialchars(ucfirst($userData['positionTitle'])) ?></div>
                    <div class="last-login" id="lastLogin">Last login: <?= date('M j, g:i A') ?></div>
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="btn-cancel" onclick="hideLogoutModal()">
                    <i class="fa-solid fa-times"></i>
                    Cancel
                </button>
                <a href="admin_logout.php?confirm=true" class="btn-signout">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    Sign Out
                </a>
            </div>
        </div>
    </div>

  <script src="../js/sidebar.js"></script>
  <script src="../js/logout.js"></script>
  <script>
    // Pass PHP data to JavaScript
    const userData = 
    {
        name: "<?= addslashes($userData['name']) ?>",
        position: "<?= addslashes($userData['position']) ?>",
        initials: "<?= addslashes($userData['initials']) ?>",
        positionTitle: "<?= addslashes($userData['positionTitle']) ?>"
    };
  </script>
</body>
</html>