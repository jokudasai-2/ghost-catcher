/*
  # Create ghosts table

  1. New Tables
    - `ghosts`
      - `id` (text, primary key) - Ghost identifier
      - `title` (text) - Ghost title
      - `description` (text) - Detailed description
      - `category` (text) - Category of issue
      - `impact` (int) - Impact score
      - `effort` (int) - Effort score
      - `priority` (text) - Priority level
      - `email` (text) - Reporter email
      - `reporter_email` (text) - Reporter email
      - `reporter` (text) - Reporter name
      - `department` (text) - Department
      - `geography` (text) - Geography
      - `risk_type` (text[]) - Risk types array
      - `url` (text) - Related URL
      - `page_title` (text) - Page title
      - `timestamp` (timestamptz) - Created timestamp
      - `date_reported` (text) - Date reported as string
      - `status` (text) - Current status
      - `assigned_to` (text) - Assigned user
      - `resolution_notes` (text) - Resolution notes
      - `days_open` (int) - Days since opened
      - `screenshot` (text) - Screenshot URL
      - `resolved_by` (text) - User who resolved
      - `resolved_at` (timestamptz) - Resolution timestamp
      - `date_resolved` (timestamptz) - Date resolved
      - `actual_resolution_time` (int) - Days to resolve
      - `points_awarded` (int) - Points awarded
      - `escalated` (bool) - Escalation flag
      - `escalated_at` (timestamptz) - Escalation timestamp
      - `escalated_by` (text) - User who escalated
      - `escalation_notes` (text) - Escalation notes
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `ghosts` table
    - Add policy for anyone to read ghosts (no auth)
    - Add policy for anyone to create ghosts (no auth)
    - Add policy for anyone to update ghosts (no auth)
*/

CREATE TABLE IF NOT EXISTS ghosts (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'Other',
  impact int DEFAULT 1,
  effort int DEFAULT 1,
  priority text DEFAULT 'Medium',
  email text DEFAULT '',
  reporter_email text DEFAULT '',
  reporter text DEFAULT '',
  department text DEFAULT '',
  geography text DEFAULT '',
  risk_type text[] DEFAULT '{}',
  url text,
  page_title text DEFAULT '',
  timestamp timestamptz DEFAULT now(),
  date_reported text DEFAULT '',
  status text DEFAULT 'New',
  assigned_to text,
  resolution_notes text DEFAULT '',
  days_open int DEFAULT 0,
  screenshot text,
  resolved_by text,
  resolved_at timestamptz,
  date_resolved timestamptz,
  actual_resolution_time int,
  points_awarded int,
  escalated bool DEFAULT false,
  escalated_at timestamptz,
  escalated_by text,
  escalation_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ghosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ghosts"
  ON ghosts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert ghosts"
  ON ghosts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update ghosts"
  ON ghosts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete ghosts"
  ON ghosts FOR DELETE
  TO anon, authenticated
  USING (true);
