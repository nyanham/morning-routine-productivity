# Documentation Index

> Master table of every documentation file, organised by section.

---

## 00  EOverview

| Document                                           | Description                                 |
| -------------------------------------------------- | ------------------------------------------- |
| [Vision.md](../00-Overview/01-Vision.md)           | Project purpose, goals, and target audience |
| [Quickstart.md](../00-Overview/02-Quickstart.md)   | Fastest path from clone to running app      |
| [Project-Map.md](../00-Overview/03-Project-Map.md) | Annotated directory tree                    |

## 01  EGetting Started

| Document                                                            | Description                             |
| ------------------------------------------------------------------- | --------------------------------------- |
| [Local-Setup.md](../01-Getting-Started/01-Local-Setup.md)           | Prerequisites, install steps, first run |
| [Configuration.md](../01-Getting-Started/02-Configuration.md)       | Environment files and settings          |
| [Running-Services.md](../01-Getting-Started/03-Running-Services.md) | Dev server, Docker Compose, SAM local   |

## 02  EArchitecture

| Document                                                                   | Description                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------ |
| [System-Overview.md](../02-Architecture/01-System-Overview.md)             | High-level system diagram and data flow          |
| [Backend-Architecture.md](../02-Architecture/02-Backend-Architecture.md)   | FastAPI layers, middleware, Lambda adapter       |
| [Frontend-Architecture.md](../02-Architecture/03-Frontend-Architecture.md) | Next.js App Router, page hierarchy               |
| [Data-Model.md](../02-Architecture/04-Data-Model.md)                       | Entity-relationship diagram                      |
| [Integration-Points.md](../02-Architecture/05-Integration-Points.md)       | How frontend, backend, Supabase, and AWS connect |

## 03  EAPI

| Document                                                              | Description                              |
| --------------------------------------------------------------------- | ---------------------------------------- |
| [API-Overview.md](../03-API/01-API-Overview.md)                       | Base URL, auth, versioning, error format |
| [Auth.md](../03-API/02-Auth.md)                                       | JWT flow and Supabase auth integration   |
| [Error-Handling.md](../03-API/03-Error-Handling.md)                   | Error response schema and status codes   |
| [Endpoints / Users.md](../03-API/Endpoints/01-Users.md)               | `GET /api/users/me`                      |
| [Endpoints / Routines.md](../03-API/Endpoints/02-Routines.md)         | CRUD for morning routines                |
| [Endpoints / Productivity.md](../03-API/Endpoints/03-Productivity.md) | CRUD for productivity entries            |
| [Endpoints / Analytics.md](../03-API/Endpoints/04-Analytics.md)       | Summary and chart endpoints              |
| [Endpoints / Import.md](../03-API/Endpoints/05-Import.md)             | CSV bulk import                          |

## 04  EFrontend

| Document                                                     | Description                               |
| ------------------------------------------------------------ | ----------------------------------------- |
| [UI-Structure.md](../04-Frontend/01-UI-Structure.md)         | Page layout, route map, App Router tree   |
| [State-Management.md](../04-Frontend/04-State-Management.md) | AuthContext, data fetching patterns       |
| [Components.md](../04-Frontend/02-Components.md)             | Component catalogue and props             |
| [Styling.md](../04-Frontend/05-Styling.md)                   | Tailwind setup, theme tokens, `cn()` util |
| [Hooks.md](../04-Frontend/03-Hooks.md)                       | Custom hooks (`useAuth`, `useApi`)        |

## 05  EBackend

| Document                                                              | Description                             |
| --------------------------------------------------------------------- | --------------------------------------- |
| [Backend-Overview.md](../05-Backend/01-Backend-Overview.md)           | Module map, request lifecycle           |
| [Services.md](../05-Backend/04-Services.md)                           | Service layer design and methods        |
| [Models.md](../05-Backend/03-Models.md)                               | Pydantic models and validation rules    |
| [Middleware-and-Config.md](../05-Backend/02-Middleware-and-Config.md) | CORS, exception handler, Settings class |

## 06  EDatabase

| Document                                                                   | Description                                   |
| -------------------------------------------------------------------------- | --------------------------------------------- |
| [Schema.md](../06-Database/01-Schema.md)                                   | Tables, columns, types                        |
| [Row-Level-Security.md](../06-Database/02-Row-Level-Security.md)           | RLS policies per table                        |
| [Indexes-and-Performance.md](../06-Database/04-Indexes-and-Performance.md) | Index catalogue and query tips                |
| [Triggers-and-Functions.md](../06-Database/03-Triggers-and-Functions.md)   | `updated_at` trigger, helper functions        |
| [Seed-Data.md](../06-Database/05-Seed-Data.md)                             | CSV dataset, download script, import endpoint |

## 07  EOperations

| Document                                                                   | Description                                  |
| -------------------------------------------------------------------------- | -------------------------------------------- |
| [Deployment.md](../07-Operations/01-Deployment.md)                         | Vercel, SAM, Docker deploy guides            |
| [CI-CD.md](../07-Operations/02-CI-CD.md)                                   | GitHub Actions workflows, Dependabot, Trivy  |
| [Monitoring-and-Logging.md](../07-Operations/03-Monitoring-and-Logging.md) | CloudWatch, Vercel analytics, log structure  |
| [Security.md](../07-Operations/04-Security.md)                             | Secrets management, IAM, dependency scanning |

## 08  ETesting

| Document                                                          | Description                                   |
| ----------------------------------------------------------------- | --------------------------------------------- |
| [Testing-Strategy.md](../08-Testing/01-Testing-Strategy.md)       | Pyramid, tool stack, quality gates            |
| [Backend-Tests.md](../08-Testing/02-Backend-Tests.md)             | Mock infrastructure, fixtures, test catalogue |
| [Frontend-Tests.md](../08-Testing/03-Frontend-Tests.md)           | Jest config, test utils, component tests      |
| [Linting-and-Quality.md](../08-Testing/04-Linting-and-Quality.md) | Ruff, mypy, Bandit, ESLint, pre-commit        |

## 09  EContributing

| Document                                                                     | Description                                  |
| ---------------------------------------------------------------------------- | -------------------------------------------- |
| [Contributing-Guide.md](../09-Contributing/02-Contributing-Guide.md)         | Fork flow, branching, commits, PR process    |
| [Code-of-Conduct.md](../09-Contributing/01-Code-of-Conduct.md)               | Community standards                          |
| [Issue-and-PR-Templates.md](../09-Contributing/03-Issue-and-PR-Templates.md) | GitHub templates, CODEOWNERS, release config |
| [Security-Policy.md](../09-Contributing/04-Security-Policy.md)               | Pointer to root `SECURITY.md` (single source of truth) |

## 10  EReference

| Document                                                | Description                             |
| ------------------------------------------------------- | --------------------------------------- |
| [Glossary.md](04-Glossary.md)                           | Term definitions                        |
| [Environment-Variables.md](03-Environment-Variables.md) | Every env var across the stack          |
| [Tech-Stack.md](02-Tech-Stack.md)                       | Pinned versions and dependency purposes |
| [Doc-Index.md](01-Doc-Index.md)                         | This file                               |

---

**Total: 11 sections · 44 documents**

---

## Related Docs

| Topic                 | Link                                                    |
| --------------------- | ------------------------------------------------------- |
| Tech stack            | [Tech-Stack.md](02-Tech-Stack.md)                       |
| Environment variables | [Environment-Variables.md](03-Environment-Variables.md) |
| Glossary              | [Glossary.md](04-Glossary.md)                           |
| Project map           | [Project-Map.md](../00-Overview/03-Project-Map.md)      |
