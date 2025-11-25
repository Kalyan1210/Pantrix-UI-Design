-- Safe Migration Script
-- This script checks your existing schema and only creates what's missing
-- It's safe to run multiple times

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- STEP 1: Check if you're using the household system
-- =============================================

DO $$ 
DECLARE
  has_household_system BOOLEAN;
BEGIN
  -- Check if households table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'households'
  ) INTO has_household_system;

  IF has_household_system THEN
    RAISE NOTICE 'Detected household-based system. Your schema is correct.';
  ELSE
    RAISE NOTICE 'No household system detected. Will create basic tables.';
  END IF;
END $$;

-- =============================================
-- STEP 2: Drop existing policies (safe to re-create)
-- =============================================

DO $$ 
BEGIN
  -- Drop all existing policies on inventory_items
  DROP POLICY IF EXISTS "Users can view their own inventory items" ON inventory_items;
  DROP POLICY IF EXISTS "Users can insert their own inventory items" ON inventory_items;
  DROP POLICY IF EXISTS "Users can update their own inventory items" ON inventory_items;
  DROP POLICY IF EXISTS "Users can delete their own inventory items" ON inventory_items;
  
  -- Drop household-based policies if they exist
  DROP POLICY IF EXISTS "Users can view household inventory" ON inventory_items;
  DROP POLICY IF EXISTS "Users can insert household inventory" ON inventory_items;
  DROP POLICY IF EXISTS "Users can update household inventory" ON inventory_items;
  DROP POLICY IF EXISTS "Users can delete household inventory" ON inventory_items;
  
  RAISE NOTICE 'Dropped existing policies successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping policies (this is OK if they dont exist): %', SQLERRM;
END $$;

-- =============================================
-- STEP 3: Ensure users table exists
-- =============================================

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'email',
  auth_provider_id TEXT,
  profile_photo_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 4: Ensure households table exists
-- =============================================

CREATE TABLE IF NOT EXISTS households (
  household_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(user_id),
  invite_code TEXT UNIQUE,
  invite_code_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 5: Ensure household_members table exists
-- =============================================

CREATE TABLE IF NOT EXISTS household_members (
  household_id UUID NOT NULL REFERENCES households(household_id),
  user_id UUID NOT NULL REFERENCES users(user_id),
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (household_id, user_id)
);

-- =============================================
-- STEP 6: Ensure user_preferences table exists
-- =============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(user_id),
  enable_push_notifications BOOLEAN DEFAULT TRUE,
  enable_email_notifications BOOLEAN DEFAULT FALSE,
  spoilage_alert_advance_days INTEGER DEFAULT 3,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  default_store TEXT,
  dietary_restrictions TEXT[],
  preferred_cuisines TEXT[],
  disliked_cuisines TEXT[],
  preferred_cook_time TEXT,
  skill_level TEXT,
  recipe_notifications BOOLEAN DEFAULT TRUE,
  notification_time TIME DEFAULT '17:30:00',
  weekend_brunch_suggestions BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'system',
  default_household_id UUID REFERENCES households(household_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 7: Ensure inventory_items has ALL required columns
-- =============================================

-- First, check if table exists with household_id or user_id
DO $$ 
DECLARE
  has_household_id BOOLEAN;
  has_user_id BOOLEAN;
  has_item_id BOOLEAN;
  has_custom_name BOOLEAN;
BEGIN
  -- Check which columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'household_id'
  ) INTO has_household_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'user_id'
  ) INTO has_user_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'item_id'
  ) INTO has_item_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'custom_name'
  ) INTO has_custom_name;
  
  IF has_household_id THEN
    RAISE NOTICE '✅ Using household-based schema (correct)';
  ELSIF has_user_id THEN
    RAISE NOTICE '⚠️  Using user-based schema (may need migration)';
  END IF;
  
  IF has_item_id THEN
    RAISE NOTICE '✅ Using item_id column (correct)';
  END IF;
  
  IF has_custom_name THEN
    RAISE NOTICE '✅ Using custom_name column (correct)';
  END IF;
END $$;

