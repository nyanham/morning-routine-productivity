# Architecture Documentation

This document describes the system architecture, technology choices, and design decisions for the Morning Routine & Productivity Tracker.

---

## 🏗️ System Architecture Overview

```mermaid
flowchart TB
    subgraph CLIENT["CLIENT LAYER"]
        direction TB
        Browser["Web Browser<br/>(Desktop/Tablet)"]
        subgraph Assets["Application Assets"]
            Static["Static Assets"]
            JS["JavaScript Bundle"]
            React["React Application<br/>(Next.js App Router)"]
        end
    end

    subgraph SERVICES["SERVICE LAYER"]
        direction TB
        subgraph Backend["Backend Layer"]
            FastAPI["FastAPI App<br/>API Router<br/>Services<br/>Auth Middleware"]
        end
        subgraph Auth["Auth Layer"]
            SupaAuth["Supabase Auth<br/>JWT Token Generation<br/>Session Management"]
        end
        subgraph Hosting["Frontend Hosting"]
            Vercel["Vercel Edge Network<br/>SSR/SSG<br/>CDN Cache<br/>Edge Functions"]
        end
    end

    subgraph DATABASE["DATABASE LAYER"]
        direction TB
        subgraph Supabase["Supabase PostgreSQL"]
            Tables["user_profiles | morning_routines | productivity_entries<br/>user_settings | user_goals"]
            RLS["Row-Level Security (RLS) Policies"]
        end
    end

    Browser --> |"HTTP/HTTPS<br/>(API Calls)"| FastAPI
    Browser --> |"WebSocket<br/>(Real-time)"| SupaAuth
    Browser --> |"HTTPS<br/>(Static)"| Vercel

    FastAPI --> Supabase
    SupaAuth --> Supabase
```

---

## 🛠️ Technology Stack

### Frontend

| Technology       | Version | Purpose                                  |
| ---------------- | ------- | ---------------------------------------- |
| **Next.js**      | 16.x    | React framework with App Router, SSR/SSG |
| **React**        | 19.x    | UI component library                     |
| **TypeScript**   | 5.7.x   | Type safety and developer experience     |
| **Tailwind CSS** | 4.x     | Utility-first CSS framework              |
| **Recharts**     | 2.x     | Data visualization library               |
| **Lucide React** | 0.5.x   | Icon library                             |

### Backend

| Technology          | Version | Purpose                           |
| ------------------- | ------- | --------------------------------- |
| **FastAPI**         | 0.115.x | High-performance API framework    |
| **Python**          | 3.11+   | Programming language              |
| **Pydantic**        | 2.x     | Data validation and serialization |
| **Supabase Python** | 2.x     | Supabase client library           |
| **Pandas**          | 2.x     | CSV parsing for data import       |

### Database & Auth

| Technology             | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| **Supabase**           | Backend-as-a-Service platform             |
| **PostgreSQL**         | Relational database (managed by Supabase) |
| **Row-Level Security** | Data isolation per user                   |
| **JWT Tokens**         | Stateless authentication                  |

### DevOps & Tooling

| Tool               | Purpose                       |
| ------------------ | ----------------------------- |
| **GitHub Actions** | CI/CD pipelines               |
| **Vercel**         | Frontend deployment           |
| **AWS Lambda**     | Backend deployment (via SAM + Mangum)     |
| **Docker**         | Local development             |
| **Pre-commit**     | Code quality hooks            |
| **Ruff**           | Python linting and formatting |
| **ESLint**         | TypeScript/JavaScript linting |
| **Prettier**       | Code formatting               |
| **Jest**           | Frontend testing              |
| **Pytest**         | Backend testing               |

---

## 📐 Design Principles

### 1. Separation of Concerns

The application follows a clean separation between layers:

```mermaid
flowchart TB
    subgraph PRESENTATION["PRESENTATION LAYER"]
        Components["Components - UI rendering"]
        Pages["Pages - Route handling"]
        Contexts["Contexts - Global state"]
    end

    subgraph APPLICATION["APPLICATION LAYER"]
        Hooks["Hooks - Business logic orchestration"]
        APIClient["API Client - HTTP communication"]
    end

    subgraph SERVICE["SERVICE LAYER"]
        APIRoutes["API Routes - Request handling"]
        Services["Services - Business logic"]
        Models["Models - Data validation"]
    end

    subgraph DATA["DATA LAYER"]
        SupabaseClient["Supabase Client - Database operations"]
        RLS["RLS Policies - Data security"]
    end

    PRESENTATION --> APPLICATION
    APPLICATION --> SERVICE
    SERVICE --> DATA
```

