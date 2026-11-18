# UniConnect Architecture Decision Record

**Version:** 1.2
**Date:** 18 November 2026
**Owner:** Harsh (System Analyst & Software Architect)

Each decision lists the choice, the reason, and the alternatives considered. Status "Accepted" means pending confirmation by the Developer (Vikryansh).

## AD-1: Three-tier monolithic web application

- **Status:** Accepted
- **Decision:** One web application (browser, application server, database), deployed as a single unit.
- **Reason:** One developer and limited time. A single codebase is the fastest to build, test and release. Modules are separated inside the code so the system stays organised.
- **Alternatives considered:** Separate frontend and backend apps (more setup, two things to deploy). Microservices (far too complex for this scope).

## AD-2: Backend in Node.js with Express

- **Status:** Accepted
- **Decision:** Node.js with the Express framework.
- **Reason:** Small and quick to learn, large ecosystem for sessions, hashing and PostgreSQL, and one language across the project. Middleware fits our role-check requirement well.
- **Alternatives considered:** Python Django (more built-in features, heavier), Java Spring (too much setup for the time), PHP Laravel (valid, but less familiar to the team).

## AD-3: Server-rendered frontend (EJS templates + Bootstrap 5)

- **Status:** Accepted
- **Decision:** Pages are rendered on the server with EJS and styled with Bootstrap 5.
- **Reason:** No separate frontend build or API layer to maintain. Bootstrap gives responsive layouts for desktop and mobile (a requirement), and the style guide can be applied through a small custom CSS file.
- **Alternatives considered:** React single-page app (needs a separate API, more setup, more testing surface). Plain HTML/CSS/JS only (no templating, lots of repeated code across 20 screens).

## AD-4: PostgreSQL as the database

- **Status:** Accepted (team decision, revised in v1.1)
- **Decision:** PostgreSQL, accessed through the `pg` driver.
- **Reason:** Our data is relational (users, courses, marks, complaints, audit log), as shown in the ER diagram. PostgreSQL supports foreign keys and transactions, which we need for the audit log (AD-7). The team chose it over MySQL, which was the first choice in v1.0.
- **Alternatives considered:** MySQL (equally suitable, was the v1.0 choice, dropped by team decision), MongoDB (document store, poor fit for relational data and joins), SQLite (not suited to multiple users).

## AD-5: Session-based authentication with bcrypt

- **Status:** Accepted
- **Decision:** Login creates a server-side session stored in a cookie. Passwords are stored only as bcrypt hashes. No self-registration; only the admin creates accounts.
- **Reason:** Simple, safe and enough for a web app with one server. Meets the security requirement that passwords are hashed.
- **Alternatives considered:** JWT tokens (useful for separate API clients, extra complexity for no benefit here).

## AD-6: Role-based access control enforced in server middleware

- **Status:** Accepted
- **Decision:** A middleware checks the user's role on every protected route, based on the permission matrix. Ownership rules (D-2 warden sees only their hostel, D-4 faculty see only students in their own courses) are enforced in the service layer.
- **Reason:** The requirement is that access control works on the server, not only in the interface. A central middleware also makes the permission test cases easy to write.
- **Alternatives considered:** Hiding buttons in the UI only (insecure, rejected). Checks written separately inside each controller (easy to miss one).

## AD-7: Audit log written in the same transaction as the change

- **Status:** Accepted
- **Decision:** Every marks or grade change and its `audit_log` row are saved in one database transaction (D-3).
- **Reason:** A change then cannot exist without its log entry, and a failed log write rolls the change back.
- **Alternatives considered:** Database triggers (hidden from the code, harder to test). Logging in a separate step (can fail and leave a change with no record).

## AD-8: Institution settings kept in configuration

- **Status:** Accepted
- **Decision:** Hostels, departments, mess timings and grading scheme are stored in config files or database tables, not hard-coded.
- **Reason:** Meets the adaptability requirement so another university could reuse the product.
- **Alternatives considered:** Hard-coding values (fast now, blocks reuse).

## Change Log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 18 Nov 2026 | Initial decision record (AD-1 to AD-8) | Harsh |
| 1.1 | 18 Nov 2026 | AD-4 changed from MySQL to PostgreSQL (team decision); AD-2 wording updated | Harsh |