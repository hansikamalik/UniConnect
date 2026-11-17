# Test Plan

Version: 1.0
Date: 17 November 2026
Owner: Siya (QA & DevOps Engineer)

## 1. Objectives

Check that the UniConnect MVP does what SRS v1.2 says, and that each role can access only what the permission matrix allows.

## 2. Scope

In scope: the MVP features (FR-1 to FR-4, FR-6 to FR-19, FR-31) and the MVP non-functional requirements (NFR-1 to NFR-11).

Out of scope: features marked "Later" in the SRS (including FR-5 until its change request is built), and security or load testing beyond normal campus use.

## 3. Test types

- **Functional tests:** login, dashboards, marks entry and viewing, complaint creation and status changes, menu publishing, notices.
- **Permission tests:** each role does only what the permission matrix allows, for example a student cannot edit marks.
- **Validation tests:** empty or invalid input, duplicate records, access attempts without login.

The test cases are in `test-cases.md`.

## 4. Environment

- Browsers: one desktop browser and one phone browser.
- A test copy of the application with its own test database and one test user for each role.
- Test data: at least two students in different hostels, two faculty with different courses, one warden per hostel.

## 5. Responsibilities

| Person | Role in testing |
|---|---|
| Siya | Writes the test cases, runs them, logs bugs, writes the test report |
| Vikryansh | Fixes bugs, tells QA when a fix is ready |
| Harsh | Clarifies the matrix and data dictionary when a test is unclear |
| Hansika | Checks results against the SRS, helps verify the change request |

## 6. Defect handling

Every bug is logged with steps to reproduce, severity (High, Medium, Low), status (Open, Fixed, Verified) and the commit or pull request that fixed it. The log is kept in `docs/testing/bug-log.md`. QA re-tests every fix before closing it.

## 7. Schedule

- Now (Stage 4): test cases written from the permission matrix.
- Stage 6 (Implementation): QA updates test cases if the design changes and tests each feature as it is merged.
- Stage 7 (Testing & QA): full run of all test cases, final test report.
- Stage 8 (Change Management): re-test the changed feature and the features around it.

## 8. Exit criteria

All test cases run. No High severity bug open. Remaining known issues listed in the test report.

## 9. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial test plan | Siya |