# Branching Strategy

Version: 1.0
Date: 17 November 2026
Owner: Siya (QA & DevOps Engineer)

How the team uses Git and GitHub for UniConnect.

## 1. Branches

- `main` holds the latest stable work. It always runs and its documents are the current versions.
- Each task gets its own branch from `main`, named by type and topic:
  - `feature/login`, `feature/marks`, `feature/complaints` for code
  - `docs/design-wireframes` for documents
  - `fix/marks-validation` for bug fixes
- Release versions are tagged on `main` (for example `v0.1` for the prototype, `v1.0` for the final release).

## 2. Working rules

1. Pull the latest `main` before starting a task.
2. Create a branch for the task and commit small, often.
3. Write commit messages that say what changed, for example `Add marks entry form for faculty`.
4. When the task is done, open a pull request into `main`. Another team member reviews it before it is merged.
5. After merging, delete the branch and pull `main` again.

Documents may be committed directly to `main` by the person who owns the document, as long as the version, date and change log are updated. Code changes go through a branch and a pull request.

## 3. Issues

Requirements, tasks and bugs are tracked as GitHub Issues. Each has a short description and a label for its module (academic, hostel or mess). Pull requests mention the issue they close.

## 4. Release

When the MVP is complete and tested, QA tags the release on `main` as `v1.0` and writes the release notes.

## 5. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 17 Nov 2026 | Initial branching strategy | Siya |