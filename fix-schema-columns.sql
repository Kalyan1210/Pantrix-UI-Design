-- =====================================================
-- FIX INVENTORY_ITEMS SCHEMA - Add missing 'name' column
-- Run this in Supabase SQL Editor
-- =====================================================

-- Check current columns
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'inventory_items';

-- OPTION 1: Add 'name' column if using legacy schema with 'custom_name'
-- This adds a simple 'name' column so the app works with both schemas

DO $$ 
BEGIN
    -- Add 'name' column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'name'
    ) THEN
        ALTER TABLE inventory_items ADD COLUMN name TEXT;
        
        -- Copy data from custom_name to name
        UPDATE inventory_items SET name = custom_name WHERE name IS NULL AND custom_name IS NOT NULL;
        
        RAISE NOTICE 'Added name column and copied data from custom_name';
    ELSE
        RAISE NOTICE 'name column already exists';
    END IF;
    
    -- Add 'location' column if it doesn't exist (might only have storage_location)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'location'
    ) THEN
        ALTER TABLE inventory_items ADD COLUMN location TEXT DEFAULT 'pantry';
        
        -- Copy from storage_location if exists
        UPDATE inventory_items SET location = storage_location WHERE location IS NULL AND storage_location IS NOT NULL;
        
        RAISE NOTICE 'Added location column';
    ELSE
        RAISE NOTICE 'location column already exists';
    END IF;
    
    -- Add 'expiry_date' column if it doesn't exist (might only have expected_expiry_date)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'expiry_date'
    ) THEN
        ALTER TABLE inventory_items ADD COLUMN expiry_date DATE;
        
        -- Copy from expected_expiry_date if exists
        UPDATE inventory_items SET expiry_date = expected_expiry_date WHERE expiry_date IS NULL AND expected_expiry_date IS NOT NULL;
        
        RAISE NOTICE 'Added expiry_date column';
    ELSE
        RAISE NOTICE 'expiry_date column already exists';
    END IF;
    
    -- Add 'id' column if only 'item_id' exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'id'
    ) THEN
        -- Check if item_id exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'inventory_items' AND column_name = 'item_id'
        ) THEN
            -- Add id as an alias/copy of item_id
            ALTER TABLE inventory_items ADD COLUMN id UUID;
            UPDATE inventory_items SET id = item_id WHERE id IS NULL;
            
            RAISE NOTICE 'Added id column from item_id';
        END IF;
    ELSE
        RAISE NOTICE 'id column already exists';
    END IF;
END $$;

-- Verify the columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;

-- =====================================================
-- ALTERNATIVE: If you want a fresh simple schema
-- Uncomment and run this if the above doesn't work
-- =====================================================

-- DROP TABLE IF EXISTS inventory_items CASCADE;
-- 
-- CREATE TABLE inventory_items (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--     name TEXT NOT NULL,
--     quantity INTEGER NOT NULL DEFAULT 1,
--     category TEXT NOT NULL DEFAULT 'other',
--     location TEXT NOT NULL DEFAULT 'pantry',
--     purchase_date DATE DEFAULT CURRENT_DATE,
--     expiry_date DATE,
--     price DECIMAL(10, 2),
--     image_url TEXT,
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- 
-- ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can manage own items" ON inventory_items
--     FOR ALL USING (auth.uid() = user_id);
-- 
-- CREATE INDEX idx_inventory_user ON inventory_items(user_id);
-- CREATE INDEX idx_inventory_expiry ON inventory_items(expiry_date);

