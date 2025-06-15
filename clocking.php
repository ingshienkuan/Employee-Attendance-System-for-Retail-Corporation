<?php
require 'component/connection.php';
date_default_timezone_set('Asia/Kuala_Lumpur');

$employee = null;
$message = '';
$location = '';
$actionCompleted = false;
$allowCheckIn = true;
$allowCheckOut = true;

if ($_SERVER['REQUEST_METHOD'] === 'POST')
{
    $employeeId = $_POST['employeeId'] ?? '';
    $location = $_POST['location'] ?? '';
    $actionType = $_POST['action_type'] ?? '';

    if ($employeeId)
    {
        $stmt = $pdo->prepare("SELECT e.employee_id, e.name, e.user_type, d.name AS department, d.shift_required 
                             FROM employees e 
                             JOIN departments d ON e.department_id = d.id 
                             WHERE e.employee_id = ?");
        $stmt->execute([$employeeId]);
        $employee = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$employee)
        {
            $message = "Employee ID not found.";
        }
        else
        {
            $currentDate = date('Y-m-d');
            $currentTime = new DateTime();
            $isManager = ($employee['user_type'] === 'manager');

            $attendanceStmt = $pdo->prepare("SELECT action_type, check_time FROM Attendance 
                                            WHERE employee_id = ? AND DATE(check_time) = ? 
                                            ORDER BY check_time ASC");
            $attendanceStmt->execute([$employeeId, $currentDate]);
            $attendanceRecords = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);

            $lastAction = null;
            $hasCheckedIn = false;
            $hasCheckedOut = false;
            
            foreach ($attendanceRecords as $record)
            {
                if ($record['action_type'] == 'check_in')
                {
                    $hasCheckedIn = true;
                    $lastAction = 'check_in';
                }
                elseif ($record['action_type'] == 'check_out')
                {
                    $hasCheckedOut = true;
                    $lastAction = 'check_out';
                }
            }

            $allowCheckIn = !$hasCheckedIn;
            $allowCheckOut = $hasCheckedIn && !$hasCheckedOut;

            if ($actionType === 'check_in')
            {
                if (!$allowCheckIn)
                {
                    if ($hasCheckedIn && $hasCheckedOut)
                    {
                        $message = "You have already completed your attendance for today.";
                    }
                    else
                    {
                        $message = "You have already checked in today.";
                    }
                }
                else
                {
                    if (!$isManager)
                    {
                        $shiftAssignStmt = $pdo->prepare("SELECT sa.shift_id, s.start_time, s.end_time 
                                                          FROM shift_assignments sa 
                                                          JOIN shifts s ON sa.shift_id = s.shift_id 
                                                          WHERE sa.employee_id = ? AND sa.assignment_date = ?");
                        $shiftAssignStmt->execute([$employeeId, $currentDate]);
                        $assignedShift = $shiftAssignStmt->fetch(PDO::FETCH_ASSOC);

                        if (!$assignedShift && $employee['shift_required'])
                        {
                            $message = "You do not have any shift assigned today.";
                        }
                        else
                        {
                            $shiftStartTime = $assignedShift ? new DateTime($assignedShift['start_time']) : new DateTime('09:00:00');
                            $shiftEndTime = $assignedShift ? new DateTime($assignedShift['end_time']) : new DateTime('17:00:00');
                            $clockInWindowStart = clone $shiftStartTime;
                            $clockInWindowStart->modify('-10 minutes');

                            if ($currentTime < $clockInWindowStart || $currentTime > $shiftEndTime)
                            {
                                $message = "You can only clock in within 10 minutes before your shift starts or during the shift.";
                            }
                        }
                    }

                    if (empty($message))
                    {
                        $stmt = $pdo->prepare("INSERT INTO Attendance (employee_id, location, action_type) VALUES (?, ?, ?)");
                        $stmt->execute([$employeeId, $location, $actionType]);

                        $time = $currentTime->format("h:i A");
                        $message = "{$employee['name']} successfully checked in at $time.";
                        $actionCompleted = true;
                        $allowCheckIn = false;
                        $allowCheckOut = true;
                    }
                }
            }
            elseif ($actionType === 'check_out')
            {
                if (!$allowCheckOut)
                {
                    if ($hasCheckedOut)
                    {
                        $message = "You have already checked out today.";
                    }
                    else
                    {
                        $message = "You must check in before you can clock out.";
                    }
                }
                else
                {
                    $stmt = $pdo->prepare("INSERT INTO Attendance (employee_id, location, action_type) VALUES (?, ?, ?)");
                    $stmt->execute([$employeeId, $location, $actionType]);

                    $time = $currentTime->format("h:i A");
                    $message = "{$employee['name']} successfully checked out at $time.";
                    $actionCompleted = true;
                    $allowCheckOut = false;
                }
            }
        }
    }
    else
    {
        $message = "Please enter your Employee ID.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Employee Check-in/out System</title>
    <link rel="stylesheet" href="css/clockin.css">
    <script type="text/javascript" src="js/clocking.js"></script>
</head>
<body>
<div class="container">
    <div class="login-link">
        <a href="login.php">Login</a>
    </div>

    <h1>Employee Check-in/out</h1>

    <form method="POST" action="clocking.php">
        <div class="form-group">
            <label for="employeeId">Employee ID</label>
            <div class="id-container">
                <input type="text" name="employeeId" id="employeeId" placeholder="Enter your employee ID" value="<?php echo htmlspecialchars($_POST['employeeId'] ?? ''); ?>" required>
                <button type="submit" class="tick-btn" title="Confirm Employee ID">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 13l4 4L19 7"></path>
                    </svg>
                </button>
            </div>
        </div>

        <?php if ($employee): ?>
            <div id="employeeDetails">
                <div class="row">
                    <div class="form-group col">
                        <label for="employeeName">Employee Name</label>
                        <input type="text" id="employeeName" value="<?php echo htmlspecialchars($employee['name']); ?>" readonly>
                    </div>

                    <div class="form-group col">
                        <label for="department">Department</label>
                        <input type="text" id="department" value="<?php echo htmlspecialchars($employee['department']); ?>" readonly>
                    </div>
                </div>

                <div class="form-group">
                    <label for="location">Current Location</label>
                    <input type="text" name="location" id="location" placeholder="Enter your current location" value="<?php echo htmlspecialchars($location); ?>" required>
                    <div id="locationInfo">Please enter your location manually.</div>
                </div>

                <div class="buttons">
                    <button type="submit" name="action_type" value="check_in" class="btn btn-check-in" <?php echo !$allowCheckIn ? 'disabled' : ''; ?>>
                        <span class="icon">✓</span> Check In
                    </button>
                    <button type="submit" name="action_type" value="check_out" class="btn btn-check-out" <?php echo !$allowCheckOut ? 'disabled' : ''; ?>>
                        <span class="icon">↠</span> Check Out
                    </button>
                </div>
            </div>
        <?php endif; ?>

        <?php if ($message): ?>
            <div id="message" class="<?php echo $actionCompleted ? 'success' : 'error'; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>
    </form>
</div>
</body>
</html>