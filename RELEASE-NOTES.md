# Release Notes — UniConnect v1.0

**Release Date:** 19 November 2026  
**Release Tag:** `v1.0`  
**Branch:** `main`  
**Status:** ✅ General Availability (MVP)

---

## Overview

UniConnect v1.0 is the first production-ready release of the **Integrated University Management System**, built for South Asian University, New Delhi, as part of the Software Engineering Project 2026 (B.Tech Computer Science & Engineering Track).

This release delivers the complete MVP (Minimum Viable Product) as specified in **SRS v1.3**, covering all five institutional roles through a single, role-based web platform.

---

## Project Team

| Role | Member |
|---|---|
| Project Lead & Requirements Engineer | Hansika |
| System Analyst & Software Architect | Harsh |
| UI/UX Designer | Saumya |
| Developer (Backend & Full-Stack) | Vikryansh |
| QA & DevOps Engineer | Siya |

---

## What's New in v1.0

### 🔐 Authentication & Access Control
- **Universal Multi-Identifier Login:** Users can sign in using any of their three identifiers — Username, University Enrollment ID (`SAU/2026/CS/001`), or Institutional Email (`student@sau.int`). Single login page serves all five roles (FR-1, FR-2).
- **Role-Based Access Control (RBAC):** Server-enforced middleware ensures strict role boundary isolation. Unauthorized access attempts return HTTP `403 Forbidden` (FR-3, NFR-3).
- **Self-Service Password Change:** Authenticated users can change their own password from their Profile page (FR-35).
- **No Self-Registration:** Accounts are provisioned exclusively by University Administration (FR-4).
- **bcrypt Password Hashing:** All credentials are stored with hashed + salted passwords using bcryptjs (NFR-2).

### 🎓 Academic Marks & Audit Trail
- **Internal Marks Entry:** Faculty can enter and update internal marks for enrolled students in courses they are assigned to teach (FR-8).
- **Automatic Grade Calculation:** Percentage and letter grade (`A+` to `F`) are computed dynamically from configurable `grade_scales` table on every marks entry.
- **Immutable Atomic Audit Log (AD-7 / D-3):** Every marks insertion or update and its corresponding `audit_log` entry execute within a single PostgreSQL transaction (`BEGIN ... COMMIT`), guaranteeing atomicity. The audit ledger cannot be edited or deleted.
- **Admin Oversight (FR-19):** University Administration can view all marks and audit log entries in a read-only inspector panel.
- **Faculty Student Profile View (FR-9):** Faculty can view the profile of any student enrolled in their own courses, with strict ownership enforcement.

### 🏗️ University Administration Panel
- **User Provisioning:** Admins can create, edit, deactivate, and reactivate accounts for all five roles with real-time uniqueness validation on username, email, and enrollment ID (FR-3).
- **Course Management:** Admin can create course records (code, name, department) and assign faculty instructors and enrolled students (FR-31, FR-32).

### 📢 Campus Notices & Circulars
- **Admin-Authored Notices:** University Administration can publish, edit, and delete campus-wide notices (FR-6).
- **Universal Read Access:** All logged-in users across all five roles can view notices in a full-text accordion panel (FR-7).

### 🏠 Hostel Maintenance & Complaints
- **Resident Complaint Submission:** Hostel-resident students can submit room maintenance tickets (title, description) linked to their `custom_hostel_id` (FR-12).
- **Day Scholar Boundary Enforcement:** Day scholars (`custom_hostel_id = NULL`) are gracefully blocked from the complaints module with a clear informational message (FR-12).
- **Warden Ticket Management (D-2):** Wardens can only view and act on complaints belonging to their assigned hostel block (BH1, BH2, GH1, GH2). Full complaint lifecycle (Pending → In Progress → Resolved) with resolution notes (FR-14, FR-15).

