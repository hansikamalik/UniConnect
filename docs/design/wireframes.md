# Wireframes (MVP)

Version: 1.1
Date: 19 November 2026
Owner: Saumya (UI/UX Designer), updated with Development Team

Low-fidelity wireframes for the MVP screens listed in `personas-and-user-flows.md` (section 3). Key screens and newly added feature screens are drawn in full. The remaining screens reuse one of these layouts and are listed in section 4. Square brackets are buttons, underscores are input fields.

## 1. Shared layout (all screens after login)

```
+----------------------------------------------------------------+
| UniConnect                     Riya (Student) [Profile v] Logout |
+--------------------+-------------------------------------------+
| Dashboard          |                                           |
| Notices            |                                           |
| (menu items depend |          Page content                     |
|  on the role)      |                                           |
|                    |                                           |
+--------------------+-------------------------------------------+
```

- Clicking `[Profile v]` opens the profile menu with a **[Change Password]** option (FR-35), launching a password update modal.
- The left menu shows only what the user's role may use (FR-18).
- On a phone, the menu collapses into one hamburger button, content stacks vertically, and tables scroll horizontally (NFR-5).
- Every form displays inline field errors and retains user inputs upon validation failures (NFR-7, NFR-8).
- Destructive actions (deleting notices, deactivating accounts) require a confirmation popup dialog.

## 2. Key screens

### S-01 Login (FR-1)

```
+------------------------------------+
|             UniConnect             |
|    University Management System    |
|                                    |
|  Username                          |
|  [______________________________]  |
|  Password                          |
|  [______________________________]  |
|                                    |
|  [            Login            ]   |
|                                    |
|  Error line, shown only on error:  |
|  Wrong username or password        |
|                                    |
|  No account? Contact the           |
|  university administration office. |
+------------------------------------+
```

There is no sign-up link, because accounts are created exclusively by the administration (FR-4).

### S-02 Student dashboard (FR-2, NFR-6)

```
+----------------------------------------------------------------+
| UniConnect                               Riya (Student) Logout |
+--------------------+-------------------------------------------+
| > Dashboard        |  Welcome, Riya                            |
|   Notices          |  Enrollment ID: 23CS101 | Hostel: BH1-304 |
|   Profile & Marks  |                                           |
|   Hostel           |  +-----------------+ +------------------+ |
|   Mess Menu        |  | Latest notices  | | Today's menu     | |
|                    |  | - Notice 1      | | Breakfast (8:30) | |
|                    |  | - Notice 2      | | Lunch (12:30)    | |
|                    |  | [See all]       | | Dinner (19:30)   | |
|                    |  |                 | | [📅 Select Date] | |
|                    |  +-----------------+ +------------------+ |
|                    |  +-----------------+ +------------------+ |
|                    |  | My complaints   | | Academic marks   | |
|                    |  | 1 Pending       | | Data Structures:B| |
|                    |  | 1 In Progress   | | Databases: A     | |
|                    |  | [New complaint] | | [View transcript]| |
|                    |  +-----------------+ +------------------+ |
+--------------------+-------------------------------------------+
```

*Note: For Day Scholars (`custom_hostel_id == null`), the "My complaints" card is hidden.*

### S-07 Notices (FR-6, FR-7)

```
+----------------------------------------------------------------+
| Campus Notices                                   [New notice]  |
+----------------------------------------------------------------+
| v Exam form last date extended                     12 Nov 2026 |
|   All students must submit the examination form by 25 Nov 2026.|
|   Late submissions will incur a fine.                          |
|   [Edit]  [Delete] (Admin only)                                |
| > Hostel water supply maintenance                  10 Nov 2026 |
| > Central Library weekend timing revision          08 Nov 2026 |
+----------------------------------------------------------------+
```

- Accordion layout: clicking any notice expands to show the full body in-place.
- The `[New notice]`, `[Edit]`, and `[Delete]` buttons are visible only to the University Admin.

### S-09 Profile and marks (FR-10)

```
+----------------------------------------------------------------+
| My Profile & Marks                                             |
+----------------------------------------------------------------+
| Name: Riya Malik             Enrollment ID: 23CS101            |
| Email: riya23@sau.int        Hostel ID: BH1-304                |
+----------------------------------------------------------------+
| Subject            | Marks | Max | Grade                       |
+----------------------------------------------------------------+
| Data Structures    |  72   | 100 |  B                          |
| Database Systems   |  81   | 100 |  A                          |
+----------------------------------------------------------------+
```

