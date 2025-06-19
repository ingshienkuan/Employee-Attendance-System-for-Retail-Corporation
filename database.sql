-- Create the database and use it
CREATE DATABASE IF NOT EXISTS tse_employee_attendance;
USE tse_employee_attendance;

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    shift_required BOOLEAN DEFAULT 0
);

-- Insert departments
INSERT INTO departments (name, description, shift_required) VALUES
('IT', NULL, 0),
('HR', NULL, 0),
('Finance', NULL, 0),
('Marketing', NULL, 0),
('Operations', NULL, 0),
('admin', NULL, 0);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
    shift_id INT AUTO_INCREMENT PRIMARY KEY,
    shift_name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description VARCHAR(255)
);

-- Insert sample shift data
INSERT INTO shifts (shift_name, start_time, end_time, description) VALUES
('Morning Shift', '08:00:00', '16:00:00', 'Standard morning shift (8am-4pm)'),
('Evening Shift', '14:00:00', '22:00:00', 'Standard evening shift (2pm-10pm)'),
('Night Shift', '22:00:00', '06:00:00', 'Standard night shift (10pm-6am)'),
('Standard Hours', '09:00:00', '17:00:00', 'Regular office hours (9am-5pm)');

-- Create employees table with foreign keys for shift and department
CREATE TABLE employees (
    employee_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_type ENUM('employee', 'manager', 'admin') NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    shift_id INT,
    department_id INT,
    FOREIGN KEY (shift_id) REFERENCES shifts(shift_id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Insert sample employees 
INSERT INTO employees (employee_id, name, user_type, password_hash, email, shift_id, department_id)
VALUES
('EMP001', 'John Smith', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'john.smith@gmail.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Morning Shift'),
    (SELECT id FROM departments WHERE name = 'IT')),

('EMP002', 'Sarah Johnson', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'sarah.johnson@gmail.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Evening Shift'),
    (SELECT id FROM departments WHERE name = 'HR')),

('EMP003', 'Michael Brown', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'michael.brown@gmail.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Night Shift'),
    (SELECT id FROM departments WHERE name = 'Finance')),

('EMP004', 'Emily Davis', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'emily.davis@gmail.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Morning Shift'),
    (SELECT id FROM departments WHERE name = 'Marketing')),

('EMP005', 'David Wilson', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'david.wilson@gmail.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Standard Hours'),
    (SELECT id FROM departments WHERE name = 'Operations')),

-- IT Department
('EMP101', 'Alice Nguyen', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'alice.nguyen@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Morning Shift'),
    (SELECT id FROM departments WHERE name = 'IT')),
('EMP102', 'Bob White', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'bob.white@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Evening Shift'),
    (SELECT id FROM departments WHERE name = 'IT')),
('EMP103', 'Carol Kim', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'carol.kim@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Night Shift'),
    (SELECT id FROM departments WHERE name = 'IT')),
('MGR101', 'Daniel Park', 'manager', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'daniel.park@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Standard Hours'),
    (SELECT id FROM departments WHERE name = 'IT')),

-- HR Department
('EMP201', 'Eva Moore', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'eva.moore@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Morning Shift'),
    (SELECT id FROM departments WHERE name = 'HR')),
('EMP202', 'Frank Green', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'frank.green@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Evening Shift'),
    (SELECT id FROM departments WHERE name = 'HR')),
('EMP203', 'Grace Lee', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'grace.lee@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Night Shift'),
    (SELECT id FROM departments WHERE name = 'HR')),
('MGR201', 'Henry Wright', 'manager', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'henry.wright@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Standard Hours'),
    (SELECT id FROM departments WHERE name = 'HR')),

-- Finance Department
('EMP301', 'Irene Hall', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'irene.hall@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Morning Shift'),
    (SELECT id FROM departments WHERE name = 'Finance')),
('EMP302', 'Jack Hill', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'jack.hill@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Evening Shift'),
    (SELECT id FROM departments WHERE name = 'Finance')),
('EMP303', 'Karen Scott', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'karen.scott@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Night Shift'),
    (SELECT id FROM departments WHERE name = 'Finance')),
('MGR301', 'Leo Adams', 'manager', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'leo.adams@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Standard Hours'),
    (SELECT id FROM departments WHERE name = 'Finance')),

-- Marketing Department
('EMP401', 'Mia Reed', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'mia.reed@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Morning Shift'),
    (SELECT id FROM departments WHERE name = 'Marketing')),
('EMP402', 'Nathan Ross', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'nathan.ross@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Evening Shift'),
    (SELECT id FROM departments WHERE name = 'Marketing')),
('EMP403', 'Olivia Cox', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'olivia.cox@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Night Shift'),
    (SELECT id FROM departments WHERE name = 'Marketing')),
('MGR401', 'Paul King', 'manager', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'paul.king@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Standard Hours'),
    (SELECT id FROM departments WHERE name = 'Marketing')),

-- Operations Department
('EMP501', 'Quinn Morgan', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'quinn.morgan@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Morning Shift'),
    (SELECT id FROM departments WHERE name = 'Operations')),
('EMP502', 'Rachel Young', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'rachel.young@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Evening Shift'),
    (SELECT id FROM departments WHERE name = 'Operations')),
('EMP503', 'Sam Baker', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'sam.baker@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Night Shift'),
    (SELECT id FROM departments WHERE name = 'Operations')),
('MGR501', 'Tina Brooks', 'manager', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'tina.brooks@company.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Standard Hours'),
    (SELECT id FROM departments WHERE name = 'Operations')),

('ADM123', 'ADMIN', 'admin', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'admin@gmail.com',
    NULL,
    (SELECT id FROM departments WHERE name = 'admin')),

('EMP006', 'Alice Green', 'employee', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'alice.green@gmail.com',
    (SELECT shift_id FROM shifts WHERE shift_name = 'Night Shift'),
    (SELECT id FROM departments WHERE name = 'Operations'));

-- Create Attendance table
CREATE TABLE Attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50),
    check_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(255),
    action_type ENUM('check_in', 'check_out') NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

-- Create shift_assignments table
CREATE TABLE IF NOT EXISTS shift_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    shift_id INT NOT NULL,
    assignment_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (shift_id) REFERENCES shifts(shift_id),
    UNIQUE KEY (employee_id, assignment_date) 
);

-- Insert shift assignments data
INSERT INTO shift_assignments (employee_id, shift_id, assignment_date)
VALUES
('EMP002', 2, '2025-06-10'),
('EMP005', 4, '2025-06-10'),
('EMP005', 4, '2025-06-11'),
('EMP006', 3, '2025-06-12'),
('EMP002', 2, '2025-06-14');

