<?php
session_start();
require_once '../component/connection.php';
require_once realpath(__DIR__ . '/../../../../phpMyAdmin/vendor/tecnickcom/tcpdf/tcpdf.php');


error_reporting(E_ALL);
ini_set('display_errors', 1);

ob_clean();
ob_start();


if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') 
{
    header("Location: ../login.php");
    exit;
}
$isJsonRequest = strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false || 
                 ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_POST));

if ($isJsonRequest) 
{
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $reportType = $data['reportType'] ?? 'weekly';
    $department = $data['department'] ?? 'all';
    $format = $data['format'] ?? 'pdf';
    $startDate = $data['startDate'] ?? '';
    $endDate = $data['endDate'] ?? '';
    $isPreview = $data['preview'] ?? false;
} 
else 
{
    $reportType = $_POST['reportType'] ?? 'weekly';
    $department = $_POST['department'] ?? 'all';
    $format = $_POST['format'] ?? 'pdf';
    $startDate = $_POST['startDate'] ?? '';
    $endDate = $_POST['endDate'] ?? '';
    $isPreview = false;
}

if ($reportType === 'weekly') 
{
    $startDate = date('Y-m-d', strtotime('monday this week'));
    $endDate = date('Y-m-d', strtotime('sunday this week'));
} 
elseif ($reportType === 'monthly') 
{
    $startDate = date('Y-m-01');
    $endDate = date('Y-m-t');
}

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
          JOIN departments d ON e.department_id = d.id
          JOIN shifts s ON e.shift_id = s.shift_id
          WHERE DATE(a.check_time) BETWEEN :start_date AND :end_date";

if ($department !== 'all') 
{
    $query .= " AND e.department = :department";
}

$query .= " GROUP BY e.employee_id, DATE(a.check_time)
            ORDER BY date DESC, e.name ASC";

$stmt = $pdo->prepare($query);
$stmt->bindParam(':start_date', $startDate);
$stmt->bindParam(':end_date', $endDate);

if ($department !== 'all') 
{
    $stmt->bindParam(':department', $department);
}

$stmt->execute();
$records = $stmt->fetchAll(PDO::FETCH_ASSOC);

$processedRecords = [];
$summary = 
[
    'present' => 0,
    'absent' => 0,
    'half_day' => 0,
    'late' => 0,
    'total_hours' => 0,
    'total_overtime' => 0
];

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
            $shiftEndDateTime = (clone $checkDate)->setTime
            (
                (int)$shiftEndTime->format('H'),
                (int)$shiftEndTime->format('i')
            );
        }

        if ($clockOut > $shiftEndDateTime) 
        {
            $overtimeDiff = $shiftEndDateTime->diff($clockOut);
            $overtime = $overtimeDiff->h + ($overtimeDiff->i / 60);
        }

        $shiftDuration = $shiftStartTime->diff($shiftEndTime);
        $shiftHours = $shiftDuration->h + ($shiftDuration->i / 60);
        if ($hours < ($shiftHours * 0.5)) 
        {
            $isHalfDay = true;
        }
    } 
    elseif ($record['clock_in'] && !$record['clock_out']) 
    {
        $isHalfDay = true;
        $hours = 4;
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

    if ($status === 'Present') $summary['present']++;
    if ($status === 'Absent') $summary['absent']++;
    if ($status === 'Half Day') $summary['half_day']++;
    if ($status === 'Late') $summary['late']++;
    $summary['total_hours'] += $hours;
    $summary['total_overtime'] += $overtime;
}
if ($isPreview) 
{
    header('Content-Type: text/html');
    echo generateHtmlPreview($processedRecords, $summary, $reportType, $department, $startDate, $endDate);
     exit;
}

switch ($format) 
{
    case 'pdf':
        generatePdfReport($processedRecords, $summary, $reportType, $department, $startDate, $endDate);
        break;
    case 'csv':
        generateCsvReport($processedRecords, $summary, $reportType, $department, $startDate, $endDate);
        break;
    default:
        die("Invalid format specified");
}

