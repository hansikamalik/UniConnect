# Data Dictionary (MVP)

Version: 1.0
Date: 17 November 2026
Owner: Harsh (System Analyst & Software Architect)

Lists all data the MVP stores. The ER diagram in Design is drawn from this. PK = primary key, FK = foreign key.

## 1. Analysis decisions

These came up while modelling. Each needs team confirmation; fill in the "Decided on" date once confirmed.

| # | Question | Decision | Decided on |
|---|---|---|---|
| D-1 | Who links faculty and students to courses? | University Admin does it during account setup. | 17 Nov 2026 |
| D-2 | How is a warden tied to a hostel? | One warden per hostel. A warden sees only their own hostel's complaints. | 17 Nov 2026 |
| D-3 | What does the audit log cover? | Every change to marks and grades (who, what, when). | 17 Nov 2026 |
| D-4 | Which student profiles can faculty view? | Only students enrolled in a course the faculty member teaches. | 17 Nov 2026 |

## 2. Entities

### User
| Field | Type | Rules |
|---|---|---|
| user_id | integer | PK |
| username | text | required, unique |
| password_hash | text | required, never plain text (NFR-2) |
| role | text | required: Student, Faculty, Warden, MessAdmin, Admin |
| full_name | text | required |
| email | text | required |
| is_active | boolean | default true. Admin sets false to deactivate |
| created_at | datetime | set by system |

### Student
| Field | Type | Rules |
|---|---|---|
| student_id | integer | PK |
| user_id | integer | FK to User, unique, role must be Student |
| roll_number | text | required, unique |
| department_id | integer | FK to Department |
| hostel_id | integer | FK to Hostel, optional (day scholars) |
| year | integer | 1 to 4 |

### Faculty
| Field | Type | Rules |
|---|---|---|
| faculty_id | integer | PK |
| user_id | integer | FK to User, unique, role must be Faculty |
| department_id | integer | FK to Department |

### Department (configuration, NFR-11)
| Field | Type | Rules |
|---|---|---|
| department_id | integer | PK |
| name | text | required, unique |

### Hostel (configuration, NFR-11)
| Field | Type | Rules |
|---|---|---|
| hostel_id | integer | PK |
| name | text | required, unique |
| warden_user_id | integer | FK to User, unique, role must be Warden (D-2) |

### Course
| Field | Type | Rules |
|---|---|---|
| course_id | integer | PK |
| code | text | required, unique |
| name | text | required |
| department_id | integer | FK to Department |

### CourseFaculty (who teaches what)
| Field | Type | Rules |
|---|---|---|
| course_id | integer | FK to Course |
| faculty_id | integer | FK to Faculty. Pair is unique |

### Enrollment (who studies what)
| Field | Type | Rules |
|---|---|---|
| course_id | integer | FK to Course |
| student_id | integer | FK to Student. Pair is unique |

### Marks
| Field | Type | Rules |
|---|---|---|
| marks_id | integer | PK |
| student_id | integer | FK to Student |
| course_id | integer | FK to Course. Student must be enrolled |
| marks_obtained | number | required, 0 to max_marks |
| max_marks | number | required, greater than 0 |
| grade | text | from GradeScale |
| updated_by | integer | FK to User (must be faculty of this course) |
| updated_at | datetime | set by system |

One row per student per course (student_id + course_id is unique).

### GradeScale (configuration, NFR-11)
| Field | Type | Rules |
|---|---|---|
| grade | text | PK, for example A, B, C |
| min_percent | number | lowest percentage for this grade |

### AuditLog
| Field | Type | Rules |
|---|---|---|
| log_id | integer | PK |
| changed_by | integer | FK to User |
| marks_id | integer | FK to Marks |
| field_changed | text | marks_obtained or grade |
| old_value | text | empty for first entry |
| new_value | text | required |
| changed_at | datetime | set by system. Rows can never be edited or deleted |

### Notice
| Field | Type | Rules |
|---|---|---|
| notice_id | integer | PK |
| title | text | required, max 150 characters |
| body | text | required |
| posted_by | integer | FK to User, role must be Admin |
| created_at | datetime | set by system |
| updated_at | datetime | set by system |

### Complaint
| Field | Type | Rules |
|---|---|---|
| complaint_id | integer | PK |
| student_id | integer | FK to Student |
| hostel_id | integer | FK to Hostel, copied from the student's hostel when raised |
| title | text | required, max 100 characters |
| description | text | required |
| status | text | Pending, In Progress or Resolved. Starts as Pending. Only moves forward in that order (FR-15) |
| created_at | datetime | set by system |
| updated_at | datetime | set by system |
| updated_by | integer | FK to User (warden) |

### MealSlot (configuration, mess timings)
| Field | Type | Rules |
|---|---|---|
| slot_id | integer | PK |
| name | text | required, unique (for example Breakfast, Lunch, Dinner) |
| start_time | time | required |
| end_time | time | required |

### MenuItem
| Field | Type | Rules |
|---|---|---|
| menu_id | integer | PK |
| menu_date | date | required |
| slot_id | integer | FK to MealSlot. menu_date + slot_id is unique |
| items | text | required, list of dishes |
| posted_by | integer | FK to User, role must be MessAdmin |
| updated_at | datetime | set by system |

The weekly menu is the seven daily menus for that week. It is not stored separately.

## 3. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 0.1 | 17 Nov 2026 | Draft MVP data dictionary and analysis decisions | Harsh (draft) |
| 1.0 | 17 Nov 2026 | Reviewed and confirmed by the team | Hansika |