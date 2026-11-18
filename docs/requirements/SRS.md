# Software Requirements Specification (SRS)

Version: 1.3
Date: 19 November 2026
Author: Hansika (Project Lead & Requirements Engineer), updated with Development Team

## 1. Introduction

UniConnect is a web platform for students, faculty, hostel wardens, mess administrators and the university administration. This document lists what the system must do. Priority "MVP" means it will be built in release v1.0. Priority "Later" means it is specified but not built in v1.0.

Sources: team project document v1.0, student research notes v1.0, architecture and design reviews v1.0.

## 2. User roles

Student, Faculty, Hostel Warden, Mess Administrator, University Administration. Accounts are created only by the University Administration. Students are uniquely identified across all academic and campus records by their `enrollment_id`. Resident students are assigned a `custom_hostel_id`.

## 3. Functional requirements

### 3.1 Authentication and accounts

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | The system shall provide one login page for all five roles. | MVP |
| FR-2 | After login, the system shall show the dashboard for the user's role. | MVP |
| FR-3 | Only the University Administration shall be able to create, edit, deactivate and reactivate user accounts. | MVP |
| FR-4 | The system shall not allow self-registration. | MVP |
| FR-5 | The University Administration shall be able to reset a user's password. | Later |
| FR-31 | The University Administration shall be able to assign faculty to courses and enrol students in courses. | MVP |
| FR-32 | The University Administration shall be able to create and manage courses (code, name). | MVP |
| FR-35 | Authenticated users shall be able to change their own password. | MVP |

### 3.2 Noticeboard

| ID | Requirement | Priority |
|---|---|---|
| FR-6 | The University Administration shall be able to publish, edit and delete notices. | MVP |
| FR-7 | All logged-in users shall be able to view all notices in one place. | MVP |

### 3.3 Student profile, marks and course content

| ID | Requirement | Priority |
|---|---|---|
| FR-8 | Faculty shall be able to enter and update subject-wise marks and grades for enrolled students. | MVP |
| FR-9 | Faculty shall be able to view profile details of students enrolled in courses they teach. | MVP |
| FR-10 | A student shall be able to view only their own profile, marks and grades identified by their enrollment ID. | MVP |
| FR-11 | The system shall record who changed a mark, what was changed and when in an immutable audit log. | MVP |
| FR-36 | Faculty shall be able to post course content, and schedule notices and dates for quizzes, lab evaluations, and assignment submissions with detailed descriptions for courses they teach. | MVP |

### 3.4 Hostel complaints

| ID | Requirement | Priority |
|---|---|---|
| FR-12 | A student residing in a hostel (assigned a custom hostel ID) shall be able to register a hostel complaint with a title and description. | MVP |
| FR-13 | A student shall be able to view the status of their own complaints (Pending, In Progress, Resolved). | MVP |
| FR-14 | A hostel warden shall be able to view all hostel complaints for their assigned hostel block. | MVP |
| FR-15 | A hostel warden shall be able to change a complaint's status from Pending to In Progress to Resolved, and record resolution remarks upon completion. | MVP |

### 3.5 Mess menu and subscriptions

| ID | Requirement | Priority |
|---|---|---|
| FR-16 | A mess administrator shall be able to publish and update menus for Breakfast (8:30-10:30), Lunch (12:30-14:30), and Dinner (19:30-21:30). | MVP |
| FR-17 | Students shall be able to view today's menu by default and select any date using a calendar date picker. | MVP |
| FR-33 | Students shall be able to choose a monthly mess subscription (subscribe or opt-out); subscribing students can view the mess payment QR code, enter transaction ID (UTR), and upload screenshot proof. | MVP |
| FR-34 | The mess administrator shall be able to verify submitted online subscription payments (approve or reject with remarks) and manually record cash payments for students. | MVP |

### 3.6 Access control