function generatePdfReport($records, $summary, $reportType, $department, $startDate, $endDate) 
{
    try 
    {

        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
    
        $pdf->SetCreator('Employee Attendance System');
        $pdf->SetAuthor('Admin');
        $pdf->SetTitle('Attendance Report');
        $pdf->SetSubject('Attendance Report');
    
        $pdf->AddPage();
    
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 10, 'Attendance Report', 0, 1, 'C');
    
        $pdf->SetFont('helvetica', '', 10);
    
        $pdf->Cell(0, 6, 'Report Type: ' . ucfirst($reportType) . ' Report', 0, 1);
        $pdf->Cell(0, 6, 'Department: ' . ($department === 'all' ? 'All Departments' : $department), 0, 1);
        $pdf->Cell(0, 6, 'Date Range: ' . date('M j, Y', strtotime($startDate)) . ' to ' . date('M j, Y', strtotime($endDate)), 0, 1);
        $pdf->Cell(0, 6, 'Generated: ' . date('M j, Y H:i:s'), 0, 1);
        $pdf->Ln(10);
    
        $header = ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Overtime', 'Status', 'Shift'];
        $w = [40, 25, 20, 20, 20, 15, 15, 20, 20];
    
        $pdf->SetFont('helvetica', 'B');
        for ($i = 0; $i < count($header); $i++) 
        {
            $pdf->Cell($w[$i], 7, $header[$i], 1, 0, 'C');
        }
        $pdf->Ln();
    
        $pdf->SetFont('helvetica', '');
        foreach ($records as $row) 
        {
            $pdf->Cell($w[0], 6, $row['name'] . ' (' . $row['id'] . ')', 'LR', 0, 'L');
            $pdf->Cell($w[1], 6, $row['department'], 'LR', 0, 'L');
            $pdf->Cell($w[2], 6, $row['date'], 'LR', 0, 'L');
            $pdf->Cell($w[3], 6, $row['clockIn'], 'LR', 0, 'L');
            $pdf->Cell($w[4], 6, $row['clockOut'], 'LR', 0, 'L');
            $pdf->Cell($w[5], 6, $row['hours'], 'LR', 0, 'L');
            $pdf->Cell($w[6], 6, $row['overtime'], 'LR', 0, 'L');
        
            $pdf->SetFillColor(255, 255, 255);
            switch ($row['status']) 
            {
                case 'Present': $pdf->SetFillColor(212, 237, 218); break;
                case 'Absent': $pdf->SetFillColor(248, 215, 218); break;
                case 'Half Day': $pdf->SetFillColor(255, 243, 205); break;
                case 'Late': $pdf->SetFillColor(204, 229, 255); break;
            }
            $pdf->Cell($w[7], 6, $row['status'], 'LR', 0, 'C', true);
        
            $pdf->SetFillColor(255, 255, 255);
            $pdf->Cell($w[8], 6, $row['shift'], 'LR', 0, 'L');
            $pdf->Ln();
        }
    
        $pdf->Ln(10);
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 10, 'Report Summary', 0, 1);
        $pdf->SetFont('helvetica', '', 10);
    
        $summaryData = 
        [
            ['Present', $summary['present']],
            ['Absent', $summary['absent']],
            ['Half Day', $summary['half_day']],
            ['Late', $summary['late']],
            ['Total Hours', number_format($summary['total_hours'], 1) . 'h'],
            ['Total Overtime', '+' . number_format($summary['total_overtime'], 1) . 'h']
        ];
    
        foreach ($summaryData as $item) 
        {
            $pdf->Cell(50, 6, $item[0] . ':', 0, 0, 'R');
            $pdf->Cell(0, 6, $item[1], 0, 1);
        }
    
        $filename = 'attendance_report_' . $reportType . '_' . date('Ymd_His') . '.pdf';
        $pdf->Output($filename, 'D');
        exit;
    }
    catch (Exception $e) 
    {
        sendErrorResponse("PDF generation failed: " . $e->getMessage());
    }
}

