-- Migration: Wrap auth.uid() in subselect for RLS policy performance
--
-- Issue:  Supabase security linter warns that calling auth.uid() directly in
--         RLS policies causes PostgreSQL to re-evaluate the function for every
--         row.  Wrapping it in (select auth.uid()) lets the planner evaluate
--         it once and reuse the result, which is significantly faster at scale.
--
-- How to apply:
--   Run this migration in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
--   It is safe to run multiple times (DROP IF EXISTS + CREATE).

-- ============================================
-- user_profiles (column: id)
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING ((select auth.uid()) = id);

-- ============================================
-- user_settings (column: user_id)
-- ============================================
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING ((select auth.uid()) = user_id);

-- ============================================
-- user_goals (column: user_id)
-- ============================================
DROP POLICY IF EXISTS "Users can view own goals" ON user_goals;
CREATE POLICY "Users can view own goals"
    ON user_goals FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own goals" ON user_goals;
CREATE POLICY "Users can insert own goals"
    ON user_goals FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON user_goals;
CREATE POLICY "Users can update own goals"
    ON user_goals FOR UPDATE
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON user_goals;
CREATE POLICY "Users can delete own goals"
    ON user_goals FOR DELETE
    USING ((select auth.uid()) = user_id);

-- ============================================
-- morning_routines (column: user_id)
-- ============================================
DROP POLICY IF EXISTS "Users can view own routines" ON morning_routines;
CREATE POLICY "Users can view own routines"
    ON morning_routines FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own routines" ON morning_routines;
CREATE POLICY "Users can insert own routines"
    ON morning_routines FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own routines" ON morning_routines;
CREATE POLICY "Users can update own routines"
    ON morning_routines FOR UPDATE
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own routines" ON morning_routines;
CREATE POLICY "Users can delete own routines"
    ON morning_routines FOR DELETE
    USING ((select auth.uid()) = user_id);

-- ============================================
-- productivity_entries (column: user_id)
-- ============================================
DROP POLICY IF EXISTS "Users can view own productivity" ON productivity_entries;
CREATE POLICY "Users can view own productivity"
    ON productivity_entries FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own productivity" ON productivity_entries;
CREATE POLICY "Users can insert own productivity"
    ON productivity_entries FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own productivity" ON productivity_entries;
CREATE POLICY "Users can update own productivity"
    ON productivity_entries FOR UPDATE
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own productivity" ON productivity_entries;
CREATE POLICY "Users can delete own productivity"
    ON productivity_entries FOR DELETE
    USING ((select auth.uid()) = user_id);
