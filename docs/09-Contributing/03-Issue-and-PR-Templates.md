# Issue & PR Templates

> Reference for every GitHub template and automation file in
> `.github/`.

---

## Directory Layout

```
.github/
├── CODEOWNERS
├── dependabot.yml
├── pull_request_template.md
├── release.yml
├── copilot-instructions.md
├── ISSUE_TEMPLATE/
━E  ├── bug_report.md
━E  └── feature_request.md
└── workflows/
    ├── ci.yml
    └── deploy.yml
```

---

## Pull Request Template

File: [`.github/pull_request_template.md`](../../.github/pull_request_template.md)

Every new PR is pre-filled with:

| Section                       | Purpose                                                                   |
| ----------------------------- | ------------------------------------------------------------------------- |
| **Description**               | Brief summary of the change                                               |
| **Type of Change**            | Checkbox list  — bug fix, feature, breaking change, docs, config, refactor |
| **Component(s) Affected**     | Frontend, Backend, Database, CI/CD, Documentation                         |
| **Related Issues**            | `Closes #(issue)`                                                         |
| **How Has This Been Tested?** | Unit / integration / manual checkboxes                                    |
| **Checklist**                 | Style, self-review, comments, docs, warnings, tests                       |
| **Screenshots**               | Space for visual evidence of UI changes                                   |

---

## Issue Templates

### Bug Report

File: [`.github/ISSUE_TEMPLATE/bug_report.md`](../../.github/ISSUE_TEMPLATE/bug_report.md)

Auto-applies the `bug` label. Sections:

| Section           | What to Include                          |
| ----------------- | ---------------------------------------- |
| Bug Description   | Clear, concise statement of the problem  |
| To Reproduce      | Numbered steps                           |
| Expected Behavior | What should happen instead               |
| Screenshots       | If applicable                            |
| Environment       | OS, browser, Node.js and Python versions |
| Component         | Frontend / Backend / Database / Other    |
| Logs              | Relevant error output                    |

### Feature Request

File: [`.github/ISSUE_TEMPLATE/feature_request.md`](../../.github/ISSUE_TEMPLATE/feature_request.md)

Auto-applies the `enhancement` label. Sections:

| Section                 | What to Include                              |
| ----------------------- | -------------------------------------------- |
| Problem Statement       | The pain point or gap                        |
| Proposed Solution       | Desired behaviour                            |
| Alternatives Considered | Other approaches explored                    |
| Component               | Frontend / Backend / Database / Docs / Other |
| Priority                | Low / Medium / High                          |
| Additional Context      | Mockups, screenshots, links                  |

---

## CODEOWNERS

File: [`.github/CODEOWNERS`](../../.github/CODEOWNERS)

Ensures automatic review requests when a PR touches a particular area:

| Path          | Owner      |
| ------------- | ---------- |
| `*` (default) | `@nyanham` |
| `/frontend/`  | `@nyanham` |
| `/backend/`   | `@nyanham` |
| `/database/`  | `@nyanham` |
| `/.github/`   | `@nyanham` |

---

## Release Configuration

File: [`.github/release.yml`](../../.github/release.yml)

Controls the auto-generated changelog categories for GitHub Releases:

| Category      | Labels                   |
| ------------- | ------------------------ |
| Features      | `feature`, `enhancement` |
| Bug Fixes     | `fix`, `bugfix`, `bug`   |
| Documentation | `documentation`, `docs`  |
| Maintenance   | `chore`, `maintenance`   |
| Other Changes | everything else          |

PRs labelled `ignore-for-release` are excluded.

---

## Dependabot

File: [`.github/dependabot.yml`](../../.github/dependabot.yml)

Automated dependency update PRs for both the frontend (npm) and backend
(pip/Poetry) ecosystems.

> See [07-Operations / CI-CD.md](../07-Operations/02-CI-CD.md) for how
> Dependabot fits into the broader CI pipeline.

---

## Related Docs

| Topic              | Link                                                   |
| ------------------ | ------------------------------------------------------ |
| Contributing guide | [Contributing-Guide.md](02-Contributing-Guide.md)         |
| Code of conduct    | [Code-of-Conduct.md](01-Code-of-Conduct.md)               |
| Security policy    | [Security-Policy.md](04-Security-Policy.md)               |
| CI / CD pipeline   | [../07-Operations/02-CI-CD.md](../07-Operations/02-CI-CD.md) |
