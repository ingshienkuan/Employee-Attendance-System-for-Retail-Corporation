<?php
session_start();
require_once '../component/connection.php';
date_default_timezone_set('Asia/Kuala_Lumpur');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') 
{
  header("Location: ../login.php");
  exit;
}

function getAttendanceRecords($pdo) 
{
    $query = "SELECT 
                a.attendance_id,
                e.employee_id,
                e.name,
                d.name AS department,
                DATE(a.check_time) as date,
                MIN(CASE WHEN a.action_type = 'check_in' THEN TIME(a.check_time) END) as clock_in,
                MAX(CASE WHEN a.action_type = 'check_out' THEN TIME(a.check_time) END) as clock_out,
                s.shift_id,
                s.shift_name,
                s.start_time as shift_start,
                s.end_time as shift_end,
                s.description as shift_description
              FROM Attendance a
              JOIN employees e ON a.employee_id = e.employee_id
              JOIN shifts s ON e.shift_id = s.shift_id
              LEFT JOIN departments d ON e.department_id = d.id
              GROUP BY e.employee_id, DATE(a.check_time)
              ORDER BY date DESC, a.check_time DESC";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $processedRecords = [];
    foreach ($records as $record) 
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
            $shiftStartTime = new DateTime($record['shift_start']);

            if ($shiftEndTime < $shiftStartTime) 
            {
                $shiftEndDateTime = (clone $checkDate)->modify('+1 day')->setTime
                (
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

            if ($clockOut > $shiftEndDateTime) 
            {
                if ($clockOut->format('Y-m-d') === $checkDate->format('Y-m-d')) 
                {
                    $overtimeDiff = $shiftEndDateTime->diff($clockOut);
                    $overtime = $overtimeDiff->h + ($overtimeDiff->i / 60);
                    if ($overtime > 5) 
                    {
                      $overtime = 5; 
                  }
                }
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
            'shift' => $record['shift_name']
        ];
    }
    
    return $processedRecords;
}

$attendanceRecords = getAttendanceRecords($pdo);

$stmt = $pdo->query("SELECT DISTINCT name FROM departments WHERE name != 'admin'");
$departments = $stmt->fetchAll(PDO::FETCH_COLUMN);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Attendance Record- Employee Attendance System</title>
  <link rel="stylesheet" href="../css/attendance_record.css" />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  />
</head>

<body>
  <?php include 'sidebar.php'; ?>
  <div class="container">
    <div class="attendance_record-header">
      <h1>Attendance Record</h1>
    </div>
      <div class="tab-navigation">
        <button class="tab-btn active" data-tab="attendance-logs">
          View Attendance Logs
        </button>
        <button class="tab-btn" data-tab="generate-reports">
          Generate Reports
        </button>
      </div>

      <div id="attendance-logs" class="tab-content active">
        <div class="content-header">
          <div class="content-title">Attendance Logs</div>
          <div class="content-subtitle">
            Showing <span id="record-count"><?php echo count($attendanceRecords); ?></span> records
          </div>
        </div>

        <div class="filters">
          <div class="filter-group">
            <label class="filter-label">Search Employee</label>
            <input
              type="text"
              id="search-employee"
              class="filter-input"
              placeholder="Enter name or ID..."
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">Department</label>
            <select id="filter-department" class="filter-select">
              <option value="">All Departments</option>
              <?php foreach ($departments as $dept): ?>
                <option value="<?php echo htmlspecialchars($dept); ?>"><?php echo htmlspecialchars($dept); ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Status</label>
            <select id="filter-status" class="filter-select">
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="Late">Late</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Date</label>
            <input type="date" id="filter-date" class="filter-input" />
          </div>
        </div>

        <table class="attendance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Hours</th>
              <th>Overtime</th>
              <th>Status</th>
              <th>Shift</th>
            </tr>
          </thead>
          <tbody id="attendance-tbody">
            <?php foreach ($attendanceRecords as $record): ?>
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
                <td><?php echo htmlspecialchars($record['clockIn']); ?></td>
                <td><?php echo htmlspecialchars($record['clockOut']); ?></td>
                <td><?php echo htmlspecialchars($record['hours']); ?></td>
                <td class="<?php echo $overtimeClass; ?>"><?php echo htmlspecialchars($record['overtime']); ?></td>
                <td>
                    <span class="status-badge <?php 
                        if ($record['status'] === 'Present') echo 'status-present';
                        elseif ($record['status'] === 'Absent') echo 'status-absent';
                        elseif ($record['status'] === 'Half Day') echo 'status-half-day';
                        elseif ($record['status'] === 'Late') echo 'status-late';
                    ?>">
                        <?php echo htmlspecialchars($record['status']); ?>
                    </span>
                </td>
                <td><?php echo htmlspecialchars($record['shift']); ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>

      <div id="generate-reports" class="tab-content">
        <div class="content-header">
          <div class="content-title">Generate Attendance Reports</div>
        </div>

        <div class="report-form">
          <div class="form-section">
            <h3>Report Type</h3>
            <div class="radio-group">
              <div class="radio-option">
                <input
                  type="radio"
                  id="weekly-report"
                  name="report-type"
                  value="weekly"
                  checked
                />
                <label for="weekly-report">Weekly Report</label>
              </div>
              <div class="radio-option">
                <input
                  type="radio"
                  id="monthly-report"
                  name="report-type"
                  value="monthly"
                />
                <label for="monthly-report">Monthly Report</label>
              </div>
              <div class="radio-option">
                <input
                  type="radio"
                  id="custom-report"
                  name="report-type"
                  value="custom"
                />
                <label for="custom-report">Custom Date Range</label>
              </div>
            </div>
            <div class="date-inputs" id="custom-date-range" style="display: none;">
              <input type="date" id="start-date" placeholder="Start Date" />
              <span>to</span>
              <input type="date" id="end-date" placeholder="End Date" />
            </div>
          </div>

          <div class="form-section">
            <h3>Department</h3>
            <select class="form-select" id="report-department">
              <option value="all">All Departments</option>
              <?php foreach ($departments as $dept): ?>
                <option value="<?php echo htmlspecialchars($dept); ?>"><?php echo htmlspecialchars($dept); ?></option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="form-section">
            <h3>Report Format</h3>
            <select class="form-select" id="report-format">
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div class="report-preview">
            <div class="preview-title">Report Preview</div>
            <div class="preview-details">
              <div>
                <strong>Type:</strong>
                <span id="preview-type">Weekly Report</span>
              </div>
              <div>
                <strong>Department:</strong>
                <span id="preview-department">All Departments</span>
              </div>
              <div>
                <strong>Format:</strong>
                <span id="preview-format">PDF</span>
              </div>
              <div>
                <strong>Records:</strong>
                <span id="preview-records"><?php echo count($attendanceRecords); ?> entries</span>
              </div>
              <div>
                <strong>Date Range:</strong>
                <span id="preview-date-range"><?php echo date('Y-m-d'); ?></span>
              </div>
            </div>

            <div class="report-summary">
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">Present:</span>
                  <span class="summary-value" id="summary-present">
                    <?php echo count(array_filter($attendanceRecords, function($r) { return $r['status'] === 'Present'; })); ?>
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Absent:</span>
                  <span class="summary-value" id="summary-absent">
                    <?php echo count(array_filter($attendanceRecords, function($r) { return $r['status'] === 'Absent'; })); ?>
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Half Day:</span>
                  <span class="summary-value" id="summary-half-day">
                    <?php echo count(array_filter($attendanceRecords, function($r) { return $r['status'] === 'Half Day'; })); ?>
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Late:</span>
                  <span class="summary-value" id="summary-late">
                    <?php echo count(array_filter($attendanceRecords, function($r) { return $r['status'] === 'Late'; })); ?>
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Total Hours:</span>
                  <span class="summary-value" id="summary-hours">
                    <?php 
                      $totalHours = array_reduce($attendanceRecords, function($carry, $item) 
                      {
                        return $carry + (float)str_replace('h', '', $item['hours']);
                      }, 0);
                      echo number_format($totalHours, 1) . 'h';
                    ?>
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Overtime:</span>
                  <span class="summary-value" id="summary-overtime">
                    <?php 
                      $totalOvertime = array_reduce($attendanceRecords, function($carry, $item) 
                      {
                        $overtime = str_replace(['+', 'h'], '', $item['overtime']);
                        return $carry + (float)$overtime;
                      }, 0);
                      echo '+' . number_format($totalOvertime, 1) . 'h';
                    ?>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="button-group">
            <button class="btn btn-primary" onclick="generateReport()">
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              Generate & Download Report
            </button>
            <button class="btn btn-secondary" onclick="previewReport()">
              Preview Report
            </button>
          </div>
        </div>
      </div>
    </div>

  <script src="../js/attendance_record.js"></script>
  <script src="../js/sidebar.js"></script>
  
</body>
</html>