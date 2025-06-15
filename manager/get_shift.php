<?php
require_once '../component/connection.php';
header('Content-Type: application/json');

try 
{
    if (!isset($_GET['assignment_id'])) 
    {
        throw new Exception('Missing assignment ID');
    }

    $assignmentId = $_GET['assignment_id'];

    session_start();
    if (!isset($_SESSION['employee_id'])) 
    {
        throw new Exception('Unauthorized access');
    }

    $manager_id = $_SESSION['employee_id'];
    $stmt = $pdo->prepare("SELECT department_id FROM employees WHERE employee_id = ?");
    $stmt->execute([$manager_id]);
    $manager_department = $stmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT 
            sa.assignment_id,
            sa.assignment_date,
            sa.shift_id,
            sa.employee_id,
            e.name AS employee_name,
            s.shift_name,
            e.department_id
        FROM shift_assignments sa
        JOIN employees e ON sa.employee_id = e.employee_id
        JOIN shifts s ON sa.shift_id = s.shift_id
        WHERE sa.assignment_id = ?
    ");
    $stmt->execute([$assignmentId]);
    $shiftData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$shiftData) 
    {
        throw new Exception('Shift assignment not found');
    }

    if ($shiftData['department_id'] != $manager_department) 
    {
        throw new Exception('You can only edit shifts in your department');
    }

    echo json_encode([
        'success' => true,
        'data' => $shiftData
    ]);
} 
catch (Exception $e) 
{
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}