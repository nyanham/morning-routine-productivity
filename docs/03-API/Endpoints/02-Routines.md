# Routines Endpoints

CRUD operations for morning routine entries.

Every endpoint requires authentication. See [../Auth.md](../Auth.md).

---

## GET `/api/routines`

List morning routines for the current user, with pagination and optional date filtering.

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
      "wake_time": "06:30:00",
      "sleep_duration_hours": 7.5,
      "exercise_minutes": 30,
      "meditation_minutes": 15,
      "breakfast_quality": "good",
      "morning_mood": 7,
      "screen_time_before_bed": 30,
      "caffeine_intake": 200,
      "water_intake_ml": 500,
      "created_at": "2024-01-15T07:00:00Z",
      "updated_at": "2024-01-15T07:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "page_size": 10,
  "total_pages": 5
}
```

---

## GET `/api/routines/{routine_id}`

Get a single morning routine by ID.

**Response** `200 OK` — routine object.

**Error** `404 Not Found`

```json
{ "detail": "Routine not found" }
```

---

## POST `/api/routines`

Create a new morning routine entry.

> Only one routine per user per date is allowed (unique constraint on `user_id + date`).

**Request body**

```json
{
  "date": "2024-01-15",
  "wake_time": "06:30",
  "sleep_duration_hours": 7.5,
  "exercise_minutes": 30,
  "meditation_minutes": 15,
  "breakfast_quality": "good",
  "morning_mood": 7,
  "screen_time_before_bed": 30,
  "caffeine_intake": 200,
  "water_intake_ml": 500
}
```

**Field validations**

| Field                    | Type    | Required | Constraints                         |
| ------------------------ | ------- | -------- | ----------------------------------- |
| `date`                   | date    | Yes      | YYYY-MM-DD                          |
| `wake_time`              | time    | Yes      | HH:MM                               |
| `sleep_duration_hours`   | float   | Yes      | 0–24                                |
| `exercise_minutes`       | integer | No       | >= 0, default 0                     |
| `meditation_minutes`     | integer | No       | >= 0, default 0                     |
| `breakfast_quality`      | string  | No       | `poor`, `fair`, `good`, `excellent` |
| `morning_mood`           | integer | Yes      | 1–10                                |
| `screen_time_before_bed` | integer | No       | >= 0, default 0                     |
| `caffeine_intake`        | integer | No       | >= 0 (mg), default 0                |
| `water_intake_ml`        | integer | No       | >= 0 (ml), default 0                |

**Response** `201 Created` — created routine object.

---

## PUT `/api/routines/{routine_id}`

Update an existing morning routine. All fields are optional.

**Request body**

```json
{
  "sleep_duration_hours": 8.0,
  "morning_mood": 8
}
```

**Response** `200 OK` — updated routine object.

**Error** `404 Not Found`

---

## DELETE `/api/routines/{routine_id}`

Delete a morning routine.

**Response** `204 No Content`

**Error** `404 Not Found`

---

## Related Docs

| Topic                  | Link                                         |
| ---------------------- | -------------------------------------------- |
| API overview           | [API-Overview.md](../01-API-Overview.md)     |
| Authentication         | [Auth.md](../02-Auth.md)                     |
| Error handling         | [Error-Handling.md](../03-Error-Handling.md) |
| Users endpoints        | [Users.md](01-Users.md)                      |
| Productivity endpoints | [Productivity.md](03-Productivity.md)        |
