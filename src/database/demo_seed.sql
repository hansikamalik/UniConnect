-- =============================================================================
-- UniConnect Rich Demo Seed Data (PostgreSQL)
-- Provides active test accounts for all 5 roles and sample records
-- =============================================================================

-- 1. Users
-- Passwords:
-- student1 / student2: Student@123 ($2a$10$q2b7HsS3V1w337l8gMrAy.OI3rMpOiIIdlF4MXhXa4jTknWceLRHu)
-- faculty1:            Faculty@123 ($2a$10$AyiDeN6xyVYYkOjF1nn/HeWq4HAg20apXB.mOdJCjmGDWEplhOh0W)
-- warden1:             Warden@123  ($2a$10$WkM0av5ubM335UNR8lYm5e.XwFXcYgvD6G4aBzcMbQBZARHf6mXKy)
-- messadmin1:          Mess@123    ($2a$10$jbQJycVpgoeXbiv5cFpdMOeAX/X/ZpdfzDzQx8r7GFq7nSf3zrv9e)

INSERT INTO users (username, password_hash, role, full_name, email, is_active) VALUES
    ('student1',   '$2a$10$q2b7HsS3V1w337l8gMrAy.OI3rMpOiIIdlF4MXhXa4jTknWceLRHu', 'Student',    'Aarav Sharma',     'aarav@students.sau.int',   TRUE),
    ('student2',   '$2a$10$q2b7HsS3V1w337l8gMrAy.OI3rMpOiIIdlF4MXhXa4jTknWceLRHu', 'Student',    'Priya Nair',       'priya@students.sau.int',   TRUE),
    ('faculty1',   '$2a$10$AyiDeN6xyVYYkOjF1nn/HeWq4HAg20apXB.mOdJCjmGDWEplhOh0W', 'Faculty',    'Dr. Rajesh Kumar', 'rajesh.kumar@sau.int',     TRUE),
    ('warden1',    '$2a$10$WkM0av5ubM335UNR8lYm5e.XwFXcYgvD6G4aBzcMbQBZARHf6mXKy', 'Warden',     'Mr. Vikram Singh', 'vikram.warden@sau.int',    TRUE),
    ('messadmin1', '$2a$10$jbQJycVpgoeXbiv5cFpdMOeAX/X/ZpdfzDzQx8r7GFq7nSf3zrv9e', 'Mess Admin', 'Mr. Ramesh Chand', 'mess.admin@sau.int',       TRUE)
ON CONFLICT (username) DO NOTHING;

-- 2. Student Profiles
-- Aarav Sharma is a hostel resident in BH1-304
-- Priya Nair is a day scholar (custom_hostel_id is NULL)
INSERT INTO students (user_id, enrollment_id, custom_hostel_id)
SELECT u.user_id, 'SAU/2026/CS/001', 'BH1-304'
FROM users u WHERE u.username = 'student1'
ON CONFLICT (enrollment_id) DO NOTHING;

INSERT INTO students (user_id, enrollment_id, custom_hostel_id)
SELECT u.user_id, 'SAU/2026/CS/002', NULL
FROM users u WHERE u.username = 'student2'
ON CONFLICT (enrollment_id) DO NOTHING;

-- 3. Faculty Profile
-- Dr. Rajesh Kumar is in Computer Science (dept 1)
INSERT INTO faculty (user_id, department_id)
SELECT u.user_id, 1
FROM users u WHERE u.username = 'faculty1'
ON CONFLICT (user_id) DO NOTHING;

-- 4. Warden Assignment
-- Mr. Vikram Singh is assigned to Boys Hostel 1 (BH1)
UPDATE hostels
SET warden_user_id = (SELECT user_id FROM users WHERE username = 'warden1')
WHERE code = 'BH1';

-- 5. Courses
INSERT INTO courses (code, name, department_id) VALUES
    ('CS101', 'Introduction to Programming & Data Structures', 1),
    ('CS201', 'Design & Analysis of Algorithms', 1),
    ('MA101', 'Linear Algebra & Calculus', 2)
ON CONFLICT (code) DO NOTHING;

-- 6. Course Faculty Assignments
-- Dr. Rajesh Kumar teaches CS101 and CS201
INSERT INTO course_faculty (course_id, faculty_id)
SELECT c.course_id, f.faculty_id
FROM courses c, faculty f
JOIN users u ON f.user_id = u.user_id
WHERE u.username = 'faculty1' AND c.code IN ('CS101', 'CS201')
ON CONFLICT (course_id, faculty_id) DO NOTHING;

-- 7. Course Enrollments
-- Student 1 (Aarav) enrolled in CS101 and CS201
-- Student 2 (Priya) enrolled in CS101 and MA101
INSERT INTO enrollments (course_id, student_id)
SELECT c.course_id, s.student_id
FROM courses c, students s
WHERE s.enrollment_id = 'SAU/2026/CS/001' AND c.code IN ('CS101', 'CS201')
ON CONFLICT (course_id, student_id) DO NOTHING;

