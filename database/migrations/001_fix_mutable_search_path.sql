-- Migration: Fix mutable search_path on PostgreSQL functions
-- Issue: Supabase security linter flags functions without an explicit search_path.
--        A mutable search_path can allow search_path injection attacks.
-- Fix:   SET search_path = '' on both functions and schema-qualify table references.
--
-- How to apply:
--   Run this migration in your Supabase SQL Editor (Dashboard → SQL Editor → New Query).
--   It is safe to run multiple times (CREATE OR REPLACE is idempotent).

-- 1. update_updated_at_column — used by all "updated_at" triggers.
--    Only references NEW and NOW(), so no schema qualification needed inside the body.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 2. handle_new_user — creates profile & settings on signup.
--    Table references are schema-qualified (public.*) because search_path is empty.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
    );

    -- Create default settings
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