Strictly read-only; students can only view their own records.

### S-10 My courses and student roster (FR-8)

```
+----------------------------------------------------------------+
| My Courses  >  CS201 Data Structures                           |
| [ Student Roster & Marks ]   [ Course Content & Deadlines ]    |
+----------------------------------------------------------------+
| Student Name   | Enrollment ID | Marks   | Grade | Action      |
+----------------+---------------+---------+-------+-------------+
| Riya Malik     | 23CS101       | 72/100  | B     | [Edit Marks]|
| Aman Sharma    | 23CS102       | Pending | -     | [Enter Marks|
+----------------------------------------------------------------+
```

### S-11 Enter marks (FR-8, FR-11)

```
+----------------------------------------------------------------+
| Enter marks                                                    |
+----------------------------------------------------------------+
| Course: CS201 Data Structures                                  |
| Student: Riya Malik (23CS101)          [View student profile]  |
|                                                                |
| Marks obtained   [  72.0  ]    Max marks   [ 100.0  ]          |
| Calculated Grade B (auto-computed from grade scale)            |
|                                                                |
| [Audit Trail] All changes logged with user, timestamp and diff.|
|                                                                |
| [Save Marks]   [Save & Next Student]   [Cancel]                |
+----------------------------------------------------------------+
```

### S-14 & S-15 Complaint Detail Modal (FR-13, FR-14, FR-15)

```
+----------------------------------------------------------------+
| Complaint Detail: #C-104                                       |
+----------------------------------------------------------------+
| Title: Water leakage in bathroom pipe                          |
| Student: Riya Malik (23CS101)        Room / Hostel: BH1-304    |
| Status: [ In Progress ]              Date: 12 Nov 2026         |
| Description:                                                   |
| The cold water pipe under the basin in bathroom 304 is leaking |
| constantly, causing water to pool on the floor.                |
|                                                                |
| (Warden view only)                                             |
| Status Action: [Mark as Resolved]                              |
| Resolution Notes:                                              |
| [____________________________________________________________] |
|                                                                |
| [Close]                                                        |
+----------------------------------------------------------------+
```

### S-16 Mess menu, student (FR-16, FR-17)

```
+----------------------------------------------------------------+
| Mess menu                    [📅 Select Date]  [Today]         |
+----------------------------------------------------------------+
| Today — Tuesday, 17 Nov 2026                                   |
|                                                                |
| Breakfast (08:30 – 10:30)                                      |
|   Poha, boiled eggs / sprouts, bread, butter, tea              |
|                                                                |
| Lunch (12:30 – 14:30)                                          |
|   Steamed rice, dal tadka, mix veg sabzi, curd, roti           |
|                                                                |
| Dinner (19:30 – 21:30)                                         |
|   Roti, paneer butter masala, jeera rice, dal fry, gulab jamun |
+----------------------------------------------------------------+
```

Clicking `[📅 Select Date]` opens the calendar date picker to view menus for any chosen date.

### S-18 Users, admin (FR-3)

```
+----------------------------------------------------------------+
| User Accounts Management                         [New user]    |
+----------------------------------------------------------------+
| Search [____________]   Role [All v]                           |
+----------------------------------------------------------------+
| Name   | Username | Role     | Identifier | Active | Action    |
+----------------------------------------------------------------+
| Riya   | riya23   | Student  | 23CS101    | Yes    | [Edit] [Deactivate]|
| Aman   | aman23   | Student  | 23CS102    | No     | [Edit] [Activate]  |
| Dr. M  | dmehta   | Faculty  | CS Dept    | Yes    | [Edit] [Deactivate]|
| Mr. Rao| mrao     | Warden   | BH1 Block  | Yes    | [Edit] [Deactivate]|
+----------------------------------------------------------------+
```

The `[New user]` modal dynamically displays `Enrollment ID` & `Custom Hostel ID` for Students, and `Assigned Hostel Block` for Wardens.

### S-19 Course catalog & assignments (FR-31, FR-32)

```
+----------------------------------------------------------------+
| Course Management                                [+ New Course]|
+----------------------------------------------------------------+
| Pick Course: [ CS201 Data Structures          v ]              |
+----------------------------------------------------------------+
| Assigned Faculty: Dr. Mehta           [Assign Faculty]         |
| Enrolled Students (64)                [Enrol Student]          |
|                                                                |
| Enrollment ID | Student Name     | Department | Action         |
| 23CS101       | Riya Malik       | CS         | [Remove]       |
| 23CS102       | Aman Sharma      | CS         | [Remove]       |
+----------------------------------------------------------------+
```

