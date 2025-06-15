<?php
session_start();
require_once '../component/connection.php';
date_default_timezone_set('Asia/Kuala_Lumpur');

if (isset($_GET['logout'])) 
{
    $_SESSION = array();

    session_destroy();

    header("Location: ../login.php");
    exit();
}

if (!isset($_SESSION['user_type'])) 
{
    header("Location: ../login.php");
    exit;
}

$stmt = $pdo->prepare("SELECT e.*, d.name AS department_name, s.shift_name 
                      FROM employees e 
                      LEFT JOIN departments d ON e.department_id = d.id 
                      LEFT JOIN shifts s ON e.shift_id = s.shift_id 
                      WHERE e.employee_id = ?");
$stmt->execute([$_SESSION['employee_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

$initials = '';
if (!empty($user['name'])) 
{
    $names = explode(' ', $user['name']);
    foreach ($names as $name) {
        $initials .= strtoupper(substr($name, 0, 1));
    }
    $initials = substr($initials, 0, 2);
}

$lastLogin = isset($_SESSION['last_login']) ? $_SESSION['last_login'] : date('M j, g:i A');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Attendance Record- Employee Attendance System</title>
  <link rel="stylesheet" href="../css/employee_logout.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</head>

<body>
  <?php include 'employee_sidebar.php'; ?>
  <div class="modal-overlay active" id="logoutModal">
    <div class="modal-content">
      <div class="logout-icon">
        <i class="fa-solid fa-right-from-bracket"></i>
      </div>
      <h2 class="modal-title">Sign Out</h2>
      <p class="modal-message">Are you sure you want to sign out of your RetailCorp <span id="modalUserType"><?php echo htmlspecialchars(ucfirst($user['user_type'] ?? 'User')); ?></span> account?</p>
      
      <div class="user-info-modal">
        <div class="user-avatar-modal" id="modalUserAvatar"><?php echo htmlspecialchars($initials); ?></div>
        <div class="user-details-modal">
          <div class="user-name-modal" id="modalUserName"><?php echo htmlspecialchars($user['name'] ?? 'User'); ?></div>
          <div class="user-position-modal" id="modalUserPosition"><?php 
            if (isset($user['department_name'])) 
            {
              echo htmlspecialchars(ucfirst($user['user_type'])) . ' - ' . htmlspecialchars($user['department_name']);
            } 
            else 
            {
              echo htmlspecialchars(ucfirst($user['user_type'] ?? 'User'));
            }
          ?></div>
          <div class="last-login" id="lastLogin">Last login: <?php echo htmlspecialchars($lastLogin); ?></div>
        </div>
      </div>
      
      <div class="modal-buttons">
        <button class="btn-cancel" onclick="hideLogoutModal()">
          <i class="fa-solid fa-times"></i>
          Cancel
        </button>
        <button class="btn-signout" onclick="signOut()">
          <i class="fa-solid fa-right-from-bracket"></i>
          Sign Out
        </button>
      </div>
    </div>
  </div>

  <script>
    const currentUser = 
    {
      name: "<?php echo addslashes($user['name'] ?? 'User'); ?>",
      position: "<?php echo addslashes($user['user_type'] ?? 'user'); ?>",
      initials: "<?php echo addslashes($initials); ?>",
      positionTitle: "<?php echo addslashes($user['department_name'] ?? ucfirst($user['user_type'] ?? 'User')); ?>"
    };
    const logoutUrl = "employee_logout.php?logout=true";
  </script>
  <script src="../js/employee_logout.js"></script>
  <script src="../js/employee_sidebar.js"></script>
</body>
</html>