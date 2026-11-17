# ER Diagram (MVP)

Version: 1.0
Date: 17 November 2026
Owner: Harsh (System Analyst & Software Architect)

Entity-relationship diagram for the MVP. It is drawn from `docs/analysis/data-dictionary.md` (v1.0), so entity and field names match. Only MVP data is included.

## 1. Diagram

```mermaid
erDiagram
    User ||--o| Student : "has student profile"
    User ||--o| Faculty : "has faculty profile"
    User |o--o| Hostel : "is warden of"
    User ||--o{ Notice : "posts"
    User ||--o{ MenuItem : "posts"
    User ||--o{ Marks : "last updated by"
    User ||--o{ AuditLog : "makes change"
    User |o--o{ Complaint : "updates status"

    Department ||--o{ Student : "has"
    Department ||--o{ Faculty : "has"
    Department ||--o{ Course : "offers"

    Hostel |o--o{ Student : "houses"
    Hostel ||--o{ Complaint : "receives"

    Student ||--o{ Complaint : "raises"
    Student ||--o{ Enrollment : "enrolled in"
    Student ||--o{ Marks : "receives"

    Course ||--o{ Enrollment : "has"
    Course ||--o{ CourseFaculty : "taught by"
    Course ||--o{ Marks : "has"

    Faculty ||--o{ CourseFaculty : "teaches"

    GradeScale |o--o{ Marks : "gives grade"
    Marks ||--o{ AuditLog : "changes logged in"

    MealSlot ||--o{ MenuItem : "has"

    User {
        int user_id PK
        string username UK
        string password_hash
        string role
        string full_name
        string email
        boolean is_active
        datetime created_at
    }
    Student {
        int student_id PK
        int user_id FK
        string roll_number UK
        int department_id FK
        int hostel_id FK
        int year
    }
    Faculty {
        int faculty_id PK
        int user_id FK
        int department_id FK
    }
    Department {
        int department_id PK
        string name UK
    }
    Hostel {
        int hostel_id PK
        string name UK
        int warden_user_id FK
    }
    Course {
        int course_id PK
        string code UK
        string name
        int department_id FK
    }
    CourseFaculty {
        int course_id PK, FK
        int faculty_id PK, FK
    }
    Enrollment {
        int course_id PK, FK
        int student_id PK, FK
    }
    Marks {
        int marks_id PK
        int student_id FK
        int course_id FK
        float marks_obtained
        float max_marks
        string grade FK
        int updated_by FK
        datetime updated_at
    }
    GradeScale {
        string grade PK
        float min_percent
    }
    AuditLog {
        int log_id PK
        int changed_by FK
        int marks_id FK
        string field_changed
        string old_value
        string new_value
        datetime changed_at
    }
    Notice {
        int notice_id PK
        string title
        string body
        int posted_by FK
        datetime created_at
        datetime updated_at
    }
    Complaint {
        int complaint_id PK
        int student_id FK
        int hostel_id FK
        string title
        string description
        string status
        datetime created_at
        datetime updated_at
        int updated_by FK
    }
    MealSlot {
        int slot_id PK
        string name UK
        time start_time
        time end_time
    }
    MenuItem {
        int menu_id PK
        date menu_date
        int slot_id FK
        string items
        int posted_by FK
        datetime updated_at
    }
```

PK = primary key, FK = foreign key, UK = unique. If the diagram does not show in your editor, view the file on GitHub, which draws it automatically.

## 2. Relationships in words

| Relationship | Meaning | SRS |
|---|---|---|
| User and Student, User and Faculty | Every student and faculty member has one login account. Warden, Mess Admin and Admin need only the User row. | FR-1, FR-3 |
| User and Hostel | A hostel has at most one warden and a warden manages one hostel (decision D-2). | FR-14 |
| Student and Hostel | A student belongs to at most one hostel. Day scholars have none. | FR-12 |
| Student, Course, Enrollment | A student can be enrolled in many courses and a course has many students. | FR-31 |
| Faculty, Course, CourseFaculty | A faculty member can teach many courses and a course can have more than one teacher. | FR-31 |
| Marks | One row per student per course. The student must be enrolled and the editor must teach the course. | FR-8, FR-10 |
| Marks and AuditLog | Every change to marks or grade adds an AuditLog row. Rows are never edited or deleted. | FR-11 |
| Student and Complaint | A student raises many complaints and sees only their own. | FR-12, FR-13 |
| Hostel and Complaint | A complaint goes to the hostel of the student who raised it. | FR-14 |
| MealSlot and MenuItem | A menu entry is one dish list for one date and one meal slot. | FR-16, FR-17 |

## 3. Design notes

- User, Student and Faculty are separate tables so login data stays apart from profile data.
- Department, Hostel, GradeScale and MealSlot are configuration tables, so another university can set its own values (NFR-11).
- The weekly menu is not stored. It is the seven daily menus for that week.
- `Complaint.hostel_id` is copied from the student's hostel when the complaint is raised, so old complaints stay with the right hostel even if the student moves.
- `Marks` can only be created for a student and course that exist in `Enrollment`. The database alone cannot enforce this, so the application checks it.

## 4. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial ER diagram from data dictionary v1.0 | Harsh |