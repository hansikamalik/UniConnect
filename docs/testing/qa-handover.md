# QA & Peer Testing Handover Guide

Version: 1.0
Date: 19 November 2026
Owner: Siya (QA & DevOps Engineer), prepared with Vikryansh (Development Lead)

---

## 1. Quick Start & Environment Setup

```bash
# 1. Fetch latest changes and switch to the target branch
git fetch origin
git checkout main
git pull origin main

# 2. Install dependencies
npm install

# 3. Verify automated verification suite (7/7 tests must pass)
npm test

# 4. Start the application in development mode
npm run dev
# The application boots on: http://localhost:3000
```

---

## 2. Test Accounts & Role Credentials Matrix

All test accounts are active and pre-configured in the database.

| Role | Username | Identifier / Email | Password | Primary Dashboard & Landing |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin` | `Admin@123` | `/dashboard/admin` |
| **Mess Admin** | `messadmin1` | `mess.admin@sau.int` | `Mess@123` | `/dashboard/mess` |
| **Hostel Warden** | `warden1` | `vikram.warden@sau.int` | `Warden@123` | `/dashboard/warden` (BH1) |
| **Hostel Warden (Official)** | `amit.shukla` | `amit.shukla@sau.int` | `Sau@2026` | `/dashboard/warden` (Boys Hostel) |
| **Faculty Instructor** | `faculty1` | `rajesh.kumar@sau.int` | `Faculty@123` | `/dashboard/faculty` |
| **Faculty (Official)** | `pranab.muhuri` | `pranabmuhuri@sau.int` | `Sau@2026` | `/dashboard/faculty` (CS Dept) |
| **Student (Hostel Resident)** | `student1` | `SAU/2026/CS/001` | `Student@123` | `/dashboard/student` (Room: BH1-304) |
| **Student (Day Scholar)** | `student2` | `SAU/2026/CS/002` | `Student@123` | `/dashboard/student` (Day Scholar) |
| **Student (Real B.Tech Batch)**| `aanvi.sharma` | `SAU/CS/BTECH(CSE)/2024/01` | `Sau@2026` | `/dashboard/student` |

> [!NOTE]
> **Universal Identifier Login:** Students can authenticate using either their **Username** (`student1`), their **Universal Enrollment ID** (`SAU/2026/CS/001`), or their **Institutional Email** (`aarav@students.sau.int`).

---

## 3. Core Verification Scenarios for QA

### Scenario A: Admin User Management & Edit Option
1. Log in as `admin` (`Admin@123`).
2. Navigate to **Users** (`/admin/users`).
3. Verify that each row in the user table displays an **Edit** button in the Actions column.
4. Click **Edit** on a student (e.g., `student1` or `aanvi.sharma`):
   - Verify fields are pre-populated (Full Name, Username, Email, Enrollment ID, Hostel Room).
   - Verify role is immutable/locked to prevent data corruption.
   - Update full name or hostel room, leave password blank, click **Save Changes**.
   - Verify the update persists without altering the password.
5. Test optional password reset:
   - Enter a new password, submit, log out, and verify authentication with the new password.
6. Test uniqueness validation:
   - Try changing username or email to an existing one (e.g. `admin`); verify conflict error is displayed.

### Scenario B: Role-Based Access Control & Dashboards
1. Log in with each of the 5 roles and confirm redirection to their respective dashboard:
   - **Student** &rarr; `/dashboard/student` (displays enrolled courses, today's meals, notices, deadlines)
   - **Faculty** &rarr; `/dashboard/faculty` (assigned courses, enrolled student counts, quick grading links)
   - **Warden** &rarr; `/dashboard/warden` (hostel occupancy stats, open maintenance complaints)
   - **Mess Admin** &rarr; `/dashboard/mess` (active meal subscribers, pending verification queue)
   - **Admin** &rarr; `/dashboard/admin` (system-wide user counts by role, quick provision forms)
2. Verify boundary checks:
   - A Day Scholar (`student2`) accessing `/hostel/complaints` should see an alert that hostel features are restricted to residents.
   - Non-faculty users attempting to access `/academic/marks/entry/:id` should receive a 403 Forbidden redirect.

### Scenario C: Academic Marks Entry & Immutable Audit Log (FR-7, FR-8)
1. Log in as `faculty1` (`Faculty@123`).
2. Go to **My Courses** and click **Enter Marks** for `CS101`.
3. Update a student's marks (e.g. change 85 to 90), enter remarks, and submit.
4. Log out and log in as `admin`.
5. Navigate to **Audit Trail** (`/admin/audit`).
6. Verify that the previous value (`85`), the new value (`90`), the changer (`Dr. Rajesh Kumar`), and the timestamp are recorded in the immutable audit log.

### Scenario D: Mess Subscription & Payment Verification (FR-33, FR-34)
1. Log in as `student1`.
2. Go to **Mess &bull; Subscriptions** (`/mess/subscribe`).
3. Select current month, choose Online UPI payment, enter a UTR number, upload a sample receipt screenshot, and submit.
4. Log in as `messadmin1` (`Mess@123`).
5. Open **Subscription Management** (`/mess/subscriptions/manage`).
6. Verify the pending subscription appears with the uploaded proof screenshot link.
7. Click **Approve** (or test **Reject** with remarks).

### Scenario E: Hostel Complaints Lifecycle (FR-11, FR-12)
1. Log in as `student1` (resident in BH1).
2. Go to **Hostel Complaints** (`/hostel/complaints/new`) and file a complaint (e.g., "Fan regulator broken in Room 304").
3. Log in as `warden1` (`Warden@123`).
4. View complaints on the Warden Dashboard.
5. Click the complaint, update status from *In Progress* to *Resolved*, enter resolution notes, and submit.
6. Verify student sees the resolved status and warden's notes.

### Scenario F: 4-Theme Dynamic Switcher
1. On any page, click the **Theme** dropdown in the top-right navbar.
2. Switch between:
   - 🏛️ *SAU Official Blue*
   - 🌙 *SAU Midnight Dark*
   - 🎓 *Heritage Collegiate Crimson*
   - ⚡ *Futuristic Neo Emerald*
3. Verify that the theme applies instantly without page reload, styling updates across cards, buttons, badges, and persists on page refresh (via `localStorage`).

---

## 4. Automated Verification Results

```
> uniconnect@1.0.0 test
> node tests/verification.js

 Starting UniConnect Automated Verification Suite...

 PASS: Database contains test accounts for all 5 roles
 PASS: Student 1 has enrollment_id SAU/2026/CS/001 and custom_hostel_id BH1-304
 PASS: Student 2 is a Day Scholar with custom_hostel_id = NULL
 PASS: Exactly 3 meal slots exist with standard SAU meal timings
 PASS: Marks record has corresponding immutable audit_log row
 PASS: Course posts (Quizzes & Assignments) loaded in database
 PASS: Hostel complaint exists with In Progress status

========================================
 Test Summary: 7 Passed, 0 Failed
========================================
```

## 5. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 19 Nov 2026 | Initial QA handover guide with credentials matrix, environment setup, and verification scenarios | Vikryansh & Siya |
