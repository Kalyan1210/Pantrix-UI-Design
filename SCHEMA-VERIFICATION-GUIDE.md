# Schema Verification Guide

This guide will help you verify that your database schema matches what the code expects.

## Quick Verification Steps

### Step 1: Run SQL Verification Script

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the entire contents of `verify-schema.sql`
4. Click **Run**
5. Review the results - all ✅ items should be present

### Step 2: Test Database Connection

Run the test script to verify connectivity:

```bash
# Install dependencies if needed
npm install

# Run the test script
npx tsx test-database-connection.ts
```

This will:
- ✅ Test database connection
- ✅ Verify all tables are accessible
- ✅ Check authentication
- ✅ Show any errors

### Step 3: Test in the App

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Sign in or create an account

3. Try adding an item:
   - Click "Add Item" from home screen
   - Fill in the form
   - Click "Add to Inventory"

4. Check for errors:
   - Open browser console (F12)
   - Look for any red error messages
   - Check Network tab for failed API calls

## Expected Schema Structure

### ✅ inventory_items Table
Must have these columns:
- `item_id` (UUID, PRIMARY KEY)
- `household_id` (UUID, NOT NULL)
- `custom_name` (TEXT)
- `quantity` (NUMERIC)
- `category` (TEXT)
- `storage_location` (TEXT) - Values: 'fridge', 'freezer', 'pantry', 'counter'
- `purchase_date` (DATE)
- `expected_expiry_date` (DATE)
- `state` (TEXT) - Default: 'stocked'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

Optional columns (code handles these):
- `user_id` (UUID)
- `location` (TEXT)
- `expiry_date` (DATE)
- `price` (NUMERIC)
- `image_url` (TEXT)
- `source_image_url` (TEXT)

### ✅ users Table
Must have:
- `user_id` (UUID, PRIMARY KEY)
- `email` (TEXT, UNIQUE)
- `display_name` (TEXT)

### ✅ households Table
Must have:
- `household_id` (UUID, PRIMARY KEY)
- `household_name` (TEXT)
- `created_by` (UUID)

### ✅ household_members Table
Must have:
- `household_id` (UUID)
- `user_id` (UUID)
- `role` (TEXT)

## Common Issues and Fixes

### Issue: "column does not exist"
**Fix**: Run `fix-schema.sql` in Supabase SQL Editor to add missing columns

### Issue: "permission denied"
**Fix**: Check Row Level Security (RLS) policies in Supabase Dashboard

### Issue: "foreign key constraint"
**Fix**: Ensure all referenced tables exist and foreign keys are set up correctly

### Issue: "household not found"
**Fix**: The code automatically creates households, but check that `household_members` table exists

## Verification Checklist

- [ ] All tables exist (inventory_items, users, households, household_members)
- [ ] All required columns exist in inventory_items
- [ ] Foreign key relationships are set up
- [ ] RLS policies are enabled
- [ ] Test connection script runs successfully
- [ ] Can add an item in the app
- [ ] Can view items in inventory screen
- [ ] No console errors

## Getting Help

If you encounter issues:

1. **Check the error message** - It usually tells you what's missing
2. **Run verify-schema.sql** - See exactly what columns exist
3. **Check browser console** - Look for detailed error messages
4. **Check Supabase logs** - Go to Dashboard → Logs → API Logs

## Code Files Reference

- `src/lib/supabase.ts` - Type definitions and field mappings
- `src/lib/inventory.ts` - Database operations
- `src/lib/auth.ts` - Authentication and user linking
- `verify-schema.sql` - SQL verification script
- `fix-schema.sql` - SQL script to add missing columns

