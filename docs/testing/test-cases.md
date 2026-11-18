# Test Cases (MVP)

Version: 1.1
Date: 19 November 2026
Owner: Siya (QA & DevOps Engineer), updated with Development Team

Test cases for the MVP, written from `docs/analysis/permission-matrix.md` (v1.1) and SRS v1.3. "Blocked" means the system refuses the action on the server (NFR-3).

Test data needed: at least one user for each role, two students (one resident with `custom_hostel_id`, one day scholar), two faculty with different courses, one warden per hostel block, and mess menus/subscriptions.

## 1. Login, password and accounts

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-01 | Each of the 5 roles | Log in with a valid username and password | Dashboard for that role opens | FR-1, FR-2 |
| TC-02 | Any user | Log in with a wrong password | Error message, no login | NFR-1 |
| TC-03 | Any user | Log in with empty username or password | Validation error | NFR-7 |
| TC-04 | Deactivated user | Log in | Blocked | FR-3 |
| TC-05 | Visitor | Look for a way to register a new account | No registration option exists | FR-4 |
| TC-06 | Not logged in | Open a dashboard page by typing its address | Redirected to login | NFR-3 |
| TC-07 | University Admin | Create user with `enrollment_id` / hostel, deactivate and reactivate | Saved; state updates, user access toggles | FR-3 |
| TC-08 | University Admin | Create an account with a username or enrollment ID that already exists | Rejected with clear message | FR-3 |
| TC-09 | Student, Faculty, Warden, Mess Admin | Open the account management page | Blocked | FR-3 |
| TC-10 | Tester | Check the database after creating an account | Password is stored hashed, not plain text | NFR-2 |
| TC-11 | Any user | Change own password from profile menu | Password updated, old password no longer works | FR-35 |

## 2. Course management and student profile

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-12 | University Admin | Create a new course (`code`, `name`) | Saved in course catalog | FR-32 |
| TC-13 | University Admin | Assign a faculty member to a course and enrol a student | Saved | FR-31 |
| TC-14 | Student, Warden, Mess Admin | Try to create courses or change assignments | Blocked | FR-31, FR-32 |
| TC-15 | Student | View own profile | Own profile with `enrollment_id` shown | FR-10 |
| TC-16 | Student | Open another student's profile (change ID in URL) | Blocked | FR-10, NFR-4 |
| TC-17 | Faculty | View profile of a student in own course | Profile shown; return button available | FR-9 |
| TC-18 | Faculty | View profile of a student not in own courses | Blocked | FR-9 |
| TC-19 | Warden, Mess Admin | Open a student profile | Blocked | Matrix |

## 3. Marks and audit log

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-20 | Faculty | View course roster | Roster displays graded vs pending status | FR-8 |
| TC-21 | Faculty | Enter marks for an enrolled student in own course | Saved, grade shown | FR-8 |
| TC-22 | Faculty | Change those marks | Saved, and an audit log entry is created in same transaction | FR-8, FR-11 |
| TC-23 | Faculty | Enter marks for a course they do not teach | Blocked | FR-8 |
| TC-24 | Faculty | Enter marks for a student not enrolled in the course | Rejected | FR-8 |
| TC-25 | Faculty | Enter marks that are empty, negative or above max marks | Validation error | NFR-7 |
| TC-26 | Student | View own marks and grades | Shown | FR-10 |
| TC-27 | Student | View another student's marks | Blocked | FR-10, NFR-4 |
| TC-28 | Student | Try to edit marks (direct request) | Blocked | FR-8 |
| TC-29 | University Admin | View all marks | Shown (read-only) | FR-19 |
| TC-30 | University Admin | Try to edit marks | Blocked | Matrix |
| TC-31 | University Admin | View the audit log after a mark change | Shows who, what changed (old/new value) and timestamp | FR-11 |
| TC-32 | Any user | Try to edit or delete an audit log entry | Blocked (immutable ledger) | FR-11 |