### S-21 Student mess subscription & QR payment (FR-33)

```
+----------------------------------------------------------------+
| Monthly Mess Subscription — November 2026                      |
+----------------------------------------------------------------+
| Current Status: [ PENDING VERIFICATION ]                       |
| Monthly Fee: INR 3,500                                         |
|                                                                |
| [ Option A: Opt-Out for this Month ]                           |
|                                                                |
| Option B: Subscribe via Online Payment                         |
| +-------------------------+                                    |
| |       [ UPI QR CODE ]   | Scan using Google Pay, PhonePe,   |
| |         (BHIM / UPI)    | or any banking app.               |
| +-------------------------+                                    |
| Bank UTR / Transaction ID *                                    |
| [ 234908123891_________________________________ ]              |
| Payment Screenshot Proof *                                     |
| [ Choose File ] receipt_nov.png                                |
|                                                                |
| [Submit Payment Proof]                                         |
+----------------------------------------------------------------+
```

### S-22 Mess admin subscriptions & cash recording (FR-34)

```
+----------------------------------------------------------------+
| Mess Subscriptions — November 2026     [+ Record Cash Payment] |
+----------------------------------------------------------------+
| Total Enrolled: 500  | Active: 420  | Pending: 15  | Opted Out: 65 |
+----------------------------------------------------------------+
| Student Name | Enrol ID | Method | Trans ID / Ref | Proof | Action  |
+--------------+----------+--------+----------------+-------+---------+
| Riya Malik   | 23CS101  | UPI    | 234908123891   | [View]| [Approve] [Reject] |
| Aman Sharma  | 23CS102  | CASH   | REC-8902       | -     | Verified|
+----------------------------------------------------------------+
```

`[+ Record Cash Payment]` opens a modal to select a student, enter amount, cash voucher number, and mark immediately as Verified.

### S-23 Faculty course content & deadlines (FR-36)

```
+----------------------------------------------------------------+
| CS201 Data Structures  >  Content & Deadlines   [+ Post New Item]
+----------------------------------------------------------------+
| [QUIZ] Quiz 1: Linked Lists & Asymptotic Analysis              |
| 📅 Date: Monday, 24 Nov 2026, 10:00 AM | Venue: Hall 201       |
| Syllabus: Doubly linked lists, stack evaluation. Bring ID card.|
| [Edit] [Delete]                                                |
|                                                                |
| [LAB EVALUATION] Lab 2: Binary Search Trees & AVL Rotations    |
| 📅 Date: Thursday, 27 Nov 2026, 02:00 PM | Venue: Lab 3        |
| Implement AVL insertion and balancing rotations. Viva included.|
| [Edit] [Delete]                                                |
+----------------------------------------------------------------+
```

## 3. How screens are reached

Every screen is opened from the left menu or from a card on the user's dashboard. Menu items and screen access are strictly enforced according to the user's role.

## 4. Remaining screens

| ID | Screen | Layout | What is different |
|---|---|---|---|
| S-03 | Faculty dashboard | Like S-02 | Cards: Latest notices, My courses, Pending grading count |
| S-04 | Warden dashboard | Like S-02 | Cards: Latest notices, Complaints by status count (Pending, In Progress, Resolved) |
| S-05 | Mess admin dashboard | Like S-02 | Cards: Latest notices, Today's menu, Subscriptions verification queue count |
| S-06 | Admin dashboard | Like S-02 | Cards: Latest notices, Users, Courses, Audit log overview |
| S-08 | New / edit notice | Form like S-13 | Fields: title, body. Buttons: Publish, Cancel |
| S-12 | Student profile (faculty) | Like S-09 | Profile details only, view only with `[Back to Marks Entry]` button |
| S-13 | New complaint | Form | Title, description; auto-attaches `custom_hostel_id` |
| S-17 | Publish menu | Form | Date, meal slot (Breakfast, Lunch, Dinner), dishes; Upsert enabled |
| S-20 | All-data overview and audit log | List like S-18 | Read-only oversight tables with filter tabs (Students, Faculty, Hostel, Mess, Audit Log) |

## 5. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial wireframes for MVP screens | Saumya |
| 1.1 | 19 Nov 2026 | Added S-21 (Mess QR), S-22 (Admin Cash/Verification), S-23 (Course Deadlines), Complaint Detail Modal, and Date Picker | Team |