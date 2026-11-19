# Defect & Bug Tracking Log

Version: 1.0  
Date: 19 November 2026  
Owner: Siya (QA & DevOps Engineer)  
Status: All Defects Closed (0 Open High/Medium/Low)

---

## 1. Defect Severity & Lifecycle Guidelines

- **High:** Blocks core user workflow, bypasses access control/permissions, causes data loss or corruption, crashes server.
- **Medium:** Functional requirement defect with partial workaround; improper validation handling; UI data misalignment.
- **Low:** Cosmetic layout defect; minor typographical error; styling inconsistency across themes.

**Lifecycle:** `Reported` &rarr; `In Progress` &rarr; `Fixed (Dev)` &rarr; `Re-tested & Verified (QA)` &rarr; `Closed`.

---

## 2. Defect Register

| Bug ID | Severity | Module / Area | Description | Fix Commit | QA Verification Status | Verified By |
|---|---|---|---|---|---|---|
| **BUG-01** | High | Hostel / Boundary | Day Scholars (`custom_hostel_id == null`) were able to reach complaint submission form. | `5325218` | **Verified & Closed** (Day Scholar view now renders restriction notice gracefully). | Siya |
| **BUG-02** | High | Academic / Marks | Marks update and audit logging were running in separate queries, risking partial write if audit insert failed. | `5a48ba1` / `5325218` | **Verified & Closed** (Single database transaction `BEGIN ... COMMIT` enforced). | Siya |
| **BUG-03** | Medium | Mess / Menu | Duplicate menu slot entry on the same date threw unhandled PostgreSQL unique constraint error. | `acbd373` | **Verified & Closed** (Upsert `ON CONFLICT (menu_date, slot_id) DO UPDATE` implemented). | Siya |
| **BUG-04** | Medium | Error Handling | Unhandled errors in dashboard controllers displayed stack traces in development. | `a0637cd` | **Verified & Closed** (Dedicated `views/errors/500.ejs` template and safe locals fallback created). | Siya |
| **BUG-05** | Low | UI / Theme Engine | Dropdown in navbar displayed internal agent numbering labels (`Agent 1: ...`). | `c581f53` | **Verified & Closed** (Labels cleaned to canonical theme display names). | Siya |
| **BUG-06** | Medium | Admin / Accounts | University admin lacked in-place form to edit existing user records without database direct queries. | `d48064d` | **Verified & Closed** (Admin user edit view and controller endpoints verified). | Siya |
| **BUG-07** | High | Security / Privacy | Real student and faculty records were seeded during test runs. | `bde38e8` / `0eed6ac` | **Verified & Closed** (All data sanitized with standard mock demo credentials). | Siya |

---

## 3. Defect Metrics Summary

- **Total Logged Defects:** 7
- **High Severity:** 3 (All Resolved & Verified)
- **Medium Severity:** 3 (All Resolved & Verified)
- **Low Severity:** 1 (All Resolved & Verified)
- **Open Defects:** **0**
- **Re-test Pass Rate:** **100%**

---

## 4. Change Log

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 19 Nov 2026 | Initial defect log compiled and closed during Stage 7 QA verification | Siya |
