-- =============================================================================
-- UniConnect Seed Data (PostgreSQL)
-- Institutional Defaults & Initial Admin Account
-- =============================================================================

-- 1. Departments
INSERT INTO departments (name) VALUES
    ('Computer Science'),
    ('Mathematics'),
    ('Biotechnology'),
    ('Economics'),
    ('International Relations'),
    ('Legal Studies')
ON CONFLICT (name) DO NOTHING;

-- 2. Hostels
INSERT INTO hostels (name, code) VALUES
    ('Boys Hostel 1', 'BH1'),
    ('Boys Hostel 2', 'BH2'),
    ('Girls Hostel 1', 'GH1'),
    ('Girls Hostel 2', 'GH2')
ON CONFLICT (code) DO NOTHING;

-- 3. Meal Slots (3 standard meals per institutional policy)
INSERT INTO meal_slots (name, start_time, end_time) VALUES
    ('Breakfast', '08:30:00', '10:30:00'),
    ('Lunch',     '12:30:00', '14:30:00'),
    ('Dinner',    '19:30:00', '21:30:00')
ON CONFLICT (name) DO NOTHING;

-- 4. Grade Scales
INSERT INTO grade_scales (grade, min_percent) VALUES
    ('A+', 90.00),
    ('A',  80.00),
    ('B+', 70.00),
    ('B',  60.00),
    ('C',  50.00),
    ('D',  40.00),
    ('F',   0.00)
ON CONFLICT (grade) DO NOTHING;

-- 5. Default Administrator Account (Username: admin | Password: Admin@123)
-- Password Hash generated via bcrypt (cost 10): $2a$10$VEJxTHvoWpRDXQ4EiL7sJ.peeLWm0aEko0XFaJi8CHNocBw1qgb16
INSERT INTO users (username, password_hash, role, full_name, email, is_active) VALUES
    ('admin', '$2a$10$VEJxTHvoWpRDXQ4EiL7sJ.peeLWm0aEko0XFaJi8CHNocBw1qgb16', 'Admin', 'System Administrator', 'admin@sau.int', TRUE)
ON CONFLICT (username) DO NOTHING;
