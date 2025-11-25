-- Fix Row Level Security (RLS) Policies
-- This ensures you can access your data

-- ========================================
-- STEP 1: Drop ALL existing policies to start fresh
-- ========================================

-- Drop inventory_items policies
DROP POLICY IF EXISTS "Users can view household inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert household inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can update household inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete household inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can view their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory items" ON inventory_items;

-- Drop users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Drop households policies
DROP POLICY IF EXISTS "Users can view their households" ON households;
DROP POLICY IF EXISTS "Users can insert households" ON households;
DROP POLICY IF EXISTS "Users can update households" ON households;

-- Drop household_members policies
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
DROP POLICY IF EXISTS "Users can insert household members" ON household_members;
DROP POLICY IF EXISTS "Users can update household members" ON household_members;

-- Drop user_preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;

-- ========================================
-- STEP 2: Enable RLS on all tables
-- ========================================

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 3: Create PERMISSIVE policies for users table
-- ========================================

CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (email = auth.jwt() ->> 'email');

-- ========================================
-- STEP 4: Create policies for households
-- ========================================

CREATE POLICY "Users can view households they belong to"
  ON households FOR SELECT
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can create households"
  ON households FOR INSERT
  WITH CHECK (
    created_by IN (
      SELECT user_id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can update their households"
  ON households FOR UPDATE
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
        AND hm.role = 'admin'
    )
  );

-- ========================================
-- STEP 5: Create policies for household_members
-- ========================================

CREATE POLICY "Users can view members of their households"
  ON household_members FOR SELECT
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can add themselves to households"
  ON household_members FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can manage household members"
  ON household_members FOR UPDATE
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
        AND hm.role = 'admin'
    )
  );

-- ========================================
-- STEP 6: Create policies for inventory_items (HOUSEHOLD-BASED)
-- ========================================

CREATE POLICY "Users can view inventory in their households"
  ON inventory_items FOR SELECT
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can add inventory to their households"
  ON inventory_items FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can update inventory in their households"
  ON inventory_items FOR UPDATE
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can delete inventory in their households"
  ON inventory_items FOR DELETE
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

-- ========================================
-- STEP 7: Create policies for user_preferences
-- ========================================

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT user_id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (
    user_id IN (
      SELECT user_id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- ========================================
-- STEP 8: Verify policies were created
-- ========================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- STEP 9: Test your access
-- ========================================

DO $$
DECLARE
  my_user_id UUID;
  my_email TEXT;
BEGIN
  -- Get your email
  my_email := auth.jwt() ->> 'email';
  
  -- Get your user_id
  SELECT user_id INTO my_user_id FROM users WHERE email = my_email;
  
  IF my_user_id IS NULL THEN
    RAISE NOTICE '❌ Your user record was not found in public.users';
  ELSE
    RAISE NOTICE '✅ Your user_id: %', my_user_id;
    RAISE NOTICE '✅ Your email: %', my_email;
    
    -- Check if you have a household
    IF EXISTS (
      SELECT 1 FROM household_members 
      WHERE user_id = my_user_id
    ) THEN
      RAISE NOTICE '✅ You are a member of a household';
    ELSE
      RAISE NOTICE '⚠️  You are not yet a member of any household';
      RAISE NOTICE '   The app will create one automatically when you add your first item';
    END IF;
  END IF;
END $$;

-- ========================================
-- DONE! RLS policies are now configured
-- ========================================

SELECT '✅ ✅ ✅ All RLS policies have been created!' as status;
SELECT 'Now refresh your app and try adding an item!' as next_step;

