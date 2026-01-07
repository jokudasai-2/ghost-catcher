/*
  # Fix RLS Security Vulnerabilities

  ## Overview
  Removes overly permissive RLS policies that allow unrestricted access and ensures all tables have proper restrictive policies based on authentication and ownership.

  ## Security Issues Fixed

  ### 1. activities table
  - **Removed**: "Anyone can insert activities" policy (unrestricted INSERT)
  - **Removed**: "Anyone can update activities" policy (unrestricted UPDATE)
  - **Removed**: "Anyone can read activities" policy (unrestricted SELECT)
  - **Kept**: Proper restrictive policies for authenticated users

  ### 2. ghosts table
  - **Removed**: "Anyone can delete ghosts" policy (unrestricted DELETE)
  - **Removed**: "Anyone can insert ghosts" policy (unrestricted INSERT)
  - **Removed**: "Anyone can update ghosts" policy (unrestricted UPDATE)
  - **Removed**: "Anyone can read ghosts" policy (unrestricted SELECT)
  - **Updated**: "Authenticated users can create ghosts" to require proper reporter email
  - **Kept**: Proper restrictive policies for authenticated users

  ### 3. users table
  - **Removed**: "Anyone can insert users" policy (unrestricted INSERT)
  - **Removed**: "Anyone can update users" policy (unrestricted UPDATE)
  - **Removed**: "Anyone can read users" policy (unrestricted SELECT)
  - **Kept**: Proper restrictive policies for authenticated users

  ## Security Model

  ### Activities
  - Users can only view and insert their own activities
  - No anonymous access

  ### Ghosts
  - All authenticated users can view ghosts (public visibility)
  - Only authenticated users can create ghosts (with valid reporter email)
  - Users can update ghosts they reported or are assigned to
  - Only admins can delete ghosts

  ### Users
  - All authenticated users can view user profiles (leaderboard functionality)
  - Users can only update their own profile
  - Users can only insert their own profile during registration

  ## Important Notes
  - All policies now require authentication via auth.uid()
  - Policies check ownership before allowing modifications
  - Admin privileges are checked for sensitive operations
  - No anonymous access to any tables
*/

-- ============================================================================
-- Drop all insecure "Anyone can..." policies
-- ============================================================================

-- Activities table - remove unrestricted access
DROP POLICY IF EXISTS "Anyone can insert activities" ON activities;
DROP POLICY IF EXISTS "Anyone can update activities" ON activities;
DROP POLICY IF EXISTS "Anyone can read activities" ON activities;

-- Ghosts table - remove unrestricted access
DROP POLICY IF EXISTS "Anyone can delete ghosts" ON ghosts;
DROP POLICY IF EXISTS "Anyone can insert ghosts" ON ghosts;
DROP POLICY IF EXISTS "Anyone can update ghosts" ON ghosts;
DROP POLICY IF EXISTS "Anyone can read ghosts" ON ghosts;

-- Users table - remove unrestricted access
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Anyone can update users" ON users;
DROP POLICY IF EXISTS "Anyone can read users" ON users;

-- ============================================================================
-- Update existing policies to be more restrictive
-- ============================================================================

-- Drop and recreate the "Authenticated users can create ghosts" policy
-- to ensure it validates the reporter email
DROP POLICY IF EXISTS "Authenticated users can create ghosts" ON ghosts;

CREATE POLICY "Authenticated users can create ghosts"
  ON ghosts FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_email = (SELECT email FROM users WHERE auth_id = auth.uid())
    OR (SELECT email FROM auth.users WHERE id = auth.uid()) = reporter_email
  );

-- Add policy for authenticated users to update their own activities
-- (in case it was missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'activities' 
    AND policyname = 'Users can update own activities'
  ) THEN
    CREATE POLICY "Users can update own activities"
      ON activities FOR UPDATE
      TO authenticated
      USING (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()))
      WITH CHECK (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- Verify all tables have proper restrictive policies
-- ============================================================================

-- Ensure activities table has proper DELETE policy for user's own data
DROP POLICY IF EXISTS "Users can delete own activities" ON activities;
CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  TO authenticated
  USING (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()));

-- Ensure badges table has proper UPDATE policy
DROP POLICY IF EXISTS "Users can update own badges" ON badges;
CREATE POLICY "Users can update own badges"
  ON badges FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()));

-- Ensure badges table has proper DELETE policy
DROP POLICY IF EXISTS "Users can delete own badges" ON badges;
CREATE POLICY "Users can delete own badges"
  ON badges FOR DELETE
  TO authenticated
  USING (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()));

-- Ensure user_stats table has proper DELETE policy
DROP POLICY IF EXISTS "Users can delete own stats" ON user_stats;
CREATE POLICY "Users can delete own stats"
  ON user_stats FOR DELETE
  TO authenticated
  USING (user_id = (SELECT user_id FROM users WHERE auth_id = auth.uid()));

-- Ensure users table has proper DELETE policy (for account deletion)
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
CREATE POLICY "Users can delete own profile"
  ON users FOR DELETE
  TO authenticated
  USING (
    auth.uid() = auth_id 
    OR user_id = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