### 🍽️ Mess Dining & Subscriptions
- **3-Meal Daily Menu:** Mess Administrators publish daily Breakfast (8:30–10:30), Lunch (12:30–14:30), and Dinner (19:30–21:30) menus. Duplicate slot updates are handled gracefully via PostgreSQL upsert (FR-16).
- **Date-Picker Menu View:** Students can browse any date's menu through an interactive date picker (FR-17).
- **Monthly Subscription Management:** Students opt into or out of the monthly mess plan. UPI payment proofs can be uploaded; cash payments can be recorded directly by the mess admin (FR-33, FR-34).
- **Payment Verification Workflow:** Mess Administrators review payment screenshots, approve or reject subscriptions, and add administrative remarks visible to the student (FR-34).

### 📚 Course Posts, Quizzes & Deadlines
- **Faculty Content Publishing:** Faculty can post quizzes, lab evaluations, assignments, and course content with descriptions and due dates for enrolled students (FR-36).
- **Student Deadline Dashboard:** Students see upcoming deadlines from all enrolled courses directly on their home dashboard (FR-36).

### 🎨 UI Theme Engine (4 Designer Themes)
- **Instant Client-Side Switching:** A CSS variable-based theme engine applies themes immediately on page load, with no visible flash (via `data-theme` attribute).
- **Persistent Preference:** Selected theme is saved in `localStorage` and restored on every subsequent visit.
- **Four Themes Shipped:**
  1. 🏛️ SAU Official Navy Blue (`sau-official`) — Authoritative SAU institutional identity.
  2. 🌙 SAU Midnight Dark (`sau-dark`) — High-contrast dark mode with electric cyan accents.
  3. 🎓 Heritage Collegiate Crimson (`collegiate-crimson`) — Classic Oxbridge/Ivy League palette.
  4. ⚡ Futuristic Neo-Emerald (`neo-emerald`) — Modern glassmorphism with vibrant emerald gradients.

---

## Quality & Testing

| Metric | Value |
|---|---|
| Automated Verification Tests | 7/7 Passed |
| Functional & Permission Test Cases | 63/63 Passed |
| Total Tests Executed | 70/70 (100%) |
| High/Medium Open Defects | 0 |
| npm audit vulnerabilities | 0 |

Full test results: [`docs/testing/test-report.md`](docs/testing/test-report.md)  
Defect history: [`docs/testing/bug-log.md`](docs/testing/bug-log.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime & Framework | Node.js v18+, Express.js 4.21 |
| Template Engine | EJS (Embedded JavaScript) |
| Database | PostgreSQL (Supabase hosted) via `pg.Pool` |
| Authentication | `express-session`, `bcryptjs` |
| File Uploads | `multer` |
| Styling | Bootstrap 5, Bootstrap Icons, Custom CSS Variable Theme Engine |

---

## Known Limitations & Deferred to v1.1

The following requirements from SRS v1.3 are out of scope for v1.0 and are tracked for the next release:

| Requirement | Description |
|---|---|
| FR-5 | University Administration-initiated password reset for locked accounts. |
| — | Cloud/S3 object storage for payment receipt uploads (currently stored on local disk). |
| — | Student timetable display and campus map (noted in research; deferred). |
| — | Linked hostel leave and mess opt-out automation (noted in research; deferred). |

---

## Getting Started

```bash
git clone https://github.com/hansikamalik/UniConnect.git
cd UniConnect
npm install
# Configure .env (see .env.example)
npm run migrate
npm run seed
npm run seed:demo
npm start
```

Open **http://localhost:3000** in your browser.

---

## Documentation

| Document | Path |
|---|---|
| SRS v1.3 | `docs/requirements/SRS.md` |
| ER Diagram | `docs/design/er-diagram.md` |
| Architecture Diagram & ADRs | `docs/architecture/` |
| Test Plan | `docs/testing/test-plan.md` |
| Final Test Report | `docs/testing/test-report.md` |
| QA Handover Guide | `docs/testing/qa-handover.md` |

---

*UniConnect v1.0 — South Asian University, New Delhi — Software Engineering Project 2026*
