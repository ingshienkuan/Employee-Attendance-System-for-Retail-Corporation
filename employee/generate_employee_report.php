<?php
session_start();
require_once '../component/connection.php';
require_once realpath(__DIR__ . '/../../../../phpMyAdmin/vendor/tecnickcom/tcpdf/tcpdf.php');
date_default_timezone_set('Asia/Kuala_Lumpur');

if (!isset($_SESSION['user_type']))
{
    header("HTTP/1.1 403 Forbidden");
    exit;
}

if ($_SESSION['user_type'] !== 'employee') 
{
    header("HTTP/1.1 403 Forbidden");
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$month = $data['month'] ?? date('Y-m');
$employee_id = $data['employee_id'] ?? $_SESSION['employee_id'];

$stmt = $pdo->prepare("
    SELECT 
        e.name, 
        d.name as department,
        s.shift_name,
        s.start_time as shift_start,
        s.end_time as shift_end
    FROM employees e
    JOIN departments d ON e.department_id = d.id
    LEFT JOIN shifts s ON e.shift_id = s.shift_id
    WHERE e.employee_id = ?
");
$stmt->execute([$employee_id]);
$employee = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$employee)
{
    die("Employee not found");
}

$startDate = date('Y-m-01', strtotime($month));
$endDate = date('Y-m-t', strtotime($month));

$stmt = $pdo->prepare("
    SELECT 
        DATE(check_time) as date,
        MIN(CASE WHEN action_type = 'check_in' THEN check_time END) as check_in,
        MAX(CASE WHEN action_type = 'check_out' THEN check_time END) as check_out
    FROM Attendance
    WHERE employee_id = :employee_id
    AND DATE(check_time) BETWEEN :start_date AND :end_date
    GROUP BY DATE(check_time)
    ORDER BY date DESC
");

$stmt->execute(
    [
        ':employee_id' => $employee_id,
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

        if (!empty($employee['shift_start']))
        {
            $shiftStart = new DateTime($employee['shift_start']);
            $lateThreshold = new DateInterval('PT20M');
            $lateTime = clone $shiftStart;
            $lateTime->add($lateThreshold);
            
            if ($clockIn > $lateTime)
            {
                $isLate = true;
            }
            
            $shiftDuration = (new DateTime($employee['shift_start']))->diff(new DateTime($employee['shift_end']));
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

$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

$pdf->SetCreator('Employee Attendance System');
$pdf->SetAuthor($employee['name']);
$pdf->SetTitle('Attendance Report - ' . $month);
$pdf->SetSubject('Attendance Report');

$pdf->AddPage();

$pdf->SetFont('helvetica', 'B', 16);
$pdf->Cell(0, 10, 'Attendance Report', 0, 1, 'C');

$pdf->SetFont('helvetica', '', 10);
$pdf->Cell(0, 6, 'Employee: ' . $employee['name'] . ' (' . $employee_id . ')', 0, 1);
$pdf->Cell(0, 6, 'Department: ' . $employee['department'], 0, 1);
$pdf->Cell(0, 6, 'Shift: ' . ($employee['shift_name'] ?? 'Not assigned'), 0, 1);
$pdf->Cell(0, 6, 'Period: ' . date('F Y', strtotime($month)), 0, 1);
$pdf->Cell(0, 6, 'Generated: ' . date('M j, Y H:i:s'), 0, 1);
$pdf->Ln(10);

$header = ['Date', 'Clock In', 'Clock Out', 'Total Hours', 'Status'];
$w = [40, 30, 30, 30, 40];

$pdf->SetFont('helvetica', 'B');
for ($i = 0; $i < count($header); $i++)
{
    $pdf->Cell($w[$i], 7, $header[$i], 1, 0, 'C');
}
$pdf->Ln();

$pdf->SetFont('helvetica', '');
foreach ($records as $row)
{
    $pdf->Cell($w[0], 6, date('M j, Y', strtotime($row['date'])), 'LR', 0, 'L');
    $pdf->Cell($w[1], 6, $row['clock_in'], 'LR', 0, 'L');
    $pdf->Cell($w[2], 6, $row['clock_out'], 'LR', 0, 'L');
    $pdf->Cell($w[3], 6, $row['total_hours'], 'LR', 0, 'L');
    
    $pdf->SetFillColor(255, 255, 255);
    switch (strtolower($row['status']))
    {
        case 'present': 
            $pdf->SetFillColor(212, 237, 218); 
            break;
        case 'late': 
            $pdf->SetFillColor(204, 229, 255); 
            break;
        case 'half day': 
            $pdf->SetFillColor(255, 243, 205); 
            break;
        case 'absent': 
            $pdf->SetFillColor(248, 215, 218); 
            break;
        case 'in progress': 
            $pdf->SetFillColor(255, 243, 205); 
            break;
    }
    $pdf->Cell($w[4], 6, $row['status'], 'LR', 0, 'C', true);
    
    $pdf->Ln();
}

$pdf->Ln(10);
$pdf->SetFont('helvetica', 'B', 12);
$pdf->Cell(0, 10, 'Summary', 0, 1);

$presentCount = count(array_filter($records, function($r) 
{ 
    return strtolower($r['status']) === 'present'; 
}));
$lateCount = count(array_filter($records, function($r) 
{ 
    return strtolower($r['status']) === 'late'; 
}));
$halfDayCount = count(array_filter($records, function($r) 
{ 
    return strtolower($r['status']) === 'half day'; 
}));
$absentCount = count(array_filter($records, function($r) 
{ 
    return strtolower($r['status']) === 'absent'; 
}));

$totalHours = array_reduce($records, function($carry, $r) 
{
    if (is_numeric(str_replace(' h', '', $r['total_hours'])))
    {
        return $carry + (float)str_replace(' h', '', $r['total_hours']);
    }
    return $carry;
}, 0);

$pdf->SetFont('helvetica', '', 10);
$pdf->Cell(50, 6, 'Present Days:', 0, 0, 'R');
$pdf->Cell(0, 6, $presentCount, 0, 1);
$pdf->Cell(50, 6, 'Late Days:', 0, 0, 'R');
$pdf->Cell(0, 6, $lateCount, 0, 1);
$pdf->Cell(50, 6, 'Half Days:', 0, 0, 'R');
$pdf->Cell(0, 6, $halfDayCount, 0, 1);
$pdf->Cell(50, 6, 'Absent Days:', 0, 0, 'R');
$pdf->Cell(0, 6, $absentCount, 0, 1);
$pdf->Cell(50, 6, 'Total Hours:', 0, 0, 'R');
$pdf->Cell(0, 6, number_format($totalHours, 2) . ' hours', 0, 1);

$filename = 'attendance_report_' . $employee_id . '_' . $month . '.pdf';
$pdf->Output($filename, 'D');