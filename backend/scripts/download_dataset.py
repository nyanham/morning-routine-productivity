"""
Script to generate synthetic Morning Routine and Productivity dataset.

This generates realistic, correlated data that matches the project schema.

Usage:
    python scripts/download_dataset.py
"""

import os
import random
from datetime import date, timedelta

import numpy as np
import pandas as pd


def generate_wake_time(sleep_quality: float) -> str:
    """Generate wake time based on sleep quality (better sleep = more consistent wake time)."""
    # Base wake time around 6:30 AM
    base_hour = 6
    base_minute = 30

    # Add some variance (less variance with better sleep quality)
    variance = int((1 - sleep_quality) * 90)  # 0-90 minutes variance
    offset = random.randint(-variance // 2, variance)

    total_minutes = base_hour * 60 + base_minute + offset
    total_minutes = max(5 * 60, min(9 * 60, total_minutes))  # Clamp between 5:00 and 9:00

    hour = total_minutes // 60
    minute = total_minutes % 60
    return f"{hour:02d}:{minute:02d}"


def generate_breakfast_quality(mood: int, exercise: int) -> str:
    """Generate breakfast quality based on mood and exercise."""
    score = (mood / 10) * 0.6 + (min(exercise, 60) / 60) * 0.4 + random.uniform(-0.2, 0.2)

    if score > 0.75:
        return "excellent"
    elif score > 0.5:
        return "good"
    elif score > 0.25:
        return "fair"
    else:
        return "poor"


def generate_notes(productivity: int, stress: int, tasks_completed: int, tasks_planned: int) -> str:
    """Generate realistic notes based on the day's metrics."""
    notes_pool = {
        "high_productivity": [
            "Very focused day, got a lot done!",
            "Great flow state today.",
            "Crushed it! Everything clicked.",
            "Productive morning set the tone for the day.",
            "Deep work session was very effective.",
        ],
        "low_productivity": [
            "Struggled to focus today.",
            "Too many interruptions.",
            "Felt scattered, hard to concentrate.",
            "Not my best day, will try again tomorrow.",
            "Brain fog most of the day.",
        ],
        "high_stress": [
            "Deadline pressure building up.",
            "Lots of meetings, little focus time.",
            "Feeling overwhelmed with tasks.",
            "Need to better prioritize tomorrow.",
            "Stressful day, took a walk to decompress.",
        ],
        "completed_all": [
            "Finished everything on my list!",
            "All tasks done, feeling accomplished.",
            "Clean sweep today!",
        ],
        "neutral": [
            "Average day overall.",
            "Steady progress on projects.",
            "Nothing special to note.",
            "Regular workday.",
            "",
            "",
            "",  # Sometimes no notes
        ],
    }

    if productivity >= 8 and tasks_completed >= tasks_planned:
        return random.choice(notes_pool["completed_all"] + notes_pool["high_productivity"])
    elif productivity >= 7:
        return random.choice(notes_pool["high_productivity"] + notes_pool["neutral"])
    elif stress >= 7:
        return random.choice(notes_pool["high_stress"])
    elif productivity <= 4:
        return random.choice(notes_pool["low_productivity"])
    else:
        return random.choice(notes_pool["neutral"])


def generate_dataset(
    num_days: int = 90, start_date: date = None, seed: int = 42
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Generate synthetic morning routine and productivity data.

    The data has realistic correlations:
    - Better sleep → better mood, energy, productivity
    - More exercise → better energy, lower stress
    - More meditation → lower stress, better focus
    - Screen time before bed → worse sleep
    - High caffeine → more distractions

    Args:
        num_days: Number of days to generate
        start_date: Starting date (defaults to 90 days ago)
        seed: Random seed for reproducibility

    Returns:
        Tuple of (routines_df, productivity_df)
    """
    random.seed(seed)
    np.random.seed(seed)

    if start_date is None:
        start_date = date.today() - timedelta(days=num_days)

    routines = []
    productivity = []

    # Track some state for realistic patterns
    prev_sleep = 7.0
    prev_exercise_streak = 0

    for day_offset in range(num_days):
        current_date = start_date + timedelta(days=day_offset)

        # Skip some random days (not everyone logs every day)
        if random.random() < 0.05:  # 5% chance to skip a day
            continue

        # Day of week affects patterns (0=Monday, 6=Sunday)
        day_of_week = current_date.weekday()
        is_weekend = day_of_week >= 5

        # === MORNING ROUTINE ===

        # Sleep duration (tends to be longer on weekends)
        base_sleep = 7.5 if is_weekend else 7.0
        sleep_duration = round(
            np.clip(np.random.normal(base_sleep, 1.0) + (prev_sleep - 7) * 0.2, 4.0, 10.0), 1
        )
        prev_sleep = sleep_duration

        # Screen time before bed (affects sleep quality)
        screen_time = int(np.clip(np.random.exponential(30), 0, 180))

        # Sleep quality factor (used for correlations)
        sleep_quality = min(1.0, (sleep_duration - 5) / 4) * (1 - screen_time / 300)

        # Wake time
        wake_time = generate_wake_time(sleep_quality)

        # Exercise (more likely if slept well, less on some weekdays)
        exercise_prob = 0.4 + sleep_quality * 0.3 + (0.2 if is_weekend else 0)
        if random.random() < exercise_prob:
            exercise_minutes = int(np.clip(np.random.normal(35, 15), 10, 90))
            prev_exercise_streak += 1
        else:
            exercise_minutes = 0
            prev_exercise_streak = 0

        # Meditation (builds habit over time if exercising)
        meditation_prob = 0.3 + min(prev_exercise_streak * 0.05, 0.3)
        if random.random() < meditation_prob:
            meditation_minutes = int(np.clip(np.random.normal(12, 5), 5, 30))
        else:
            meditation_minutes = 0

        # Morning mood (affected by sleep, exercise)
        mood_base = (
            5 + sleep_quality * 3 + (exercise_minutes > 0) * 1.5 + (meditation_minutes > 0) * 0.5
        )
        morning_mood = int(np.clip(np.random.normal(mood_base, 1), 1, 10))

        # Breakfast quality
        breakfast_quality = generate_breakfast_quality(morning_mood, exercise_minutes)

        # Caffeine intake (more if tired)
        if sleep_duration < 6.5:
            caffeine_intake = int(np.random.normal(250, 50))
        elif sleep_duration < 7.5:
            caffeine_intake = int(np.random.normal(150, 40))
        else:
            caffeine_intake = int(np.random.normal(80, 30))
        caffeine_intake = max(0, caffeine_intake)

        # Water intake (correlates with exercise and good habits)
        water_base = 400 + exercise_minutes * 8 + (meditation_minutes > 0) * 200
        water_intake = int(np.clip(np.random.normal(water_base, 150), 0, 2000))

        routines.append(
            {
                "date": current_date.isoformat(),
                "wake_time": wake_time,
                "sleep_duration_hours": sleep_duration,
                "exercise_minutes": exercise_minutes,
                "meditation_minutes": meditation_minutes,
                "breakfast_quality": breakfast_quality,
                "morning_mood": morning_mood,
                "screen_time_before_bed": screen_time,
                "caffeine_intake": caffeine_intake,
                "water_intake_ml": water_intake,
            }
        )

        # === PRODUCTIVITY ===

        # Energy level (sleep + exercise + breakfast)
        breakfast_score = {"poor": 0, "fair": 1, "good": 2, "excellent": 3}[breakfast_quality]
        energy_base = 4 + sleep_quality * 3 + (exercise_minutes > 20) * 1.5 + breakfast_score * 0.5
        energy_level = int(np.clip(np.random.normal(energy_base, 1), 1, 10))

        # Stress level (lower with meditation, exercise; higher with poor sleep)
        stress_base = (
            6 - meditation_minutes * 0.1 - (exercise_minutes > 0) * 1.5 + (1 - sleep_quality) * 2
        )
        stress_level = int(np.clip(np.random.normal(stress_base, 1.5), 1, 10))

        # Tasks planned (more on weekdays)
        tasks_planned = int(np.clip(np.random.normal(6 if not is_weekend else 3, 2), 1, 12))

        # Focus hours (affected by energy, meditation, caffeine balance)
        caffeine_optimal = 100 <= caffeine_intake <= 200
        focus_base = (
            3 + energy_level * 0.3 + (meditation_minutes > 0) * 0.5 + caffeine_optimal * 0.5
        )
        focus_hours = round(np.clip(np.random.normal(focus_base, 1), 0, 8), 1)

        # Distractions (more with high caffeine, high stress, poor sleep)
        distraction_base = (
            3 + (caffeine_intake > 200) * 2 + stress_level * 0.3 - meditation_minutes * 0.1
        )
        distractions_count = int(np.clip(np.random.normal(distraction_base, 2), 0, 20))

        # Productivity score (comprehensive formula)
        productivity_base = (
            5
            + sleep_quality * 2
            + energy_level * 0.2
            + focus_hours * 0.3
            - stress_level * 0.15
            - distractions_count * 0.1
            + (exercise_minutes > 0) * 0.5
        )
        productivity_score = int(np.clip(np.random.normal(productivity_base, 0.8), 1, 10))

        # Tasks completed (based on productivity and planned)
        completion_rate = 0.3 + productivity_score * 0.07
        tasks_completed = int(
            np.clip(
                round(tasks_planned * completion_rate + np.random.normal(0, 1)),
                0,
                tasks_planned + 1,  # Sometimes exceed planned!
            )
        )

        # Notes
        notes = generate_notes(productivity_score, stress_level, tasks_completed, tasks_planned)

        productivity.append(
            {
                "date": current_date.isoformat(),
                "productivity_score": productivity_score,
                "tasks_completed": tasks_completed,
                "tasks_planned": tasks_planned,
                "focus_hours": focus_hours,
                "distractions_count": distractions_count,
                "energy_level": energy_level,
                "stress_level": stress_level,
                "notes": notes,
            }
        )

    return pd.DataFrame(routines), pd.DataFrame(productivity)


def print_statistics(routines_df: pd.DataFrame, productivity_df: pd.DataFrame):
    """Print summary statistics of generated data."""
    print("\n" + "=" * 60)
    print("GENERATED DATA STATISTICS")
    print("=" * 60)

    print(f"\n📅 Date range: {routines_df['date'].min()} to {routines_df['date'].max()}")
    print(f"📊 Total entries: {len(routines_df)}")

    print("\n🌅 MORNING ROUTINE AVERAGES:")
    print(f"   Sleep duration: {routines_df['sleep_duration_hours'].mean():.1f} hrs")
    print(f"   Wake time mode: {routines_df['wake_time'].mode().iloc[0]}")
    print(
        f"   Exercise: {routines_df['exercise_minutes'].mean():.0f} min ({(routines_df['exercise_minutes'] > 0).mean() * 100:.0f}% of days)"
    )
    print(
        f"   Meditation: {routines_df['meditation_minutes'].mean():.0f} min ({(routines_df['meditation_minutes'] > 0).mean() * 100:.0f}% of days)"
    )
    print(f"   Morning mood: {routines_df['morning_mood'].mean():.1f}/10")
    print(f"   Caffeine: {routines_df['caffeine_intake'].mean():.0f} mg")
    print(f"   Water: {routines_df['water_intake_ml'].mean():.0f} ml")

    print("\n📈 PRODUCTIVITY AVERAGES:")
    print(f"   Productivity score: {productivity_df['productivity_score'].mean():.1f}/10")
    print(f"   Energy level: {productivity_df['energy_level'].mean():.1f}/10")
    print(f"   Stress level: {productivity_df['stress_level'].mean():.1f}/10")
    print(f"   Focus hours: {productivity_df['focus_hours'].mean():.1f} hrs")
    print(
        f"   Tasks completed: {productivity_df['tasks_completed'].mean():.1f}/{productivity_df['tasks_planned'].mean():.1f}"
    )
    print(f"   Distractions: {productivity_df['distractions_count'].mean():.1f}")

    # Correlations
    merged = routines_df.merge(productivity_df, on="date")
    print("\n🔗 KEY CORRELATIONS:")
    print(
        f"   Sleep → Productivity: {merged['sleep_duration_hours'].corr(merged['productivity_score']):.2f}"
    )
    print(f"   Sleep → Energy: {merged['sleep_duration_hours'].corr(merged['energy_level']):.2f}")
    print(f"   Exercise → Energy: {merged['exercise_minutes'].corr(merged['energy_level']):.2f}")
    print(
        f"   Meditation → Stress: {merged['meditation_minutes'].corr(merged['stress_level']):.2f}"
    )
    print(
        f"   Mood → Productivity: {merged['morning_mood'].corr(merged['productivity_score']):.2f}"
    )


def main():
    """Main function."""
    print("=" * 60)
    print("Morning Routine & Productivity Dataset Generator")
    print("=" * 60)

    # Generate data
    print("\n🎲 Generating synthetic dataset...")
    routines_df, productivity_df = generate_dataset(num_days=90, seed=42)

    # Print statistics
    print_statistics(routines_df, productivity_df)

    # Save to files
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "..", "data")
    os.makedirs(output_dir, exist_ok=True)

    routines_path = os.path.join(output_dir, "morning_routines.csv")
    productivity_path = os.path.join(output_dir, "productivity_entries.csv")

    routines_df.to_csv(routines_path, index=False)
    productivity_df.to_csv(productivity_path, index=False)

    print("\n" + "=" * 60)
    print("✅ DONE!")
    print("=" * 60)
    print(f"\nFiles saved to: {output_dir}")
    print(f"   📄 morning_routines.csv ({len(routines_df)} rows)")
    print(f"   📄 productivity_entries.csv ({len(productivity_df)} rows)")
    print("\n💡 Next steps:")
    print("   1. Set up your Supabase database with the schema")
    print("   2. Import these CSV files through the application")
    print("   3. Or use the API to bulk import")


if __name__ == "__main__":
    main()
