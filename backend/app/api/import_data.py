import io

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from supabase import Client

from app.core import get_current_user, get_user_supabase
from app.models import CSVImportResult


router = APIRouter(prefix="/import", tags=["import"])


@router.post("/csv", response_model=CSVImportResult)
async def import_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """
    Import data from a CSV file.

    Expected columns for routines:
    - date, wake_time, sleep_duration_hours, exercise_minutes,
      meditation_minutes, breakfast_quality, morning_mood,
      screen_time_before_bed, caffeine_intake, water_intake_ml

    Expected columns for productivity:
    - date, productivity_score, tasks_completed, tasks_planned,
      focus_hours, distractions_count, energy_level, stress_level, notes
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV",
        )

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse CSV: {e!s}",
        ) from e

    imported_count = 0
    failed_count = 0
    errors = []

    # Determine which type of data based on columns
    routine_columns = {"wake_time", "sleep_duration_hours", "morning_mood"}
    productivity_columns = {"productivity_score", "energy_level"}

    csv_columns = set(df.columns)

    user_id = current_user["id"]

    for idx, row in df.iterrows():
        try:
            row_dict = row.to_dict()
            row_dict["user_id"] = user_id

            # Remove NaN values
            row_dict = {k: v for k, v in row_dict.items() if pd.notna(v)}

            # Determine table and insert
            if routine_columns.issubset(csv_columns):
                # Import as morning routine
                supabase.table("morning_routines").insert(row_dict).execute()
            elif productivity_columns.issubset(csv_columns):
                # Import as productivity
                supabase.table("productivity_entries").insert(row_dict).execute()
            else:
                # Try to insert into both tables based on available columns
                routine_data = {
                    k: v
                    for k, v in row_dict.items()
                    if k
                    in [
                        "date",
                        "user_id",
                        "wake_time",
                        "sleep_duration_hours",
                        "exercise_minutes",
                        "meditation_minutes",
                        "breakfast_quality",
                        "morning_mood",
                        "screen_time_before_bed",
                        "caffeine_intake",
                        "water_intake_ml",
                    ]
                }

                productivity_data = {
                    k: v
                    for k, v in row_dict.items()
                    if k
                    in [
                        "date",
                        "user_id",
                        "productivity_score",
                        "tasks_completed",
                        "tasks_planned",
                        "focus_hours",
                        "distractions_count",
                        "energy_level",
                        "stress_level",
                        "notes",
                    ]
                }

                if len(routine_data) > 2:
                    supabase.table("morning_routines").insert(routine_data).execute()

                if len(productivity_data) > 2:
                    supabase.table("productivity_entries").insert(productivity_data).execute()

            imported_count += 1

        except Exception as e:
            failed_count += 1
            errors.append(f"Row {idx + 1}: {e!s}")
            if len(errors) > 10:
                errors.append("... (more errors truncated)")
                break

    return CSVImportResult(
        success=failed_count == 0,
        imported_count=imported_count,
        failed_count=failed_count,
        errors=errors[:10],
    )
