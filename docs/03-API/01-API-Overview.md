# API Overview

The backend exposes a REST API built with FastAPI. All endpoints are prefixed with `/api` and return JSON.

---

## Base URL

| Environment       | URL                                                               |
| ----------------- | ----------------------------------------------------------------- |
| Local development | `http://localhost:8000`                                           |
| AWS Lambda (dev)  | `https://<api-id>.execute-api.<region>.amazonaws.com/development` |
| AWS Lambda (prod) | `https://<api-id>.execute-api.<region>.amazonaws.com/production`  |

> When deployed to Lambda, the API Gateway adds a stage prefix (e.g. `/development`). The Mangum adapter strips it automatically, so routes work unchanged.

---

## Interactive docs

When the backend is running locally (or in a non-production environment), interactive API docs are available:

| Tool       | URL                                                        |
| ---------- | ---------------------------------------------------------- |
| Swagger UI | [http://localhost:8000/docs](http://localhost:8000/docs)   |
| ReDoc      | [http://localhost:8000/redoc](http://localhost:8000/redoc) |

These are disabled in production to reduce attack surface.

---

## Source of truth

The API contract is defined by the FastAPI code and its auto-generated OpenAPI schema. If this documentation and the generated docs diverge, **the OpenAPI schema wins**.

---

## Content type

All requests and responses use:

```
Content-Type: application/json
```

The only exception is the CSV import endpoint, which accepts `multipart/form-data`.

---

## Authentication

Every endpoint except `/` (root) and `/health` requires a JWT in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

See [Auth.md](./02-Auth.md) for details on how tokens are obtained and verified.

---

## Endpoint map

| Method           | Endpoint                   | Description                                 | Details                                           |
| ---------------- | -------------------------- | ------------------------------------------- | ------------------------------------------------- |
| **Users**        |                            |                                             |                                                   |
| `GET`            | `/api/users/me`            | Full user data (profile + settings + goals) | [Users.md](./Endpoints/01-Users.md)               |
| `GET`            | `/api/users/me/profile`    | User profile                                | [Users.md](./Endpoints/01-Users.md)               |
| `PATCH`          | `/api/users/me/profile`    | Update profile                              | [Users.md](./Endpoints/01-Users.md)               |
| `GET`            | `/api/users/me/settings`   | User settings                               | [Users.md](./Endpoints/01-Users.md)               |
| `PATCH`          | `/api/users/me/settings`   | Update settings                             | [Users.md](./Endpoints/01-Users.md)               |
| `GET`            | `/api/users/me/goals`      | List goals                                  | [Users.md](./Endpoints/01-Users.md)               |
| `POST`           | `/api/users/me/goals`      | Create goal                                 | [Users.md](./Endpoints/01-Users.md)               |
| `PATCH`          | `/api/users/me/goals/{id}` | Update goal                                 | [Users.md](./Endpoints/01-Users.md)               |
| `DELETE`         | `/api/users/me/goals/{id}` | Delete goal                                 | [Users.md](./Endpoints/01-Users.md)               |
| **Routines**     |                            |                                             |                                                   |
| `GET`            | `/api/routines`            | List routines (paginated)                   | [Routines.md](./Endpoints/02-Routines.md)         |
| `GET`            | `/api/routines/{id}`       | Get routine                                 | [Routines.md](./Endpoints/02-Routines.md)         |
| `POST`           | `/api/routines`            | Create routine                              | [Routines.md](./Endpoints/02-Routines.md)         |
| `PUT`            | `/api/routines/{id}`       | Update routine                              | [Routines.md](./Endpoints/02-Routines.md)         |
| `DELETE`         | `/api/routines/{id}`       | Delete routine                              | [Routines.md](./Endpoints/02-Routines.md)         |
| **Productivity** |                            |                                             |                                                   |
| `GET`            | `/api/productivity`        | List entries (paginated)                    | [Productivity.md](./Endpoints/03-Productivity.md) |
| `GET`            | `/api/productivity/{id}`   | Get entry                                   | [Productivity.md](./Endpoints/03-Productivity.md) |
| `POST`           | `/api/productivity`        | Create entry                                | [Productivity.md](./Endpoints/03-Productivity.md) |
| `PUT`            | `/api/productivity/{id}`   | Update entry                                | [Productivity.md](./Endpoints/03-Productivity.md) |
| `DELETE`         | `/api/productivity/{id}`   | Delete entry                                | [Productivity.md](./Endpoints/03-Productivity.md) |
| **Analytics**    |                            |                                             |                                                   |
| `GET`            | `/api/analytics/summary`   | Aggregated metrics                          | [Analytics.md](./Endpoints/04-Analytics.md)       |
| `GET`            | `/api/analytics/charts`    | Time-series chart data                      | [Analytics.md](./Endpoints/04-Analytics.md)       |
| **Import**       |                            |                                             |                                                   |
| `POST`           | `/api/import/csv`          | Bulk CSV import                             | [Import.md](./Endpoints/05-Import.md)             |
| **Health**       |                            |                                             |                                                   |
| `GET`            | `/`                        | Root / health check                         | Returns API name and version                      |
| `GET`            | `/health`                  | Health check                                | Returns `{"status": "healthy"}`                   |

---

## Pagination

List endpoints return a paginated response:

```json
{
  "data": [ ... ],
  "total": 45,
  "page": 1,
  "page_size": 10,
  "total_pages": 5
}
```

Common query parameters:

| Parameter    | Type    | Default | Description                   |
| ------------ | ------- | ------- | ----------------------------- |
| `page`       | integer | `1`     | Page number (1-indexed)       |
| `page_size`  | integer | `10`    | Items per page                |
| `start_date` | date    |  —       | Filter from date (YYYY-MM-DD) |
| `end_date`   | date    |  —       | Filter to date (YYYY-MM-DD)   |

---

## Quick examples

### cURL

```bash
# List routines
curl -X GET "http://localhost:8000/api/routines?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create routine
curl -X POST "http://localhost:8000/api/routines" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15", "wake_time": "06:30", "sleep_duration_hours": 7.5, "morning_mood": 7}'
```

### TypeScript (frontend API client)

```typescript
import { api } from "@/lib/api";

const routines = await api.routines.list(token, { page: 1, pageSize: 10 });
const entry = await api.productivity.create(token, {
  date: "2024-01-15",
  productivity_score: 8,
  energy_level: 7,
  stress_level: 4,
});
```

### Python

```python
import requests

headers = {"Authorization": f"Bearer {token}"}
response = requests.get("http://localhost:8000/api/routines", headers=headers)
data = response.json()
```

---

## Related Docs

| Topic                | Link                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| Authentication       | [Auth.md](02-Auth.md)                                                    |
| Error handling       | [Error-Handling.md](03-Error-Handling.md)                                |
| Backend architecture | [Backend-Architecture.md](../02-Architecture/02-Backend-Architecture.md) |