### 2. Security First

- **JWT Authentication**: All API requests require valid tokens
- **Row-Level Security**: Database enforces user data isolation
- **Input Validation**: Pydantic models validate all inputs
- **CORS Configuration**: Restricted cross-origin requests

### 3. Type Safety

- **TypeScript**: Frontend uses strict typing
- **Pydantic**: Backend uses model validation
- **Shared Types**: Consistent data shapes across stack

### 4. Stateless Design

- **No Server Sessions**: JWT tokens carry all auth info
- **RLS-Enabled Queries**: Database handles authorization
- **Scalable Backend**: Stateless API supports horizontal scaling

---

## 📁 Directory Structure

### Frontend (`/frontend`)

```
frontend/
+-- src/
|   +-- app/                    # Next.js App Router
|   |   +-- layout.tsx          # Root layout with providers
|   |   +-- page.tsx            # Landing page
|   |   +-- auth/               # Authentication pages
|   |   |   +-- login/          # Login page
|   |   |   +-- signup/         # Signup page
|   |   +-- dashboard/          # Protected dashboard
|   |       +-- page.tsx        # Dashboard home
|   |       +-- entry/          # Manual data entry
|   |       +-- import/         # CSV import
|   |       +-- settings/       # User settings
|   +-- components/             # Reusable components
|   |   +-- charts/             # Recharts visualizations
|   |   +-- layout/             # Layout components
|   |   +-- ui/                 # UI primitives
|   +-- contexts/               # React contexts
|   |   +-- AuthContext.tsx     # Authentication state
|   +-- hooks/                  # Custom React hooks
|   |   +-- useApi.ts           # API interaction hooks
|   +-- lib/                    # Utilities
|   |   +-- api.ts              # API client
|   |   +-- supabase/           # Supabase clients
|   |   +-- utils.ts            # Helper functions
|   +-- types/                  # TypeScript definitions
|   |   +-- index.ts            # All type exports
|   +-- __tests__/              # Jest test files
+-- public/                     # Static assets
+-- next.config.ts              # Next.js configuration
+-- tailwind.config.ts          # Tailwind configuration
+-- tsconfig.json               # TypeScript configuration
+-- jest.config.ts              # Jest configuration
```

### Backend (`/backend`)

```
backend/
+-- app/
|   +-- __init__.py
|   +-- main.py                 # FastAPI application entry
|   +-- api/                    # API route modules
|   |   +-- __init__.py         # Router aggregation
|   |   +-- users.py            # User endpoints
|   |   +-- routines.py         # Routine endpoints
|   |   +-- productivity.py     # Productivity endpoints
|   |   +-- analytics.py        # Analytics endpoints
|   |   +-- import_data.py      # CSV import endpoint
|   +-- core/                   # Core utilities
|   |   +-- __init__.py
|   |   +-- config.py           # Configuration settings
|   |   +-- auth.py             # Authentication logic
|   |   +-- supabase.py         # Supabase client setup
|   +-- models/                 # Pydantic models
|   |   +-- __init__.py         # All model exports
|   |   +-- routine.py          # Morning routine models
|   |   +-- productivity.py     # Productivity models
|   |   +-- user.py             # User-related models
|   |   +-- analytics.py        # Analytics models
|   |   +-- common.py           # Shared models
|   +-- services/               # Business logic
|       +-- __init__.py
|       +-- routine_service.py
|       +-- productivity_service.py
|       +-- user_service.py
|       +-- analytics_service.py
+-- tests/                      # Pytest test files
+-- pyproject.toml              # Python dependencies
+-- poetry.lock                 # Locked dependencies
```

---

## 🔐 Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant SupaAuth as Supabase Auth
    participant Backend as FastAPI Backend
    participant DB as PostgreSQL

    Client->>SupaAuth: 1. Login Request<br/>(email, password)
    SupaAuth-->>Client: 2. JWT Token

    Client->>Backend: 3. API Request<br/>(Authorization: Bearer JWT)
    Backend->>SupaAuth: 4. Verify Token
    SupaAuth-->>Backend: 5. User Info

    Backend->>DB: 6. Query with User Token
    Note over DB: RLS enforces<br/>user_id match
    DB-->>Backend: 7. Filtered Data
    Backend-->>Client: 8. Response
