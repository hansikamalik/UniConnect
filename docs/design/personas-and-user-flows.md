# Personas, User Flows and Screen List (MVP)

Version: 1.1
Date: 19 November 2026
Owner: Saumya (UI/UX Designer), updated with Development Team

Covers the MVP (SRS v1.3). The wireframes in `wireframes.md` are built from the screen list in section 3.

## 1. Personas

Names are illustrative. The student persona reflects findings from student interviews (`docs/requirements/research-notes.md`).

| Persona | Role | What they need | Problem today | Basis |
|---|---|---|---|---|
| Riya, resident student | Student | See notices, marks, mess menus; subscribe to mess with UPI QR; report hostel problems and track status. | Notices and menus scattered on WhatsApp/whiteboards. No online complaint tracking or mess subscription portal. | Student interviews |
| Dr. Mehta, lecturer | Faculty | Enter marks quickly with audit trail; publish course content, quiz dates, lab evaluations, and assignment deadlines. | Information communicated informally via email without a central student deadline tracker. | Academic review |
| Mr. Rao, hostel warden | Hostel Warden | View all complaints for their assigned hostel block, read full descriptions, and record resolution remarks. | Complaints arrive informally in person or email with no status lifecycle. | Process analysis |
| Mrs. Kaur, mess manager | Mess Admin | Publish daily 3-meal menus, verify student UPI payment screenshots, and record manual cash payments. | Menu is written on whiteboards; tracking cash and meal subscriptions is paper-based. | Process analysis |
| Mr. Singh, office administrator | University Admin | Create user accounts with enrollment IDs and hostel IDs, create courses, assign enrollments, publish campus notices. | Institutional records split across disconnected registers and office spreadsheets. | Administrative analysis |

## 2. User flows

Each flow starts after login unless stated. "Error" always means a clear message that says what to fix (NFR-7).

**F1. Login & Password Change (all roles, FR-1, FR-2, FR-35)**
1. Open the website and see the login page.
2. Enter username and password, press Login.
3. Right details: the dashboard for that role opens.
4. Wrong details or deactivated account: error message, stay on the login page.
5. Any logged-in user can click their profile in the top navbar and choose "Change Password" to update their credentials securely.

**F2. Student reads notices (FR-7)**
1. Dashboard, then Notices.
2. See all notices, newest first.
3. Click a notice to expand its accordion and read it in full.

**F3. Student checks profile and marks (FR-10)**
1. Dashboard, then My Profile and Marks.
2. See own details (`enrollment_id`, name, email, `custom_hostel_id`), then the list of enrolled subjects with marks and calculated grade.
3. Strictly read-only; no edit button exists on this screen.

**F4. Student reports a hostel problem and tracks it (FR-12, FR-13)**
1. Dashboard, then Hostel Complaints, then New Complaint (only enabled if student has a `custom_hostel_id`).
2. Enter title and multi-line description, press Submit.
3. Confirmation shows and complaint appears in My Complaints as Pending.
4. Later: click complaint row to open Complaint Detail Modal showing full description, current status, and warden resolution remarks once resolved.

**F5. Student views the mess menu (FR-17)**
1. Dashboard, then Mess Menu.
2. Today's menu loads automatically by default with Breakfast (8:30-10:30), Lunch (12:30-14:30), and Dinner (19:30-21:30).
3. Click `[📅 Select Date]` to open the calendar pop-up and pick any date, or click `[Today]` to return immediately to today's schedule.

**F6. Faculty enters marks (FR-8, FR-9, FR-11)**
1. Dashboard, then My Courses, pick a course.
2. View enrolled students list with grading status badges (`Graded: X/100` or `Pending Grade`).
3. Click a student to open Enter Marks: enter marks obtained, grade auto-calculates from grade scale.
4. Click `[Save Marks]` to return or `[Save & Next Student]` to proceed directly to the next enrolled student.
5. Click `[View Student Profile]` to inspect enrolled student details, with a `[Back to Marks Entry]` button to return.

**F7. Warden handles a complaint (FR-14, FR-15)**
1. Dashboard, then Hostel Complaints. View complaints matching the warden's assigned hostel prefix.
2. Click any complaint row to open the Complaint Detail Modal and read the student's full problem description.
3. Change status forward: Pending -> In Progress -> Resolved. When marking Resolved, optional resolution notes can be recorded.

**F8. Mess admin publishes the menu (FR-16)**
1. Dashboard, then Menu, pick a date and meal slot (Breakfast, Lunch, Dinner).
2. Enter dishes, press Save.
3. If an entry already exists for that date and slot, it pre-populates and updates seamlessly via database Upsert.

