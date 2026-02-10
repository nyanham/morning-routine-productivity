# API Reference

This document provides a complete reference for all REST API endpoints in the Morning Routine & Productivity Tracker.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Users](#users)
  - [Morning Routines](#morning-routines)
  - [Productivity](#productivity)
  - [Analytics](#analytics)
  - [Data Import](#data-import)

---

## 🔍 Overview

### Base URL

| Environment       | URL                                                                    |
| ----------------- | ---------------------------------------------------------------------- |
| Local Development | `http://localhost:8000`                                                |
| AWS Lambda (Dev)  | `https://<api-id>.execute-api.<region>.amazonaws.com/development`      |
| AWS Lambda (Prod) | `https://<api-id>.execute-api.<region>.amazonaws.com/production`       |
| Custom Domain     | `https://api.your-domain.com`                                          |

> **Note:** When deployed to AWS Lambda via SAM, the API Gateway adds a stage
> prefix (e.g. `/development`). The Mangum adapter strips this prefix
> automatically so FastAPI routes work unchanged.

### API Prefix

All endpoints are prefixed with `/api`:

```
http://localhost:8000/api/routines
```

### Content Type

All requests and responses use JSON:

```
Content-Type: application/json
```

---

## 🔐 Authentication

All endpoints (except health checks) require JWT authentication via the `Authorization` header.

### Request Header

```http
Authorization: Bearer <jwt_token>
```

### Getting a Token

Tokens are obtained by authenticating with Supabase Auth. The frontend handles this automatically:

```typescript
// Frontend authentication
const { data } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});

// Use the access token for API calls
const token = data.session?.access_token;
```

### Token Verification

The backend verifies tokens by calling Supabase Auth:

```python
# Backend verification (automatic via middleware)
user = supabase.auth.get_user(token)
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "detail": "Human-readable error message"
}
```

### HTTP Status Codes

| Code  | Meaning                                 |
| ----- | --------------------------------------- |
| `200` | Success                                 |
| `201` | Created                                 |
| `204` | No Content (successful delete)          |
| `400` | Bad Request (validation error)          |
| `401` | Unauthorized (invalid/missing token)    |
| `404` | Not Found                               |
| `422` | Unprocessable Entity (validation error) |
| `500` | Internal Server Error                   |

### Authentication Error Responses

The backend provides user-friendly auth error messages based on the failure type:

```json
// Token expired
{ "detail": "Token expired \u2014 please sign in again" }

// Invalid or tampered token
{ "detail": "Invalid token \u2014 please sign in again" }

// Generic auth failure
{ "detail": "Authentication failed \u2014 please sign in again" }
```

### Example Error Response

```json
{
  "detail": "Morning routine not found"
}
```

---

## 📡 Endpoints

---

## 👤 Users

### GET `/api/users/me`

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
    "show_streak_publicly": false,
    "allow_data_analytics": true,
    "default_date_range": 30,
    "default_chart_type": "line",
    "show_weekend_markers": true,
    "start_week_on": "monday",
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

### GET `/api/users/me/profile`

Get current user's profile.

**Response** `200 OK`

```json
{
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
  "updated_at": "2024-01-15T00:00:00Z"
}
```

---

### PATCH `/api/users/me/profile`

Update current user's profile.

**Request Body** (all fields optional)

```json
{
  "full_name": "John Updated",
  "display_name": "Johnny",
  "bio": "Updated bio",
  "occupation": "Senior Engineer",
  "timezone": "Europe/London"
}
```

**Response** `200 OK` - Updated profile object

---

### GET `/api/users/me/settings`

Get current user's settings.

**Response** `200 OK`

```json
{
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
}
```

---

### PATCH `/api/users/me/settings`

Update current user's settings.

**Request Body** (all fields optional)

```json
{
  "theme": "light",
  "email_notifications": false,
  "default_date_range": 7
}
```

**Response** `200 OK` - Updated settings object

---

### GET `/api/users/me/goals`

List user's goals.

**Query Parameters**

| Parameter     | Type    | Default | Description              |
| ------------- | ------- | ------- | ------------------------ |
| `active_only` | boolean | `false` | Only return active goals |

**Response** `200 OK`

```json
[
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
```

---

### POST `/api/users/me/goals`

Create a new goal.

**Request Body**

```json
{
  "goal_type": "exercise_minutes",
  "target_value": 30,
  "target_unit": "minutes",
  "reminder_enabled": true
}
```

**Goal Types:**

- `sleep_duration` - Target sleep hours
- `wake_time` - Target wake time
- `exercise_minutes` - Daily exercise target
- `meditation_minutes` - Daily meditation target
- `water_intake` - Water intake in ml
- `caffeine_limit` - Caffeine limit in mg
- `productivity_score` - Target productivity score (1-10)
- `focus_hours` - Daily focus hours target
- `tasks_completed` - Daily tasks target
- `stress_level_max` - Maximum stress level (1-10)
- `screen_time_limit` - Screen time limit in minutes

**Response** `201 Created` - Created goal object

---

### PATCH `/api/users/me/goals/{goal_id}`

Update an existing goal.

**Request Body** (all fields optional)

```json
{
  "target_value": 45,
  "is_active": false
}
```

**Response** `200 OK` - Updated goal object

---

### DELETE `/api/users/me/goals/{goal_id}`

Delete a goal.

**Response** `204 No Content`

---

## 🌅 Morning Routines

### GET `/api/routines`

List morning routines with pagination and optional date filtering.

**Query Parameters**

| Parameter    | Type    | Default | Description                   |
| ------------ | ------- | ------- | ----------------------------- |
| `page`       | integer | `1`     | Page number (1-indexed)       |
| `page_size`  | integer | `10`    | Items per page                |
| `start_date` | date    | -       | Filter from date (YYYY-MM-DD) |
| `end_date`   | date    | -       | Filter to date (YYYY-MM-DD)   |

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

### GET `/api/routines/{routine_id}`

Get a specific morning routine by ID.

**Response** `200 OK`

```json
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
```

**Error** `404 Not Found`

```json
{
  "detail": "Routine not found"
}
```

---

### POST `/api/routines`

Create a new morning routine entry.

**Request Body**

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

**Field Validations:**

| Field                    | Type    | Required | Constraints                 |
| ------------------------ | ------- | -------- | --------------------------- |
| `date`                   | date    | ✅       | YYYY-MM-DD format           |
| `wake_time`              | time    | ✅       | HH:MM format                |
| `sleep_duration_hours`   | float   | ✅       | 0-24                        |
| `exercise_minutes`       | integer | ❌       | ≥ 0, default: 0             |
| `meditation_minutes`     | integer | ❌       | ≥ 0, default: 0             |
| `breakfast_quality`      | string  | ❌       | poor\|fair\|good\|excellent |
| `morning_mood`           | integer | ✅       | 1-10                        |
| `screen_time_before_bed` | integer | ❌       | ≥ 0, default: 0             |
| `caffeine_intake`        | integer | ❌       | ≥ 0 (mg), default: 0        |
| `water_intake_ml`        | integer | ❌       | ≥ 0 (ml), default: 0        |

**Response** `201 Created` - Created routine object

**Note:** Only one routine per user per date is allowed (unique constraint).

---

### PUT `/api/routines/{routine_id}`

Update an existing morning routine.

**Request Body** (all fields optional)

```json
{
  "sleep_duration_hours": 8.0,
  "morning_mood": 8
}
```

**Response** `200 OK` - Updated routine object

**Error** `404 Not Found`

---

### DELETE `/api/routines/{routine_id}`

Delete a morning routine.

**Response** `204 No Content`

**Error** `404 Not Found`

---

## 📊 Productivity

### GET `/api/productivity`

List productivity entries with pagination and optional date filtering.

**Query Parameters**

| Parameter    | Type    | Default | Description      |
| ------------ | ------- | ------- | ---------------- |
| `page`       | integer | `1`     | Page number      |
| `page_size`  | integer | `10`    | Items per page   |
| `start_date` | date    | -       | Filter from date |
| `end_date`   | date    | -       | Filter to date   |

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

### GET `/api/productivity/{entry_id}`

Get a specific productivity entry by ID.

**Response** `200 OK` - Productivity entry object

**Error** `404 Not Found`

---

### POST `/api/productivity`

Create a new productivity entry.

**Request Body**

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

**Field Validations:**

| Field                | Type    | Required | Constraints             |
| -------------------- | ------- | -------- | ----------------------- |
| `date`               | date    | ✅       | YYYY-MM-DD format       |
| `routine_id`         | uuid    | ❌       | Link to morning routine |
| `productivity_score` | integer | ✅       | 1-10                    |
| `tasks_completed`    | integer | ❌       | ≥ 0, default: 0         |
| `tasks_planned`      | integer | ❌       | ≥ 0, default: 0         |
| `focus_hours`        | float   | ❌       | ≥ 0, default: 0         |
| `distractions_count` | integer | ❌       | ≥ 0, default: 0         |
| `energy_level`       | integer | ✅       | 1-10                    |
| `stress_level`       | integer | ✅       | 1-10                    |
| `notes`              | string  | ❌       | Free text               |

**Response** `201 Created` - Created entry object

**Note:** Only one entry per user per date is allowed.

---

### PUT `/api/productivity/{entry_id}`

Update an existing productivity entry.

**Request Body** (all fields optional)

```json
{
  "productivity_score": 9,
  "tasks_completed": 14
}
```

**Response** `200 OK` - Updated entry object

---

### DELETE `/api/productivity/{entry_id}`

Delete a productivity entry.

**Response** `204 No Content`

---

## 📈 Analytics

### GET `/api/analytics/summary`

Get analytics summary with calculated metrics.

**Query Parameters**

| Parameter    | Type | Default | Description     |
| ------------ | ---- | ------- | --------------- |
| `start_date` | date | -       | Start of period |
| `end_date`   | date | -       | End of period   |

**Response** `200 OK`

```json
{
  "avg_productivity_score": 7.5,
  "avg_sleep_duration": 7.2,
  "avg_morning_mood": 6.8,
  "avg_energy_level": 7.0,
  "avg_stress_level": 4.5,
  "total_exercise_minutes": 450,
  "total_meditation_minutes": 180,
  "total_tasks_completed": 85,
  "total_focus_hours": 42.5,
  "current_streak": 7,
  "longest_streak": 14,
  "total_entries": 30
}
```

---

### GET `/api/analytics/charts`

Get time-series data formatted for charts.

**Query Parameters**

| Parameter    | Type | Default | Description     |
| ------------ | ---- | ------- | --------------- |
| `start_date` | date | -       | Start of period |
| `end_date`   | date | -       | End of period   |

**Response** `200 OK`

```json
[
  {
    "date": "2024-01-15",
    "productivity_score": 8,
    "energy_level": 7,
    "morning_mood": 7,
    "sleep_duration_hours": 7.5,
    "stress_level": 4,
    "exercise_minutes": 30,
    "meditation_minutes": 15
  },
  {
    "date": "2024-01-16",
    "productivity_score": 7,
    "energy_level": 6,
    "morning_mood": 6,
    "sleep_duration_hours": 6.5,
    "stress_level": 5,
    "exercise_minutes": 0,
    "meditation_minutes": 10
  }
]
```

---

## 📥 Data Import

### POST `/api/import/csv`

Import data from a CSV file.

**Request** `multipart/form-data`

| Field  | Type | Required | Description        |
| ------ | ---- | -------- | ------------------ |
| `file` | file | ✅       | CSV file to import |

**Expected CSV Columns for Routines:**

- date, wake_time, sleep_duration_hours, exercise_minutes, meditation_minutes, breakfast_quality, morning_mood, screen_time_before_bed, caffeine_intake, water_intake_ml

**Expected CSV Columns for Productivity:**

- date, productivity_score, tasks_completed, tasks_planned, focus_hours, distractions_count, energy_level, stress_level, notes

**Response** `200 OK`

```json
{
  "imported_count": 25,
  "failed_count": 2,
  "errors": [
    "Row 5: Invalid date format",
    "Row 12: morning_mood must be between 1 and 10"
  ]
}
```

**Example CSV (Routines):**

```csv
date,wake_time,sleep_duration_hours,exercise_minutes,meditation_minutes,breakfast_quality,morning_mood
2024-01-15,06:30,7.5,30,15,good,7
2024-01-16,07:00,8.0,45,20,excellent,8
```

**Example CSV (Productivity):**

```csv
date,productivity_score,tasks_completed,tasks_planned,focus_hours,distractions_count,energy_level,stress_level,notes
2024-01-15,8,12,15,6.5,5,7,4,Great day!
2024-01-16,7,10,12,5.0,8,6,5,Many meetings
```

---

## 📚 Code Examples

### JavaScript/TypeScript

```typescript
// Using fetch
const response = await fetch("http://localhost:8000/api/routines", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const data = await response.json();
```

### Python

```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'http://localhost:8000/api/routines',
    headers=headers
)

data = response.json()
```

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

---

## 🔗 Related Documentation

- [System Flows](./SYSTEM_FLOWS.md) - See how API calls fit into user workflows
- [Database Schema](./DATABASE.md) - Understand the data models
- [Architecture](./ARCHITECTURE.md) - System design overview
