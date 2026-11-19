# UniConnect 🎓

**Integrated University Management System**  
Built for the Software Engineering Project 2026 (B.Tech Computer Science & Engineering Track), South Asian University, New Delhi.

![Version](https://img.shields.io/badge/version-v1.0-blue) ![Stage](https://img.shields.io/badge/SDLC%20Stage-Released%20(v1.0)-green) ![Tests](https://img.shields.io/badge/tests-70%2F70%20passed-brightgreen)

UniConnect is an all-in-one university management portal connecting students, faculty members, hostel wardens, mess administrators, and university administration into a single, cohesive, role-based platform.

---

## 👥 Project Team

| Role | Member | Responsibilities |
|---|---|---|
| **Project Lead & Requirements Engineer** | Hansika | SRS, Backlog, Stakeholder Alignment |
| **System Analyst & Software Architect** | Harsh | Architecture, Decision Records, ER Model |
| **UI/UX Designer** | Saumya | Personas, User Flows, Wireframes, Style Guide |
| **Developer** | Vikryansh | Backend Engine, Monolith Implementation, Database, UI Themes |
| **QA & DevOps Engineer** | Siya | Test Plan, Automated Verification, Branching Strategy |

---

## ✨ Key System Features

### 1. Universal Multi-Identifier Authentication
* **Universal Sign-In:** Users can log in using their **Enrollment ID** (e.g. `SAU/2026/CS/001`), their **University Email** (`student1@sau.int`), or their standard **Username** (`student1`).
* **Session Security:** Server-side sessions with bcrypt-hashed credentials and automatic role-based landing redirection.
* **Granular RBAC:** Middleware enforcement ensuring users only access endpoints authorized for their designated role (`Student`, `Faculty`, `Warden`, `Mess Admin`, `Admin`).

### 2. UI Theme Showcase (4 Designer Themes + Instant Switcher)
UniConnect features an instant client-side theme engine with persistent `localStorage` support and a quick-switch dropdown in the top navigation header:
1. 🏛️ **SAU Official Navy Blue (`sau-official`):** Authoritative South Asian University institutional identity (`#00408d`).
2. 🌙 **SAU Midnight Dark (`sau-dark`):** High-contrast dark mode featuring deep slate backgrounds (`#080E1A`) and electric cyan accents (`#38BDF8`).
3. 🎓 **Heritage Collegiate Crimson (`collegiate-crimson`):** Oxbridge / Ivy League academic aesthetic in deep collegiate crimson (`#7A0019`) and warm gold (`#C5A059`).
4. ⚡ **Futuristic Neo-Emerald (`neo-emerald`):** Modern glassmorphism palette using vibrant emerald (`#059669`) and cyan gradients.

### 3. Role-Specific Dashboards
* **Student Dashboard:** Enrolled course progress, grades snapshot, upcoming quiz/assignment deadlines, today's 3 dining hall meals, room maintenance status, and active campus broadcasts.
* **Faculty Portal:** Active teaching load, enrolled student counts, deadline publication console, marks entry portal, and announcement authoring.
* **Warden Console:** Resident ticket queue strictly isolated to the warden's assigned building (`BH1`, `BH2`, `GH1`, `GH2`), pending repair reviews, and status lifecycles.
* **Mess Admin Station:** Real-time 3-meal menu editor, monthly subscription verifications, UPI transaction proof approvals, and cash payment recording.
* **Admin Command Center:** System-wide user provisioning, course catalogue management, instructor assignments, and immutable marks audit log inspection.

### 4. Academic Marks & Atomic Audit Trail
* Course-based marks entry with real-time percentage and letter grade calculation (`A+` down to `F`).
* **AD-7 / D-3 Single-Transaction Audit:** Every marks modification and its corresponding `audit_log` entry execute in the exact same database transaction (`BEGIN ... COMMIT`).

### 5. Hostel & Dining Lifecycle
* **Hostel Maintenance:** Resident students submit room issues; non-resident day scholars are prevented from opening hostel tickets.
* **Mess Dining & Subscriptions:** Daily 3-meal schedule (Breakfast, Lunch, Dinner). Students opt-in monthly via QR UPI upload or cash; admins verify and approve subscriptions.

---

## 🛠️ Tech Stack & Architecture

* **Architecture:** Modular MVC Monolith (`src/modules/*`) with central Express routing.
* **Runtime & Framework:** Node.js, Express.js.
* **Template Engine:** EJS (Embedded JavaScript) with reusable partials.
* **Styling:** Bootstrap 5, Bootstrap Icons, Custom CSS Variable Theme Engine.
* **Database:** PostgreSQL (hosted on Supabase) utilizing connection pooling (`pg.Pool`).
* **Authentication:** `express-session`, `bcryptjs`.
* **File Uploads:** `multer` (payment proof receipts).

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js (v18.0.0 or higher)
* PostgreSQL database instance (or Supabase project)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/hansikamalik/UniConnect.git
cd UniConnect

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=uniconnect_super_secret_session_key_2026
DATABASE_URL=postgresql://postgres.your_id:your_password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### 4. Database Setup & Seeding
```bash
# 1. Run migrations to create schema tables
npm run migrate

# 2. Seed basic institutional defaults (Departments, Hostels, 3 Meal Slots, Grading Scale, Admin)
npm run seed

# 3. Seed demo accounts across all 5 roles, sample courses, and test records
npm run seed:demo
```

### 5. Launch Application
```bash
# Production start
npm start

# Development mode with hot-reloading
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Sample Login Credentials

All users can sign in using their **Username**, **Universal Enrollment ID**, or **Institutional Email**:

| Role | Username / Identifier | Password | Description |
|---|---|---|---|
| **Admin** | `admin` *or* `admin@sau.int` | `Admin@123` | System Superuser |
| **Student** | `student1` *or* `SAU/2026/CS/001` *or* `aarav@students.sau.int` | `Student@123` | Aarav Sharma (Hostel Resident, Room BH1-304) |
| **Student** | `student2` *or* `SAU/2026/CS/002` *or* `priya@students.sau.int` | `Student@123` | Priya Nair (Day Scholar) |
| **Faculty** | `faculty1` *or* `rajesh.kumar@sau.int` | `Faculty@123` | Dr. Rajesh Kumar (Dept. of Computer Science) |
| **Faculty** | `faculty2` *or* `sunita.sharma@sau.int` | `Faculty@123` | Dr. Sunita Sharma (Dept. of Mathematics) |
| **Warden** | `warden1` *or* `vikram.warden@sau.int` | `Warden@123` | Mr. Vikram Singh (Boys Hostel 1 - BH1) |
| **Warden** | `warden2` *or* `anita.warden@sau.int` | `Warden@123` | Dr. Anita Roy (Girls Hostel 1 - GH1) |
| **Mess Admin** | `messadmin1` *or* `mess.admin@sau.int` | `Mess@123` | Mr. Ramesh Chand (Campus Central Mess) |

---

## 📂 Repository Structure

```text
UniConnect/
├── docs/                        # Complete project documentation
│   ├── analysis/                # Data dictionary, permission matrix, use cases
│   ├── architecture/            # Architecture diagrams, decision records (AD-1 to AD-7)
│   ├── design/                  # ER diagram, personas, user flows, style guide, wireframes
│   ├── requirements/            # Problem statement, research notes, SRS v1.3
│   └── testing/                 # Test plan, test cases, bug log, test report, branching strategy
├── src/
│   ├── app.js                   # Express application entry & middleware orchestration
│   ├── config/                  # Database connection pool (pg.Pool)
│   ├── database/                # Schema DDL, migrations, and seeder scripts
│   ├── middleware/              # Auth guard, role-based access control (requireRole)
│   ├── modules/                 # Modular domain features
│   │   ├── academic/            # Course catalogue, posts, deadlines, marks & audits
│   │   ├── admin/               # User management, course assignment, audit inspector
│   │   ├── auth/                # Universal multi-identifier login & session management
│   │   ├── dashboard/           # Real-time aggregated data dashboard controller
│   │   ├── hostel/              # Resident complaints & warden resolution workflows
│   │   ├── mess/                # 3-meal daily menu & monthly fee subscriptions
│   │   └── notices/             # Campus announcements & circulars
│   ├── public/                  # Static assets: custom CSS, themes, JavaScript
│   └── views/                   # EJS templates grouped by feature module
├── tests/                       # Verification suite
├── RELEASE-NOTES.md             # v1.0 Release Notes
└── PULL_REQUEST.md              # Formal pull request documentation
```

---

## 📜 License
Developed for educational and institutional research purposes under the South Asian University Computer Science & Engineering program.
