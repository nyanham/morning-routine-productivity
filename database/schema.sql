-- Morning Routine & Productivity Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE
-- ============================================
-- Extends Supabase auth.users with application-specific data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Information
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    display_name VARCHAR(50),
    avatar_url TEXT,
    
    -- Personal Details
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say', NULL)),
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en-US',
    
    -- Profile
    bio TEXT,
    occupation VARCHAR(100),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
-- Separated from profile for single responsibility & frequent updates
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Appearance
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    accent_color VARCHAR(20) DEFAULT 'blue',
    compact_mode BOOLEAN DEFAULT false,
    
    -- Notifications
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    weekly_summary_email BOOLEAN DEFAULT true,
    reminder_time TIME DEFAULT '07:00',
    
    -- Privacy
    profile_visibility VARCHAR(20) DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'friends')),
    show_streak_publicly BOOLEAN DEFAULT false,
    allow_data_analytics BOOLEAN DEFAULT true,
    
    -- Dashboard Preferences
    default_date_range INTEGER DEFAULT 30, -- days to show by default
    default_chart_type VARCHAR(20) DEFAULT 'line' CHECK (default_chart_type IN ('line', 'bar', 'area')),
    show_weekend_markers BOOLEAN DEFAULT true,
    start_week_on VARCHAR(10) DEFAULT 'monday' CHECK (start_week_on IN ('monday', 'sunday')),
    
    -- Units & Formats
    time_format VARCHAR(5) DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    measurement_system VARCHAR(10) DEFAULT 'metric' CHECK (measurement_system IN ('metric', 'imperial')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER GOALS TABLE
-- ============================================
-- Normalized: goals are separate as they can have multiple per user
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Goal Definition
    goal_type VARCHAR(30) NOT NULL CHECK (goal_type IN (
        'sleep_duration', 'wake_time', 'exercise_minutes', 'meditation_minutes',
        'water_intake', 'caffeine_limit', 'productivity_score', 'focus_hours',
        'tasks_completed', 'stress_level_max', 'screen_time_limit'
    )),
    target_value DECIMAL(10,2) NOT NULL,
    target_unit VARCHAR(20), -- 'hours', 'minutes', 'ml', 'mg', 'score', 'count'
    
    -- Goal Settings
    is_active BOOLEAN DEFAULT true,
    reminder_enabled BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MORNING ROUTINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS morning_routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    wake_time TIME NOT NULL,
    sleep_duration_hours DECIMAL(4,2) NOT NULL CHECK (sleep_duration_hours >= 0 AND sleep_duration_hours <= 24),
    exercise_minutes INTEGER DEFAULT 0 CHECK (exercise_minutes >= 0),
    meditation_minutes INTEGER DEFAULT 0 CHECK (meditation_minutes >= 0),
    breakfast_quality VARCHAR(20) DEFAULT 'good' CHECK (breakfast_quality IN ('poor', 'fair', 'good', 'excellent')),
    morning_mood INTEGER NOT NULL CHECK (morning_mood >= 1 AND morning_mood <= 10),
    screen_time_before_bed INTEGER DEFAULT 0 CHECK (screen_time_before_bed >= 0),
    caffeine_intake INTEGER DEFAULT 0 CHECK (caffeine_intake >= 0),
    water_intake_ml INTEGER DEFAULT 0 CHECK (water_intake_ml >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one routine per user per day
    UNIQUE(user_id, date)
);

-- ============================================
-- PRODUCTIVITY ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS productivity_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    routine_id UUID REFERENCES morning_routines(id) ON DELETE SET NULL,
    productivity_score INTEGER NOT NULL CHECK (productivity_score >= 1 AND productivity_score <= 10),
    tasks_completed INTEGER DEFAULT 0 CHECK (tasks_completed >= 0),
    tasks_planned INTEGER DEFAULT 0 CHECK (tasks_planned >= 0),
    focus_hours DECIMAL(4,2) DEFAULT 0 CHECK (focus_hours >= 0),
    distractions_count INTEGER DEFAULT 0 CHECK (distractions_count >= 0),
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
    stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one entry per user per day
    UNIQUE(user_id, date)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_active ON user_goals(user_id, is_active) WHERE is_active = true;

-- Partial unique index: only one active goal per type per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_goals_unique_active 
    ON user_goals(user_id, goal_type) 
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_morning_routines_user_date ON morning_routines(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_productivity_entries_user_date ON productivity_entries(user_id, date DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_goals_updated_at ON user_goals;
CREATE TRIGGER update_user_goals_updated_at
    BEFORE UPDATE ON user_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_morning_routines_updated_at ON morning_routines;
CREATE TRIGGER update_morning_routines_updated_at
    BEFORE UPDATE ON morning_routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_productivity_entries_updated_at ON productivity_entries;
CREATE TRIGGER update_productivity_entries_updated_at
    BEFORE UPDATE ON productivity_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-CREATE PROFILE & SETTINGS ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
    );
    
    -- Create default settings
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_entries ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- User Settings Policies
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- User Goals Policies
CREATE POLICY "Users can view own goals"
    ON user_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
    ON user_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
    ON user_goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
    ON user_goals FOR DELETE
    USING (auth.uid() = user_id);

-- Morning Routines Policies
CREATE POLICY "Users can view own routines"
    ON morning_routines FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
    ON morning_routines FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
    ON morning_routines FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines"
    ON morning_routines FOR DELETE
    USING (auth.uid() = user_id);

-- Productivity Entries Policies
CREATE POLICY "Users can view own productivity"
    ON productivity_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own productivity"
    ON productivity_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own productivity"
    ON productivity_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own productivity"
    ON productivity_entries FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- GRANTS
-- ============================================
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON user_goals TO authenticated;
GRANT ALL ON morning_routines TO authenticated;
GRANT ALL ON productivity_entries TO authenticated;
