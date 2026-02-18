# Users Endpoints

All endpoints for managing user profile, settings, and goals.

Every endpoint requires authentication. See [../Auth.md](../Auth.md).

---

## GET `/api/users/me`

Get complete current user data including profile, settings, and active goals.

**Response** `200 OK`

```json
{
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "display_name": "John",
    "avatar_url": "https://...",
    "date_of_birth": "1990-01-15",
    "gender": "male",
    "timezone": "America/New_York",
    "locale": "en-US",
    "bio": "Productivity enthusiast",
    "occupation": "Software Engineer",
    "is_active": true,
    "email_verified": true,
    "onboarding_completed": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z",
    "last_login_at": "2024-01-15T08:00:00Z"
  },
  "settings": {
    "id": "uuid",
    "user_id": "uuid",
    "theme": "dark",
    "accent_color": "blue",
    "compact_mode": false,
    "email_notifications": true,
    "push_notifications": true,
    "weekly_summary_email": true,
    "reminder_time": "07:00",
    "profile_visibility": "private",
    "default_date_range": 30,
    "default_chart_type": "line",
    "time_format": "24h",
    "date_format": "YYYY-MM-DD",
    "measurement_system": "metric"
  },
  "goals": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "goal_type": "sleep_duration",
      "target_value": 8.0,
      "target_unit": "hours",
      "is_active": true,
      "reminder_enabled": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Profile

### GET `/api/users/me/profile`

Get the current user's profile.

**Response** `200 OK` — profile object (same shape as `profile` above).

---

### PATCH `/api/users/me/profile`

Update the current user's profile. All fields are optional.

**Request body**

```json
{
  "full_name": "John Updated",
  "display_name": "Johnny",
  "bio": "Updated bio",
  "occupation": "Senior Engineer",
  "timezone": "Europe/London"
}
```

**Response** `200 OK` — updated profile object.

---

## Settings

### GET `/api/users/me/settings`

Get the current user's settings.

**Response** `200 OK` — settings object (same shape as `settings` above).

---

### PATCH `/api/users/me/settings`

Update the current user's settings. All fields are optional.

**Request body**

```json
{
  "theme": "light",
  "email_notifications": false,
  "default_date_range": 7
}
```

**Response** `200 OK` — updated settings object.

---

## Goals

### GET `/api/users/me/goals`

List the user's goals.

**Query parameters**

| Parameter     | Type    | Default | Description              |
| ------------- | ------- | ------- | ------------------------ |
| `active_only` | boolean | `false` | Only return active goals |

**Response** `200 OK` — array of goal objects.

---

### POST `/api/users/me/goals`

Create a new goal.

**Request body**

```json
{
  "goal_type": "exercise_minutes",
  "target_value": 30,
  "target_unit": "minutes",
  "reminder_enabled": true
}
```

**Goal types:**

| Type                 | Unit    | Description               |
| -------------------- | ------- | ------------------------- |
| `sleep_duration`     | hours   | Target sleep hours        |
| `wake_time`          | time    | Target wake time          |
| `exercise_minutes`   | minutes | Daily exercise target     |
| `meditation_minutes` | minutes | Daily meditation target   |
| `water_intake`       | ml      | Water intake target       |
| `caffeine_limit`     | mg      | Caffeine limit            |
| `productivity_score` | 1–10    | Target productivity score |
| `focus_hours`        | hours   | Daily focus hours target  |
| `tasks_completed`    | count   | Daily task target         |
| `stress_level_max`   | 1–10    | Maximum stress level      |
| `screen_time_limit`  | minutes | Screen time limit         |

**Response** `201 Created` — created goal object.

---

### PATCH `/api/users/me/goals/{goal_id}`

Update an existing goal. All fields are optional.

**Request body**

```json
{
  "target_value": 45,
  "is_active": false
}
```

**Response** `200 OK` — updated goal object.

---

### DELETE `/api/users/me/goals/{goal_id}`

Delete a goal.

**Response** `204 No Content`

**Error** `404 Not Found` — goal does not exist.

---

## Related Docs

| Topic              | Link                                         |
| ------------------ | -------------------------------------------- |
| API overview       | [API-Overview.md](../01-API-Overview.md)     |
| Authentication     | [Auth.md](../02-Auth.md)                     |
| Error handling     | [Error-Handling.md](../03-Error-Handling.md) |
| Routines endpoints | [Routines.md](02-Routines.md)                |
