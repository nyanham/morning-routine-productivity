# Tech Stack

> Pinned versions and purpose of every major dependency.

---

## Frontend

### Runtime Dependencies

| Package               | Version  | Purpose                                              |
| --------------------- | -------- | ---------------------------------------------------- |
| Next.js               | ^16.1.6  | React framework (App Router, SSR, static generation) |
| React                 | ^19.2.4  | UI library                                           |
| React DOM             | ^19.2.4  | React renderer for the browser                       |
| @supabase/supabase-js | ^2.95.3  | Supabase client SDK                                  |
| @supabase/ssr         | ^0.8.0   | Server-side Supabase helpers for Next.js             |
| Tailwind CSS          | ^4.1.18  | Utility-first CSS framework                          |
| @tailwindcss/postcss  | ^4.1.18  | PostCSS plugin for Tailwind v4                       |
| Recharts              | ^3.7.0   | Chart library built on D3                            |
| Lucide React          | ^0.563.0 | Icon set                                             |
| PapaParse             | ^5.4.1   | CSV parsing (data import)                            |
| clsx                  | ^2.1.1   | Conditional class-name helper                        |
| tailwind-merge        | ^3.4.0   | Intelligent Tailwind class merging                   |

### Dev Dependencies

| Package                     | Version | Purpose                           |
| --------------------------- | ------- | --------------------------------- |
| TypeScript                  | ^5.7.0  | Static typing                     |
| ESLint                      | ^9.17.0 | Linter                            |
| Prettier                    | ^3.8.1  | Code formatter                    |
| Jest                        | ^30.2.0 | Test runner                       |
| jest-environment-jsdom      | ^30.2.0 | Browser-like test environment     |
| @testing-library/react      | ^16.3.2 | React component testing utilities |
| @testing-library/jest-dom   | ^6.9.1  | Custom DOM matchers for Jest      |
| @testing-library/user-event | ^14.6.1 | User interaction simulation       |
| ts-jest                     | ^29.4.6 | TypeScript preprocessor for Jest  |

### Engines

| Runtime | Minimum |
| ------- | ------- |
| Node.js | 22.0.0  |
| npm     | 10.0.0  |

---

## Backend

### Runtime Dependencies

| Package           | Version  | Purpose                             |
| ----------------- | -------- | ----------------------------------- |
| FastAPI           | ^0.128.6 | Web framework                       |
| Uvicorn           | ^0.40.0  | ASGI dev server                     |
| Pydantic          | ^2.10.0  | Data validation and settings        |
| pydantic-settings | ^2.6.0   | Environment-aware settings          |
| Supabase          | ^2.27.3  | Supabase Python client              |
| Mangum            | ^0.21.0  | AWS Lambda ↁEASGI adapter           |
| Pandas            | ^2.2.3   | Data manipulation (import pipeline) |
| KaggleHub         | ^0.4.3   | Dataset download helper             |
| python-dotenv     | ^1.0.1   | `.env` file loading                 |
| python-multipart  | ^0.0.22  | Form / file upload parsing          |

### Dev Dependencies

| Package        | Version | Purpose                                |
| -------------- | ------- | -------------------------------------- |
| pytest         | ^9.0.2  | Test framework                         |
| pytest-asyncio | ^1.3.0  | Async test support                     |
| httpx          | ^0.28.0 | Async HTTP client (used by TestClient) |
| Ruff           | ^0.15.0 | Linter + formatter                     |
| mypy           | ^1.14.0 | Static type checker                    |
| Bandit         | ^1.8.0  | Security linter                        |
| pre-commit     | ^4.5.1  | Git hook manager                       |

### Runtime

| Runtime | Version |
| ------- | ------- |
| Python  | ^3.12   |

---

## Infrastructure

| Service / Tool                | Purpose                                         |
| ----------------------------- | ----------------------------------------------- |
| Supabase                      | Hosted PostgreSQL + Auth + RLS                  |
| AWS Lambda                    | Serverless compute for the backend              |
| AWS API Gateway (HTTP API v2) | Low-latency HTTP front-end for Lambda           |
| AWS SAM                       | Infrastructure-as-Code for Lambda + API Gateway |
| Vercel                        | Frontend hosting and edge CDN                   |
| GitHub Actions                | CI / CD pipelines                               |
| Dependabot                    | Automated dependency updates                    |
| Trivy                         | Container and code vulnerability scanning       |
| Docker / Docker Compose       | Local multi-service development                 |

---

## Related Docs

| Topic                 | Link                                                                           |
| --------------------- | ------------------------------------------------------------------------------ |
| System overview       | [../02-Architecture/01-System-Overview.md](../02-Architecture/01-System-Overview.md) |
| Deployment            | [../07-Operations/01-Deployment.md](../07-Operations/01-Deployment.md)               |
| Environment variables | [Environment-Variables.md](03-Environment-Variables.md)                           |
| Glossary              | [Glossary.md](04-Glossary.md)                                                     |
