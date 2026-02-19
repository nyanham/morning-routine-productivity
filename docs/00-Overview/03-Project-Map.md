# Project Map

A high-level guide to the repository layout. Use this to orient yourself when you first open the codebase.

---

## Root

```
morning-routine-productivity/
├── frontend/          ↁENext.js application (UI, pages, components)
├── backend/           ↁEFastAPI application (API, services, models)
├── database/          ↁESQL schema and migration scripts
├── docs/              ↁEAll project documentation (you are here)
├── docker-compose.yml ↁELocal multi-service development
├── CONTRIBUTING.md    ↁEHow to contribute
├── CODE_OF_CONDUCT.md ↁECommunity standards
├── SECURITY.md        ↁEReporting vulnerabilities
├── LICENSE            ↁEMIT License
└── README.md          ↁEProject introduction and quick start
```

---

## Frontend (`frontend/`)

```
frontend/
├── src/
━E  ├── app/               ↁENext.js App Router (pages and layouts)
━E  ━E  ├── layout.tsx     ↁERoot layout
━E  ━E  ├── page.tsx       ↁELanding page
━E  ━E  ├── auth/          ↁELogin / signup pages
━E  ━E  └── dashboard/     ↁEMain dashboard pages
━E  ├── components/        ↁEReusable React components
━E  ━E  ├── charts/        ↁERecharts-based visualizations
━E  ━E  ├── layout/        ↁEHeader, sidebar, navigation
━E  ━E  └── ui/            ↁEGeneric UI primitives
━E  ├── contexts/          ↁEReact contexts (AuthContext)
━E  ├── hooks/             ↁECustom hooks (useApi, useAuth)
━E  ├── lib/               ↁEUtilities, API client, Supabase client
━E  └── types/             ↁEShared TypeScript type definitions
├── jest.config.ts         ↁETest configuration
├── tailwind.config.js     ↁETailwind CSS configuration
├── tsconfig.json          ↁETypeScript configuration
└── package.json           ↁEDependencies and scripts
```

**Key entry points:**

- [src/app/layout.tsx](../../frontend/src/app/layout.tsx)  — root layout, providers
- [src/lib/api.ts](../../frontend/src/lib/api.ts)  — API client used by all hooks
- [src/contexts/AuthContext.tsx](../../frontend/src/contexts/AuthContext.tsx)  — authentication state

---

## Backend (`backend/`)

```
backend/
├── app/
━E  ├── main.py            ↁEFastAPI app creation + Mangum handler
━E  ├── api/               ↁERoute handlers (one file per resource)
━E  ━E  ├── routines.py
━E  ━E  ├── productivity.py
━E  ━E  ├── analytics.py
━E  ━E  ├── import_data.py
━E  ━E  └── users.py
━E  ├── core/              ↁECross-cutting concerns
━E  ━E  ├── config.py      ↁESettings (env vars, Pydantic BaseSettings)
━E  ━E  ├── auth.py        ↁEJWT verification middleware
━E  ━E  └── supabase.py    ↁESupabase client factory
━E  ├── models/            ↁEPydantic request / response models
━E  ━E  ├── routine.py
━E  ━E  ├── productivity.py
━E  ━E  ├── user.py
━E  ━E  └── common.py
━E  └── services/          ↁEBusiness logic layer
━E      ├── routine_service.py
━E      ├── productivity_service.py
━E      ├── analytics_service.py
━E      └── user_service.py
├── tests/                 ↁEPytest test suite (mirrors app/ structure)
├── scripts/               ↁEUtility scripts (e.g., dataset download)
├── data/                  ↁESample CSV files for import
├── template.yaml          ↁEAWS SAM infrastructure definition
├── samconfig.toml         ↁESAM deployment configuration (per-env)
├── requirements.txt       ↁELambda production dependencies
└── pyproject.toml         ↁEPoetry project configuration
```

**Key entry points:**

- [app/main.py](../../backend/app/main.py)  — app startup, CORS, Lambda handler
- [app/core/config.py](../../backend/app/core/config.py)  — all environment variables
- [app/api/](../../backend/app/api/)  — start here to understand available endpoints

---

## Database (`database/`)

```
database/
└── schema.sql    ↁETable definitions, indexes, RLS policies, triggers
```

Tables: `user_profiles`, `morning_routines`, `productivity_entries`, `user_settings`, `user_goals`.

See [../06-Database/01-Schema.md](../06-Database/01-Schema.md) for a detailed entity-relationship diagram.

---

## Documentation (`docs/`)

```
docs/
├── 00-Overview/       ↁEVision, quickstart, this file
├── 01-Getting-Started/ ↁELocal setup, configuration, running services
├── 02-Architecture/   ↁESystem design, backend / frontend architecture
├── 03-API/            ↁEREST API reference
├── 04-Frontend/       ↁEUI structure, state, components, styling
├── 05-Backend/        ↁEServices, data access, validation
├── 06-Database/       ↁESchema, migrations, seed data
├── 07-Operations/     ↁEDeployment, monitoring, security
├── 08-Testing/        ↁETest strategy, running tests, test data
├── 09-Contributing/   ↁEContribution guide, code style, releases
├── 10-Reference/      ↁEGlossary, FAQ, changelog
└── images/            ↁEScreenshots and diagrams
```

---

## Related Docs

| Topic               | Link                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| System architecture | [System-Overview.md](../02-Architecture/01-System-Overview.md)       |
| API endpoints       | [API-Overview.md](../03-API/01-API-Overview.md)                      |
| Contributing        | [Contributing-Guide.md](../09-Contributing/02-Contributing-Guide.md) |
| Testing             | [Testing-Strategy.md](../08-Testing/01-Testing-Strategy.md)          |
| Deployment          | [Deployment.md](../07-Operations/01-Deployment.md)                   |
