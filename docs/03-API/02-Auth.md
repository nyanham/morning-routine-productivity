# Authentication

How tokens are obtained, passed, and verified across the stack.

---

## Overview

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant SBAuth as Supabase Auth
    participant Backend as FastAPI
    participant DB as PostgreSQL

    Browser->>SBAuth: signIn(email, password)
    SBAuth-->>Browser: JWT (access_token + refresh_token)

    Browser->>Backend: GET /api/routines\nAuthorization: Bearer <access_token>
    Backend->>SBAuth: auth.get_user(access_token)
    SBAuth-->>Backend: User { id, email, metadata }

    Backend->>DB: Query with user token (RLS)
    DB-->>Backend: Filtered rows
    Backend-->>Browser: JSON response
```

---

## Getting a token

Tokens are issued by **Supabase Auth**, not by the backend. The frontend handles authentication via the Supabase JS SDK:

```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});

// The access token is in the session
const token = data.session?.access_token;
```

The `AuthContext` on the frontend manages session state and provides a `getAccessToken()` helper that automatically refreshes expired tokens.

---

## Passing the token

Every API request must include the JWT in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The frontend API client (`lib/api.ts`) adds this header automatically when a token is provided.

---

## Token verification (backend)

The backend verifies tokens using a FastAPI dependency (`get_current_user` in `app/core/auth.py`):

1. Extract the Bearer token from the `Authorization` header.
2. Call `supabase.auth.get_user(token)` to validate the JWT with Supabase.
3. If valid, return a user dict with `id`, `email`, `user_metadata`, and `access_token`.
4. If invalid, raise an `HTTPException` with a user-friendly message.

### User dict structure

```python
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "user_metadata": {"full_name": "John Doe"},
    "access_token": "eyJ...",  # Passed through for RLS
}
```

The `access_token` is preserved so downstream code can create an **authenticated Supabase client** that respects Row-Level Security.

---

## RLS enforcement

Two Supabase clients exist in the backend:

| Client                   | How it's created                       | RLS      | Use case                             |
| ------------------------ | -------------------------------------- | -------- | ------------------------------------ |
| **Service client**       | `get_supabase()` with service role key | Bypassed | Token verification, admin operations |
| **Authenticated client** | `get_user_supabase()` with user's JWT  | Enforced | All user-scoped CRUD operations      |

The authenticated client calls `client.postgrest.auth(access_token)`, which sets PostgreSQL's `auth.uid()` to the current user. RLS policies then filter rows automatically.

---

## Token lifecycle

| Event                     | What happens                                                                |
| ------------------------- | --------------------------------------------------------------------------- |
| **Sign up / sign in**     | Supabase issues `access_token` (short-lived) + `refresh_token` (long-lived) |
| **Access token expires**  | Supabase SDK refreshes it automatically via `refresh_token`                 |
| **Refresh token expires** | User must sign in again                                                     |
| **Sign out**              | Tokens are invalidated; frontend clears session                             |

---

## Endpoints that skip authentication

| Endpoint      | Why                                              |
| ------------- | ------------------------------------------------ |
| `GET /`       | Root health check  Ereturns API name and version |
| `GET /health` | Health check  Ereturns `{"status": "healthy"}`   |

All other endpoints require a valid JWT.

---

## Error responses

| Condition                      | Status | Detail                                         |
| ------------------------------ | ------ | ---------------------------------------------- |
| Missing `Authorization` header | 403    | `Not authenticated`                            |
| Token expired                  | 401    | `Token expired  Eplease sign in again`         |
| Invalid / tampered token       | 401    | `Invalid token  Eplease sign in again`         |
| Other auth failure             | 401    | `Authentication failed  Eplease sign in again` |

See [Error-Handling.md](./03-Error-Handling.md) for the full error format.

---

## Related Docs

| Topic                | Link                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| API overview         | [API-Overview.md](01-API-Overview.md)                                    |
| Backend architecture | [Backend-Architecture.md](../02-Architecture/02-Backend-Architecture.md) |
| Integration points   | [Integration-Points.md](../02-Architecture/05-Integration-Points.md)     |
