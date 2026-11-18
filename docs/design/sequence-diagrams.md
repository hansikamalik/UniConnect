# Sequence Diagrams (MVP)

Version: 1.0
Date: 17 November 2026
Owner: Harsh (System Analyst & Software Architect)

Three sequence diagrams for the key MVP flows. They use the entities in `er-diagram.md` and the rules in `docs/analysis/permission-matrix.md`.

| # | Flow | SRS |
|---|---|---|
| 1 | Login | FR-1, FR-2, FR-18 |
| 2 | Faculty enters marks (with audit log) | FR-8, FR-11 |
| 3 | Hostel complaint from Pending to Resolved | FR-12 to FR-15 |

In all diagrams, "Server" checks the user's role on every request, not just the screen (NFR-3).

## 1. Login

```mermaid
sequenceDiagram
    actor U as User
    participant UI as Web Page
    participant S as Server
    participant DB as Database

    U->>UI: Enter username and password
    UI->>S: Send login request
    S->>DB: Find user by username
    DB-->>S: User record or nothing
    S->>S: Check user is active and password matches stored hash
    alt Valid login
        S-->>UI: Start session with the user's role
        UI-->>U: Open the dashboard for that role
    else Wrong password, unknown user or deactivated
        S-->>UI: Error message
        UI-->>U: Show error and stay on login page
    end
    Note over S: Every later request is checked against the role permission matrix
```

## 2. Faculty enters marks

```mermaid
sequenceDiagram
    actor F as Faculty
    participant UI as Web Page
    participant S as Server
    participant DB as Database

    F->>UI: Choose course and student, enter marks
    UI->>S: Save marks request
    S->>S: Check session role is Faculty
    S->>DB: Does this faculty teach the course and is the student enrolled?
    DB-->>S: Yes or no
    alt Not allowed
        S-->>UI: Blocked
        UI-->>F: Show error
    else Marks empty, negative or above max marks
        S-->>UI: Validation error
        UI-->>F: Show what to fix
    else Allowed and valid
        S->>DB: Read existing marks if any
        DB-->>S: Old marks
        S->>DB: Save new marks and grade from GradeScale
        S->>DB: Add AuditLog row with who, old value, new value and time
        DB-->>S: Saved
        S-->>UI: Success
        UI-->>F: Show saved marks and grade
    end
```

## 3. Hostel complaint from Pending to Resolved

```mermaid
sequenceDiagram
    actor St as Student
    actor W as Warden
    participant UI as Web Page
    participant S as Server
    participant DB as Database

    St->>UI: Enter complaint title and description
    UI->>S: Submit complaint
    S->>DB: Save complaint with status Pending and the student's hostel
    DB-->>S: Saved
    S-->>UI: Success
    UI-->>St: Show complaint as Pending

    W->>UI: Open complaints
    UI->>S: Get complaints
    S->>DB: Find complaints of the warden's own hostel
    DB-->>S: Complaint list
    S-->>UI: Complaint list
    UI-->>W: Show complaints

    W->>UI: Change status to In Progress
    UI->>S: Update status request
    S->>S: Check the change is the next step in the order
    alt Allowed
        S->>DB: Save new status, time and warden
        DB-->>S: Saved
        S-->>UI: Success
        UI-->>W: Show new status
    else Not allowed, for example Resolved back to Pending
        S-->>UI: Blocked
        UI-->>W: Show error
    end

    St->>UI: Open my complaints
    UI->>S: Get my complaints
    S->>DB: Find complaints of this student
    DB-->>S: Complaint list with status
    S-->>UI: Complaint list
    UI-->>St: Show status In Progress
    Note over W,St: The same steps repeat for In Progress to Resolved
```

## 4. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial sequence diagrams for login, marks and complaints | Harsh |