INSERT INTO enrollments (course_id, student_id)
SELECT c.course_id, s.student_id
FROM courses c, students s
WHERE s.enrollment_id = 'SAU/2026/CS/002' AND c.code IN ('CS101', 'MA101')
ON CONFLICT (course_id, student_id) DO NOTHING;

-- 8. Sample Marks & Audit Log
-- Aarav has 85/100 (A) in CS101
INSERT INTO marks (course_id, student_id, marks_obtained, max_marks, grade, updated_by, updated_at)
SELECT c.course_id, s.student_id, 85.00, 100.00, 'A', u.user_id, CURRENT_TIMESTAMP
FROM courses c, students s, users u
WHERE c.code = 'CS101' AND s.enrollment_id = 'SAU/2026/CS/001' AND u.username = 'faculty1'
ON CONFLICT (student_id, course_id) DO NOTHING;

INSERT INTO audit_log (changed_by, marks_id, field_changed, old_value, new_value, changed_at)
SELECT u.user_id, m.marks_id, 'marks_created', NULL, 'Marks: 85/100 (Grade: A)', CURRENT_TIMESTAMP
FROM users u, marks m
JOIN students s ON m.student_id = s.student_id
JOIN courses c ON m.course_id = c.course_id
WHERE u.username = 'faculty1' AND s.enrollment_id = 'SAU/2026/CS/001' AND c.code = 'CS101'
LIMIT 1;

-- 9. Sample Campus Notices
INSERT INTO notices (title, body, posted_by, created_at, updated_at)
SELECT
    'Welcome to South Asian University - Autumn Semester 2026',
    'Classes for Autumn Semester 2026 commence on Monday. All students are advised to check their course registrations on UniConnect and collect their physical student ID cards from the Academic Section.',
    u.user_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'admin'
LIMIT 1;

INSERT INTO notices (title, body, posted_by, created_at, updated_at)
SELECT
    'Hostel Maintenance Schedule for November',
    'Routine maintenance of water heating units and Wi-Fi access points in Boys Hostel 1 and Girls Hostel 1 will be conducted between 10:00 AM and 04:00 PM this Saturday.',
    u.user_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'warden1'
LIMIT 1;

-- 10. Sample Daily Menu for Today
INSERT INTO menu_items (menu_date, slot_id, items, posted_by, updated_at)
SELECT CURRENT_DATE, 1, 'Idli, Sambhar, Coconut Chutney, Boiled Eggs / Banana, Tea / Coffee', u.user_id, CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'messadmin1'
ON CONFLICT (menu_date, slot_id) DO UPDATE SET items = EXCLUDED.items;

INSERT INTO menu_items (menu_date, slot_id, items, posted_by, updated_at)
SELECT CURRENT_DATE, 2, 'Jeera Rice, Yellow Dal Tadka, Paneer Butter Masala, Roti, Fresh Salad, Curd', u.user_id, CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'messadmin1'
ON CONFLICT (menu_date, slot_id) DO UPDATE SET items = EXCLUDED.items;

INSERT INTO menu_items (menu_date, slot_id, items, posted_by, updated_at)
SELECT CURRENT_DATE, 3, 'Steamed Rice, Mix Veg Curry, Rajma Masala, Tawa Roti, Gulab Jamun', u.user_id, CURRENT_TIMESTAMP
FROM users u WHERE u.username = 'messadmin1'
ON CONFLICT (menu_date, slot_id) DO UPDATE SET items = EXCLUDED.items;

-- 11. Sample Course Posts (Deadlines & Quizzes)
INSERT INTO course_posts (course_id, faculty_id, title, type, description, due_date, created_at, updated_at)
SELECT
    c.course_id,
    f.faculty_id,
    'Quiz 1: Asymptotic Analysis & Recurrences',
    'QUIZ',
    'Class quiz covering Big-O notation, master theorem, and recursion trees. Venue: LH-201. Duration: 45 minutes.',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM courses c, faculty f
JOIN users u ON f.user_id = u.user_id
WHERE c.code = 'CS101' AND u.username = 'faculty1'
LIMIT 1;

INSERT INTO course_posts (course_id, faculty_id, title, type, description, due_date, created_at, updated_at)
SELECT
    c.course_id,
    f.faculty_id,
    'Programming Assignment 1: Binary Search Trees',
    'ASSIGNMENT',
    'Implement a self-balancing AVL Tree in C++ or Python with insert, delete, and search operations. Upload your source file with unit tests.',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM courses c, faculty f
JOIN users u ON f.user_id = u.user_id
WHERE c.code = 'CS101' AND u.username = 'faculty1'
LIMIT 1;

-- 12. Sample Hostel Complaint
INSERT INTO complaints (student_id, hostel_id, title, description, status, resolution_notes, created_at, updated_at, updated_by)
SELECT
    s.student_id,
    h.hostel_id,
    'Geyser heating coil not functioning',
    'The bathroom geyser in Room 304 stopped heating water yesterday morning.',
    'In Progress',
    'Electrician assigned and spare heating element requisitioned.',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP,
    w.user_id
FROM students s, hostels h, users w
WHERE s.enrollment_id = 'SAU/2026/CS/001' AND h.code = 'BH1' AND w.username = 'warden1'
LIMIT 1;
