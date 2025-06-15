<?php

session_start();

require_once '../component/connection.php';
date_default_timezone_set('Asia/Kuala_Lumpur');

if (!isset($_SESSION['user_type']))
{
    header("Location: ../login.php");
    exit;
}

if ($_SESSION['user_type'] !== 'manager')
{
    header("Location: ../login.php");
    exit;
}

$manager_id = $_SESSION['employee_id'];
$stmt = $pdo->prepare("SELECT d.name, d.shift_required FROM employees e 
                      JOIN departments d ON e.department_id = d.id 
                      WHERE e.employee_id = ?");
$stmt->execute([$manager_id]);
$manager_dept = $stmt->fetch(PDO::FETCH_ASSOC);
$manager_department = $manager_dept['name'];
$dept_requires_shifts = $manager_dept['shift_required'];

$currentDate = date('Y-m-d');
$departments = [$manager_department];

if (isset($_POST['start_date']) && isset($_POST['end_date']))
{
    $startDate = $_POST['start_date'];
    $endDate = $_POST['end_date'];

    $query = "SELECT 
                a.attendance_id,
                e.employee_id, 
                e.name, 
                d.name AS department,
                DATE(a.check_time) AS date,
                MIN(CASE WHEN a.action_type = 'check_in' THEN TIME(a.check_time) END) AS clock_in,
                MAX(CASE WHEN a.action_type = 'check_out' THEN TIME(a.check_time) END) AS clock_out,
                CASE 
                    WHEN d.shift_required = 1 THEN s.shift_name
                    ELSE 'Standard Hours'
                END AS shift_name,
                CASE 
                    WHEN d.shift_required = 1 THEN s.start_time
                    ELSE '09:00:00'
                END AS shift_start,
                CASE 
                    WHEN d.shift_required = 1 THEN s.end_time
                    ELSE '17:00:00'
                END AS shift_end
              FROM employees e
              LEFT JOIN departments d ON e.department_id = d.id
              LEFT JOIN shifts s ON e.shift_id = s.shift_id
              LEFT JOIN Attendance a ON e.employee_id = a.employee_id 
              WHERE DATE(a.check_time) BETWEEN ? AND ? 
              AND d.name = ?
              GROUP BY e.employee_id, DATE(a.check_time)
              HAVING COUNT(a.attendance_id) > 0
              ORDER BY a.check_time DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$startDate, $endDate, $manager_department]);
}
else
{
    $query = "SELECT 
                a.attendance_id,
                e.employee_id, 
                e.name, 
                d.name AS department,
                DATE(a.check_time) AS date,
                MIN(CASE WHEN a.action_type = 'check_in' THEN TIME(a.check_time) END) AS clock_in,
                MAX(CASE WHEN a.action_type = 'check_out' THEN TIME(a.check_time) END) AS clock_out,
                CASE 
                    WHEN d.shift_required = 1 THEN s.shift_name
                    ELSE 'Standard Hours'
                END AS shift_name,
                CASE 
                    WHEN d.shift_required = 1 THEN s.start_time
                    ELSE '09:00:00'
                END AS shift_start,
                CASE 
                    WHEN d.shift_required = 1 THEN s.end_time
                    ELSE '17:00:00'
                END AS shift_end
              FROM employees e
              LEFT JOIN departments d ON e.department_id = d.id
              LEFT JOIN shifts s ON e.shift_id = s.shift_id
              LEFT JOIN Attendance a ON e.employee_id = a.employee_id
              WHERE d.name = ?
              GROUP BY e.employee_id, DATE(a.check_time)
              HAVING COUNT(a.attendance_id) > 0
              ORDER BY a.check_time DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$manager_department]);
}

$attendanceRecords = $stmt->fetchAll(PDO::FETCH_ASSOC);

