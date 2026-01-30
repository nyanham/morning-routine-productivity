"""
Tests for Pydantic model validation.
"""

from datetime import date, datetime

import pytest
from pydantic import ValidationError

from app.models import (
    MorningRoutine,
    MorningRoutineCreate,
    MorningRoutineUpdate,
    Productivity,
    ProductivityCreate,
    ProductivityUpdate,
)


class TestMorningRoutineModels:
    """Tests for MorningRoutine Pydantic models."""

    def test_create_valid_routine(self) -> None:
        """Test creating a valid routine."""
        routine = MorningRoutineCreate(
            date=date.today(),
            wake_time="06:30",
            sleep_duration_hours=7.5,
            exercise_minutes=30,
            meditation_minutes=15,
            breakfast_quality="good",
            morning_mood=7,
            screen_time_before_bed=30,
            caffeine_intake=200,
            water_intake_ml=500,
        )

        assert routine.date == date.today()
        assert routine.wake_time == "06:30"
        assert routine.sleep_duration_hours == 7.5
        assert routine.morning_mood == 7
        assert routine.breakfast_quality == "good"

    def test_routine_with_defaults(self) -> None:
        """Test routine uses default values correctly."""
        routine = MorningRoutineCreate(
            date=date.today(),
            wake_time="07:00",
            sleep_duration_hours=8.0,
            morning_mood=6,
        )

        assert routine.exercise_minutes == 0
        assert routine.meditation_minutes == 0
        assert routine.breakfast_quality == "good"
        assert routine.screen_time_before_bed == 0
        assert routine.caffeine_intake == 0
        assert routine.water_intake_ml == 0

    def test_routine_invalid_mood_too_high(self) -> None:
        """Test validation fails for mood > 10."""
        with pytest.raises(ValidationError) as exc_info:
            MorningRoutineCreate(
                date=date.today(),
                wake_time="07:00",
                sleep_duration_hours=8.0,
                morning_mood=15,
            )

        assert "morning_mood" in str(exc_info.value)

    def test_routine_invalid_mood_too_low(self) -> None:
        """Test validation fails for mood < 1."""
        with pytest.raises(ValidationError) as exc_info:
            MorningRoutineCreate(
                date=date.today(),
                wake_time="07:00",
                sleep_duration_hours=8.0,
                morning_mood=0,
            )

        assert "morning_mood" in str(exc_info.value)

    def test_routine_invalid_sleep_duration(self) -> None:
        """Test validation fails for sleep > 24 hours."""
        with pytest.raises(ValidationError) as exc_info:
            MorningRoutineCreate(
                date=date.today(),
                wake_time="07:00",
                sleep_duration_hours=25.0,
                morning_mood=7,
            )

        assert "sleep_duration_hours" in str(exc_info.value)

    def test_routine_negative_sleep_duration(self) -> None:
        """Test validation fails for negative sleep duration."""
        with pytest.raises(ValidationError) as exc_info:
            MorningRoutineCreate(
                date=date.today(),
                wake_time="07:00",
                sleep_duration_hours=-1.0,
                morning_mood=7,
            )

        assert "sleep_duration_hours" in str(exc_info.value)

    def test_routine_negative_exercise(self) -> None:
        """Test validation fails for negative exercise minutes."""
        with pytest.raises(ValidationError) as exc_info:
            MorningRoutineCreate(
                date=date.today(),
                wake_time="07:00",
                sleep_duration_hours=8.0,
                morning_mood=7,
                exercise_minutes=-10,
            )

        assert "exercise_minutes" in str(exc_info.value)

    def test_routine_invalid_breakfast_quality(self) -> None:
        """Test validation fails for invalid breakfast quality."""
        with pytest.raises(ValidationError) as exc_info:
            MorningRoutineCreate(
                date=date.today(),
                wake_time="07:00",
                sleep_duration_hours=8.0,
                morning_mood=7,
                breakfast_quality="amazing",  # Not in allowed values
            )

        assert "breakfast_quality" in str(exc_info.value)

    def test_routine_valid_breakfast_qualities(self) -> None:
        """Test all valid breakfast quality values."""
        for quality in ["poor", "fair", "good", "excellent"]:
            routine = MorningRoutineCreate(
                date=date.today(),
                wake_time="07:00",
                sleep_duration_hours=8.0,
                morning_mood=7,
                breakfast_quality=quality,
            )
            assert routine.breakfast_quality == quality

    def test_routine_update_partial(self) -> None:
        """Test update model allows partial updates."""
        update = MorningRoutineUpdate(
            morning_mood=8,
        )

        assert update.morning_mood == 8
        assert update.wake_time is None
        assert update.exercise_minutes is None

    def test_routine_update_all_fields(self) -> None:
        """Test update model with all fields."""
        update = MorningRoutineUpdate(
            wake_time="06:00",
            sleep_duration_hours=9.0,
            exercise_minutes=60,
            meditation_minutes=30,
            breakfast_quality="excellent",
            morning_mood=10,
            screen_time_before_bed=0,
            caffeine_intake=50,
            water_intake_ml=1000,
        )

        assert update.wake_time == "06:00"
        assert update.morning_mood == 10

    def test_full_routine_model(self) -> None:
        """Test full routine model with all database fields."""
        routine = MorningRoutine(
            id="routine-123",
            user_id="user-456",
            date=date.today(),
            wake_time="06:30",
            sleep_duration_hours=7.5,
            morning_mood=7,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        assert routine.id == "routine-123"
        assert routine.user_id == "user-456"


class TestProductivityModels:
    """Tests for Productivity Pydantic models."""

    def test_create_valid_productivity(self) -> None:
        """Test creating valid productivity entry."""
        productivity = ProductivityCreate(
            date=date.today(),
            productivity_score=8,
            tasks_completed=5,
            tasks_planned=6,
            focus_hours=4.5,
            distractions_count=3,
            energy_level=7,
            stress_level=4,
            notes="Good day!",
        )

        assert productivity.productivity_score == 8
        assert productivity.tasks_completed == 5
        assert productivity.energy_level == 7

    def test_productivity_with_routine_id(self) -> None:
        """Test productivity linked to routine."""
        productivity = ProductivityCreate(
            date=date.today(),
            routine_id="routine-123",
            productivity_score=9,
            energy_level=8,
            stress_level=3,
        )

        assert productivity.routine_id == "routine-123"

    def test_productivity_with_defaults(self) -> None:
        """Test productivity uses defaults."""
        productivity = ProductivityCreate(
            date=date.today(),
            productivity_score=7,
            energy_level=6,
            stress_level=5,
        )

        assert productivity.tasks_completed == 0
        assert productivity.tasks_planned == 0
        assert productivity.focus_hours == 0
        assert productivity.distractions_count == 0
        assert productivity.notes is None
        assert productivity.routine_id is None

    def test_productivity_invalid_score_too_high(self) -> None:
        """Test validation fails for score > 10."""
        with pytest.raises(ValidationError) as exc_info:
            ProductivityCreate(
                date=date.today(),
                productivity_score=15,
                energy_level=7,
                stress_level=5,
            )

        assert "productivity_score" in str(exc_info.value)

    def test_productivity_invalid_score_too_low(self) -> None:
        """Test validation fails for score < 1."""
        with pytest.raises(ValidationError) as exc_info:
            ProductivityCreate(
                date=date.today(),
                productivity_score=0,
                energy_level=7,
                stress_level=5,
            )

        assert "productivity_score" in str(exc_info.value)

    def test_productivity_invalid_energy_level(self) -> None:
        """Test validation fails for invalid energy level."""
        with pytest.raises(ValidationError) as exc_info:
            ProductivityCreate(
                date=date.today(),
                productivity_score=7,
                energy_level=12,
                stress_level=5,
            )

        assert "energy_level" in str(exc_info.value)

    def test_productivity_invalid_stress_level(self) -> None:
        """Test validation fails for invalid stress level."""
        with pytest.raises(ValidationError) as exc_info:
            ProductivityCreate(
                date=date.today(),
                productivity_score=7,
                energy_level=6,
                stress_level=0,
            )

        assert "stress_level" in str(exc_info.value)

    def test_productivity_negative_tasks(self) -> None:
        """Test validation fails for negative task count."""
        with pytest.raises(ValidationError) as exc_info:
            ProductivityCreate(
                date=date.today(),
                productivity_score=7,
                energy_level=6,
                stress_level=5,
                tasks_completed=-5,
            )

        assert "tasks_completed" in str(exc_info.value)

    def test_productivity_negative_focus_hours(self) -> None:
        """Test validation fails for negative focus hours."""
        with pytest.raises(ValidationError) as exc_info:
            ProductivityCreate(
                date=date.today(),
                productivity_score=7,
                energy_level=6,
                stress_level=5,
                focus_hours=-2.5,
            )

        assert "focus_hours" in str(exc_info.value)

    def test_productivity_update_partial(self) -> None:
        """Test update model allows partial updates."""
        update = ProductivityUpdate(
            productivity_score=10,
            notes="Updated notes",
        )

        assert update.productivity_score == 10
        assert update.notes == "Updated notes"
        assert update.energy_level is None

    def test_full_productivity_model(self) -> None:
        """Test full productivity model with all database fields."""
        productivity = Productivity(
            id="productivity-123",
            user_id="user-456",
            date=date.today(),
            productivity_score=8,
            energy_level=7,
            stress_level=4,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        assert productivity.id == "productivity-123"
        assert productivity.user_id == "user-456"

    def test_productivity_score_boundaries(self) -> None:
        """Test productivity score at boundaries."""
        # Minimum valid
        prod_min = ProductivityCreate(
            date=date.today(),
            productivity_score=1,
            energy_level=1,
            stress_level=1,
        )
        assert prod_min.productivity_score == 1

        # Maximum valid
        prod_max = ProductivityCreate(
            date=date.today(),
            productivity_score=10,
            energy_level=10,
            stress_level=10,
        )
        assert prod_max.productivity_score == 10
