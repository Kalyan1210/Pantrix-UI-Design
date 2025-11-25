# Database Schema Fix

## Issue
The error shows: `column "inventory_items.user_id does not exist`

This means your Supabase database table doesn't have the `user_id` column yet.

## Solution

### Option 1: Run the Schema SQL (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to execute

This will create the table with the correct structure including the `user_id` column.

### Option 2: Check Your Current Table Structure

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Check the `inventory_items` table
4. See what columns exist

If the table has different column names, you may need to:
- Rename columns to match the schema
- Or update the code to match your existing structure

### Option 3: Drop and Recreate (If you have no important data)

```sql
-- Drop existing table (WARNING: This deletes all data!)
DROP TABLE IF EXISTS inventory_items CASCADE;

-- Then run the full schema from supabase-schema.sql
```

## Verify the Fix

After running the schema, verify the table has these columns:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to auth.users)
- `name` (TEXT)
- `quantity` (INTEGER)
- `category` (TEXT)
- `location` (TEXT)
- `purchase_date` (DATE)
- `expiry_date` (DATE)
- `price` (DECIMAL)
- `image_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## After Fixing

1. Refresh your app
2. Try adding an item again
3. The error should be gone