$processedRecords = [];
foreach ($attendanceRecords as $record)
{
    $hours = 0;
    $overtime = 0;
    $status = "Present";
    $isLate = false;
    $isHalfDay = false;
    
    if ($record['clock_in'] && $record['clock_out'])
    {
        $clockIn = new DateTime($record['clock_in']);
        $clockOut = new DateTime($record['clock_out']);
        $diff = $clockIn->diff($clockOut);
        $hours = $diff->h + ($diff->i / 60);
        
        $shiftStart = new DateTime($record['shift_start']);
        $lateThreshold = new DateInterval('PT20M');
        $lateTime = clone $shiftStart;
        $lateTime->add($lateThreshold);
        
        if ($clockIn > $lateTime)
        {
            $isLate = true;
        }
        
        $checkDate = new DateTime($record['date']);
        $shiftEndTime = new DateTime($record['shift_end']);

        if ($shiftEndTime < $shiftStart)
        {
            $shiftEndDateTime = (clone $checkDate)->modify('+1 day')->setTime(
                (int)$shiftEndTime->format('H'),
                (int)$shiftEndTime->format('i')
            );
        }
        else
        {
            $shiftEndDateTime = (clone $checkDate)->setTime(
                (int)$shiftEndTime->format('H'),
                (int)$shiftEndTime->format('i')
            );
        }
        $shiftEndDateTimeDate = $shiftEndDateTime->format('Y-m-d');
        $clockOutDate = $clockOut->format('Y-m-d');

        if ($shiftEndDateTimeDate === $clockOutDate)
        {
            if ($clockOut > $shiftEndDateTime)
            {
                $overtimeDiff = $shiftEndDateTime->diff($clockOut);
                $overtime = $overtimeDiff->h + ($overtimeDiff->i / 60);
            }
        }
        else
        {
            $overtime = 0; 
        }

        $shiftDuration = (new DateTime($record['shift_start']))->diff(new DateTime($record['shift_end']));
        $shiftHours = $shiftDuration->h + ($shiftDuration->i / 60);
        
        if ($hours < ($shiftHours * 0.5))
        {
            $isHalfDay = true;
        }
    }
    else if ($record['clock_in'] && !$record['clock_out'])
    {
        $clockIn = new DateTime($record['clock_in']);
        $currentTime = new DateTime(); 
        $diff = $clockIn->diff($currentTime); 
        $hours = $diff->h + ($diff->i / 60);
        $status = "Present";
    }
    else
    {
        $status = "Absent";
    }

    if ($isHalfDay)
    {
        $status = "Half Day";
    }
    elseif ($isLate)
    {
        $status = "Late";
    }
    
    $processedRecords[] = 
    [
        'id' => $record['employee_id'],
        'name' => $record['name'],
        'department' => $record['department'],
        'date' => $record['date'],
        'clockIn' => $record['clock_in'] ?: '--',
        'clockOut' => $record['clock_out'] ?: '--',
        'hours' => $hours > 0 ? number_format($hours, 2) . 'h' : '0h',
        'overtime' => $overtime > 0 ? '+' . number_format($overtime, 2) . 'h' : '0h',
        'status' => $status,
        'shift' => $record['shift_name'] ?? '--'
    ];
}

$recordsJson = json_encode($processedRecords);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attendance Monitoring</title>
    <link rel="stylesheet" href="../css/attendance.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/manager_sidebar.css">
