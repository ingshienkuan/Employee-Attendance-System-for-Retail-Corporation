<?php
session_start();
require_once '../component/connection.php';
date_default_timezone_set('Asia/Kuala_Lumpur');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'employee')
{
    header("Location: ../login.php");
    exit;
}

$employee_id = $_SESSION['employee_id'];
$today = date('Y-m-d');

$stmt = $pdo->prepare("SELECT e.*, d.name AS department_name, d.shift_required 
                      FROM employees e 
                      JOIN departments d ON e.department_id = d.id 
                      WHERE e.employee_id = ?");
$stmt->execute([$employee_id]);
$employee = $stmt->fetch(PDO::FETCH_ASSOC);

$requiresShifts = $employee['shift_required'];

$shift_assignment_today = $pdo->prepare("SELECT * FROM shift_assignments WHERE employee_id = ? AND assignment_date = ?");
$shift_assignment_today->execute([$employee_id, $today]);
$has_shift_today = $shift_assignment_today->fetch();

if (!$has_shift_today && !$requiresShifts)
{
    $has_shift_today = [
        'assignment_date' => $today,
        'shift_name' => 'Standard Hours',
        'start_time' => '09:00:00',
        'end_time' => '17:00:00'
    ];
}

$attendance_stmt = $pdo->prepare("SELECT * FROM Attendance WHERE employee_id = ? AND DATE(check_time) = ? ORDER BY check_time DESC LIMIT 1");
$attendance_stmt->execute([$employee_id, $today]);
$attendance = $attendance_stmt->fetch(PDO::FETCH_ASSOC);

$week_start = date('Y-m-d', strtotime('monday this week'));
$week_end = date('Y-m-d', strtotime('sunday this week'));
$month_start = date('Y-m-01');
$month_end = date('Y-m-t');

if ($requiresShifts)
{
    $week_shift_stmt = $pdo->prepare("SELECT COUNT(DISTINCT assignment_date) as total_days FROM shift_assignments WHERE employee_id = ? AND assignment_date BETWEEN ? AND ?");
    $week_shift_stmt->execute([$employee_id, $week_start, $week_end]);
    $week_total_days = $week_shift_stmt->fetch(PDO::FETCH_ASSOC)['total_days'];

    $month_shift_stmt = $pdo->prepare("SELECT COUNT(DISTINCT assignment_date) as total_days FROM shift_assignments WHERE employee_id = ? AND assignment_date BETWEEN ? AND ?");
    $month_shift_stmt->execute([$employee_id, $month_start, $month_end]);
    $month_total_days = $month_shift_stmt->fetch(PDO::FETCH_ASSOC)['total_days'];
}
else
{
    $week_total_days = 5;
    $month_total_days = date('t', strtotime($today)) - count(array_filter(range(1, date('t', strtotime($today))), function($day) use ($today) 
    {
        return date('N', strtotime(date('Y-m-', strtotime($today)) . $day)) >= 6;
    }));
}

$week_attendance_stmt = $pdo->prepare("SELECT COUNT(DISTINCT DATE(check_time)) as present_days FROM Attendance WHERE employee_id = ? AND DATE(check_time) BETWEEN ? AND ?");
$week_attendance_stmt->execute([$employee_id, $week_start, $week_end]);
$week_present_days = $week_attendance_stmt->fetch(PDO::FETCH_ASSOC)['present_days'];

$month_attendance_stmt = $pdo->prepare("SELECT COUNT(DISTINCT DATE(check_time)) as present_days FROM Attendance WHERE employee_id = ? AND DATE(check_time) BETWEEN ? AND ?");
$month_attendance_stmt->execute([$employee_id, $month_start, $month_end]);
$month_present_days = $month_attendance_stmt->fetch(PDO::FETCH_ASSOC)['present_days'];

$avg_hours_stmt = $pdo->prepare("SELECT AVG(TIMESTAMPDIFF(HOUR, a1.check_time, a2.check_time)) as avg_hours 
                                FROM Attendance a1 
                                JOIN Attendance a2 ON a1.employee_id = a2.employee_id 
                                    AND DATE(a1.check_time) = DATE(a2.check_time) 
                                    AND a1.action_type = 'check_in' 
                                    AND a2.action_type = 'check_out'
                                WHERE a1.employee_id = ? 
                                AND DATE(a1.check_time) BETWEEN ? AND ?");
$avg_hours_stmt->execute([$employee_id, $week_start, $week_end]);
$avg_hours = $avg_hours_stmt->fetch(PDO::FETCH_ASSOC)['avg_hours'] ?? 0;

$punctuality_stmt = $pdo->prepare("SELECT COUNT(*) as on_time_days
                                  FROM (
                                      SELECT DATE(a.check_time) as day
                                      FROM Attendance a
                                      JOIN shift_assignments sa ON a.employee_id = sa.employee_id 
                                          AND DATE(a.check_time) = sa.assignment_date
                                      JOIN shifts s ON sa.shift_id = s.shift_id
                                      WHERE a.employee_id = ? 
                                        AND a.action_type = 'check_in'
                                        AND DATE(a.check_time) BETWEEN ? AND ?
                                        AND TIME(a.check_time) <= s.start_time
                                  ) as on_time");
$punctuality_stmt->execute([$employee_id, $week_start, $week_end]);
$on_time_days = $punctuality_stmt->fetch(PDO::FETCH_ASSOC)['on_time_days'] ?? 0;
$punctuality_rate = $week_present_days > 0 ? round(($on_time_days / $week_present_days) * 100) : 0;

$week_percent = $week_total_days ? round(($week_present_days / $week_total_days) * 100) : 0;
$month_percent = $month_total_days ? round(($month_present_days / $month_total_days) * 100) : 0;

$clocked_in = false;
$last_action_time = null;
$last_action_type = null;

if ($attendance)
{
    $last_action_time = date('g:i A', strtotime($attendance['check_time']));
    $last_action_type = $attendance['action_type'];
    $clocked_in = ($last_action_type == 'check_in');
}

$start_date = date('Y-m-d');
$end_date = date('Y-m-d', strtotime('+7 days'));

if ($requiresShifts)
{
    $upcoming_shifts = $pdo->prepare("SELECT sa.assignment_date, s.shift_name, 
                                     TIME_FORMAT(s.start_time, '%h:%i %p') as start_time, 
                                     TIME_FORMAT(s.end_time, '%h:%i %p') as end_time, 
                                     d.name as department_name 
                                     FROM shift_assignments sa 
                                     JOIN shifts s ON sa.shift_id = s.shift_id 
                                     JOIN employees e ON sa.employee_id = e.employee_id 
                                     JOIN departments d ON e.department_id = d.id 
                                     WHERE sa.employee_id = ? 
                                     AND sa.assignment_date BETWEEN ? AND ? 
                                     ORDER BY sa.assignment_date ASC");
    $upcoming_shifts->execute([$employee_id, $start_date, $end_date]);
    $shifts = $upcoming_shifts->fetchAll(PDO::FETCH_ASSOC);
}
else
{
    $shifts = [];
    $currentDate = new DateTime($start_date);
    $endDate = new DateTime($end_date);
    
    while ($currentDate <= $endDate)
    {
        $dayOfWeek = $currentDate->format('N');
        if ($dayOfWeek >= 1 && $dayOfWeek <= 5)
        {
            $shifts[] = [
                'assignment_date' => $currentDate->format('Y-m-d'),
                'shift_name' => 'Standard Hours',
                'start_time' => '09:00 AM',
                'end_time' => '05:00 PM',
                'department_name' => $employee['department_name']
            ];
        }
        $currentDate->modify('+1 day');
    }
}

$grouped_shifts = array();
foreach ($shifts as $shift)
{
    $shift_date_str = $shift['assignment_date'];
    $today_str = date('Y-m-d');
    $tomorrow_str = date('Y-m-d', strtotime('+1 day'));

    if ($shift_date_str === $today_str)
    {
        $date_label = 'Today';
    }
    elseif ($shift_date_str === $tomorrow_str)
    {
        $date_label = 'Tomorrow';
    }
    else
    {
        $date_label = date('l, F j', strtotime($shift_date_str));
    }

    $date_key = $shift['assignment_date'];
    if (!isset($grouped_shifts[$date_key]))
    {
        $grouped_shifts[$date_key] = [
            'date_label' => $date_label,
            'shifts' => []
        ];
    }

    $grouped_shifts[$date_key]['shifts'][] = [
        'shift_name' => $shift['shift_name'],
        'start_time' => $shift['start_time'],
        'end_time' => $shift['end_time'],
        'department' => $shift['department_name']
    ];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Dashboard</title>
    <link rel="stylesheet" href="../css/employee-dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <?php include 'employee_sidebar.php'; ?>
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h1>Employee Dashboard Overview</h1>
        </div>
        <main class="dashboard-main">
            <div class="dashboard-grid">
                <div class="card attendance-card">
                    <div class="card-header">
                        <h3>Today's Attendance</h3>
                        <span class="date"><?php echo date('l, F j, Y'); ?></span>
                    </div>
                    <div class="card-content">
                        <div class="attendance-status">
                            <div class="status-item">
                                <span class="status-label">Clock Status</span>
                                <div class="status-value <?php echo $clocked_in ? 'clocked-in' : 'clocked-out'; ?>">
                                    <span class="status-dot"></span>
                                    <?php echo $clocked_in ? 'Clocked In' : 'Clocked Out'; ?>
                                </div>
                                <?php if ($last_action_time): ?>
                                    <span class="clock-time"><?php echo $last_action_time; ?></span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="clock-actions">
                            <button onclick="window.location.href='../clocking.php'" class="<?php echo $clocked_in ? 'clock-out-btn' : 'clock-in-btn'; ?>">
                                <i class="fas <?php echo $clocked_in ? 'fa-sign-out-alt' : 'fa-sign-in-alt'; ?>"></i>
                                <?php echo $clocked_in ? 'Clock Out' : 'Clock In'; ?>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card summary-card">
                    <div class="card-header">
                        <h3>Attendance Summary</h3>
                    </div>
                    <div class="card-content">
                        <div class="summary-stats">
                            <div class="stat-item">
                                <span class="stat-label">This Week</span>
                                <span class="stat-value"><?php echo "$week_present_days/$week_total_days days"; ?></span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">This Month</span>
                                <span class="stat-value"><?php echo "$month_present_days/$month_total_days days"; ?></span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Avg Hours/Day</span>
                                <span class="stat-value"><?php echo number_format($avg_hours, 1) . " hrs"; ?></span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Punctuality Rate</span>
                                <span class="stat-value"><?php echo "$punctuality_rate%"; ?></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card shifts-card">
                    <div class="card-header">
                        <h3>Upcoming Shifts</h3>
                        <span class="date-range"><?php echo date('M j', strtotime($start_date)) . ' - ' . date('M j, Y', strtotime($end_date)); ?></span>
                    </div>
                    <div class="card-content">
                        <div class="shifts-list">
                            <?php if (empty($grouped_shifts)): ?>
                                <div class="no-shifts">No shifts scheduled in the next 7 days</div>
                            <?php else: ?>
                                <?php foreach ($grouped_shifts as $date_group): ?>
                                    <div class="shift-date-group">
                                        <div class="shift-date-header"><?php echo $date_group['date_label']; ?></div>
                                        <?php foreach ($date_group['shifts'] as $shift): ?>
                                            <div class="shift-item">
                                                <div class="shift-info">
                                                    <span class="shift-name"><?php echo $shift['shift_name']; ?></span>
                                                    <span class="shift-dept"><?php echo $shift['department']; ?></span>
                                                </div>
                                                <div class="shift-time"><?php echo $shift['start_time'] . ' - ' . $shift['end_time']; ?></div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                        <button class="view-schedule-btn" onclick="window.location.href='employee_shift_schedule.php'">View Full Schedule</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <script src="../js/employee-sidebar.js"></script>
</body>
</html>