<?php
require '../component/connection.php';
if (session_status() === PHP_SESSION_NONE) session_start();


if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') 
{
  header("Location: ../login.php");
  exit;
}

$totalEmployees = 0;
$presentToday = 0;
$absentToday = 0;
$lateArrivals = 0;
$departments = [];

$today = date('Y-m-d');

$stmt = $pdo->query("SELECT COUNT(*) as total FROM employees WHERE user_type != 'admin'");
$totalEmployees = $stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COUNT(DISTINCT employee_id) as present FROM Attendance WHERE DATE(check_time) = :today AND action_type = 'check_in' AND employee_id NOT IN (SELECT employee_id FROM employees WHERE user_type = 'admin')");
$stmt->execute([':today' => $today]);
$presentToday = $stmt->fetchColumn();

$absentToday = $totalEmployees - $presentToday;

$stmt = $pdo->prepare("SELECT COUNT(DISTINCT employee_id) as late FROM Attendance WHERE DATE(check_time) = :today AND action_type = 'check_in' AND TIME(check_time) > '09:30:00' AND employee_id NOT IN (SELECT employee_id FROM employees WHERE user_type = 'admin')");
$stmt->execute([':today' => $today]);
$lateArrivals = $stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT d.name AS name, COUNT(DISTINCT e.employee_id) AS total,
                      COUNT(DISTINCT CASE WHEN DATE(a.check_time) = :today AND a.action_type = 'check_in' THEN e.employee_id END) AS present
                      FROM employees e 
                      JOIN departments d ON e.department_id = d.id
                      LEFT JOIN Attendance a ON e.employee_id = a.employee_id 
                      WHERE e.user_type != 'admin' 
                      GROUP BY d.name");

$stmt->execute([':today' => $today]);
$departmentData = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($departmentData as $dept) 
{
    $percentage = $dept['total'] > 0 ? round(($dept['present'] / $dept['total']) * 100) : 0;
    $departments[] = ['name' => $dept['name'], 'attendance' => $percentage];
}

$maxPercentage = max(array_column($departments, 'attendance'));
$maxPercentage = $maxPercentage > 0 ? $maxPercentage : 100;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dashboard - Employee Attendance System</title>
  <link rel="stylesheet" href="../css/admin-dashboard.css" />
  <script type="text/javascript" src="../js/admin-dashboard.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</head>
<body>
  <?php include 'sidebar.php'; ?>
  
  <div class="container">
    <div class="dashboard-header">
      <h1>Admin Dashboard Overview</h1>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Total Employees</div>
            <div class="card-value"><?= htmlspecialchars($totalEmployees) ?></div>
          </div>
          <div class="card-icon icon-blue">
            <i class="fa-regular fa-id-badge"></i>
          </div>
        </div>
        <div class="card-footer">
          <div class="metric-row">
            <span class="metric-label">Active today</span>
            <span class="metric-value">
              <span class="trend-up"></span>
              <?= $totalEmployees > 0 ? round(($presentToday / $totalEmployees) * 100) : 0 ?>%
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Present Today</div>
            <div class="card-value"><?= htmlspecialchars($presentToday) ?></div>
          </div>
          <div class="card-icon icon-green">
            <i class="fa-regular fa-calendar-check"></i>
          </div>
        </div>
        <div class="card-footer">
          <div class="progress-bar">
            <div class="progress-fill progress-green" style="width: <?= $totalEmployees > 0 ? round(($presentToday / $totalEmployees) * 100) : 0 ?>%"></div>
          </div>
          <div style="text-align: right; margin-top: 8px;">
            <span class="percentage-text"><?= $totalEmployees > 0 ? round(($presentToday / $totalEmployees) * 100) : 0 ?>%</span>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h2 class="chart-title">Attendance by Department</h2>
          <div class="time-filter">
            <div id="real-time-date" class="date"></div>
          </div>
        </div>

        <div class="chart-area">
          <div id="chartContent">
            <div class="chart-bars">
              <?php foreach ($departments as $dept): ?>
                <div class="bar-group">
                  <div class="bar" style="height: <?= ($dept['attendance'] / $maxPercentage) * 180 ?>px;">
                    <div class="bar-value"><?= $dept['attendance'] ?>%</div>
                  </div>
                </div>
              <?php endforeach; ?>
            </div>
            <div class="department-labels">
              <?php foreach ($departments as $dept): ?>
                <div class="department-item">
                  <div class="department-name"><?= htmlspecialchars($dept['name']) ?></div>
                  <div class="department-percentage"><?= $dept['attendance'] ?>%</div>
                </div>
              <?php endforeach; ?>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Absent Today</div>
            <div class="card-value"><?= htmlspecialchars($absentToday) ?></div>
          </div>
          <div class="card-icon icon-red">
            <i class="fa-regular fa-calendar-xmark"></i>
          </div>
        </div>
        <div class="card-footer">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span class="status-dot dot-red"></span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill progress-red" style="width: <?= $totalEmployees > 0 ? round(($absentToday / $totalEmployees) * 100) : 0 ?>%"></div>
          </div>
          <div style="text-align: right; margin-top: 8px;">
            <span class="percentage-text"><?= $totalEmployees > 0 ? round(($absentToday / $totalEmployees) * 100) : 0 ?>%</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Late Arrivals</div>
            <div class="card-value"><?= htmlspecialchars($lateArrivals) ?></div>
          </div>
          <div class="card-icon icon-yellow">
            <i class="fa-regular fa-clock"></i>
          </div>
        </div>
        <div class="card-footer">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span class="status-dot dot-yellow"></span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill progress-yellow" style="width: <?= $totalEmployees > 0 ? round(($lateArrivals / $totalEmployees) * 100) : 0 ?>%"></div>
          </div>
          <div style="text-align: right; margin-top: 8px;">
            <span class="percentage-text"><?= $totalEmployees > 0 ? round(($lateArrivals / $totalEmployees) * 100) : 0 ?>%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>