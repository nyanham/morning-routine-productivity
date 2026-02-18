# Import Endpoint

Bulk import data from CSV files.

This endpoint requires authentication. See [../Auth.md](../Auth.md).

---

## POST `/api/import/csv`

Import morning routine and/or productivity data from a CSV file.

**Request** `multipart/form-data`

| Field  | Type | Required | Description   |
| ------ | ---- | -------- | ------------- |
| `file` | file | Yes      | A `.csv` file |

### How it works

1. The file must have a `.csv` extension (otherwise → 400).
2. The CSV is parsed with Pandas.
3. The endpoint inspects the column names to determine the data type:
   - Columns include `wake_time`, `sleep_duration_hours`, `morning_mood` → **morning routines**.
   - Columns include `productivity_score`, `energy_level` → **productivity entries**.
   - If both sets of columns are present, the endpoint splits the row and inserts into both tables.
4. Each row is inserted individually. If a row fails (e.g. duplicate date, bad value), it is counted as a failure and the error is captured, but processing continues.

### Expected CSV columns

**Routines:**

```
date, wake_time, sleep_duration_hours, exercise_minutes, meditation_minutes,
breakfast_quality, morning_mood, screen_time_before_bed, caffeine_intake, water_intake_ml
```

**Productivity:**

```
date, productivity_score, tasks_completed, tasks_planned, focus_hours,
distractions_count, energy_level, stress_level, notes
```

### Example CSV (routines)

```csv
date,wake_time,sleep_duration_hours,exercise_minutes,meditation_minutes,breakfast_quality,morning_mood
2024-01-15,06:30,7.5,30,15,good,7
2024-01-16,07:00,8.0,45,20,excellent,8
```

### Example CSV (productivity)

```csv
date,productivity_score,tasks_completed,tasks_planned,focus_hours,distractions_count,energy_level,stress_level,notes
2024-01-15,8,12,15,6.5,5,7,4,Great day!
2024-01-16,7,10,12,5.0,8,6,5,Many meetings
```

### Response `200 OK`

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

| Field            | Type     | Description                              |
| ---------------- | -------- | ---------------------------------------- |
| `imported_count` | integer  | Number of rows successfully imported     |
| `failed_count`   | integer  | Number of rows that failed               |
| `errors`         | string[] | Human-readable error for each failed row |

### Error responses

| Status | Detail                     | Cause                        |
| ------ | -------------------------- | ---------------------------- |
| 400    | `File must be a CSV`       | File extension is not `.csv` |
| 400    | `Failed to parse CSV: ...` | Pandas cannot read the file  |

### cURL example

```bash
curl -X POST "http://localhost:8000/api/import/csv" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@data/morning_routines.csv"
```

### Notes

- Sample CSV files are included in `backend/data/` for testing.
- The frontend also provides a CSV import UI at `/dashboard/import`.
- Rows with `NaN` values have those fields stripped before insertion.

---

## Related Docs

| Topic               | Link                                              |
| ------------------- | ------------------------------------------------- |
| API overview        | [API-Overview.md](../01-API-Overview.md)          |
| Authentication      | [Auth.md](../02-Auth.md)                          |
| Error handling      | [Error-Handling.md](../03-Error-Handling.md)      |
| Seed data           | [Seed-Data.md](../../06-Database/05-Seed-Data.md) |
| Analytics endpoints | [Analytics.md](04-Analytics.md)                   |
