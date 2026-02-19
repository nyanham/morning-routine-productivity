# Error Handling

How the API reports errors, the response format, and the status codes used.

---

## Error response format

All errors use a consistent JSON structure:

```json
{
  "detail": "Human-readable error message"
}
```

For validation errors (422), FastAPI returns a more detailed body:

```json
{
  "detail": [
    {
      "loc": ["body", "morning_mood"],
      "msg": "ensure this value is less than or equal to 10",
      "type": "value_error.number.not_le"
    }
  ]
}
```

---

## HTTP status codes

| Code  | Meaning               | When it's used                                     |
| ----- | --------------------- | -------------------------------------------------- |
| `200` | OK                    | Successful read or update                          |
| `201` | Created               | Successful create                                  |
| `204` | No Content            | Successful delete                                  |
| `400` | Bad Request           | Invalid CSV, malformed input                       |
| `401` | Unauthorized          | Missing, expired, or invalid JWT                   |
| `403` | Forbidden             | Missing `Authorization` header entirely            |
| `404` | Not Found             | Resource does not exist or belongs to another user |
| `422` | Unprocessable Entity  | Pydantic validation failure                        |
| `500` | Internal Server Error | Unhandled exception (logged to CloudWatch)         |

---

## Authentication errors

The backend maps common JWT failure modes to user-friendly messages:

| Condition                    | Status | Detail                                         |
| ---------------------------- | ------ | ---------------------------------------------- |
| Token expired                | 401    | `Token expired  — please sign in again`         |
| Invalid signature / tampered | 401    | `Invalid token  — please sign in again`         |
| Other auth failure           | 401    | `Authentication failed  — please sign in again` |
| No `Authorization` header    | 403    | `Not authenticated`                            |

---

## Validation errors

Pydantic validates all request bodies. If a field fails validation, the API returns a 422 with the field location and a human-readable message:

```json
{
  "detail": [
    {
      "loc": ["body", "sleep_duration_hours"],
      "msg": "ensure this value is less than or equal to 24",
      "type": "value_error.number.not_le"
    },
    {
      "loc": ["body", "date"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Not-found errors

When a resource is not found (or belongs to a different user and is filtered by RLS), the API returns:

```json
{
  "detail": "Routine not found"
}
```

The message varies by resource type: `"Routine not found"`, `"Productivity entry not found"`, `"Profile not found"`, etc.

---

## Global exception handler

Any unhandled exception is caught by a global handler in `app/main.py`. It:

1. Logs the full traceback to CloudWatch.
2. Returns a clean JSON response (never an HTML error page):

```json
{
  "detail": "Internal server error"
}
```

---

## Frontend error handling

The API client (`lib/api.ts`) defines an `ApiError` class and a helper for safe extraction:

```typescript
export class ApiError extends Error {
  status: number;
  detail: string;
}

// Safe extraction  — works across chunk boundaries
export function getApiErrorMessage(err: unknown, fallback: string): string;
```

Usage in hooks:

```typescript
try {
  const data = await api.routines.list(token);
} catch (err) {
  setError(getApiErrorMessage(err, "Failed to load routines"));
}
```

> The helper uses a `name`-based check instead of `instanceof` because Next.js Turbopack/webpack can duplicate class identities across chunk boundaries.

---

## Related Docs

| Topic                | Link                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| Authentication       | [Auth.md](02-Auth.md)                                                    |
| API overview         | [API-Overview.md](01-API-Overview.md)                                    |
| Backend architecture | [Backend-Architecture.md](../02-Architecture/02-Backend-Architecture.md) |
