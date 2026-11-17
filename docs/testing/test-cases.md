# Test Cases (MVP)

Version: 1.0
Date: 17 November 2026
Owner: Siya (QA & DevOps Engineer)

Test cases for the MVP, written from `docs/analysis/permission-matrix.md` (v1.0) and SRS v1.2. "Blocked" means the system refuses the action, and the server must refuse it even if the screen hides the button (NFR-3). Results are recorded later in the test report.

Test data needed: at least one user for each role, two students in different hostels, one faculty member teaching one course with one enrolled student, and one faculty member teaching a different course.

## 1. Login and accounts

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-01 | Each of the 5 roles | Log in with a valid username and password | Dashboard for that role opens | FR-1, FR-2 |
| TC-02 | Any user | Log in with a wrong password | Error message, no login | NFR-1 |
| TC-03 | Any user | Log in with empty username or password | Validation error | NFR-7 |
| TC-04 | Deactivated user | Log in | Blocked | FR-3 |
| TC-05 | Visitor | Look for a way to register a new account | No registration option exists | FR-4 |
| TC-06 | Not logged in | Open a dashboard page by typing its address | Redirected to login | NFR-3 |
| TC-07 | University Admin | Create, edit and deactivate an account | Saved. New user can log in | FR-3 |
| TC-08 | University Admin | Create an account with a username that already exists | Rejected with clear message | FR-3 |
| TC-09 | Student, Faculty, Warden, Mess Admin | Open the account management page | Blocked | FR-3 |
| TC-10 | Tester | Check the database after creating an account | Password is stored hashed, not plain text | NFR-2 |

## 2. Course assignments and student profile

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-11 | University Admin | Assign a faculty member to a course and enrol a student | Saved | FR-31 |
| TC-12 | Student, Warden, Mess Admin | Try to assign or change course assignments | Blocked | FR-31 |
| TC-13 | Student | View own profile | Own profile shown | FR-10 |
| TC-14 | Student | Open another student's profile (change the ID in the address) | Blocked | FR-10, NFR-4 |
| TC-15 | Faculty | View profile of a student in own course | Profile shown | FR-9 |
| TC-16 | Faculty | View profile of a student not in own courses | Blocked | FR-9 |
| TC-17 | Warden, Mess Admin | Open a student profile | Blocked | Matrix |
| TC-18 | University Admin | Create and edit a student profile | Saved | Matrix |

## 3. Marks and audit log

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-19 | Faculty | Enter marks for an enrolled student in own course | Saved, grade shown | FR-8 |
| TC-20 | Faculty | Change those marks | Saved, and an audit log entry is created | FR-8, FR-11 |
| TC-21 | Faculty | Enter marks for a course they do not teach | Blocked | FR-8 |
| TC-22 | Faculty | Enter marks for a student not enrolled in the course | Rejected | FR-8 |
| TC-23 | Faculty | Enter marks that are empty, negative or above max marks | Validation error | NFR-7 |
| TC-24 | Student | View own marks and grades | Shown | FR-10 |
| TC-25 | Student | View another student's marks | Blocked | FR-10, NFR-4 |
| TC-26 | Student | Try to edit marks (direct request, no button) | Blocked | FR-8 |
| TC-27 | Warden, Mess Admin | Open marks | Blocked | Matrix |
| TC-28 | University Admin | View all marks | Shown | FR-19 |
| TC-29 | University Admin | Try to edit marks | Blocked | Matrix |
| TC-30 | University Admin | View the audit log after a mark change | Entry shows who, what changed (old and new value) and when | FR-11 |
| TC-31 | Any user | Try to edit or delete an audit log entry | Not possible | FR-11 |
| TC-32 | Student, Faculty | Open the audit log | Blocked | Matrix |

## 4. Noticeboard

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-33 | University Admin | Publish a notice | Appears for all roles | FR-6, FR-7 |
| TC-34 | University Admin | Edit a notice, then delete another | Edit shows, deleted notice is gone | FR-6 |
| TC-35 | University Admin | Publish a notice with empty title or body | Validation error | NFR-7 |
| TC-36 | Student, Faculty, Warden, Mess Admin | View notices | All notices shown in one place | FR-7 |
| TC-37 | Student, Faculty, Warden, Mess Admin | Try to publish, edit or delete a notice | Blocked | FR-6 |

## 5. Hostel complaints

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-38 | Student | Register a complaint with title and description | Saved with status Pending | FR-12 |
| TC-39 | Student | Register a complaint with empty title or description | Validation error | NFR-7 |
| TC-40 | Student | View own complaints and their status | Shown | FR-13 |
| TC-41 | Student | View another student's complaints | Blocked | Matrix |
| TC-42 | Warden | View complaints of own hostel | Shown | FR-14 |
| TC-43 | Warden | View complaints of another hostel | Blocked | FR-14, D-2 |
| TC-44 | Warden | Change status Pending, then In Progress, then Resolved | Each change saved. Student sees the new status | FR-15 |
| TC-45 | Warden | Move a Resolved complaint back to Pending | Blocked | FR-15 |
| TC-46 | Warden | Edit a complaint's title or description | Blocked | Matrix |
| TC-47 | University Admin | View all complaints | Shown | FR-19 |
| TC-48 | University Admin | Try to change a complaint's status | Blocked | Matrix |
| TC-49 | Faculty, Mess Admin | Open hostel complaints | Blocked | Matrix |

## 6. Mess menu

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-50 | Mess Admin | Publish a menu for a day and a meal | Saved | FR-16 |
| TC-51 | Mess Admin | Edit an existing menu | Updated | FR-16 |
| TC-52 | Mess Admin | Add a second menu for the same day and meal | Rejected with clear message | Data dictionary |
| TC-53 | Mess Admin | Publish a menu with empty dishes | Validation error | NFR-7 |
| TC-54 | Student | View the daily and weekly menu | Shown | FR-17 |
| TC-55 | Student, Faculty, Warden | Try to publish or edit the menu | Blocked | FR-16 |
| TC-56 | University Admin | View the menu | Shown | FR-19 |
| TC-57 | University Admin | Try to edit the menu | Blocked | Matrix |

## 7. Quality checks

| ID | Role | Action | Expected result | Source |
|---|---|---|---|---|
| TC-58 | Any user | Use the main pages on a phone browser and a desktop browser | Pages are usable on both | NFR-5 |
| TC-59 | Any user | Open the main pages and note the load time | Under 3 seconds | NFR-9 |
| TC-60 | Tester | Send a request directly to a restricted page or action using a user of the wrong role | Blocked by the server | NFR-3 |

## 8. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial MVP test cases from permission matrix v1.0 | Siya |