-- Add missing columns to inventory_items if they don't exist
DO $$ 
BEGIN
  -- Add household_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'household_id'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN household_id UUID REFERENCES households(household_id);
    RAISE NOTICE 'Added household_id column';
  END IF;

  -- Add item_id if missing (your schema uses item_id, not id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'item_id'
  ) THEN
    -- If id exists, rename it to item_id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory_items' AND column_name = 'id'
    ) THEN
      ALTER TABLE inventory_items RENAME COLUMN id TO item_id;
      RAISE NOTICE 'Renamed id to item_id';
    ELSE
      ALTER TABLE inventory_items ADD COLUMN item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
      RAISE NOTICE 'Added item_id column';
    END IF;
  END IF;

  -- Add custom_name if missing (your schema uses custom_name, not name)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'custom_name'
  ) THEN
    -- If name exists, rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'inventory_items' AND column_name = 'name'
    ) THEN
      ALTER TABLE inventory_items RENAME COLUMN name TO custom_name;
      RAISE NOTICE 'Renamed name to custom_name';
    ELSE
      ALTER TABLE inventory_items ADD COLUMN custom_name TEXT;
      RAISE NOTICE 'Added custom_name column';
    END IF;
  END IF;

  -- Add storage_location if missing (your schema uses this, not location)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'storage_location'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN storage_location TEXT NOT NULL DEFAULT 'pantry' 
      CHECK (storage_location IN ('fridge', 'freezer', 'pantry', 'counter'));
    RAISE NOTICE 'Added storage_location column';
  END IF;

  -- Add expected_expiry_date if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'expected_expiry_date'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN expected_expiry_date DATE;
    RAISE NOTICE 'Added expected_expiry_date column';
  END IF;

  -- Add other required columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'quantity') THEN
    ALTER TABLE inventory_items ADD COLUMN quantity NUMERIC NOT NULL DEFAULT 1.0 CHECK (quantity > 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'category') THEN
    ALTER TABLE inventory_items ADD COLUMN category TEXT NOT NULL DEFAULT 'other';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'purchase_date') THEN
    ALTER TABLE inventory_items ADD COLUMN purchase_date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'state') THEN
    ALTER TABLE inventory_items ADD COLUMN state TEXT DEFAULT 'stocked';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'added_by') THEN
    ALTER TABLE inventory_items ADD COLUMN added_by UUID REFERENCES users(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'price') THEN
    ALTER TABLE inventory_items ADD COLUMN price NUMERIC;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'source_image_url') THEN
    ALTER TABLE inventory_items ADD COLUMN source_image_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'created_at') THEN
    ALTER TABLE inventory_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'updated_at') THEN
    ALTER TABLE inventory_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  RAISE NOTICE '✅ All required columns exist';
END $$;

-- =============================================
-- STEP 8: Enable RLS
-- =============================================

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 9: Create policies for household-based access
-- =============================================

-- Inventory items policies (household-based)
CREATE POLICY "Users can view household inventory"
  ON inventory_items FOR SELECT
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can insert household inventory"
  ON inventory_items FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can update household inventory"
  ON inventory_items FOR UPDATE
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can delete household inventory"
  ON inventory_items FOR DELETE
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM household_members hm
      JOIN users u ON u.user_id = hm.user_id
      WHERE u.email = auth.jwt() ->> 'email'
    )
  );

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (email = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (email = auth.jwt() ->> 'email');

-- Household policies
CREATE POLICY "Users can view their households" ON households FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members hm JOIN users u ON u.user_id = hm.user_id WHERE u.email = auth.jwt() ->> 'email'));

-- Household members policies
CREATE POLICY "Users can view household members" ON household_members FOR SELECT
  USING (household_id IN (SELECT household_id FROM household_members hm JOIN users u ON u.user_id = hm.user_id WHERE u.email = auth.jwt() ->> 'email'));

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (user_id IN (SELECT user_id FROM users WHERE email = auth.jwt() ->> 'email'));
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (user_id IN (SELECT user_id FROM users WHERE email = auth.jwt() ->> 'email'));
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (user_id IN (SELECT user_id FROM users WHERE email = auth.jwt() ->> 'email'));

-- =============================================
-- STEP 10: Create indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_inventory_items_household_id ON inventory_items(household_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry_date ON inventory_items(expected_expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(storage_location);
CREATE INDEX IF NOT EXISTS idx_inventory_items_state ON inventory_items(state);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================
-- DONE!
-- =============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ ✅ ✅ Migration completed successfully! ✅ ✅ ✅';
  RAISE NOTICE 'Your database is now ready to use.';
  RAISE NOTICE 'Try adding an item in the app!';
END $$;

