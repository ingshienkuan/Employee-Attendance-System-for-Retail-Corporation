<?php
session_start();
require_once '../component/connection.php';
date_default_timezone_set('Asia/Kuala_Lumpur');

if (!isset($_SESSION['user_type'])) 
{
    header("Location: ../login.php");
    exit;
}

$employee_id = $_SESSION['employee_id'];

$stmt = $pdo->prepare("SELECT e.*, d.name AS department_name, d.shift_required 
                       FROM employees e 
                       JOIN departments d ON e.department_id = d.id 
                       WHERE e.employee_id = ?");
$stmt->execute([$employee_id]);
$currentEmployee = $stmt->fetch(PDO::FETCH_ASSOC);

$requiresShifts = $currentEmployee['shift_required'];

$upcomingShifts = [];
if ($requiresShifts) 
{
    $stmt = $pdo->prepare("SELECT sa.assignment_date, s.shift_name, 
                          TIME_FORMAT(s.start_time, '%h:%i %p') AS start_time, 
                          TIME_FORMAT(s.end_time, '%h:%i %p') AS end_time,
                          d.name AS department_name
                          FROM shift_assignments sa
                          JOIN shifts s ON sa.shift_id = s.shift_id
                          JOIN employees e ON sa.employee_id = e.employee_id
                          JOIN departments d ON e.department_id = d.id
                          WHERE sa.employee_id = ?
                          AND sa.assignment_date >= CURDATE()
                          ORDER BY sa.assignment_date ASC");
    $stmt->execute([$employee_id]);
    $upcomingShifts = $stmt->fetchAll(PDO::FETCH_ASSOC);
}
else
{
    $standardShift = [
        'shift_name' => 'Standard Hours',
        'start_time' => '09:00 AM',
        'end_time' => '05:00 PM',
        'department_name' => $currentEmployee['department_name']
    ];
    
    $currentDate = new DateTime();
    $endDate = new DateTime();
    $endDate->modify('+3 months');
    
    while ($currentDate <= $endDate)
    {
        $dayOfWeek = $currentDate->format('N');
        if ($dayOfWeek >= 1 && $dayOfWeek <= 5)
        {
            $upcomingShifts[] = array_merge(
                ['assignment_date' => $currentDate->format('Y-m-d')],
                $standardShift
            );
        }
        $currentDate->modify('+1 day');
    }
}

$shiftHistory = [];
if ($requiresShifts) 
{
    $stmt = $pdo->prepare("SELECT sa.assignment_date, s.shift_name, 
                          TIME_FORMAT(s.start_time, '%h:%i %p') AS start_time, 
                          TIME_FORMAT(s.end_time, '%h:%i %p') AS end_time,
                          d.name AS department_name,
                          (SELECT a.check_time 
                           FROM attendance a 
                           WHERE a.employee_id = sa.employee_id 
                           AND DATE(a.check_time) = sa.assignment_date 
                           AND a.action_type = 'check_in'
                           LIMIT 1) AS clock_in_time
                          FROM shift_assignments sa
                          JOIN shifts s ON sa.shift_id = s.shift_id
                          JOIN employees e ON sa.employee_id = e.employee_id
                          JOIN departments d ON e.department_id = d.id
                          WHERE sa.employee_id = ?
                          AND sa.assignment_date < CURDATE()
                          ORDER BY sa.assignment_date DESC");
    $stmt->execute([$employee_id]);
    $shiftHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
}
else
{
    $standardShift = [
        'shift_name' => 'Standard Hours',
        'start_time' => '09:00 AM',
        'end_time' => '05:00 PM',
        'department_name' => $currentEmployee['department_name'],
        'clock_in_time' => null
    ];
    
    $currentDate = new DateTime();
    $currentDate->modify('-3 months');
    $endDate = new DateTime();
    $endDate->modify('-1 day');
    
    while ($currentDate <= $endDate)
    {
        $dayOfWeek = $currentDate->format('N');
        if ($dayOfWeek >= 1 && $dayOfWeek <= 5)
        {
            $shiftHistory[] = array_merge(
                ['assignment_date' => $currentDate->format('Y-m-d')],
                $standardShift
            );
        }
        $currentDate->modify('+1 day');
    }
}

$stmt = $pdo->prepare("SELECT DISTINCT DATE_FORMAT(assignment_date, '%Y-%m') AS month 
                      FROM shift_assignments 
                      WHERE employee_id = ?
                      ORDER BY month DESC");
$stmt->execute([$employee_id]);
$availableMonths = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($availableMonths)) 
{
    $currentDate = new DateTime();
    $currentDate->modify('-3 months');
    $endDate = new DateTime();
    $endDate->modify('+3 months');
    
    while ($currentDate <= $endDate)
    {
        $month = $currentDate->format('Y-m');
        if (!in_array($month, $availableMonths))
        {
            $availableMonths[] = $month;
        }
        $currentDate->modify('first day of next month');
    }
    sort($availableMonths);
    $availableMonths = array_reverse($availableMonths);
}

$currentWeekStart = new DateTime();
$currentWeekStart->modify('monday this week');
$currentWeekEnd = clone $currentWeekStart;
$currentWeekEnd->modify('sunday this week');
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shift Schedule</title>
    <link rel="stylesheet" href="../css/shift_schedule.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <?php include 'employee_sidebar.php'; ?>
    <div class="container">
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Upcoming Shifts</h2>
                <div class="week-navigation">
                    <button class="nav-btn" onclick="previousWeek()">
                        <span class="arrow-left"></span>
                        Previous Week
                    </button>
                    <span class="current-week" id="currentWeekDisplay">
                        <?php echo $currentWeekStart->format('M j') . ' - ' . $currentWeekEnd->format('M j, Y'); ?>
                    </span>
                    <button class="nav-btn" onclick="nextWeek()">
                        Next Week
                        <span class="arrow-right"></span>
                    </button>
                </div>
            </div>
            
            <div class="calendar-grid" id="calendarGrid">
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Shift History</h2>
            </div>
            
            <div class="filter-section">
                <div class="filter-control">
                    <span class="filter-label">Filter by month:</span>
                    <select class="filter-select" id="monthFilter">
                        <?php foreach ($availableMonths as $month): 
                            $monthName = date('F Y', strtotime($month . '-01'));
                        ?>
                            <option value="<?php echo $month; ?>"><?php echo $monthName; ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            
            <table class="table">
                <thead class="table-header">
                    <tr>
                        <th>DATE</th>
                        <th>SHIFT TIME</th>
                        <th>DEPARTMENT</th>
                        <th>CLOCK IN</th>
                    </tr>
                </thead>
                <tbody id="shiftHistoryTable">
                </tbody>
            </table>
            
            <div class="pagination">
                <div class="pagination-info" id="paginationInfo">
                    Showing 1 to 5 of <?php echo count($shiftHistory); ?> shifts
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn" id="prevBtn">Previous</button>
                    <button class="pagination-btn active">1</button>
                    <button class="pagination-btn" id="nextBtn">Next</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        window.requiresShifts = <?php echo $requiresShifts ? 'true' : 'false'; ?>;
        window.currentWeekStart = '<?php echo $currentWeekStart->format('Y-m-d'); ?>';
        window.currentWeekEnd = '<?php echo $currentWeekEnd->format('Y-m-d'); ?>';
        window.upcomingShifts = <?php echo json_encode($upcomingShifts); ?>;
        window.shiftHistory = <?php echo json_encode($shiftHistory); ?>;
        window.availableMonths = <?php echo json_encode($availableMonths); ?>;
    </script>
    
    <script src="../js/shift_schedule.js"></script>
    <script src="../js/employee_sidebar.js"></script>
</body>
</html>