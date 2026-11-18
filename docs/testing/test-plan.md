# Test Plan

Version: 1.1
Date: 19 November 2026
Owner: Siya (QA & DevOps Engineer), updated with Development Team

## 1. Objectives

Check that the UniConnect MVP satisfies SRS v1.3, and that each role can access only what the permission matrix allows.

## 2. Scope

In scope: the MVP features (FR-1 to FR-4, FR-6 to FR-19, FR-31 to FR-36) and the MVP non-functional requirements (NFR-1 to NFR-11).

Out of scope: features marked "Later" in the SRS, and external load testing beyond normal campus use.

## 3. Test types

- **Functional tests:** login, password change, dashboards, marks entry, complaint lifecycle and resolution notes, menu date picker queries, mess subscriptions & cash payments, course content and evaluation deadlines, notices.
- **Permission tests:** each role executes only what the permission matrix allows; day scholar access boundaries on hostels; faculty access boundaries on courses they teach.
- **Validation tests:** empty or invalid input, duplicate records, access attempts without login, negative/excess marks, duplicate meal slot handling via Upsert.

The detailed test cases are in `test-cases.md`.

## 4. Environment

- Browsers: one desktop browser (Chrome/Firefox) and one mobile browser.
- A test copy of the application connected to a test PostgreSQL database (Supabase) with test accounts for all 5 roles.
- Test data: at least two students (one resident with `custom_hostel_id` and one day scholar), two faculty with different courses, one warden per hostel block, and sample mess menus/subscriptions.

## 5. Responsibilities

| Person | Role in testing |
|---|---|
| Siya | Writes the test cases, runs them, logs bugs, writes the test report |
| Vikryansh | Fixes bugs, tells QA when a fix is ready |
| Harsh | Clarifies the matrix and data dictionary when a test is unclear |
| Hansika | Checks results against the SRS, helps verify requirements |

## 6. Defect handling

Every bug is logged with steps to reproduce, severity (High, Medium, Low), status (Open, Fixed, Verified) and the commit or pull request that fixed it. The log is kept in `docs/testing/bug-log.md`. QA re-tests every fix before closing it.

## 7. Schedule

- Stage 4 (Analysis): test cases written from the permission matrix.
- Stage 5 (Design): test cases updated for new MVP features (mess subscriptions, course deadlines, password change).
- Stage 6 (Implementation): test each feature branch against test cases.
- Stage 7 (Testing & QA): full run of all test cases, final test report.

## 8. Exit criteria

All test cases run. No High severity bug open. Remaining known issues listed in the test report.

## 9. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial test plan | Siya |
| 1.1 | 19 Nov 2026 | Updated scope to SRS v1.3 (FR-32 to FR-36), PostgreSQL environment, and new feature test coverage | Team |