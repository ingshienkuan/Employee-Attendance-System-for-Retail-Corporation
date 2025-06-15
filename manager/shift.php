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
$stmt = $pdo->prepare("SELECT department_id FROM employees WHERE employee_id = ?");
$stmt->execute([$manager_id]);
$manager_department = $stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT name, shift_required FROM departments WHERE id = ?");
$stmt->execute([$manager_department]);
$department_info = $stmt->fetch(PDO::FETCH_ASSOC);
$manager_department_name = $department_info['name'];
$department_requires_shifts = $department_info['shift_required'];

$date_param = $_GET['date'] ?? null;
$week_start_param = $_GET['start'] ?? null;
$week_end_param = $_GET['end'] ?? null;
$today = date('Y-m-d');

if ($date_param) 
{
    $current_date = date('Y-m-d', strtotime($date_param));
    $current_week_start = $current_date;
    $current_week_end = $current_date;
    $view_type = 'day';
}
elseif ($week_start_param && $week_end_param) 
{
    $current_week_start = date('Y-m-d', strtotime($week_start_param));
    $current_week_end = date('Y-m-d', strtotime($week_end_param));
    $view_type = 'week';
}
else 
{
    $current_date = $today;
    $current_week_start = $current_date;
    $current_week_end = $current_date;
    $view_type = 'day';
}

function getShiftsByDepartment($pdo, $department_id, $start_date, $end_date, $requires_shifts, $manager_department_name)
{
    $shifts = [];

    if ($requires_shifts)
    {
        $sql = "SELECT 
                    sa.assignment_id,
                    sa.assignment_date,
                    s.shift_id,
                    s.shift_name,
                    s.start_time,
                    s.end_time,
                    e.employee_id,
                    e.name AS employee_name,
                    e.user_type AS role,
                    d.name AS department_name
                FROM shift_assignments sa
                JOIN shifts s ON sa.shift_id = s.shift_id
                JOIN employees e ON sa.employee_id = e.employee_id
                JOIN departments d ON e.department_id = d.id
                WHERE sa.assignment_date BETWEEN ? AND ?
                AND e.department_id = ?
                ORDER BY sa.assignment_date ASC, s.start_time ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$start_date, $end_date, $department_id]);
        $shifts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    else
    {
        $standard_shift = [
            'shift_name' => 'Standard Hours',
            'start_time' => '09:00:00',
            'end_time' => '17:00:00',
            'department_name' => 'Standard'
        ];

        $employees = getEmployeesForReassignment($pdo, $department_id);
        $current_date = new DateTime($start_date);
        $end_date = new DateTime($end_date);

        while ($current_date <= $end_date)
        {
            $day_of_week = $current_date->format('N');
            if ($day_of_week >= 1 && $day_of_week <= 5)
            {
                foreach ($employees as $employee)
                {
                    $shifts[] = [
                        'assignment_id' => null,
                        'assignment_date' => $current_date->format('Y-m-d'),
                        'shift_id' => null,
                        'shift_name' => $standard_shift['shift_name'],
                        'start_time' => $standard_shift['start_time'],
                        'end_time' => $standard_shift['end_time'],
                        'employee_id' => $employee['employee_id'],
                        'employee_name' => $employee['name'],
                        'role' => 'employee',
                        'department_name' => $manager_department_name
                    ];
                }
            }
            $current_date->modify('+1 day');
        }
    }

    return $shifts;
}