```

### Row-Level Security (RLS)

Every table has RLS policies ensuring users can only access their own data:

```sql
-- Example: Users can only view their own routines
CREATE POLICY "Users can view own routines"
    ON morning_routines FOR SELECT
    USING (auth.uid() = user_id);
```

---

## 🔄 Data Flow Architecture

### Read Path (GET request)

```mermaid
flowchart LR
    subgraph Frontend
        Hook["React Hook"]
    end

    subgraph Backend
        Handler["FastAPI Handler"]
        Service["Service Layer"]
        SupaClient["Supabase Client"]
    end

    subgraph Database
        PG["PostgreSQL<br/>(with RLS)"]
    end

    Hook -->|"GET /api/routines"| Handler
    Handler --> Service
    Service --> SupaClient
    SupaClient --> PG
    PG -->|"Filtered Data"| SupaClient
    SupaClient --> Service
    Service --> Handler
    Handler -->|"JSON Response"| Hook
```

### Write Path (POST request)

```mermaid
flowchart LR
    subgraph Frontend
        Form["React Form"]
    end

    subgraph Backend
        Handler["FastAPI Handler"]
        Pydantic["Pydantic Validation"]
        Service["Service Layer"]
        SupaClient["Supabase INSERT"]
    end

    Form -->|"POST /api/routines<br/>{ routine data }"| Handler
    Handler --> Pydantic
    Pydantic -->|"Validated"| Service
    Service --> SupaClient
    SupaClient -->|"Created Row"| Service
    Service --> Handler
    Handler -->|"201 Created"| Form
```

---

## 🚀 Deployment Architecture

### Production Environment

```mermaid
flowchart TB
    Internet["INTERNET"]

    subgraph Frontend["Frontend (Vercel)"]
        VercelEdge["Vercel Edge<br/>CDN Cache<br/>SSR/SSG<br/>Edge Functions"]
    end

    subgraph Backend["Backend (AWS)"]
        APIGateway["AWS Gateway / Lambda<br/>Auto-scaling<br/>Pay-per-use"]
    end

    subgraph Database["Database (Supabase)"]
        Supabase["Supabase Managed<br/>PostgreSQL<br/>Auth<br/>Storage"]
    end

    Internet --> VercelEdge
    Internet --> APIGateway
    APIGateway --> Supabase
    VercelEdge -.->|"API Calls"| APIGateway
```

### Local Development

```mermaid
flowchart TB
    subgraph LocalMachine["LOCAL MACHINE"]
        subgraph DevServers["Development Servers"]
            NextJS["Next.js Dev Server<br/>localhost:3000"]
            FastAPIDev["FastAPI Dev Server<br/>localhost:8000"]
        end

        NextJS <-->|"API Proxy"| FastAPIDev
    end

    subgraph Cloud["CLOUD"]
        SupabaseCloud["Supabase Cloud<br/>(or local Supabase)"]
    end

    FastAPIDev --> SupabaseCloud
```

---

## 📈 Scalability Considerations

### Frontend Scalability

- **CDN Distribution**: Static assets cached globally via Vercel Edge
- **Server Components**: Reduce client-side JavaScript
- **Code Splitting**: Automatic chunking by Next.js

### Backend Scalability

- **Stateless Design**: Any instance can handle any request
- **Connection Pooling**: Supabase manages database connections
- **Horizontal Scaling**: Add more Lambda/container instances

### Database Scalability

- **Indexes**: Optimized queries on common access patterns
- **Partitioning**: Can partition by date for large datasets
- **Read Replicas**: Supabase supports read replicas for scale

---

## ⚠️ Error Handling Strategy

### Frontend Errors

```typescript
// Structured error handling in hooks
try {
  const data = await api.routines.list(token);
  setData(data);
} catch (err) {
  if (err instanceof ApiError) {
    setError(err.detail); // Show user-friendly message
  } else {
    setError("An unexpected error occurred");
  }
}
```

### Backend Errors

```python
# HTTP exceptions with proper status codes
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Routine not found",
)
```

### Database Errors

- Caught at service layer
- Transformed into appropriate HTTP responses
- Logged for debugging (without sensitive data)

---

## 📚 Related Documentation

- [API Reference](./API.md) - Detailed API documentation
- [System Flows](./SYSTEM_FLOWS.md) - User action flow diagrams
- [Database Schema](./DATABASE.md) - Database design details
- [Frontend Guide](./FRONTEND.md) - Frontend architecture details
- [Development Guide](./DEVELOPMENT.md) - Setup and contribution
