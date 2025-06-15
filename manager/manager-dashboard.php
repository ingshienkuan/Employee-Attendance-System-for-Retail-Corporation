<?php
session_start();
require_once '../component/connection.php';
date_default_timezone_set('Asia/Kuala_Lumpur');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'manager')
{
    header("Location: ../login.php");
    exit;
}

$manager_id = $_SESSION['employee_id'];
$stmt = $pdo->prepare("SELECT e.department_id, d.shift_required 
                      FROM employees e 
                      JOIN departments d ON e.department_id = d.id 
                      WHERE e.employee_id = ?");
$stmt->execute([$manager_id]);
$manager_dept = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$manager_dept)
{
    die("Error: Manager department not found");
}

$manager_dept_id = $manager_dept['department_id'];
$shift_required = $manager_dept['shift_required'];

$stmt = $pdo->prepare("SELECT name FROM departments WHERE id = ?");
$stmt->execute([$manager_dept_id]);
$manager_department = $stmt->fetchColumn();

function getDashboardStats($pdo, $manager_dept_id, $shift_required)
{
    $stats = [];
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees 
                          WHERE user_type = 'employee' 
                          AND department_id = ?");
    $stmt->execute([$manager_dept_id]);
    $stats['total_employees'] = $stmt->fetchColumn();
    
    $today = date('Y-m-d');
    $dayOfWeek = date('N');
    
    if ($shift_required)
    {
        $stmt = $pdo->prepare("SELECT COUNT(DISTINCT a.employee_id) 
                              FROM Attendance a
                              JOIN employees e ON a.employee_id = e.employee_id
                              WHERE DATE(a.check_time) = ? 
                              AND e.user_type = 'employee'
                              AND e.department_id = ?
                              AND a.action_type = 'check_in'");
        $stmt->execute([$today, $manager_dept_id]);
        $stats['present'] = $stmt->fetchColumn();
        
        $stmt = $pdo->prepare("SELECT COUNT(*) 
                              FROM employees e
                              WHERE e.user_type = 'employee'
                              AND e.department_id = ?
                              AND e.employee_id NOT IN (
                                  SELECT DISTINCT a.employee_id 
                                  FROM Attendance a 
                                  WHERE DATE(a.check_time) = ?
                                  AND a.action_type = 'check_in'
                              )");
        $stmt->execute([$manager_dept_id, $today]);
        $stats['absent'] = $stmt->fetchColumn();
        
        $stmt = $pdo->prepare("SELECT COUNT(DISTINCT a.employee_id)
                              FROM Attendance a
                              JOIN employees e ON a.employee_id = e.employee_id
                              JOIN shifts s ON e.shift_id = s.shift_id
                              WHERE DATE(a.check_time) = ?
                              AND a.action_type = 'check_in'
                              AND TIME(a.check_time) > ADDTIME(s.start_time, '00:20:00')
                              AND e.user_type = 'employee'
                              AND e.department_id = ?");
        $stmt->execute([$today, $manager_dept_id]);
        $stats['late'] = $stmt->fetchColumn();
    }
    else
    {
        if ($dayOfWeek >= 1 && $dayOfWeek <= 5) 
        {
            $stmt = $pdo->prepare("SELECT COUNT(DISTINCT a.employee_id) 
                                  FROM Attendance a
                                  JOIN employees e ON a.employee_id = e.employee_id
                                  WHERE DATE(a.check_time) = ? 
                                  AND e.user_type = 'employee'
                                  AND e.department_id = ?
                                  AND a.action_type = 'check_in'");
            $stmt->execute([$today, $manager_dept_id]);
            $stats['present'] = $stmt->fetchColumn();
            
            $stmt = $pdo->prepare("SELECT COUNT(*) 
                                  FROM employees e
                                  WHERE e.user_type = 'employee'
                                  AND e.department_id = ?
                                  AND e.employee_id NOT IN (
                                      SELECT DISTINCT a.employee_id 
                                      FROM Attendance a 
                                      WHERE DATE(a.check_time) = ?
                                      AND a.action_type = 'check_in'
                                  )");
            $stmt->execute([$manager_dept_id, $today]);
            $stats['absent'] = $stmt->fetchColumn();
            
            $stmt = $pdo->prepare("SELECT COUNT(DISTINCT a.employee_id)
                                  FROM Attendance a
                                  JOIN employees e ON a.employee_id = e.employee_id
                                  WHERE DATE(a.check_time) = ?
                                  AND a.action_type = 'check_in'
                                  AND TIME(a.check_time) > '09:20:00'
                                  AND e.user_type = 'employee'
                                  AND e.department_id = ?");
            $stmt->execute([$today, $manager_dept_id]);
            $stats['late'] = $stmt->fetchColumn();
        }
        else
        {
            $stats['present'] = 0;
            $stats['absent'] = 0;
            $stats['late'] = 0;
        }
    }
    
    $stats['leave'] = 0;
    
    return $stats;
}

function getRecentActivities($pdo, $manager_dept_id, $shift_required)
{
    $activities = [];  
    $today = date('Y-m-d');
    
    if ($shift_required)
    {
        $stmt = $pdo->prepare("SELECT a.*, e.name, s.start_time
                              FROM Attendance a
                              JOIN employees e ON a.employee_id = e.employee_id
                              JOIN shifts s ON e.shift_id = s.shift_id
                              WHERE DATE(a.check_time) = ?
                              AND a.action_type = 'check_in'
                              AND TIME(a.check_time) > ADDTIME(s.start_time, '00:20:00')
                              AND e.user_type = 'employee'
                              AND e.department_id = ?
                              ORDER BY a.check_time DESC
                              LIMIT 5");
        $stmt->execute([$today, $manager_dept_id]);
        $lateArrivals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    else
    {
        $stmt = $pdo->prepare("SELECT a.*, e.name
                              FROM Attendance a
                              JOIN employees e ON a.employee_id = e.employee_id
                              WHERE DATE(a.check_time) = ?
                              AND a.action_type = 'check_in'
                              AND TIME(a.check_time) > '09:20:00'
                              AND e.user_type = 'employee'
                              AND e.department_id = ?
                              ORDER BY a.check_time DESC
                              LIMIT 5");
        $stmt->execute([$today, $manager_dept_id]);
        $lateArrivals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    foreach ($lateArrivals as $arrival)
    {
        $initials = getInitials($arrival['name']);
        $lateTime = new DateTime($arrival['check_time']);
        
        if ($shift_required)
        {
            $shiftStart = new DateTime($arrival['start_time']);
            $lateMinutes = $shiftStart->diff($lateTime)->i;
            $details = 'Clocked in at ' . date('g:i A', strtotime($arrival['check_time'])) . 
                      " ($lateMinutes min late)";
        }
        else
        {
            $standardStart = new DateTime('09:00:00');
            $lateMinutes = $standardStart->diff($lateTime)->i;
            $details = 'Clocked in at ' . date('g:i A', strtotime($arrival['check_time'])) . 
                      " ($lateMinutes min late)";
        }
        
        $activities[] = 
        [
            'type' => 'late',
            'user' => $arrival['name'],
            'action' => 'arrived late',
            'details' => $details,
            'time' => 'Today',
            'avatar' => $initials
        ];
    }
    
    return array_slice($activities, 0, 5); 
}

function getTodaysSchedule($pdo, $manager_dept_id, $shift_required)
{
    $schedule = [];
    $today = date('Y-m-d');
    $dayOfWeek = date('N');
    
    if ($shift_required)
    {
        $stmt = $pdo->prepare("SELECT 
                              s.shift_name, 
                              s.start_time, 
                              s.end_time,
                              COUNT(e.employee_id) as scheduled,
                              SUM(CASE WHEN a.employee_id IS NOT NULL THEN 1 ELSE 0 END) as present,
                              SUM(CASE WHEN a.employee_id IS NULL THEN 1 ELSE 0 END) as absent,
                              SUM(CASE WHEN TIME(a.check_time) > ADDTIME(s.start_time, '00:20:00') THEN 1 ELSE 0 END) as late
                              FROM shifts s
                              LEFT JOIN employees e ON s.shift_id = e.shift_id 
                                AND e.user_type = 'employee' 
                                AND e.department_id = ?
                              LEFT JOIN Attendance a ON e.employee_id = a.employee_id 
                                AND DATE(a.check_time) = CURDATE() 
                                AND a.action_type = 'check_in'
                              GROUP BY s.shift_id");
        $stmt->execute([$manager_dept_id]);
        $shifts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    else
    {
        if ($dayOfWeek >= 1 && $dayOfWeek <= 5)
        {
            $shifts = [
                [
                    'shift_name' => 'Standard Hours',
                    'start_time' => '09:00:00',
                    'end_time' => '17:00:00',
                    'scheduled' => 0,
                    'present' => 0,
                    'absent' => 0,
                    'late' => 0
                ]
            ];
            
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM employees 
                                  WHERE user_type = 'employee' 
                                  AND department_id = ?");
            $stmt->execute([$manager_dept_id]);
            $total_employees = $stmt->fetchColumn();
            
            $stmt = $pdo->prepare("SELECT COUNT(DISTINCT a.employee_id) 
                                  FROM Attendance a
                                  JOIN employees e ON a.employee_id = e.employee_id
                                  WHERE DATE(a.check_time) = ? 
                                  AND e.user_type = 'employee'
                                  AND e.department_id = ?
                                  AND a.action_type = 'check_in'");
            $stmt->execute([$today, $manager_dept_id]);
            $present = $stmt->fetchColumn();
            
            $stmt = $pdo->prepare("SELECT COUNT(DISTINCT a.employee_id)
                                  FROM Attendance a
                                  JOIN employees e ON a.employee_id = e.employee_id
                                  WHERE DATE(a.check_time) = ?
                                  AND a.action_type = 'check_in'
                                  AND TIME(a.check_time) > '09:20:00'
                                  AND e.user_type = 'employee'
                                  AND e.department_id = ?");
            $stmt->execute([$today, $manager_dept_id]);
            $late = $stmt->fetchColumn();
            
            $shifts[0]['scheduled'] = $total_employees;
            $shifts[0]['present'] = $present;
            $shifts[0]['absent'] = $total_employees - $present;
            $shifts[0]['late'] = $late;
        }
        else
        {
            $shifts = [];
        }
    }
    
    foreach ($shifts as $shift)
    {
        $schedule[] = 
        [
            'shift' => $shift['shift_name'],
            'time' => date('H:i', strtotime($shift['start_time'])) . ' - ' . 
                     date('H:i', strtotime($shift['end_time'])),
            'scheduled' => $shift['scheduled'],
            'present' => $shift['present'],
            'absent' => $shift['absent'],
            'late' => $shift['late']
        ];
    }
    
    return $schedule;
}

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

$stats = getDashboardStats($pdo, $manager_dept_id, $shift_required);
$activities = getRecentActivities($pdo, $manager_dept_id, $shift_required);
$schedule = getTodaysSchedule($pdo, $manager_dept_id, $shift_required);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RetailHQ Manager - Dashboard</title>
    <link rel="stylesheet" href="../css/manager_sidebar.css">
    <link rel="stylesheet" href="../css/manager-dashboard.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">

    <?php include 'manager_sidebar.php'; ?>

    <div class="main-content">
        <div class="top-bar">
            <h1>Dashboard</h1>   
        </div>

        <div class="department-header">
            <h2>Department Overview</h2>
            <span class="total-employees">Total Employees: <?php echo $stats['total_employees']; ?></span>
        </div>

        <div class="department-overview">
            <div class="overview-card present">
                <div class="card-icon">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="card-content">
                    <div class="card-title">Present Today</div>
                    <div class="card-number" id="presentCount"><?php echo $stats['present']; ?></div>
                    <div class="card-percentage">+ 2%</div>
                </div>
            </div>
            <div class="overview-card absent">
                <div class="card-icon">
                    <i class="fas fa-user-times"></i>
                </div>
                <div class="card-content">
                    <div class="card-title">Absent Today</div>
                    <div class="card-number" id="absentCount"><?php echo $stats['absent']; ?></div>
                    <div class="card-percentage">+ 1%</div>
                </div>
            </div>
            <div class="overview-card late">
                <div class="card-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="card-content">
                    <div class="card-title">Late Arrivals</div>
                    <div class="card-number" id="lateCount"><?php echo $stats['late']; ?></div>
                    <div class="card-percentage">- 0%</div>
                </div>
            </div>
            <div class="overview-card leave">
                <div class="card-icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="card-content">
                    <div class="card-title">On Leave</div>
                    <div class="card-number" id="leaveCount"><?php echo $stats['leave']; ?></div>
                    <div class="card-percentage">- 0%</div>
                </div>
            </div>
        </div>

        <div class="recent-activities-full">
            <div class="section-header">
                <h3>Recent Activities</h3>
                <a href="#" class="view-all">View All</a>
            </div>
            <div class="activities-list" id="activitiesList">
                <?php foreach ($activities as $activity): ?>
                <div class="activity-item">
                    <div class="activity-avatar <?php echo strtolower(substr($activity['avatar'], 0, 1)); ?>">
                        <?php echo $activity['avatar']; ?>
                    </div>
                    <div class="activity-content">
                        <div class="activity-main">
                            <strong><?php echo $activity['user']; ?></strong> <?php echo $activity['action']; ?>
                        </div>
                        <div class="activity-details"><?php echo $activity['details']; ?></div>
                    </div>
                    <div class="activity-time"><?php echo $activity['time']; ?></div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="attendance-reports-section">
            <div class="reports-header">
                <div class="reports-title">
                    <i class="fas fa-chart-line"></i>
                    <h2>Attendance Reports</h2>
                </div>
                <p class="reports-subtitle">Generate and view detailed attendance reports for your team</p>
            </div>

            <div class="report-filters-card">
                <div class="filters-header">
                    <i class="fas fa-filter"></i>
                    <h3>Report Filters</h3>
                </div>
                
                <div class="filters-grid">
                    <div class="filter-group">
                        <label for="reportType">Report Type</label>
                        <select id="reportType" class="filter-select">
                            <option value="daily">Daily Report</option>
                            <option value="weekly">Weekly Report</option>
                            <option value="monthly">Monthly Report</option>
                            <option value="custom">Custom Report</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="department">Department</label>
                        <select id="department" class="filter-select">
                            <option value="">All Departments</option>
                            <?php foreach ($departments as $dept): ?>
                            <option value="<?php echo htmlspecialchars($dept); ?>"><?php echo htmlspecialchars($dept); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="fromDate">From Date</label>
                        <input type="date" id="fromDate" class="filter-input" value="<?php echo date('Y-m-d', strtotime('-7 days')); ?>">
                    </div>

                    <div class="filter-group">
                        <label for="toDate">To Date</label>
                        <input type="date" id="toDate" class="filter-input" value="<?php echo date('Y-m-d'); ?>">
                    </div>
                </div>

                <div class="filter-actions">
                    <button id="generateReportBtn" class="btn-primary">
                        <i class="fas fa-file-alt"></i>
                        Generate Report
                    </button>
                    <button id="exportPdfBtn" class="btn-secondary">
                        <i class="fas fa-file-pdf"></i>
                        Export PDF
                    </button>
                </div>
            </div>
        </div>

        <div class="schedule-section">
            <div class="schedule-header">
                <h3>Today's Schedule - <?php echo date('l, F j, Y'); ?></h3>
                <div class="schedule-nav">
                    <button class="nav-btn prev"><i class="fas fa-chevron-left"></i></button>
                    <button class="nav-btn next"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="schedule-table-container">
                <table class="schedule-table" id="scheduleTable">
                    <thead>
                        <tr>
                            <th>SHIFT</th>
                            <th>TIME</th>
                            <th>EMPLOYEES SCHEDULED</th>
                            <th>PRESENT</th>
                            <th>ABSENT</th>
                            <th>LATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($schedule as $shift): ?>
                        <tr>
                            <td>
                                <span class="shift-label <?php echo strtolower(explode(' ', $shift['shift'])[0]); ?>">
                                    <?php echo explode(' ', $shift['shift'])[0]; ?>
                                </span>
                            </td>
                            <td><?php echo $shift['time']; ?></td>
                            <td><?php echo $shift['scheduled']; ?></td>
                            <td><?php echo $shift['present']; ?></td>
                            <td><?php echo $shift['absent']; ?></td>
                            <td><?php echo $shift['late']; ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="../js/manager_sidebar.js"></script>
    
    <script>
    document.getElementById('generateReportBtn').addEventListener('click', function() 
    {
        generateReport('preview');
    });

    document.getElementById('exportPdfBtn').addEventListener('click', function() 
    {
        generateReport('pdf');
    });

    function generateReport(format) 
    {
        const reportType = document.getElementById('reportType').value;
        const department = document.getElementById('department').value;
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;

        if (new Date(toDate) < new Date(fromDate)) 
        {
            alert('End date cannot be before start date');
            return;
        }

        const btn = format === 'pdf' ? document.getElementById('exportPdfBtn') : document.getElementById('generateReportBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        const data = 
        {
            reportType: reportType,
            department: department,
            startDate: fromDate,
            endDate: toDate,
            format: format
        };

        fetch('generate_report.php', 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => 
        {
            if (format === 'pdf') 
            {
                return response.blob();
            } 
            else 
            {
                return response.json();
            }
        })
        .then(data => 
        {
            if (format === 'pdf') 
            {  
                const blob = new Blob([data], { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `attendance_report_${reportType}_${new Date().toISOString().slice(0,10)}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } 
            else 
            {
                window.open('', '_blank').document.write(data.html);
            }
        })
        .catch(error => 
        {
            console.error('Error:', error);
            alert('Failed to generate report. Please try again.');
        })
        .finally(() => 
        {
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    }

    document.addEventListener('DOMContentLoaded', function() 
    {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
    
        document.getElementById('fromDate').valueAsDate = today;
        document.getElementById('toDate').valueAsDate = today;
    
        document.getElementById('reportType').addEventListener('change', function() 
        {
            const today = new Date();
            const fromDate = document.getElementById('fromDate');
            const toDate = document.getElementById('toDate');
        
            switch(this.value) 
            {
                case 'weekly':
                    const monday = new Date(today);
                    monday.setDate(today.getDate() - (today.getDay() + 6) % 7);
                    fromDate.valueAsDate = monday;
                
                    const sunday = new Date(monday);
                    sunday.setDate(monday.getDate() + 6);
                    toDate.valueAsDate = sunday;
                    break;
                
                case 'monthly':
                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                
                    fromDate.valueAsDate = firstDay;
                    toDate.valueAsDate = lastDay;
                    break;
                
                case 'daily':
                    const selectedDate = fromDate.valueAsDate || today;
                    fromDate.valueAsDate = selectedDate;
                    toDate.valueAsDate = selectedDate;
                    break;
                
                case 'custom':
                    break;
            }
        });
        document.getElementById('fromDate').addEventListener('change', function() 
        {
            if (document.getElementById('reportType').value === 'daily') 
            {
                document.getElementById('toDate').valueAsDate = this.valueAsDate;
            }
        });
    });
    </script>
</body>
</html>