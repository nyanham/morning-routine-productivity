# Productivity Endpoints

CRUD operations for daily productivity entries.

Every endpoint requires authentication. See [../Auth.md](../Auth.md).

---

## GET `/api/productivity`

List productivity entries for the current user, with pagination and optional date filtering.

**Query parameters**

| Parameter    | Type    | Default | Description                   |
| ------------ | ------- | ------- | ----------------------------- |
| `page`       | integer | `1`     | Page number (1-indexed)       |
| `page_size`  | integer | `10`    | Items per page                |
| `start_date` | date    | —       | Filter from date (YYYY-MM-DD) |
| `end_date`   | date    | —       | Filter to date (YYYY-MM-DD)   |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "date": "2024-01-15",
      "routine_id": "uuid",
      "productivity_score": 8,
      "tasks_completed": 12,
      "tasks_planned": 15,
      "focus_hours": 6.5,
      "distractions_count": 5,
      "energy_level": 7,
      "stress_level": 4,
      "notes": "Great productive day!",
      "created_at": "2024-01-15T18:00:00Z",
      "updated_at": "2024-01-15T18:00:00Z"
    }
  ],
  "total": 30,
  "page": 1,
  "page_size": 10,
  "total_pages": 3
}
```

---

## GET `/api/productivity/{entry_id}`

Get a single productivity entry by ID.

**Response** `200 OK` — productivity entry object.

**Error** `404 Not Found`

```json
{ "detail": "Productivity entry not found" }
```

---

## POST `/api/productivity`

Create a new productivity entry.

> Only one entry per user per date is allowed (unique constraint on `user_id + date`).

**Request body**

```json
{
  "date": "2024-01-15",
  "routine_id": "uuid",
  "productivity_score": 8,
  "tasks_completed": 12,
  "tasks_planned": 15,
  "focus_hours": 6.5,
  "distractions_count": 5,
  "energy_level": 7,
  "stress_level": 4,
  "notes": "Great productive day!"
}
```

**Field validations**

| Field                | Type    | Required | Constraints           |
| -------------------- | ------- | -------- | --------------------- |
| `date`               | date    | Yes      | YYYY-MM-DD            |
| `routine_id`         | uuid    | No       | FK to morning routine |
| `productivity_score` | integer | Yes      | 1–10                  |
| `tasks_completed`    | integer | No       | >= 0, default 0       |
| `tasks_planned`      | integer | No       | >= 0, default 0       |
| `focus_hours`        | float   | No       | >= 0, default 0       |
| `distractions_count` | integer | No       | >= 0, default 0       |
| `energy_level`       | integer | Yes      | 1–10                  |
| `stress_level`       | integer | Yes      | 1–10                  |
| `notes`              | string  | No       | Free text             |

**Response** `201 Created` — created entry object.

---

## PUT `/api/productivity/{entry_id}`

Update an existing productivity entry. All fields are optional.

**Request body**

```json
{
  "productivity_score": 9,
  "tasks_completed": 14
}
```

**Response** `200 OK` — updated entry object.

**Error** `404 Not Found`

---

## DELETE `/api/productivity/{entry_id}`

Delete a productivity entry.

**Response** `204 No Content`

**Error** `404 Not Found`

---

## Related Docs

| Topic               | Link                                         |
| ------------------- | -------------------------------------------- |
| API overview        | [API-Overview.md](../01-API-Overview.md)     |
| Authentication      | [Auth.md](../02-Auth.md)                     |
| Error handling      | [Error-Handling.md](../03-Error-Handling.md) |
| Analytics endpoints | [Analytics.md](04-Analytics.md)              |
| Routines endpoints  | [Routines.md](02-Routines.md)                |