**F9. Admin publishes a notice (FR-6)**
1. Dashboard, then Notices, then New Notice.
2. Enter title and body, press Publish.
3. From the notices list, admin can edit or delete a notice (destructive actions trigger a confirmation modal).

**F10. Admin manages users, courses and assignments (FR-3, FR-31, FR-32)**
1. Dashboard, then Users, then New User.
2. Enter name, username, email, role, and temporary password.
   - For Student: enter required `enrollment_id` and optional `custom_hostel_id`.
   - For Warden: select assigned hostel block.
3. Users table allows editing and toggling account state (`[Deactivate]` / `[Activate]`).
4. Dashboard, then Courses: click `[+ New Course]` to create a course (`code`, `name`), then assign faculty instructors and enroll students.

**F11. Student mess subscription & payment (FR-33)**
1. Dashboard, then Mess Menu, then Monthly Subscription tab.
2. Choose monthly option:
   - **Opt-Out:** click `[Opt-Out for this Month]` to register absence.
   - **Subscribe:** scan the official UPI QR code, enter bank Transaction ID (UTR), and upload a payment receipt screenshot.
3. Status updates to `Pending Verification` until verified by Mess Admin.

**F12. Mess Admin verifies payments & records cash (FR-34)**
1. Dashboard, then Mess Subscriptions.
2. View summary metrics: Total Enrolled, Active Diners, Pending Verifications, Opted Out.
3. Verification queue: click `[View Screenshot]` to check payment receipt against UTR, then click `[Approve]` or `[Reject (with remarks)]`.
4. Offline cash collection: click `[+ Record Cash Payment]`, select student `enrollment_id`, amount, and cash receipt voucher to immediately verify subscription.

**F13. Faculty posts course content & evaluation deadlines (FR-36)**
1. Dashboard, then My Courses, pick course, open "Course Content & Deadlines" tab.
2. Click `[+ Post New Item]`, select type (`Quiz`, `Lab Evaluation`, `Assignment`, `Course Content`).
3. Enter title, scheduled date & time, and detailed description/syllabus instructions.
4. Enrolled students immediately see the assessment on their course feed and dashboard deadlines widget.

## 3. Screen list

| ID | Screen | Role | Flow | SRS |
|---|---|---|---|---|
| S-01 | Login & Change Password Modal | All | F1 | FR-1, FR-35 |
| S-02 | Student dashboard | Student | F1 | FR-2, NFR-6 |
| S-03 | Faculty dashboard | Faculty | F1 | FR-2, NFR-6 |
| S-04 | Warden dashboard | Warden | F1 | FR-2, NFR-6 |
| S-05 | Mess admin dashboard | Mess Admin | F1 | FR-2, NFR-6 |
| S-06 | Admin dashboard | Univ. Admin | F1 | FR-2, NFR-6 |
| S-07 | Notices list and notice view (accordion) | All | F2 | FR-7 |
| S-08 | New / edit notice | Univ. Admin | F9 | FR-6 |
| S-09 | My profile and marks | Student | F3 | FR-10 |
| S-10 | My courses and student roster | Faculty | F6 | FR-8 |
| S-11 | Enter marks | Faculty | F6 | FR-8 |
| S-12 | Student profile (faculty view) | Faculty | F6 | FR-9 |
| S-13 | New complaint | Student | F4 | FR-12 |
| S-14 | My complaints & Detail Modal | Student | F4 | FR-13 |
| S-15 | Hostel complaints list & update status modal | Warden | F7 | FR-14, FR-15 |
| S-16 | Mess menu (daily view with calendar picker) | Student | F5 | FR-17 |
| S-17 | Publish menu | Mess Admin | F8 | FR-16 |
| S-18 | Users list, new / edit user, activate toggle | Univ. Admin | F10 | FR-3 |
| S-19 | Courses catalog & student/faculty assignments | Univ. Admin | F10 | FR-31, FR-32 |
| S-20 | All-data overview and audit log | Univ. Admin | n/a | FR-11, FR-19 |
| S-21 | Student mess subscription & UPI payment modal | Student | F11 | FR-33 |
| S-22 | Mess admin subscriptions, verification & cash entry | Mess Admin | F12 | FR-34 |
| S-23 | Faculty course content & assessment deadlines | Faculty | F13 | FR-36 |

All screens work on mobile and desktop browsers (NFR-5).

## 4. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial personas, user flows and screen list | Saumya |
| 1.1 | 19 Nov 2026 | Added F11 to F13 flows, S-21 to S-23 screens, calendar picker on S-16, complaint modals, and cash/UPI verification | Team |