function getEmployeesForReassignment($pdo, $department_id) 
{
    $sql = "SELECT employee_id, name, email FROM employees 
            WHERE department_id = ? AND user_type = 'employee'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$department_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getInitials($name) 
{
    if (empty($name)) return '';
    $names = explode(' ', $name);
    $initials = '';
    foreach ($names as $n)
    {
        $initials .= strtoupper(substr($n, 0, 1));
    }
    return substr($initials, 0, 2);
}

$shifts = getShiftsByDepartment($pdo, $manager_department, $current_week_start, $current_week_end, $department_requires_shifts, $manager_department_name);
$reassign_employees = getEmployeesForReassignment($pdo, $manager_department);

$is_today_view = false;
$is_this_week_view = false;

if ($view_type === 'day' && $current_week_start === $today) 
{
    $is_today_view = true;
}
elseif ($view_type === 'week') 
{
    $today_obj = new DateTime($today);
    $start_obj = new DateTime($current_week_start);
    $end_obj = new DateTime($current_week_end);
    
    if ($today_obj >= $start_obj && $today_obj <= $end_obj) 
    {
        $is_this_week_view = true;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Shift Management - RetailCorp Employee Attendance System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
    <link rel="stylesheet" href="../css/shift.css" />
    <link rel="stylesheet" href="../css/manager_sidebar.css"/>
</head>
<body>
    <?php include 'manager_sidebar.php'; ?>

    <div class="main-container">
        <div class="container">
            <header class="page-header">
                <h1>Shift Management</h1>
                <div class="header-actions">
                    <button class="btn-primary" id="createShiftBtn">+ Create New Shift</button>
                </div>
            </header>

            <nav class="department-tabs">
                <button class="tab-btn active" data-dept="all" disabled>Your Departments</button>
                <button class="tab-btn" data-dept="<?php echo strtolower(str_replace(' ', '-', $manager_department_name)); ?>" disabled>
                    <?php echo htmlspecialchars($manager_department_name); ?>
                </button>
            </nav>

            <nav class="sub-nav">
                <button class="sub-nav-btn active" data-view="upcoming">Upcoming Shifts</button>
                <button class="sub-nav-btn" data-view="reassign">Reassign Shifts</button>
            </nav>

            <div class="date-navigation">
                <button class="nav-arrow" id="prevWeek">‹</button>
                <h2 class="date-range" data-start="<?php echo $current_week_start; ?>" data-end="<?php echo $current_week_end; ?>">
                    <?php 
                        if ($view_type === 'day')
                        {
                            echo date('M j, Y', strtotime($current_week_start));
                        }
                        else
                        {
                            echo date('M j', strtotime($current_week_start)) . ' - ' . date('M j, Y', strtotime($current_week_end));
                        }
                    ?>
                </h2>
                <button class="nav-arrow" id="nextWeek">›</button>
                <div class="date-controls">
                    <button class="date-btn <?php echo $is_today_view ? 'active' : ''; ?>" id="todayBtn">Today</button>
                    <button class="date-btn <?php echo $is_this_week_view ? 'active' : ''; ?>" id="thisWeekBtn">This Week</button>
                </div>
            </div>

            <main class="main-content">
                <div id="upcomingView" class="view-container active">
                    <div class="schedule-grid">
                       <?php
                       if ($view_type === 'day')
                       {
                            $day_name = date('l', strtotime($current_week_start));
                            $formatted_date = date('M j, Y', strtotime($current_week_start));
                            echo '<div class="day-column">';
                            echo '<h3 class="day-header">' . $day_name . ', ' . $formatted_date . '</h3>';
                            $day_shifts = array_filter($shifts, function($shift) use ($current_week_start) 
                            {
                                return $shift['assignment_date'] == $current_week_start;
                            });
                            if (empty($day_shifts)) 
                            {
                                echo '<div class="no-shifts">No shifts scheduled</div>';
                            } 
                            else 
                            {
                                foreach ($day_shifts as $shift) 
                                {
                                    $shiftClass = '';
                                    if (strpos($shift['shift_name'], 'Morning') !== false) $shiftClass = 'morning';
                                    elseif (strpos($shift['shift_name'], 'Evening') !== false) $shiftClass = 'evening';
                                    elseif (strpos($shift['shift_name'], 'Night') !== false) $shiftClass = 'night';
                                    elseif (strpos($shift['shift_name'], 'Standard') !== false) $shiftClass = 'standard';
                            
                                    echo '<div class="shift-card ' . $shiftClass . '">';
                                    echo '<div class="shift-header">';
                                    echo '<span class="shift-badge ' . $shiftClass . '-shift">' . htmlspecialchars($shift['shift_name']) . '</span>';
                                    echo '<button class="more-btn" data-assignment-id="'.htmlspecialchars($shift['assignment_id']).'">⋯</button>';
                                    echo '</div>';
                                    echo '<div class="shift-content">';
                                    echo '<h4>' . htmlspecialchars($shift['department_name']) . '</h4>';
                                    echo '<p class="shift-time">' . date('g:i A', strtotime($shift['start_time'])) . ' - ' . date('g:i A', strtotime($shift['end_time'])) . '</p>';
                            
                                    if ($shift['employee_name']) 
                                    {
                                        $initials = getInitials($shift['employee_name']);
                                        echo '<div class="employee-info">';
                                        echo '<div class="avatar clickable-avatar" data-employee="' . htmlspecialchars($shift['employee_id']) . '">' . $initials . '</div>';
                                        echo '<div class="employee-details">';
                                        echo '<span class="employee-name">' . htmlspecialchars($shift['employee_name']) . '</span>';
                                        echo '<span class="employee-role">' . htmlspecialchars($shift['role']) . '</span>';
                                        echo '</div>';
                                        echo '</div>';
                                    }
                            
                                    echo '</div>';
                                    echo '</div>';
                                }
                            }
                            echo '</div>';
                       }
                       else
                       {
                            $current_date = $current_week_start;
                            while ($current_date <= $current_week_end) 
                            {
                                $day_name = date('l', strtotime($current_date));
                                $formatted_date = date('M j', strtotime($current_date));
                    
                                echo '<div class="day-column">';
                                echo '<h3 class="day-header">' . $day_name . ', ' . $formatted_date . '</h3>';
                    
                                $day_shifts = array_filter($shifts, function($shift) use ($current_date) 
                                {
                                    return $shift['assignment_date'] == $current_date;
                                });
                    
                                if (empty($day_shifts)) 
                                {
                                    echo '<div class="no-shifts">No shifts scheduled</div>';
                                } 
                                else 
                                {
                                    foreach ($day_shifts as $shift) 
                                    {
                                        $shiftClass = '';
                                        if (strpos($shift['shift_name'], 'Morning') !== false) $shiftClass = 'morning';
                                        elseif (strpos($shift['shift_name'], 'Evening') !== false) $shiftClass = 'evening';
                                        elseif (strpos($shift['shift_name'], 'Night') !== false) $shiftClass = 'night';
                                        elseif (strpos($shift['shift_name'], 'Standard') !== false) $shiftClass = 'standard';
                            
                                        echo '<div class="shift-card ' . $shiftClass . '">';
                                        echo '<div class="shift-header">';
                                        echo '<span class="shift-badge ' . $shiftClass . '-shift">' . htmlspecialchars($shift['shift_name']) . '</span>';
                                        echo '<button class="more-btn" data-assignment-id="'.htmlspecialchars($shift['assignment_id']).'">⋯</button>';
                                        echo '</div>';
                                        echo '<div class="shift-content">';
                                        echo '<h4>' . htmlspecialchars($shift['department_name']) . '</h4>';
                                        echo '<p class="shift-time">' . date('g:i A', strtotime($shift['start_time'])) . ' - ' . date('g:i A', strtotime($shift['end_time'])) . '</p>';
                            
                                        if ($shift['employee_name']) 
                                        {
                                            $initials = getInitials($shift['employee_name']);
                                            echo '<div class="employee-info">';
                                            echo '<div class="avatar clickable-avatar" data-employee="' . htmlspecialchars($shift['employee_id']) . '">' . $initials . '</div>';
                                            echo '<div class="employee-details">';
                                            echo '<span class="employee-name">' . htmlspecialchars($shift['employee_name']) . '</span>';
                                            echo '<span class="employee-role">' . htmlspecialchars($shift['role']) . '</span>';
                                            echo '</div>';
                                            echo '</div>';
                                        }
                            
                                        echo '</div>';
                                        echo '</div>';
                                    }
                                }
                    
                                echo '</div>';
                                $current_date = date('Y-m-d', strtotime($current_date . ' +1 day'));
                            }
                       }
                       ?>
                    </div>
                </div>

                <div id="reassignView" class="view-container">
                    <div class="reassign-controls">
                        <div class="reassign-instructions">
                            <h3>Reassign Shifts</h3>
                            <p>Select shifts that need reassignment and find replacement employees</p>
                        </div>
                        <div class="bulk-actions">
                            <button class="btn-secondary" id="selectAllBtn">Select All</button>
                            <button class="btn-danger" id="bulkReassignBtn" disabled>Bulk Unassign (<span id="selectedCount">0</span>)</button>
                        </div>
                    </div>

                    <div class="reassign-table-container">
                        <table class="reassign-table">
                            <thead>
                                <tr>
                                    <th class="checkbox-col">
                                        <input type="checkbox" id="selectAllCheckbox">
                                    </th>
                                    <th class="employee-col">EMPLOYEE</th>
                                    <th class="department-col">DEPARTMENT</th>
                                    <th class="shift-col">SHIFT</th>
                                    <th class="date-col">DATE</th>
                                    <th class="actions-col">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($shifts as $shift): ?>
                                <tr class="reassign-row" data-shift-id="<?php echo htmlspecialchars($shift['assignment_id']); ?>">
                                    <td class="checkbox-cell">
                                        <input type="checkbox" id="shift-<?php echo htmlspecialchars($shift['assignment_id']); ?>" class="shift-checkbox">
                                    </td>
                                    <td class="employee-cell">
                                        <div class="employee-info">
                                            <div class="avatar"><?php echo getInitials($shift['employee_name'] ?? 'NA'); ?></div>
                                            <span class="employee-name"><?php echo htmlspecialchars($shift['employee_name'] ?? 'Not Assigned'); ?></span>
                                        </div>
                                    </td>
                                    <td class="department-cell"><?php echo htmlspecialchars($shift['department_name']); ?></td>
                                    <td class="shift-cell">
                                        <span class="shift-badge">
                                            <?php echo htmlspecialchars($shift['shift_name']); ?>
                                        </span>
                                    </td>
                                    <td class="date-cell"><?php echo date('M j, Y', strtotime($shift['assignment_date'])); ?></td>
                                    <td class="actions-cell">
                                        <div class="action-buttons">
                                            <button class="btn-action edit-btn">Edit</button>
                                            <button class="btn-action remove-btn">Remove</button>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <div id="employeeProfileModal" class="modal">
        <div class="modal-content profile-modal">
            <div class="modal-header">
                <h2 id="employeeName">Employee Profile</h2>
                <span class="close-btn" id="closeProfileModal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="profile-info">
                    <div class="profile-avatar" id="profileAvatar"></div>
                    <div class="profile-details">
                        <h3 id="profileName"></h3>
                        <p id="profileRole"></p>
                        <p id="profileDepartment"></p>
                    </div>
                </div>
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-label">This Week</span>
                        <span class="stat-value" id="weekHours"></span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">This Month</span>
                        <span class="stat-value" id="monthHours"></span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Attendance Rate</span>
                        <span class="stat-value" id="attendanceRate"></span>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="btn-secondary">View Full Profile</button>
                    <button class="btn-primary">Send Message</button>
                </div>
            </div>
        </div>
    </div>

    <div id="assignShiftModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Assign Shift</h2>
                <span class="close-btn" id="closeModal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="assignShiftForm">
                    <div class="form-group">
                        <label for="employeeSelect">Employee</label>
                        <select id="employeeSelect" class="form-select" required>
                            <option value="">Select Employee</option>
                            <?php foreach ($reassign_employees as $employee): ?>
                            <option value="<?php echo htmlspecialchars($employee['employee_id']); ?>">
                                <?php echo htmlspecialchars($employee['name']) . ' - ' . htmlspecialchars($employee['email']); ?>
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="departmentSelect">Department</label>
                        <select id="departmentSelect" class="form-select" required disabled>
                            <option value="<?php echo htmlspecialchars($manager_department); ?>" selected>
                                <?php echo htmlspecialchars($manager_department_name); ?>
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="shiftTypeSelect">Shift Type</label>
                        <select id="shiftTypeSelect" class="form-select highlighted" required>
                            <option value="">Select Shift</option>
                            <option value="morning">Morning Shift (8:00 AM - 2:00 PM)</option>
                            <option value="evening">Evening Shift (6:00 PM - 12:00 AM)</option>
                            <option value="night">Night Shift (11:00 PM - 7:00 AM)</option>
                            <option value="standard">Standard Shift (9:00 AM - 5:00 PM)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="shiftDate">Date</label>
                        <input type="date" id="shiftDate" class="form-input" required placeholder="dd/mm/yyyy">
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" id="cancelBtn">Cancel</button>
                        <button type="submit" class="btn-assign">Assign Shift</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div id="editShiftModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Shift Assignment</h2>
                <span class="close-btn" id="closeEditModal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="editShiftForm">
                    <input type="hidden" id="editAssignmentId">
                
                    <div class="form-group">
                        <label for="editEmployeeSelect">Employee</label>
                        <select id="editEmployeeSelect" class="form-select" required>
                            <option value="">Select Employee</option>
                            <?php foreach ($reassign_employees as $employee): ?>
                            <option value="<?php echo htmlspecialchars($employee['employee_id']); ?>">
                                <?php echo htmlspecialchars($employee['name']) . ' - ' . htmlspecialchars($employee['email']); ?>
                            </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editDepartmentSelect">Department</label>
                        <select id="editDepartmentSelect" class="form-select" required disabled>
                            <option value="<?php echo htmlspecialchars($manager_department); ?>" selected>
                                <?php echo htmlspecialchars($manager_department_name); ?>
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editShiftTypeSelect">Shift Type</label>
                        <select id="editShiftTypeSelect" class="form-select highlighted" required>
                            <option value="">Select Shift</option>
                            <option value="morning">Morning Shift (8:00 AM - 2:00 PM)</option>
                            <option value="evening">Evening Shift (6:00 PM - 12:00 AM)</option>
                            <option value="night">Night Shift (11:00 PM - 7:00 AM)</option>
                            <option value="standard">Standard Shift (9:00 AM - 5:00 PM)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editShiftDate">Date</label>
                        <input type="date" id="editShiftDate" class="form-input" required>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" id="cancelEditBtn">Cancel</button>
                        <button type="submit" class="btn-assign">Update Shift</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="../js/manager_sidebar.js"></script>
    <script src="../js/shift.js"></script>
</body>
</html>