## 4. Course content, quizzes and deadlines

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-33 | Faculty | Post quiz, lab evaluation, or assignment with due date and description | Published to enrolled students | FR-36 |
| TC-34 | Faculty | Post content for a course they do not teach | Blocked | FR-36 |
| TC-35 | Student | View content and deadlines for enrolled courses | Shown in course stream and dashboard | FR-36 |
| TC-36 | Student | View content of courses they are not enrolled in | Blocked | FR-36 |
| TC-37 | Student | Try to create, edit or delete course content/deadlines | Blocked | FR-36 |

## 5. Noticeboard

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-38 | University Admin | Publish a campus notice | Appears in accordion list for all roles | FR-6, FR-7 |
| TC-39 | University Admin | Edit a notice, delete another with confirmation | Notice updated; deleted notice removed | FR-6 |
| TC-40 | Student, Faculty, Warden, Mess Admin | View notices and expand accordion | Full notice text readable | FR-7 |
| TC-41 | Student, Faculty, Warden, Mess Admin | Try to publish, edit or delete a notice | Blocked | FR-6 |

## 6. Hostel complaints

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-42 | Resident Student | Register a complaint with title and description | Saved with `custom_hostel_id`, status Pending | FR-12 |
| TC-43 | Day Scholar | Try to register a hostel complaint (`custom_hostel_id == null`) | Blocked gracefully | FR-12 |
| TC-44 | Student | View own complaints and click to open detail modal | Full description and room shown | FR-13 |
| TC-45 | Student | View another student's complaints | Blocked | Matrix |
| TC-46 | Warden | View complaints matching assigned hostel prefix | Shown | FR-14 |
| TC-47 | Warden | View complaints of another hostel block | Blocked | FR-14, D-2 |
| TC-48 | Warden | Change status Pending -> In Progress -> Resolved with resolution notes | Saved; student sees status & resolution notes | FR-15 |
| TC-49 | Warden | Move a Resolved complaint back to Pending | Blocked | FR-15 |
| TC-50 | University Admin | View all complaints | Shown (read-only) | FR-19 |

## 7. Mess menu

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-51 | Mess Admin | Publish Breakfast (8:30-10:30), Lunch (12:30-14:30), Dinner (19:30-21:30) | Saved | FR-16 |
| TC-52 | Mess Admin | Update an existing menu slot for a date | Updated without duplicate error (Upsert) | FR-16 |
| TC-53 | Student | View today's menu by default, select date via calendar picker | Chosen date's menu displayed | FR-17 |
| TC-54 | Student, Faculty, Warden | Try to publish or edit the menu | Blocked | FR-16 |

## 8. Mess subscriptions and payments

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-55 | Student | Choose monthly subscription, scan UPI QR, enter UTR, upload proof | Saved with status `Pending Verification` | FR-33 |
| TC-56 | Student | Choose monthly opt-out | Saved with status `Opted Out` | FR-33 |
| TC-57 | Mess Admin | View pending online subscriptions, view screenshot, approve | Status becomes `Verified / Active` | FR-34 |
| TC-58 | Mess Admin | Reject pending online subscription with remarks | Status becomes `Rejected`, remarks visible to student | FR-34 |
| TC-59 | Mess Admin | Record manual cash payment with receipt voucher | Saved immediately with status `Verified / Active` | FR-34 |
| TC-60 | Student | Try to verify own payment or record cash | Blocked | FR-34 |

## 9. Quality and performance checks

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-61 | Any user | Use pages on phone browser and desktop browser | Responsive layout, sidebar collapses on mobile | NFR-5 |
| TC-62 | Any user | Measure page load time under campus usage | Under 3 seconds | NFR-9 |
| TC-63 | Tester | Send direct forged requests to restricted URLs/endpoints | Blocked on the server with 403 Forbidden | NFR-3 |

## 10. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial MVP test cases from permission matrix v1.0 | Siya |
| 1.1 | 19 Nov 2026 | Added test cases for password change, courses, course posts, mess subscriptions, cash payments, and calendar picker | Team |