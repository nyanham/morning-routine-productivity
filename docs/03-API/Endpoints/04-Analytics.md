# Analytics Endpoints

Read-only endpoints that return aggregated metrics and time-series data for charts.

Every endpoint requires authentication. See [../Auth.md](../Auth.md).

---

## GET `/api/analytics/summary`

Get aggregated analytics for the current user over a date range.

**Query parameters**

| Parameter    | Type | Default | Description                  |
| ------------ | ---- | ------- | ---------------------------- |
| `start_date` | date | —       | Start of period (YYYY-MM-DD) |
| `end_date`   | date | —       | End of period (YYYY-MM-DD)   |

If dates are omitted, the API returns metrics across all available data.

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

**Fields**

| Field                      | Type    | Description                     |
| -------------------------- | ------- | ------------------------------- |
| `avg_productivity_score`   | float   | Mean productivity score (1–10)  |
| `avg_sleep_duration`       | float   | Mean sleep hours                |
| `avg_morning_mood`         | float   | Mean morning mood (1–10)        |
| `avg_energy_level`         | float   | Mean energy level (1–10)        |
| `avg_stress_level`         | float   | Mean stress level (1–10)        |
| `total_exercise_minutes`   | integer | Sum of exercise minutes         |
| `total_meditation_minutes` | integer | Sum of meditation minutes       |
| `total_tasks_completed`    | integer | Sum of completed tasks          |
| `total_focus_hours`        | float   | Sum of focus hours              |
| `current_streak`           | integer | Consecutive days with entries   |
| `longest_streak`           | integer | Best consecutive-day streak     |
| `total_entries`            | integer | Number of entries in the period |

---

## GET `/api/analytics/charts`

Get time-series data formatted for chart rendering (used by Recharts on the frontend).

**Query parameters**

| Parameter    | Type | Default | Description                  |
| ------------ | ---- | ------- | ---------------------------- |
| `start_date` | date | —       | Start of period (YYYY-MM-DD) |
| `end_date`   | date | —       | End of period (YYYY-MM-DD)   |

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

Each object in the array represents one day and merges data from both the `morning_routines` and `productivity_entries` tables. The frontend passes this array directly to Recharts components.

---

## Related Docs

| Topic                  | Link                                         |
| ---------------------- | -------------------------------------------- |
| API overview           | [API-Overview.md](../01-API-Overview.md)     |
| Authentication         | [Auth.md](../02-Auth.md)                     |
| Error handling         | [Error-Handling.md](../03-Error-Handling.md) |
| Productivity endpoints | [Productivity.md](03-Productivity.md)        |
| Import endpoints       | [Import.md](05-Import.md)                    |