| ID | Requirement | Priority |
|---|---|---|
| FR-18 | Each role shall be able to access only what the role-permission matrix allows. | MVP |
| FR-19 | The University Administration shall be able to view all student, faculty, hostel and mess data for oversight. | MVP |

### 3.7 Features specified for later releases

| ID | Requirement | Priority |
|---|---|---|
| FR-20 | Online course and event registration forms with admin approval. | Later |
| FR-21 | Hostel forms with warden approval. | Later |
| FR-22 | Leave and outpass applications, reviewed by the warden. | Later |
| FR-23 | Meal feedback and ratings. | Later |
| FR-25 | Linking approved leave to automatic meal opt-out. | Later |
| FR-27 | Anonymous complaints and student queries to the administration. | Later |
| FR-28 | Academic calendar and examination schedule management. | Later |
| FR-29 | Mess complaints. | Later |
| FR-30 | Timetable view and campus map. | Later |

## 4. Non-functional requirements

| ID | Category | Requirement | Priority |
|---|---|---|---|
| NFR-1 | Security | Every user shall log in with a username and password. | MVP |
| NFR-2 | Security | Passwords shall be stored hashed, never as plain text. | MVP |
| NFR-3 | Security | Role checks shall be enforced on the server, not only in the user interface. | MVP |
| NFR-4 | Privacy | Marks and profiles shall be visible only to the student concerned and authorised roles. | MVP |
| NFR-5 | Usability | The website shall work on both desktop and mobile browsers. | MVP |
| NFR-6 | Usability | Each role shall have a simple, consistent dashboard. | MVP |
| NFR-7 | Reliability | All forms shall validate input and show clear error messages. | MVP |
| NFR-8 | Reliability | Submitted data shall not be lost. | MVP |
| NFR-9 | Performance | Pages shall load in under 3 seconds for normal campus usage. | MVP |
| NFR-10 | Maintainability | Code shall be organised by module (academic, hostel, mess) with a README that explains setup. | MVP |
| NFR-11 | Adaptability | Hostel names, departments and grading schemes shall be stored as configuration, not hard-coded. | MVP |

## 5. Assumptions (to be confirmed by the team)

| # | Assumption | Decided on |
|---|---|---|
| 1 | Students cannot change institutional records, but they can submit requests. | 16 Nov 2026 |
| 2 | Faculty create assignments and deadlines. | 16 Nov 2026 |
| 3 | Faculty can edit marks only for courses they teach, and every change is logged. | 16 Nov 2026 |
| 4 | University Administration can view hostel and mess data for oversight. | 16 Nov 2026 |
| 5 | Hostels, mess timings and departments are configurable. | 16 Nov 2026 |
| 6 | Students are universally identified by enrollment ID; resident students have a custom hostel ID. | 19 Nov 2026 |
| 7 | Mess operates on a monthly subscription with UPI QR and cash payment verification. | 19 Nov 2026 |
| 8 | Faculty manage course content and assessment schedules for their courses. | 19 Nov 2026 |

## 6. Traceability to research

| Finding from student interviews | Requirement |
|---|---|
| Notices reach students only by email and are missed | FR-6, FR-7 |
| No way to report hostel problems or see if they are fixed | FR-12 to FR-15 |
| Menu is shared on WhatsApp and a whiteboard | FR-16, FR-17 |
| No single place for everything | FR-1, FR-2 |
| Leave should pause mess automatically / opt-out needed | FR-33, FR-25 |
| Timetable and campus map wanted | FR-30 |

## 7. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 16 Nov 2026 | Initial SRS | Hansika |
| 1.1 | 17 Nov 2026 | Added decision dates to assumptions in section 5 | Hansika |
| 1.2 | 17 Nov 2026 | Added FR-31 (course assignment) found during analysis | Hansika |
| 1.3 | 19 Nov 2026 | Added FR-32 (courses), FR-33/FR-34 (mess subscription & cash), FR-35 (password), FR-36 (faculty content & deadlines), enrollment ID & custom hostel ID | Team |