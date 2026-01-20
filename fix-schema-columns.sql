-- =====================================================
-- FIX INVENTORY_ITEMS SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: Make household_id nullable (if it exists and is NOT NULL)
DO $$ 
BEGIN
    -- Check if household_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'household_id'
    ) THEN
        -- Make it nullable
        ALTER TABLE inventory_items ALTER COLUMN household_id DROP NOT NULL;
        RAISE NOTICE 'Made household_id nullable';
    END IF;
END $$;

-- STEP 2: Add missing columns for compatibility
DO $$ 
BEGIN
    -- Add 'name' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'name'
    ) THEN
        ALTER TABLE inventory_items ADD COLUMN name TEXT;
        UPDATE inventory_items SET name = custom_name WHERE name IS NULL AND custom_name IS NOT NULL;
        RAISE NOTICE 'Added name column';
    END IF;
    
    -- Add 'location' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'location'
    ) THEN
        ALTER TABLE inventory_items ADD COLUMN location TEXT DEFAULT 'pantry';
        UPDATE inventory_items SET location = storage_location WHERE location IS NULL AND storage_location IS NOT NULL;
        RAISE NOTICE 'Added location column';
    END IF;
    
    -- Add 'expiry_date' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'expiry_date'
    ) THEN
        ALTER TABLE inventory_items ADD COLUMN expiry_date DATE;
        UPDATE inventory_items SET expiry_date = expected_expiry_date WHERE expiry_date IS NULL AND expected_expiry_date IS NOT NULL;
        RAISE NOTICE 'Added expiry_date column';
    END IF;
    
    -- Add 'id' column if only 'item_id' exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'item_id'
    ) THEN
        ALTER TABLE inventory_items ADD COLUMN id UUID;
        UPDATE inventory_items SET id = item_id WHERE id IS NULL;
        RAISE NOTICE 'Added id column from item_id';
    END IF;
END $$;

-- STEP 3: Verify the columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;

-- =====================================================
-- OPTIONAL: If you want a FRESH SIMPLE SCHEMA
-- This will DELETE ALL DATA - only use if starting over!
-- =====================================================

/*
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS households CASCADE;
DROP TABLE IF EXISTS household_members CASCADE;

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    household_id UUID, -- Optional, nullable
    name TEXT NOT NULL,
    custom_name TEXT, -- Alias for compatibility
    quantity INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL DEFAULT 'other',
    location TEXT DEFAULT 'pantry',
    storage_location TEXT, -- Alias for compatibility
    purchase_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    expected_expiry_date DATE, -- Alias for compatibility
    price DECIMAL(10, 2),
    image_url TEXT,
    input_method TEXT DEFAULT 'manual',
    state TEXT DEFAULT 'stocked',
    added_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Simple policy: users can manage their own items
CREATE POLICY "Users can view own items" ON inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON inventory_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON inventory_items FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_inventory_user ON inventory_items(user_id);
CREATE INDEX idx_inventory_expiry ON inventory_items(expiry_date);
*/