</head>
<body class="bg-gray-100">

    <?php include 'manager_sidebar.php'; ?>

    <div class="main-content">

        <div class="filter-section">
            <div class="filter-header">
                <h2 class="filter-title">Filter Attendance Records</h2>
                <button id="toggleFilters" class="filter-toggle">
                    <i class="fas fa-filter"></i>
                    <span id="toggleText">Hide Filters</span>
                    <i class="fas fa-chevron-up" id="toggleIcon"></i>
                </button>
            </div>
            
            <div class="filter-content" id="filterContent">
                <div class="filter-grid">
                    <div class="filter-item">
                        <label for="filterDate">Date</label>
                        <input type="date" id="filterDate" class="filter-input" value="<?php echo $currentDate; ?>">
                    </div>
                    <div class="filter-item">
                        <label for="filterEmployee">Employee</label>
                        <input type="text" id="filterEmployee" class="filter-input" placeholder="Name or ID">
                    </div>
                    <div class="filter-item">
                        <label for="filterDepartment">Department</label>
                        <select id="filterDepartment" class="filter-input">
                            <option value="">All Departments</option>
                            <?php foreach ($departments as $dept): ?>
                                <option value="<?php echo htmlspecialchars($dept); ?>"><?php echo htmlspecialchars($dept); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="filter-item">
                        <label for="filterStatus">Status</label>
                        <select id="filterStatus" class="filter-input">
                            <option value="">All Status</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Half Day">Half Day</option>
                            <option value="Late">Late</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="logs-section">
            <div class="logs-header">
                <div class="logs-title-section">
                    <h2 class="logs-title">Attendance Logs</h2>
                    <p class="logs-subtitle">Showing <span id="recordCount"><?php echo count($processedRecords); ?></span> records</p>
                </div>
                <div class="filter-toggle-mobile">
                    <button id="showFiltersBtn" class="show-filters-btn">
                        <i class="fas fa-filter"></i>
                        <span>Show Filters</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>

            <div class="table-container">
                <table id="attendanceTable" class="attendance-table">
                    <thead>
                        <tr>
                            <th>EMPLOYEE</th>
                            <th>DEPARTMENT</th>
                            <th>DATE</th>
                            <th>CLOCK IN</th>
                            <th>CLOCK OUT</th>
                            <th>HOURS</th>
                            <th>OVERTIME</th>
                            <th>STATUS</th>
                            <th>SHIFT</th>
                        </tr>
                    </thead>
                    <tbody id="attendanceLogs">
                        <?php if (empty($processedRecords)): ?>
                            <tr>
                                <td colspan="9" style="text-align: center; padding: 40px; color: #718096;">
                                    <i class="fas fa-search" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                                    No attendance records found
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($processedRecords as $record): ?>
                                <?php
                                    $statusClass = '';
                                    if ($record['status'] === 'Present')
                                    {
                                        $statusClass = 'status-present';
                                    }
                                    elseif ($record['status'] === 'Absent')
                                    {
                                        $statusClass = 'status-absent';
                                    }
                                    elseif ($record['status'] === 'Half Day')
                                    {
                                        $statusClass = 'status-half-day';
                                    }
                                    elseif ($record['status'] === 'Late')
                                    {
                                        $statusClass = 'status-late';
                                    }
                                    
                                    $overtimeClass = strpos($record['overtime'], '+') !== false ? 'overtime-positive' : 
                                                     ($record['overtime'] === '0h' ? '' : 'overtime-negative');
                                ?>
                                <tr>
                                    <td>
                                        <div class="employee-info">
                                            <div class="employee-name"><?php echo htmlspecialchars($record['name']); ?></div>
                                            <div class="employee-id"><?php echo htmlspecialchars($record['id']); ?></div>
                                        </div>
                                    </td>
                                    <td><?php echo htmlspecialchars($record['department']); ?></td>
                                    <td><?php echo htmlspecialchars($record['date']); ?></td>
                                    <td class="time-cell"><?php echo htmlspecialchars($record['clockIn']); ?></td>
                                    <td class="time-cell"><?php echo htmlspecialchars($record['clockOut']); ?></td>
                                    <td class="time-cell"><?php echo htmlspecialchars($record['hours']); ?></td>
                                    <td class="time-cell <?php echo $overtimeClass; ?>"><?php echo htmlspecialchars($record['overtime']); ?></td>
                                    <td>
                                        <span class="status-badge <?php echo $statusClass; ?>">
                                            <?php echo htmlspecialchars($record['status']); ?>
                                        </span>
                                    </td>
                                    <td><?php echo htmlspecialchars($record['shift']); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        const attendanceRecords = <?php echo $recordsJson; ?>;
        const currentDate = '<?php echo $currentDate; ?>';
    </script>

    <script src="../js/manager_sidebar.js"></script>
    <script src="../js/attendance.js"></script>
</body>
</html>