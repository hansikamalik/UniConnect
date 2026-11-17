# Role-Permission Matrix (MVP)

Version: 1.0
Date: 17 November 2026
Owner: Harsh (System Analyst & Software Architect)

This matrix is the basis for access control in the code (FR-18, NFR-3) and for QA's permission test cases. Rows are exact for MVP features. Later features are listed in section 3 and get their rows when they are built.

Legend: V = view, R = raise/submit, C = create, U = update, D = delete, - = no access.

## 1. MVP matrix

| Feature | Student | Faculty | Hostel Warden | Mess Admin | Univ. Admin | SRS |
|---|---|---|---|---|---|---|
| Login and own dashboard | V | V | V | V | V | FR-1, FR-2 |
| User accounts | - | - | - | - | C, U, V | FR-3, FR-4 |
| Course assignments (faculty and student to course) | - | V (own courses) | - | - | C, U, V | FR-31 |
| Student profile | V (own) | V (students in own courses) | - | - | C, U, V | FR-9, FR-10 |
| Marks and grades | V (own) | C, U, V (own courses only) | - | - | V | FR-8, FR-10, FR-19 |
| Mark audit log | - | - | - | - | V | FR-11 |
| University notices | V | V | V | V | C, U, D, V | FR-6, FR-7 |
| Hostel complaints | R, V (own) | - | U, V (own hostel) | - | V | FR-12 to FR-15 |
| Mess menu | V | - | - | C, U, V | V | FR-16, FR-17 |

Notes:
- "Own" means the user can see only records linked to their own account. The server must check this, not just the interface (NFR-3, NFR-4).
- Warden "U" on complaints means changing the status only (Pending, then In Progress, then Resolved). Wardens cannot edit the student's title or description.
- Nobody except the University Admin can create or edit accounts.
- Faculty cannot see or edit marks of courses they do not teach (assumption 3).

## 2. The (*) items from the project document

| Item | Resolution |
|---|---|
| Admin views marks and grades | Yes, V. Covered by FR-19. |
| Faculty views academic calendar | Later (FR-28) |
| Admin approves registration forms | Later (FR-20) |
| Faculty creates deadlines | Later (FR-26) |
| Admin answers queries | Later (FR-27) |
| Admin views anonymous complaints | Later (FR-27) |

## 3. Later features (not in v1.0)

No matrix rows yet for: registration forms (FR-20), hostel forms (FR-21), leave and outpass (FR-22), meal feedback (FR-23), meal opt-out (FR-24, FR-25), deadline reminders (FR-26), anonymous complaints and queries (FR-27), academic calendar (FR-28), mess complaints (FR-29), timetable and map (FR-30), class notices, password reset (FR-5).

## 4. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 0.1 | 17 Nov 2026 | Draft MVP matrix, (*) items resolved | Harsh (draft) |
| 1.0 | 17 Nov 2026 | Reviewed and confirmed by the team | Hansika |