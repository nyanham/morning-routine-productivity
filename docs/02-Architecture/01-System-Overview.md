# System Overview

High-level view of how every part of the Morning Routine & Productivity Tracker connects, the design principles behind those connections, and how a request flows from browser to database and back.

---

## Architecture diagram

```mermaid
flowchart TB
    subgraph CLIENT["CLIENT"]
        Browser["Web Browser"]
    end

    subgraph FRONTEND["FRONTEND  — Vercel"]
        Vercel["Vercel Edge Network\nSSR / SSG / CDN"]
        NextJS["Next.js 16\nApp Router\nReact 19"]
    end

    subgraph BACKEND["BACKEND  — AWS"]
        APIGW["API Gateway\nHTTP API V2"]
        Lambda["AWS Lambda\nPython 3.12"]
        Mangum["Mangum Adapter\nASGI ↁELambda"]
        FastAPI["FastAPI\nCORS · Auth · Routing\nServices"]
        CW["CloudWatch Logs"]
    end

    subgraph DATA["DATA  — Supabase"]
        Auth["Supabase Auth\nJWT · Sessions"]
        PG["PostgreSQL\nRLS Policies"]
    end

    Browser -->|"HTTPS"| Vercel
    Vercel --> NextJS
    Browser -->|"API calls"| APIGW
    APIGW --> Lambda --> Mangum --> FastAPI
    Lambda -.->|"logs"| CW
    FastAPI --> PG
    Browser -->|"Auth"| Auth
    Auth --> PG
```

---

## Layers at a glance

| Layer              | Technology                         | Responsibility                                             |
| ------------------ | ---------------------------------- | ---------------------------------------------------------- |
| **Presentation**   | Next.js, React, Tailwind, Recharts | Pages, components, client-side state                       |
| **Application**    | Custom hooks, API client           | Orchestrate UI ↁEAPI communication                         |
| **API**            | FastAPI route handlers             | Accept HTTP requests, validate input, delegate to services |
| **Service**        | Python service modules             | Business logic, data transformation                        |
| **Data**           | Supabase client (postgrest)        | Database queries with RLS enforcement                      |
| **Auth**           | Supabase Auth + JWT                | Token issuance, verification, session management           |
| **Infrastructure** | AWS SAM, Vercel, Docker            | Provisioning, deployment, networking                       |

---

## Design principles

### 1. Separation of concerns

Each layer has a single job and communicates only with adjacent layers.

```mermaid
flowchart TB
    subgraph PRESENTATION["PRESENTATION"]
        Components["Components  — UI rendering"]
        Pages["Pages  — route handling"]
        Contexts["Contexts  — global state"]
    end

    subgraph APPLICATION["APPLICATION"]
        Hooks["Hooks  — logic orchestration"]
        APIClient["API Client  — HTTP communication"]
    end

    subgraph SERVICE["SERVICE"]
        Routes["API Routes  — request handling"]
        Services["Services  — business logic"]
        Models["Models  — data validation"]
    end

    subgraph DATA["DATA"]
        Supabase["Supabase Client  — DB operations"]
        RLS["RLS Policies  — data security"]
    end

    PRESENTATION --> APPLICATION
    APPLICATION --> SERVICE
    SERVICE --> DATA
```

### 2. Security first

- **JWT authentication**  — every API request requires a valid token.
- **Row-Level Security**  — PostgreSQL enforces user data isolation at the query level.
- **Input validation**  — Pydantic models reject malformed data before it reaches the service layer.
- **CORS restriction**  — only explicitly allowed origins can call the API.

### 3. Type safety across the stack

- **TypeScript strict mode** on the frontend  — no implicit `any`.
- **Pydantic v2** on the backend  — runtime model validation.
- **Shared shapes**  — frontend `types/index.ts` mirrors backend Pydantic models.

### 4. Stateless design

- No server sessions  — JWT tokens carry all authentication state.
- RLS-enabled queries  — the database handles authorization.
- Any Lambda invocation can handle any request  — enables horizontal auto-scaling.

---

## Request lifecycle

A typical authenticated GET request flows through these steps:

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant Vercel
    participant APIGW as API Gateway
    participant Lambda
    participant Mangum
    participant FastAPI
    participant Supabase

    Browser->>Vercel: Load page (SSR/SSG)
    Vercel-->>Browser: HTML + JS bundle

    Browser->>APIGW: GET /development/api/routines\n(Authorization: Bearer <jwt>)
    APIGW->>Lambda: Lambda event (V2 payload)
    Lambda->>Mangum: handler(event, context)
    Note over Mangum: Strips stage prefix\n"/development/api/routines" ↁE"/api/routines"
    Mangum->>FastAPI: ASGI request
    FastAPI->>FastAPI: CORS middleware\nAuth middleware (verify JWT)
    FastAPI->>Supabase: Query with user token (RLS)
    Supabase-->>FastAPI: Filtered rows
    FastAPI-->>Mangum: JSON response
    Mangum-->>Lambda: API Gateway response
    Lambda-->>APIGW: HTTP response
    APIGW-->>Browser: JSON + CORS headers
```

---

## Production deployment topology

| Component     | Platform                     | Key traits                                   |
| ------------- | ---------------------------- | -------------------------------------------- |
| Frontend      | **Vercel**                   | Edge CDN, SSR/SSG, automatic preview deploys |
| Backend       | **AWS Lambda + API Gateway** | Serverless, auto-scaling, pay-per-invocation |
| Database      | **Supabase (PostgreSQL)**    | Managed, RLS, Auth, connection pooling       |
| IaC           | **AWS SAM**                  | `template.yaml` + `samconfig.toml`           |
| Observability | **CloudWatch**               | Structured logs, 14-day retention            |
| CI/CD         | **GitHub Actions**           | Lint, test, build on every PR                |

---

## Related Docs

| Topic                 | Link                                                    |
| --------------------- | ------------------------------------------------------- |
| Backend architecture  | [Backend-Architecture.md](02-Backend-Architecture.md)   |
| Frontend architecture | [Frontend-Architecture.md](03-Frontend-Architecture.md) |
| Data model            | [Data-Model.md](04-Data-Model.md)                       |
| Integration points    | [Integration-Points.md](05-Integration-Points.md)       |
