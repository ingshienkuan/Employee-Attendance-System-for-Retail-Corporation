CREATE DATABASE IF NOT EXISTS tse_employee_attendance;
USE tse_employee_attendance;

-- Create departments table first (referenced later)
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

-- Insert sample employees with pre-linked department_id and shift_id
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

('ADM123', 'ADMIN', 'admin', 'd59b6ad4dd4667de6c6ac8c56b9e2293', 'admin@gmail.com',
    NULL,
    (SELECT id FROM departments WHERE name = 'admin'));

-- Create Attendance table
CREATE TABLE Attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50),
    check_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(255),
    action_type ENUM('check_in', 'check_out') NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE IF NOT EXISTS shift_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    shift_id INT NOT NULL,
    assignment_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (shift_id) REFERENCES shifts(shift_id),
    UNIQUE KEY (employee_id, assignment_date) 
);

INSERT INTO shift_assignments (employee_id, shift_id, assignment_date)
VALUES
('EMP002', 2, '2025-06-10'),
('EMP005', 4, '2025-06-10'),
('EMP005', 4, '2025-06-11'),
('EMP006', 3, '2025-06-12'),
('EMP002', 2, '2025-06-14');

