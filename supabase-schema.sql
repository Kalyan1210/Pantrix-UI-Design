-- ============================================
-- Pantrix Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. INVENTORY_ITEMS TABLE
-- Main table for storing pantry items
-- ============================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory items" ON inventory_items;

-- Create or update inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT 'other',
  location TEXT NOT NULL DEFAULT 'pantry' CHECK (location IN ('fridge', 'freezer', 'pantry', 'counter')),
  purchase_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  price DECIMAL(10, 2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add any missing columns to existing table
DO $$ 
BEGIN
  -- Add category column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'category'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN category TEXT NOT NULL DEFAULT 'other';
  END IF;

  -- Add location column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'location'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN location TEXT DEFAULT 'pantry';
  END IF;

  -- Add purchase_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'purchase_date'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN purchase_date DATE DEFAULT CURRENT_DATE;
  END IF;

  -- Add expiry_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'expiry_date'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN expiry_date DATE;
  END IF;

  -- Add price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'price'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN price DECIMAL(10, 2);
  END IF;

  -- Add image_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN image_url TEXT;
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry_date ON inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(location);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Users can only access their own items
CREATE POLICY "Users can view their own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory items"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. USER_PREFERENCES TABLE (Optional)
-- For storing user settings
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enable_push_notifications BOOLEAN DEFAULT true,
  enable_email_notifications BOOLEAN DEFAULT false,
  spoilage_alert_advance_days INTEGER DEFAULT 3,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DONE! Your database is ready.
-- ============================================

-- To verify the setup, run:
-- SELECT * FROM inventory_items LIMIT 1;
-- SELECT * FROM user_preferences LIMIT 1;
