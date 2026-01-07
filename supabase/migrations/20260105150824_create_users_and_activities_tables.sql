/*
  # Create users and activities tables

  1. New Tables
    - `users`
      - `user_id` (text, primary key) - User identifier
      - `display_name` (text) - Display name
      - `first_name` (text) - First name
      - `last_name` (text) - Last name
      - `email` (text) - Email address
      - `total_points` (int) - Total points earned
      - `level` (int) - User level
      - `badges` (jsonb) - Array of badges
      - `stats` (jsonb) - User statistics
      - `created_at` (timestamptz) - Account creation time
      - `last_activity_date` (timestamptz) - Last activity timestamp

    - `activities`
      - `id` (uuid, primary key) - Activity identifier
      - `user_id` (text) - User who performed activity
      - `ghost_id` (text) - Related ghost
      - `activity_type` (text) - Type of activity
      - `points_earned` (int) - Points earned
      - `timestamp` (timestamptz) - Activity timestamp
      - `metadata` (jsonb) - Additional metadata

  2. Security
    - Enable RLS on both tables
    - Allow anyone to read/write (no auth required)
*/

CREATE TABLE IF NOT EXISTS users (
  user_id text PRIMARY KEY,
  display_name text NOT NULL,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  email text DEFAULT '',
  total_points int DEFAULT 0,
  level int DEFAULT 1,
  badges jsonb DEFAULT '[]'::jsonb,
  stats jsonb DEFAULT '{
    "ghostsResolved": 0,
    "averageResolutionTime": 0,
    "streak": 0,
    "weeklyPoints": 0,
    "weeklyGhostsResolved": 0
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  last_activity_date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  ghost_id text NOT NULL,
  activity_type text NOT NULL,
  points_earned int DEFAULT 0,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update users"
  ON users FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read activities"
  ON activities FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert activities"
  ON activities FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update activities"
  ON activities FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
