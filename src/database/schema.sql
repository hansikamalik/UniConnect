-- =============================================================================
-- UniConnect Database Schema (PostgreSQL)
-- Version: 1.1
-- Generated per docs/design/er-diagram.md and docs/analysis/data-dictionary.md
-- =============================================================================

-- Drop tables in reverse order of foreign key dependency if re-running
DROP TABLE IF EXISTS course_posts CASCADE;
DROP TABLE IF EXISTS mess_subscriptions CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS meal_slots CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS marks CASCADE;
DROP TABLE IF EXISTS grade_scales CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS course_faculty CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS hostels CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table (Central authentication entity)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Student', 'Faculty', 'Warden', 'Mess Admin', 'Admin')),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Hostels table
CREATE TABLE hostels (
    hostel_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    warden_user_id INT REFERENCES users(user_id) ON DELETE SET NULL
);

-- 4. Students profile table
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    enrollment_id VARCHAR(50) UNIQUE NOT NULL,
    custom_hostel_id VARCHAR(50) DEFAULT NULL
);

-- 5. Faculty profile table
CREATE TABLE faculty (
    faculty_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    department_id INT NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT
);

-- 6. Courses table
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT
);

-- 7. Course Faculty assignment (many-to-many)
CREATE TABLE course_faculty (
    course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    faculty_id INT NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, faculty_id)
);

-- 8. Student Course Enrollments (many-to-many)
CREATE TABLE enrollments (
    course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, student_id)
);

-- 9. Grading scale configuration
CREATE TABLE grade_scales (
    grade VARCHAR(5) PRIMARY KEY,
    min_percent NUMERIC(5,2) NOT NULL
);

-- 10. Marks table
CREATE TABLE marks (
    marks_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5,2) NOT NULL CHECK (marks_obtained >= 0),
    max_marks NUMERIC(5,2) NOT NULL CHECK (max_marks > 0),
    grade VARCHAR(5) REFERENCES grade_scales(grade) ON DELETE SET NULL,
    updated_by INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_student_course UNIQUE (student_id, course_id)
);

-- 11. Audit Log table (immutable record of marks/grade changes)
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    changed_by INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    marks_id INT NOT NULL REFERENCES marks(marks_id) ON DELETE CASCADE,
    field_changed VARCHAR(50) NOT NULL,
    old_value VARCHAR(100),
    new_value VARCHAR(100),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Notices table
CREATE TABLE notices (
    notice_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    posted_by INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Hostel Complaints table
CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    hostel_id INT NOT NULL REFERENCES hostels(hostel_id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by INT REFERENCES users(user_id) ON DELETE SET NULL
);

-- 14. Meal Slots table (Institutional config: 3 meals)
CREATE TABLE meal_slots (
    slot_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- 15. Menu Items table
CREATE TABLE menu_items (
    menu_id SERIAL PRIMARY KEY,
    menu_date DATE NOT NULL,
    slot_id INT NOT NULL REFERENCES meal_slots(slot_id) ON DELETE RESTRICT,
    items TEXT NOT NULL,
    posted_by INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_menu_date_slot UNIQUE (menu_date, slot_id)
);

-- 16. Mess Subscriptions table (Monthly opt-in/opt-out & payment proofs)
CREATE TABLE mess_subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    status VARCHAR(20) NOT NULL DEFAULT 'OPTED_IN' CHECK (status IN ('OPTED_IN', 'OPTED_OUT')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('UPI', 'CASH')),
    payment_status VARCHAR(25) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')),
    transaction_id VARCHAR(100),
    payment_proof_url VARCHAR(255),
    submitted_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    admin_remarks TEXT,
    CONSTRAINT uk_student_month UNIQUE (student_id, month_year)
);

-- 17. Course Posts table (Content, quizzes, lab evals, assignments)
CREATE TABLE course_posts (
    post_id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    faculty_id INT NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('QUIZ', 'LAB_EVALUATION', 'ASSIGNMENT', 'COURSE_CONTENT')),
    description TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_course ON marks(course_id);
CREATE INDEX idx_audit_marks ON audit_log(marks_id);
CREATE INDEX idx_complaints_student ON complaints(student_id);
CREATE INDEX idx_complaints_hostel ON complaints(hostel_id);
CREATE INDEX idx_menu_date ON menu_items(menu_date);
CREATE INDEX idx_mess_sub_student ON mess_subscriptions(student_id);
CREATE INDEX idx_course_posts_course ON course_posts(course_id);
