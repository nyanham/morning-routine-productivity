# Changelog

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://www.conventionalcommits.org/) for commit guidelines.

## v0.2.0-beta (2026-02-18)

### Feat

- add AWS Lambda deployment support via SAM

### Fix

- **deps**: bump cryptography 46.0.4 → 46.0.5 (CVE-2026-26007)
- improve error handling across frontend and backend
- Mangum stage path stripping + Lambda logging
- Lambda crash on cors_origins parsing + add request logging
- address Copilot review wave 2 feedback
- address Copilot review feedback on Lambda deployment PR
- resolve sam build failures (runtime, deps, container build)
- resolve CORS wildcard error and add Lambda best practices
- align pre-commit tool versions with CI by using local hooks

### Docs

- reorganize documentation into 11 numbered sections (44 files)
- standardize all cross-reference sections to Related Docs tables
- create docs/README.md entry point and update root README links
- deduplicate security policy (docs version now points to root SECURITY.md)
- update documentation for AWS Lambda deployment architecture

### Refactor

- apply poetry-lock and code formatting
- use pytest fixture for TestClient instead of module-level instance

## v0.1.0-beta (2026-02-06)

### BREAKING CHANGE

- Replace PowerShell-specific commands with cross-platform solutions

### Feat

- initial commit — morning routine productivity tracker

### Fix

- make pre-commit hooks cross-platform compatible
- **security**: update protobuf to 6.33.5 (CVE-2026-0994)
- **frontend**: handle missing Supabase env vars during build
- **frontend**: update ESLint to native flat config
- wrap useSearchParams in Suspense boundary for static generation
- resolve TypeScript and Ruff formatting errors
- **frontend**: resolve ESLint and gitignore issues
- fixed username at CI of readme.md