function generateCsvReport($records, $summary, $reportType, $department, $startDate, $endDate) 
{
    $filename = 'attendance_report_' . $reportType . '_' . date('Ymd_His') . '.csv';
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    $output = fopen('php://output', 'w');
    
    fputcsv($output, ['Attendance Report']);
    fputcsv($output, ['Report Type:', ucfirst($reportType) . ' Report']);
    fputcsv($output, ['Department:', $department === 'all' ? 'All Departments' : $department]);
    fputcsv($output, ['Date Range:', date('M j, Y', strtotime($startDate)) . ' to ' . date('M j, Y', strtotime($endDate))]);
    fputcsv($output, ['Generated:', date('M j, Y H:i:s')]);
    fputcsv($output, []); 
    
    fputcsv($output, ['Employee', 'Department', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Overtime', 'Status', 'Shift']);
    
    foreach ($records as $record) 
    {
        fputcsv($output, 
        [
            $record['name'] . ' (' . $record['id'] . ')',
            $record['department'],
            $record['date'],
            $record['clockIn'],
            $record['clockOut'],
            $record['hours'],
            $record['overtime'],
            $record['status'],
            $record['shift']
        ]);
    }
    
    fputcsv($output, []); 
    fputcsv($output, ['Report Summary']);
    fputcsv($output, ['Present:', $summary['present']]);
    fputcsv($output, ['Absent:', $summary['absent']]);
    fputcsv($output, ['Half Day:', $summary['half_day']]);
    fputcsv($output, ['Late:', $summary['late']]);
    fputcsv($output, ['Total Hours:', number_format($summary['total_hours'], 1) . 'h']);
    fputcsv($output, ['Total Overtime:', '+' . number_format($summary['total_overtime'], 1) . 'h']);
    
    fclose($output);
    exit;
}

function generateHtmlPreview($records, $summary, $reportType, $department, $startDate, $endDate) 
{
    ob_start();
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Attendance Report Preview</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { margin-top: 20px; }
            .status-present { background-color: #d4edda; }
            .status-absent { background-color: #f8d7da; }
            .status-half-day { background-color: #fff3cd; }
            .status-late { background-color: #cce5ff; }
        </style>
    </head>
    <body>
        <h1>Attendance Report Preview</h1>
        <div><strong>Report Type:</strong> <?= ucfirst($reportType) ?> Report</div>
        <div><strong>Department:</strong> <?= $department === 'all' ? 'All Departments' : $department ?></div>
        <div><strong>Date Range:</strong> <?= date('M j, Y', strtotime($startDate)) ?> to <?= date('M j, Y', strtotime($endDate)) ?></div>
        <div><strong>Generated:</strong> <?= date('M j, Y H:i:s') ?></div>
        
        <table>
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
            <tbody>
                <?php foreach ($records as $record): ?>
                <tr>
                    <td><?= htmlspecialchars($record['name']) ?> (<?= htmlspecialchars($record['id']) ?>)</td>
                    <td><?= htmlspecialchars($record['department']) ?></td>
                    <td><?= htmlspecialchars($record['date']) ?></td>
                    <td><?= htmlspecialchars($record['clockIn']) ?></td>
                    <td><?= htmlspecialchars($record['clockOut']) ?></td>
                    <td><?= htmlspecialchars($record['hours']) ?></td>
                    <td><?= htmlspecialchars($record['overtime']) ?></td>
                    <td class="status-<?= strtolower(str_replace(' ', '-', $record['status'])) ?>">
                        <?= htmlspecialchars($record['status']) ?>
                    </td>
                    <td><?= htmlspecialchars($record['shift']) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        
        <div class="summary">
            <h2>Report Summary</h2>
            <div><strong>Present:</strong> <?= $summary['present'] ?></div>
            <div><strong>Absent:</strong> <?= $summary['absent'] ?></div>
            <div><strong>Half Day:</strong> <?= $summary['half_day'] ?></div>
            <div><strong>Late:</strong> <?= $summary['late'] ?></div>
            <div><strong>Total Hours:</strong> <?= number_format($summary['total_hours'], 1) ?>h</div>
            <div><strong>Total Overtime:</strong> +<?= number_format($summary['total_overtime'], 1) ?>h</div>
        </div>
    </body>
    </html>
    <?php
    return ob_get_clean();
}

function sendErrorResponse($message) 
{
    if (headers_sent()) 
    {
        die($message);
    }
    
    header('Content-Type: application/json');
    die(json_encode(['error' => $message]));
}