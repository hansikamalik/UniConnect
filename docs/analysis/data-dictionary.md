# Data Dictionary (MVP)

Version: 1.1
Date: 19 November 2026
Owner: Harsh (System Analyst & Software Architect), updated with Development Team

Lists all data the MVP stores. The ER diagram in Design is drawn from this. PK = primary key, FK = foreign key.

## 1. Analysis decisions

These came up while modelling. Confirmed by the team; fill in the "Decided on" date once confirmed.

| # | Question | Decision | Decided on |
|---|---|---|---|
| D-1 | Who links faculty and students to courses? | University Admin does it during account setup and enrollment. | 17 Nov 2026 |
| D-2 | How is a warden tied to a hostel? | One warden per hostel. A warden sees only their own hostel's complaints. | 17 Nov 2026 |
| D-3 | What does the audit log cover? | Every change to marks and grades (who, what, when). | 17 Nov 2026 |
| D-4 | Which student profiles can faculty view? | Only students enrolled in a course the faculty member teaches. | 17 Nov 2026 |
| D-5 | How are students uniquely identified? | Universal unique `enrollment_id`. Replaces separate roll number, department and year attributes. | 19 Nov 2026 |
| D-6 | How is hostel residence tracked? | `custom_hostel_id` assigned to resident students (e.g., `BH1-304`). Null for day scholars. | 19 Nov 2026 |
| D-7 | How are mess subscriptions tracked? | Monthly subscription (Subscribed vs Opted Out) with online UPI QR proof submission or offline cash recording. | 19 Nov 2026 |
| D-8 | How are academic deadlines & content shared? | Faculty post course-scoped announcements, quizzes, lab evaluations, and assignments via `CoursePost`. | 19 Nov 2026 |

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
| is_active | boolean | default true. Admin sets false to deactivate, true to reactivate |
| created_at | datetime | set by system |

### Student
| Field | Type | Rules |
|---|---|---|
| student_id | integer | PK |
| user_id | integer | FK to User, unique, role must be Student |
| enrollment_id | text | required, unique universal student identifier (D-5) |
| custom_hostel_id | text | optional; room identifier for residents (e.g. "BH1-304"), null for day scholars (D-6) |

### Faculty
| Field | Type | Rules |
|---|---|---|
| faculty_id | integer | PK |
| user_id | integer | FK to User, unique, role must be Faculty |
| department_id | integer | FK to Department, optional |

### Department (configuration, NFR-11)
| Field | Type | Rules |
|---|---|---|
| department_id | integer | PK |
| name | text | required, unique |

### Hostel (configuration, NFR-11)
| Field | Type | Rules |
|---|---|---|
| hostel_id | integer | PK |
| name | text | required, unique (e.g. "Boys Hostel 1") |
| code | text | required, unique prefix (e.g. "BH1") |
| warden_user_id | integer | FK to User, unique, role must be Warden (D-2) |

### Course
| Field | Type | Rules |
|---|---|---|
| course_id | integer | PK |
| code | text | required, unique |
| name | text | required |
| department_id | integer | FK to Department, optional |

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
| student_id | integer | FK to Student (must have custom_hostel_id) |
| hostel_id | integer | FK to Hostel, matched from student custom_hostel_id prefix |
| title | text | required, max 100 characters |
| description | text | required |
| status | text | Pending, In Progress or Resolved. Starts as Pending. Moves forward only (FR-15) |
| resolution_notes | text | optional; recorded by warden upon resolving |
| created_at | datetime | set by system |
| updated_at | datetime | set by system |
| updated_by | integer | FK to User (warden) |

### MealSlot (configuration, mess timings)
| Field | Type | Rules |
|---|---|---|
| slot_id | integer | PK |
| name | text | required, unique: Breakfast (8:30-10:30), Lunch (12:30-14:30), Dinner (19:30-21:30) |
| start_time | time | required |
| end_time | time | required |

### MenuItem
| Field | Type | Rules |
|---|---|---|
| menu_id | integer | PK |
| menu_date | date | required |
| slot_id | integer | FK to MealSlot. menu_date + slot_id is unique (Upsert enabled) |
| items | text | required, dishes served |
| posted_by | integer | FK to User, role must be MessAdmin |
| updated_at | datetime | set by system |

### MessSubscription
| Field | Type | Rules |
|---|---|---|
| subscription_id | integer | PK |
| student_id | integer | FK to Student |
| month_year | text | required, e.g. "2026-11". Pair (student_id, month_year) is unique |
| status | text | required: SUBSCRIBED, OPTED_OUT, PENDING_VERIFICATION, REJECTED |
| payment_method | text | optional: UPI or CASH |
| payment_status | text | required: UNPAID, PENDING, VERIFIED, REJECTED |
| transaction_id | text | optional; bank UTR number (UPI) or cash voucher number (CASH) |
| payment_proof_url | text | optional; path to uploaded payment receipt screenshot |
| submitted_at | datetime | required, set by system |
| verified_at | datetime | set when verified by mess admin |
| verified_by | integer | FK to User (MessAdmin) |
| admin_remarks | text | optional notes (e.g. rejection reason) |

### CoursePost (Course content and evaluations)
| Field | Type | Rules |
|---|---|---|
| post_id | integer | PK |
| course_id | integer | FK to Course |
| faculty_id | integer | FK to Faculty (must teach the course) |
| title | text | required, max 200 characters |
| type | text | required: QUIZ, LAB_EVALUATION, ASSIGNMENT, COURSE_CONTENT, ANNOUNCEMENT |
| description | text | required, detailed syllabus, instructions or notes |
| due_date | datetime | optional; date and time of evaluation or assignment submission deadline |
| created_at | datetime | set by system |
| updated_at | datetime | set by system |

## 3. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 0.1 | 17 Nov 2026 | Draft MVP data dictionary and analysis decisions | Harsh (draft) |
| 1.0 | 17 Nov 2026 | Reviewed and confirmed by the team | Hansika |
| 1.1 | 19 Nov 2026 | Added D-5 to D-8; updated Student (enrollment_id, custom_hostel_id), Complaint (resolution_notes), MenuItem; added MessSubscription and CoursePost | Team |