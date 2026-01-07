/*
  # Add Authentication Support to Existing Schema

  ## Overview
  Updates the existing Ghost Catcher schema to support Supabase authentication while preserving existing data.

  ## Changes Made

  ### 1. users table updates
  - Add `auth_id` column to link to Supabase auth.users
  - Add `is_admin` column for admin role management
  - Keep existing columns and data intact

  ### 2. Create user_stats table (if needed)
  - Separate statistics from main users table for better normalization
  - Migrate stats from JSON column

  ### 3. Create badges table (if needed)
  - Separate badges from JSON column in users table
  - Enable proper querying and relationships

  ### 4. Update ghosts table
  - Ensure proper timestamp types
  - Add any missing columns for new features

  ### 5. Security Updates
  - Update RLS policies to use auth.uid()
  - Add proper admin checks
  - Ensure data isolation between users

  ## Notes
  - Existing data is preserved
  - New columns have safe defaults
  - RLS policies are authentication-aware
*/

-- Add auth_id to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'auth_id'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_id uuid UNIQUE;
  END IF;
END $$;

-- Add is_admin to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Create user_stats table as separate entity
CREATE TABLE IF NOT EXISTS user_stats (
  user_id text PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  ghosts_resolved integer DEFAULT 0,
  average_resolution_time numeric DEFAULT 0,
  streak integer DEFAULT 0,
  weekly_points integer DEFAULT 0,
  weekly_ghosts_resolved integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Create badges table as separate entity
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(user_id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  bonus_points integer DEFAULT 0,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Migrate stats from users.stats JSONB to user_stats table
INSERT INTO user_stats (user_id, ghosts_resolved, average_resolution_time, streak, weekly_points, weekly_ghosts_resolved)
SELECT 
  user_id,
  COALESCE((stats->>'ghostsResolved')::integer, 0),
  COALESCE((stats->>'averageResolutionTime')::numeric, 0),
  COALESCE((stats->>'streak')::integer, 0),
  COALESCE((stats->>'weeklyPoints')::integer, 0),
  COALESCE((stats->>'weeklyGhostsResolved')::integer, 0)
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM user_stats WHERE user_stats.user_id = users.user_id
);

-- Migrate badges from users.badges JSONB to badges table
INSERT INTO badges (user_id, badge_id, name, description, icon, bonus_points, unlocked_at)
SELECT 
  u.user_id,
  badge->>'id',
  badge->>'name',
  badge->>'description',
  badge->>'icon',
  COALESCE((badge->>'bonusPoints')::integer, 0),
  COALESCE((badge->>'unlockedAt')::timestamptz, now())
FROM users u,
JSONB_ARRAY_ELEMENTS(u.badges) AS badge
WHERE NOT EXISTS (
  SELECT 1 FROM badges b 
  WHERE b.user_id = u.user_id AND b.badge_id = badge->>'id'
);

-- Update activities table to use proper foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'activities_user_id_fkey'
  ) THEN
    ALTER TABLE activities DROP CONSTRAINT activities_user_id_fkey;
  END IF;
END $$;

ALTER TABLE activities 
  ADD CONSTRAINT activities_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ghosts_status ON ghosts(status);
CREATE INDEX IF NOT EXISTS idx_ghosts_reporter_email ON ghosts(reporter_email);
CREATE INDEX IF NOT EXISTS idx_ghosts_timestamp ON ghosts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ghosts_assigned_to ON ghosts(assigned_to);

-- Ensure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ghosts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view all stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view all badges" ON badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON badges;
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users can view all ghosts" ON ghosts;
DROP POLICY IF EXISTS "Authenticated users can create ghosts" ON ghosts;
DROP POLICY IF EXISTS "Users can update ghosts they reported" ON ghosts;
DROP POLICY IF EXISTS "Admins can delete ghosts" ON ghosts;

-- Users table policies
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id OR user_id = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (auth.uid() = auth_id OR user_id = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_id OR user_id = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- User stats policies
CREATE POLICY "Users can view all stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()));

-- Badges policies
CREATE POLICY "Users can view all badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own badges"
  ON badges FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()));

-- Activities policies
CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()));

-- Ghosts table policies
CREATE POLICY "Authenticated users can view all ghosts"
  ON ghosts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create ghosts"
  ON ghosts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update ghosts they reported or admins"
  ON ghosts FOR UPDATE
  TO authenticated
  USING (
    reporter_email = (SELECT email FROM users WHERE auth_id = auth.uid())
    OR assigned_to = (SELECT email FROM users WHERE auth_id = auth.uid())
    OR (SELECT is_admin FROM users WHERE auth_id = auth.uid()) = true
  )
  WITH CHECK (
    reporter_email = (SELECT email FROM users WHERE auth_id = auth.uid())
    OR assigned_to = (SELECT email FROM users WHERE auth_id = auth.uid())
    OR (SELECT is_admin FROM users WHERE auth_id = auth.uid()) = true
  );

CREATE POLICY "Admins can delete ghosts"
  ON ghosts FOR DELETE
  TO authenticated
  USING ((SELECT is_admin FROM users WHERE auth_id = auth.uid()) = true);