<?php
require_once '../component/connection.php';
header('Content-Type: application/json');

try 
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) 
    {
        throw new Exception('Invalid input data');
    }

    session_start();
    if (!isset($_SESSION['employee_id']) || $_SESSION['user_type'] !== 'manager') 
    {
        throw new Exception('Unauthorized access');
    }

    $manager_id = $_SESSION['employee_id'];
    $stmt = $pdo->prepare("SELECT department_id FROM employees WHERE employee_id = ?");
    $stmt->execute([$manager_id]);
    $manager_department = $stmt->fetchColumn();

    $shiftMap = [
        'morning' => 1,
        'evening' => 2,
        'night' => 3,
        'standard' => 4
    ];

    $action = $input['action'] ?? 'assign';

    switch ($action) 
    {
        case 'assign':
            $required = ['employee_id', 'shift_type', 'date'];
            foreach ($required as $field) 
            {
                if (empty($input[$field])) 
                {
                    throw new Exception("Missing required field: $field");
                }
            }

            if (!isset($shiftMap[$input['shift_type']])) 
            {
                throw new Exception('Invalid shift type');
            }

            $stmt = $pdo->prepare("SELECT department_id FROM employees WHERE employee_id = ?");
            $stmt->execute([$input['employee_id']]);
            $employee_dept = $stmt->fetchColumn();

            if ($employee_dept != $manager_department) 
            {
                throw new Exception('You can only assign shifts to employees in your department');
            }

            $shift_id = $shiftMap[$input['shift_type']];

            $stmt = $pdo->prepare("INSERT INTO shift_assignments (employee_id, shift_id, assignment_date) VALUES (?, ?, ?)");
            $stmt->execute([$input['employee_id'], $shift_id, $input['date']]);

            echo json_encode([
                'success' => true,
                'message' => 'Shift assigned successfully'
            ]);
            break;

        case 'edit':
            $required = ['assignment_id', 'employee_id', 'shift_type', 'date'];
            foreach ($required as $field) 
            {
                if (empty($input[$field])) 
                {
                    throw new Exception("Missing required field: $field");
                }
            }

            if (!isset($shiftMap[$input['shift_type']])) {
                throw new Exception('Invalid shift type');
            }

            $stmt = $pdo->prepare("
                SELECT e.department_id 
                FROM shift_assignments sa
                JOIN employees e ON sa.employee_id = e.employee_id
                WHERE sa.assignment_id = ?
            ");
            $stmt->execute([$input['assignment_id']]);
            $shift_dept = $stmt->fetchColumn();

            if ($shift_dept != $manager_department) {
                throw new Exception('You can only edit shifts in your department');
            }

            $stmt = $pdo->prepare("SELECT department_id FROM employees WHERE employee_id = ?");
            $stmt->execute([$input['employee_id']]);
            $employee_dept = $stmt->fetchColumn();

            if ($employee_dept != $manager_department) 
            {
                throw new Exception('You can only assign shifts to employees in your department');
            }

            $shift_id = $shiftMap[$input['shift_type']];

            $stmt = $pdo->prepare("UPDATE shift_assignments SET employee_id = ?, shift_id = ?, assignment_date = ? WHERE assignment_id = ?");
            $stmt->execute([$input['employee_id'], $shift_id, $input['date'], $input['assignment_id']]);

            echo json_encode([
                'success' => true,
                'message' => 'Shift updated successfully'
            ]);
            break;

        case 'remove':
            if (empty($input['assignment_id'])) 
            {
                throw new Exception("Missing assignment ID");
            }

            $stmt = $pdo->prepare("
                SELECT e.department_id 
                FROM shift_assignments sa
                JOIN employees e ON sa.employee_id = e.employee_id
                WHERE sa.assignment_id = ?
            ");
            $stmt->execute([$input['assignment_id']]);
            $shift_dept = $stmt->fetchColumn();

            if ($shift_dept != $manager_department) 
            {
                throw new Exception('You can only remove shifts in your department');
            }

            $stmt = $pdo->prepare("DELETE FROM shift_assignments WHERE assignment_id = ?");
            $stmt->execute([$input['assignment_id']]);

            echo json_encode([
                'success' => true,
                'message' => 'Shift removed successfully'
            ]);
            break;

            case 'bulk_remove':
                if (empty($input['assignment_ids']) || !is_array($input['assignment_ids'])) 
                {
                    throw new Exception("Missing or invalid assignment IDs");
                }

                $placeholders = implode(',', array_fill(0, count($input['assignment_ids']), '?'));
                $stmt = $pdo->prepare("
                    SELECT sa.assignment_id 
                    FROM shift_assignments sa
                    JOIN employees e ON sa.employee_id = e.employee_id
                    WHERE sa.assignment_id IN ($placeholders)
                    AND e.department_id = ?
                ");
                $params = array_merge($input['assignment_ids'], [$manager_department]);
                $stmt->execute($params);
                $validAssignments = $stmt->fetchAll(PDO::FETCH_COLUMN);

                if (count($validAssignments) !== count($input['assignment_ids'])) 
                {
                    throw new Exception('Some shifts cannot be unassigned (not in your department)');
                }

                $stmt = $pdo->prepare("DELETE FROM shift_assignments WHERE assignment_id IN ($placeholders)");
                $stmt->execute($input['assignment_ids']);

                echo json_encode([
                    'success' => true,
                    'message' => count($input['assignment_ids']) . ' shift(s) unassigned successfully'
                ]);
                break;

        default:
            throw new Exception('Invalid action');
    }
} 
catch (Exception $e) 
{
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}