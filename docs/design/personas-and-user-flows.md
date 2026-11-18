# Personas, User Flows and Screen List (MVP)

Version: 1.0
Date: 17 November 2026
Owner: Saumya (UI/UX Designer)

Covers the MVP only (SRS v1.2). The wireframes in `wireframes.md` are built from the screen list in section 3.

## 1. Personas

Names are made up. The student persona combines what the 4 interviewed students told us (`docs/requirements/research-notes.md`). Staff were not interviewed, so those personas are assumptions taken from the stakeholder table in the project document and should be confirmed with real staff.

| Persona | Role | What they need | Problem today | Basis |
|---|---|---|---|---|
| Riya, hostel student | Student | See notices, marks and the mess menu in one place. Report hostel problems and see if they are fixed. | Notices come by email and get missed. Menu is on WhatsApp and a whiteboard. No way to track a hostel problem. | Student interviews |
| Dr. Mehta, lecturer | Faculty | Enter and correct marks quickly for the courses they teach. | Not known. | Assumed |
| Mr. Rao, hostel warden | Hostel Warden | See all complaints of the hostel in one list and update their status. | Complaints arrive by email or in person with no list or status. | Assumed, student side only |
| Mrs. Kaur, mess manager | Mess Admin | Publish the daily and weekly menu once, where every student sees it. | Menu is sent on WhatsApp and written on a whiteboard. | Assumed, student side only |
| Mr. Singh, office administrator | University Admin | Create accounts, assign courses, publish notices, check any data. | Information is spread across separate offices and registers. | Assumed |

## 2. User flows

Each flow starts after login unless stated. "Error" always means a clear message that says what to fix (NFR-7).

**F1. Login (all roles, FR-1, FR-2)**
1. Open the website and see the login page.
2. Enter username and password, press Login.
3. Right details: the dashboard for that role opens.
4. Wrong details or deactivated account: error message, stay on the login page.

**F2. Student reads notices (FR-7)**
1. Dashboard, then Notices.
2. See all notices, newest first.
3. Open a notice to read it in full.

**F3. Student checks profile and marks (FR-10)**
1. Dashboard, then My Profile and Marks.
2. See own details, then the list of subjects with marks and grade.
3. There is no edit button anywhere on this screen.

**F4. Student reports a hostel problem and tracks it (FR-12, FR-13)**
1. Dashboard, then Hostel, then New Complaint.
2. Enter title and description, press Submit.
3. Empty title or description: error. Otherwise a confirmation shows and the complaint appears as Pending.
4. Later: Hostel, then My Complaints to see the status (Pending, In Progress or Resolved).

**F5. Student views the mess menu (FR-17)**
1. Dashboard, then Mess Menu.
2. See today's menu. Switch to the week view for all seven days.

**F6. Faculty enters marks (FR-8, FR-9)**
1. Dashboard, then My Courses, then pick a course.
2. See the students enrolled in that course.
3. Pick a student, enter marks. The grade is filled in from the grade scale.
4. Empty, negative or too-high marks: error. Otherwise saved, and the change is logged.
5. From the student list, faculty can open a student's profile (view only).

**F7. Warden handles a complaint (FR-14, FR-15)**
1. Dashboard, then Complaints. See all complaints of the warden's hostel, newest first.
2. Open one, change the status to the next step.
3. The new status is saved and the student sees it.
4. Going backwards (for example Resolved to Pending) is not offered.

**F8. Mess admin publishes the menu (FR-16)**
1. Dashboard, then Menu, then pick a date and a meal.
2. Enter the dishes, press Save.
3. Empty dishes, or a menu that already exists for that date and meal: error. Otherwise saved and visible to students.

**F9. Admin publishes a notice (FR-6)**
1. Dashboard, then Notices, then New Notice.
2. Enter title and body, press Publish.
3. Empty title or body: error. Otherwise the notice shows for all roles.
4. From the notice list the admin can also edit or delete a notice.

**F10. Admin creates an account and assigns courses (FR-3, FR-31)**
1. Dashboard, then Users, then New User.
2. Enter name, username, email, role and a first password, press Create. Existing username: error.
3. For faculty and students: Courses, then assign faculty to a course or enrol a student.
4. From the Users list the admin can edit or deactivate an account.

## 3. Screen list

Every wireframe in the next document comes from this list. "All" means every role sees it.

| ID | Screen | Role | Flow | SRS |
|---|---|---|---|---|
| S-01 | Login | All | F1 | FR-1 |
| S-02 | Student dashboard | Student | F1 | FR-2, NFR-6 |
| S-03 | Faculty dashboard | Faculty | F1 | FR-2, NFR-6 |
| S-04 | Warden dashboard | Warden | F1 | FR-2, NFR-6 |
| S-05 | Mess admin dashboard | Mess Admin | F1 | FR-2, NFR-6 |
| S-06 | Admin dashboard | Univ. Admin | F1 | FR-2, NFR-6 |
| S-07 | Notices list and notice view | All | F2 | FR-7 |
| S-08 | New / edit notice | Univ. Admin | F9 | FR-6 |
| S-09 | My profile and marks | Student | F3 | FR-10 |
| S-10 | My courses and student list | Faculty | F6 | FR-8 |
| S-11 | Enter marks | Faculty | F6 | FR-8 |
| S-12 | Student profile (view only) | Faculty | F6 | FR-9 |
| S-13 | New complaint | Student | F4 | FR-12 |
| S-14 | My complaints | Student | F4 | FR-13 |
| S-15 | Hostel complaints list and update status | Warden | F7 | FR-14, FR-15 |
| S-16 | Mess menu (day and week) | Student | F5 | FR-17 |
| S-17 | Publish menu | Mess Admin | F8 | FR-16 |
| S-18 | Users list, new / edit user | Univ. Admin | F10 | FR-3 |
| S-19 | Course assignments | Univ. Admin | F10 | FR-31 |
| S-20 | All-data overview and audit log | Univ. Admin | n/a | FR-11, FR-19 |

All screens must work on a phone and a desktop browser (NFR-5).

## 4. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial personas, user flows and screen list | Saumya |