# Wireframes (MVP)

Version: 1.0
Date: 17 November 2026
Owner: Saumya (UI/UX Designer)

Low-fidelity wireframes for the MVP screens listed in `personas-and-user-flows.md` (section 3). Nine key screens are drawn in full. The remaining screens reuse one of these layouts and are listed in section 4, so every screen is covered. Square brackets are buttons, underscores are input fields.

## 1. Shared layout (all screens after login)

```
+----------------------------------------------------------------+
| UniConnect                               Riya (Student) Logout |
+--------------------+-------------------------------------------+
| Dashboard          |                                           |
| Notices            |                                           |
| (menu items depend |          Page content                     |
|  on the role)      |                                           |
|                    |                                           |
+--------------------+-------------------------------------------+
```

- The left menu shows only what the user's role may use (FR-18).
- On a phone, the menu collapses into one menu button, content stacks in one column, and wide tables scroll sideways (NFR-5).
- Every form shows a clear error message next to the field that needs fixing (NFR-7).

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
|  university office.                |
+------------------------------------+
```

There is no sign-up link, because accounts are only created by the administration (FR-4).

### S-02 Student dashboard (FR-2, NFR-6)

```
+----------------------------------------------------------------+
| UniConnect                               Riya (Student) Logout |
+--------------------+-------------------------------------------+
| > Dashboard        |  Welcome, Riya                            |
|   Notices          |                                           |
|   Profile & Marks  |  +-----------------+ +------------------+ |
|   Hostel           |  | Latest notices  | | Today's menu     | |
|   Mess Menu        |  | - Notice 1      | | Breakfast: ...   | |
|                    |  | - Notice 2      | | Lunch: ...       | |
|                    |  | - Notice 3      | | Dinner: ...      | |
|                    |  | [See all]       | | [Week view]      | |
|                    |  +-----------------+ +------------------+ |
|                    |  +-----------------+ +------------------+ |
|                    |  | My complaints   | | My marks         | |
|                    |  | 1 Pending       | | [View marks]     | |
|                    |  | 1 In Progress   | |                  | |
|                    |  | [New complaint] | |                  | |
|                    |  +-----------------+ +------------------+ |
+--------------------+-------------------------------------------+
```

The other four dashboards use the same layout with different cards (section 4).

### S-07 Notices (FR-6, FR-7)

```
+----------------------------------------------------------------+
| Notices                                          [New notice]  |
+----------------------------------------------------------------+
| Exam form last date extended                    12 Nov 2026    |
| Hostel water supply maintenance                 10 Nov 2026    |
| Library timing change                           08 Nov 2026    |
+----------------------------------------------------------------+
```

- Newest first. Click a notice to read it in full.
- The [New notice] button, and an [Edit] and [Delete] next to each notice, are shown only to the University Admin.

### S-09 Profile and marks (FR-10)

```
+----------------------------------------------------------------+
| Profile & Marks                                                |
+----------------------------------------------------------------+
| Name: Riya        Roll no: 23CS101        Year: 3              |
| Department: Computer Science     Hostel: Block B               |
+----------------------------------------------------------------+
| Subject            | Marks | Max | Grade                       |
+----------------------------------------------------------------+
| Data Structures    |  72   | 100 |  B                          |
| Databases          |  81   | 100 |  A                          |
+----------------------------------------------------------------+
```

Read only. There is no edit button, and a student can only ever see their own record.

### S-11 Enter marks (FR-8)

```
+----------------------------------------------------------------+
| Enter marks                                                    |
+----------------------------------------------------------------+
| Course: CS201 Data Structures                                  |
| Student: Riya (23CS101)               [View student profile]   |
|                                                                |
| Marks obtained   [______]    Max marks   [______]              |
| Grade            B (filled in automatically)                   |
|                                                                |
| Error line, shown only on error:                               |
| Marks must be between 0 and max marks                          |
|                                                                |
| [Save]   [Cancel]                                              |
+----------------------------------------------------------------+
```

The faculty reaches this screen from S-10: My Courses, pick a course, then pick a student from the list. The faculty only sees their own courses and the students enrolled in them.

### S-13 New complaint (FR-12)

```
+----------------------------------------------------------------+
| New hostel complaint                                           |
+----------------------------------------------------------------+
| Title                                                          |
| [_____________________________________________________]        |
| Description                                                    |
| [_____________________________________________________]        |
| [_____________________________________________________]        |
|                                                                |
| [Submit]   [Cancel]                                            |
+----------------------------------------------------------------+
```

After Submit, a confirmation shows and the student goes to S-14 My complaints, where the new complaint appears as Pending.

### S-15 Hostel complaints, warden (FR-14, FR-15)

```
+----------------------------------------------------------------+
| Complaints - Block B                                           |
+----------------------------------------------------------------+
| Date   | Student | Title           | Status       | Action     |
+----------------------------------------------------------------+
| 12 Nov | Riya    | Water leakage   | Pending      | [Start]    |
| 10 Nov | Aman    | Fan not working | In Progress  | [Resolve]  |
| 08 Nov | Neha    | Broken window   | Resolved     |    -       |
+----------------------------------------------------------------+
```

- Only the warden's own hostel is shown.
- The action button offers only the next step: Pending to In Progress, In Progress to Resolved. Resolved has no action, so a complaint cannot go backwards.

### S-16 Mess menu, student (FR-17)

```
+----------------------------------------------------------------+
| Mess menu                         [ Day ]  [ Week ]            |
+----------------------------------------------------------------+
| Today - Tuesday, 17 Nov                                        |
|   Breakfast (7:30-9:00)   Poha, tea                            |
|   Lunch (12:30-2:00)      Rice, dal, sabzi                     |
|   Dinner (7:30-9:00)      Roti, paneer, rice                   |
+----------------------------------------------------------------+
```

The Week button shows all seven days in a table, one row per day and one column per meal. Meal names and times come from the mess configuration (NFR-11).

### S-18 Users, admin (FR-3)

```
+----------------------------------------------------------------+
| Users                                           [New user]     |
+----------------------------------------------------------------+
| Search [____________]   Role [All v]                           |
+----------------------------------------------------------------+
| Name   | Username | Role     | Active | Action                 |
+----------------------------------------------------------------+
| Riya   | riya23   | Student  | Yes    | [Edit] [Deactivate]    |
| Aman   | aman23   | Student  | Yes    | [Edit] [Deactivate]    |
| Dr. M  | dmehta   | Faculty  | Yes    | [Edit] [Deactivate]    |
+----------------------------------------------------------------+
```

The [New user] form asks for name, username, email, role and a first password. An existing username shows an error (F10).

## 3. How screens are reached

Every screen is opened from the left menu or from a card on the user's dashboard. After login, the user lands on their dashboard (S-02 to S-06) and never sees menu items for other roles.

## 4. Remaining screens

| ID | Screen | Layout | What is different |
|---|---|---|---|
| S-03 | Faculty dashboard | Like S-02 | Cards: Latest notices, My courses |
| S-04 | Warden dashboard | Like S-02 | Cards: Latest notices, Complaints by status (count of Pending, In Progress, Resolved) |
| S-05 | Mess admin dashboard | Like S-02 | Cards: Latest notices, Today's menu, [Publish menu] |
| S-06 | Admin dashboard | Like S-02 | Cards: Latest notices, Users, Courses, Audit log |
| S-08 | New / edit notice | Form like S-13 | Fields: title, body. Buttons: Publish, Cancel |
| S-10 | My courses and student list | List like S-15 | Courses first, then the enrolled students of the chosen course with an [Enter marks] button |
| S-12 | Student profile (faculty) | Like S-09 | Profile details only, view only |
| S-14 | My complaints | List like S-15 | Student's own complaints, status shown, no action column |
| S-17 | Publish menu | Form like S-13 | Fields: date, meal, dishes. Buttons: Save, Cancel |
| S-19 | Course assignments | List like S-18 | Pick a course, then assign a faculty member or enrol a student |
| S-20 | All-data overview and audit log | List like S-18 | Read-only tables for students, faculty, hostel and mess data, and the audit log (who, what, old value, new value, when) |

## 5. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial wireframes for MVP screens | Saumya |