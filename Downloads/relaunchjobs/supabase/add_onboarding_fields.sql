-- Run this in Supabase SQL Editor
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS onboarding_started   boolean  DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean  DEFAULT false,
  ADD COLUMN IF NOT EXISTS intake_step          integer  DEFAULT 1,
  ADD COLUMN IF NOT EXISTS intake_answers       jsonb    DEFAULT '{}';
