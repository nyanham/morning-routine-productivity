# Glossary

> Quick definitions for terms used throughout the documentation.

---

| Term                 | Definition                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Anon Key**         | Supabase's public API key, safe to expose on the client. Row-Level Security policies restrict what it can access.       |
| **App Router**       | Next.js routing model (v13+) that uses a file-system hierarchy under `app/` with layouts, pages, and server components. |
| **Bandit**           | A Python static-analysis tool that finds common security issues (hard-coded secrets, insecure hashes, etc.).            |
| **CORS**             | Cross-Origin Resource Sharing  EHTTP headers that control which browser origins may call the API.                       |
| **Dependabot**       | GitHub service that opens PRs automatically when dependency updates or security patches are available.                  |
| **FastAPI**          | A modern, high-performance Python web framework for building APIs, based on Starlette and Pydantic.                     |
| **JWT**              | JSON Web Token  Ea compact, URL-safe token format used for authentication. Supabase issues JWTs on login.               |
| **Mangum**           | An adapter that translates AWS API Gateway events into ASGI requests so FastAPI can run on Lambda.                      |
| **Middleware**       | Code that wraps every request/response cycle  Eused here for CORS headers and exception handling.                       |
| **mypy**             | A static type checker for Python that enforces type annotations at analysis time.                                       |
| **Next.js**          | A React-based framework for server-rendered and statically-generated web applications.                                  |
| **Pydantic**         | A Python library for data validation and settings management using type annotations.                                    |
| **RLS**              | Row-Level Security  EPostgreSQL policies that restrict which rows a given user can read or write.                       |
| **Recharts**         | A React charting library built on D3 used here for analytics visualisations.                                            |
| **Ruff**             | An extremely fast Python linter and formatter written in Rust.                                                          |
| **SAM**              | AWS Serverless Application Model  Ean IaC framework that extends CloudFormation for Lambda, API Gateway, etc.           |
| **Service Role Key** | A privileged Supabase key that bypasses RLS. Must be kept server-side only.                                             |
| **Supabase**         | An open-source Firebase alternative built on PostgreSQL, providing auth, database, storage, and real-time features.     |
| **Tailwind CSS**     | A utility-first CSS framework that provides low-level classes for building custom designs.                              |
| **TestClient**       | FastAPI/Starlette's synchronous HTTP client used in tests to call endpoints without a running server.                   |
| **Trivy**            | An open-source vulnerability scanner for containers, filesystems, and code dependencies used in CI.                     |
| **Uvicorn**          | A lightning-fast ASGI server used to run FastAPI locally during development.                                            |

---

## Related Docs

| Topic                 | Link                                                 |
| --------------------- | ---------------------------------------------------- |
| Tech stack            | [Tech-Stack.md](02-Tech-Stack.md)                       |
| Environment variables | [Environment-Variables.md](03-Environment-Variables.md) |
| Documentation index   | [Doc-Index.md](01-Doc-Index.md)                         |
