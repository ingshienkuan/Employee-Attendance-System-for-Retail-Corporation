<?php
session_start();
require_once '../component/connection.php';
date_default_timezone_set('Asia/Kuala_Lumpur');

if (!isset($_SESSION['user_type'])) 
{
    header("Location: ../login.php");
    exit;
}

if ($_SESSION['user_type'] !== 'employee') 
{
    header("Location: ../login.php");
    exit;
}

$currentMonth = date('Y-m');
$selectedMonth = isset($_GET['month']) ? $_GET['month'] : $currentMonth;

function getAttendanceData($pdo, $employeeId, $month) 
{
    $startDate = date('Y-m-01', strtotime($month));
    $endDate = date('Y-m-t', strtotime($month));
    
    try 
    {
        $stmt = $pdo->prepare("
            SELECT 
                DATE(check_time) as date,
                MIN(CASE WHEN action_type = 'check_in' THEN check_time END) as check_in,
                MAX(CASE WHEN action_type = 'check_out' THEN check_time END) as check_out,
                s.shift_name,
                s.start_time as shift_start,
                s.end_time as shift_end
            FROM Attendance a
            JOIN employees e ON a.employee_id = e.employee_id
            LEFT JOIN shifts s ON e.shift_id = s.shift_id
            WHERE a.employee_id = :employee_id
            AND DATE(a.check_time) BETWEEN :start_date AND :end_date
            GROUP BY DATE(a.check_time)
            ORDER BY date DESC
        ");
        
        $stmt->execute(
            [
                ':employee_id' => $employeeId,
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]
        );
        
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($records as &$record)
        {
            $hours = 0;
            $status = "Present";
            $isLate = false;
            $isHalfDay = false;
            
            if ($record['check_in'] && $record['check_out'])
            {
                $clockIn = new DateTime($record['check_in']);
                $clockOut = new DateTime($record['check_out']);
                $diff = $clockIn->diff($clockOut);
                $hoursWorked = $diff->h;
                $minutesWorked = $diff->i;
                
                if ($record['shift_start'])
                {
                    $shiftStart = new DateTime($record['shift_start']);
                    $lateThreshold = new DateInterval('PT20M');
                    $lateTime = clone $shiftStart;
                    $lateTime->add($lateThreshold);
                    
                    if ($clockIn > $lateTime)
                    {
                        $isLate = true;
                    }
                    
                    $shiftDuration = (new DateTime($record['shift_start']))->diff(new DateTime($record['shift_end']));
                    $shiftHours = $shiftDuration->h + ($shiftDuration->i / 60);
                    
                    if ($hours < ($shiftHours * 0.5))
                    {
                        $isHalfDay = true;
                    }
                }
            }
            else if ($record['check_in'] && !$record['check_out'])
            {
                $isError = true;
                $hoursWorked = null;
                $minutesWorked = null;
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
            elseif ($isError)
            {
                $status = "Unknown";
            }
            
            if (is_null($hoursWorked) || is_null($minutesWorked)) 
            {
              $record['total_hours'] = '--';
            } 
            else 
            {
              $record['total_hours'] = "{$hoursWorked} hr {$minutesWorked} min";
            }

            $record['status'] = $status;
            $record['clock_in'] = $record['check_in'] ? date('h:i A', strtotime($record['check_in'])) : '--:-- --';
            $record['clock_out'] = $record['check_out'] ? date('h:i A', strtotime($record['check_out'])) : '--:-- --';
        }
        
        return $records;
    } 
    catch (PDOException $e) 
    {
        error_log("Database error: " . $e->getMessage());
        return [];
    }
}

$attendanceData = getAttendanceData($pdo, $_SESSION['employee_id'], $selectedMonth);

$currentPage = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$itemsPerPage = 7;
$totalItems = count($attendanceData);
$totalPages = ceil($totalItems / $itemsPerPage);
$offset = ($currentPage - 1) * $itemsPerPage;
$paginatedData = array_slice($attendanceData, $offset, $itemsPerPage);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Attendance History - Employee Attendance System</title>
    <link rel="stylesheet" href="../css/history.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</head>

<body>
    <?php include 'employee_sidebar.php'; ?>
    
    <div class="main-content">
        <div class="container">
            <div class="page-header">
                <h1 class="page-title">Attendance History</h1>
                <div class="header-controls">
                    <select id="month-filter" class="month-dropdown">
                        <?php
                        for ($i = 0; $i < 12; $i++) 
                        {
                            $monthValue = date('Y-m', strtotime("-$i months"));
                            $monthName = date('F Y', strtotime($monthValue));
                            $selected = $monthValue == $selectedMonth ? 'selected' : '';
                            echo "<option value='$monthValue' $selected>$monthName</option>";
                        }
                        ?>
                    </select>
                    <button class="export-btn" id="exportPdfBtn">
                        <i class="fas fa-file-pdf"></i>
                        Export PDF
                    </button>
                </div>
            </div>

            <div class="attendance-card">
                <div class="table-container">
                    <table class="attendance-table">
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>CLOCK IN</th>
                                <th>CLOCK OUT</th>
                                <th>TOTAL HOURS</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody id="attendance-tbody">
                            <?php foreach ($paginatedData as $record): ?>
                            <tr>
                                <td class="date-cell"><?php echo date('F j, Y', strtotime($record['date'])); ?></td>
                                <td class="time-cell"><?php echo $record['clock_in']; ?></td>
                                <td class="time-cell"><?php echo $record['clock_out']; ?></td>
                                <td class="hours-cell <?php 
                                    echo $record['status'] == 'In progress' ? 'hours-progress' : 
                                        ($record['total_hours'] == '0.00 h' ? 'hours-zero' : ''); 
                                ?>">
                                    <?php echo $record['total_hours']; ?>
                                </td>
                                <td>
                                    <span class="status-badge <?php 
                                        switch($record['status']) 
                                        {
                                            case 'Present': 
                                                echo 'status-present'; 
                                                break;
                                            case 'Late': 
                                                echo 'status-late'; 
                                                break;
                                            case 'Half Day': 
                                                echo 'status-half-day'; 
                                                break;
                                            case 'Absent': 
                                                echo 'status-absent'; 
                                                break;
                                            default: 
                                                echo 'status-in-progress';
                                        }
                                    ?>">
                                        <?php echo $record['status']; ?>
                                    </span>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <div class="pagination-container">
                    <div class="pagination-info">
                        <span>Showing <span id="showing-start"><?php echo $offset + 1; ?></span> to <span id="showing-end"><?php echo min($offset + $itemsPerPage, $totalItems); ?></span> of <span id="total-count"><?php echo $totalItems; ?></span> results</span>
                    </div>
                    <div class="pagination-controls">
                        <button class="pagination-btn" id="prev-btn" <?php echo $currentPage == 1 ? 'disabled' : ''; ?>>
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
                        <button class="pagination-btn <?php echo $i == $currentPage ? 'active' : ''; ?>" data-page="<?php echo $i; ?>">
                            <?php echo $i; ?>
                        </button>
                        <?php endfor; ?>
                        <button class="pagination-btn" id="next-btn" <?php echo $currentPage == $totalPages || $totalPages == 0 ? 'disabled' : ''; ?>>
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/history.js"></script>
    <script src="../js/sidebar.js"></script>
    <script>
    document.getElementById('exportPdfBtn').addEventListener('click', function() 
    {
        const monthFilter = document.getElementById('month-filter');
        const selectedMonth = monthFilter ? monthFilter.value : '<?php echo $currentMonth; ?>';
        
        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        btn.disabled = true;

        fetch('generate_employee_report.php', 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
            {
                month: selectedMonth,
                employee_id: '<?php echo $_SESSION["employee_id"]; ?>'
            })
        })
        .then(response => response.blob())
        .then(blob => 
        {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_report_${selectedMonth}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => 
        {
            console.error('Error:', error);
            alert('Failed to generate PDF report');
        })
        .finally(() => 
        {
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
    });
    </script>
</body>
</html>