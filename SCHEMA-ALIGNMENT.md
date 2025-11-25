# Database Schema Alignment

This document shows how the code is aligned with your actual database schema.

## Current Code Expectations

Based on your schema information, the code expects the following structure:

### ✅ inventory_items Table
- **Primary Key**: `item_id` (UUID)
- **Required Fields**:
  - `household_id` (UUID) - Links to households table
  - `custom_name` (TEXT) - Item name
  - `quantity` (NUMERIC) - Item quantity
  - `category` (TEXT) - Item category
  - `storage_location` (TEXT) - Location: 'fridge', 'freezer', 'pantry', 'counter'
  - `purchase_date` (DATE) - Purchase date
  - `expected_expiry_date` (DATE) - Expiry date
  - `state` (TEXT) - Item state (default: 'stocked')
- **Optional Fields**:
  - `product_id` (UUID) - Links to products table
  - `unit` (TEXT) - Unit of measurement
  - `price` (NUMERIC) - Item price
  - `image_url` (TEXT) - Image URL
  - `source_image_url` (TEXT) - Source image URL
  - `added_by` (UUID) - User who added the item
  - `input_method` (TEXT) - How item was added (manual/receipt_scan)
  - `spoilage_urgency_score` (INTEGER) - Urgency score
  - `used_up_at` (TIMESTAMP) - When item was used
  - `user_id` (UUID) - Optional, also exists
  - `location` (TEXT) - Optional, duplicate of storage_location
  - `expiry_date` (DATE) - Optional, duplicate of expected_expiry_date
- **Timestamps**:
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

### ✅ users Table
- **Primary Key**: `user_id` (UUID)
- **Required Fields**:
  - `email` (TEXT) - User email (unique)
  - `display_name` (TEXT) - User display name
- **Optional Fields**:
  - `auth_provider` (TEXT) - Auth provider (default: 'email')
  - `profile_photo_url` (TEXT) - Profile photo
  - `email_verified` (BOOLEAN) - Email verification status
  - `password_hash` (TEXT) - Password hash (if using email auth)
- **Timestamps**:
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
  - `last_login_at` (TIMESTAMP)

### ✅ households Table
- **Primary Key**: `household_id` (UUID)
- **Required Fields**:
  - `household_name` (TEXT) - Household name
  - `created_by` (UUID) - User who created the household
- **Optional Fields**:
  - `invite_code` (TEXT) - Invite code (unique)
  - `invite_code_expires_at` (TIMESTAMP) - Invite expiration
- **Timestamps**:
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

### ✅ household_members Table
- **Primary Key**: Composite (`household_id`, `user_id`)
- **Required Fields**:
  - `household_id` (UUID) - Foreign key to households
  - `user_id` (UUID) - Foreign key to users
  - `role` (TEXT) - Member role (default: 'member')
- **Timestamps**:
  - `joined_at` (TIMESTAMP)

## Code Mapping

The code uses these mappings:

### Database → UI Mapping
```typescript
// Database field → UI field
item_id → id
custom_name → name
storage_location → location (primary)
location → location (fallback)
expected_expiry_date → expiry_date (primary)
expiry_date → expiry_date (fallback)
image_url → image_url (primary)
source_image_url → image_url (fallback)
```

### Field Priority
1. **Name**: `custom_name` (required)
2. **Location**: `storage_location` → `location` (fallback)
3. **Expiry**: `expected_expiry_date` → `expiry_date` (fallback)
4. **Image**: `image_url` → `source_image_url` (fallback)

## Verification Steps

1. Run `verify-schema.sql` in Supabase SQL Editor
2. Check that all ✅ fields exist
3. Verify foreign key relationships
4. Test adding an item in the app

## Code Files

- `src/lib/supabase.ts` - Type definitions and mapping functions
- `src/lib/inventory.ts` - CRUD operations
- `src/lib/auth.ts` - Authentication with public.users linking

## Notes

- The code handles both `storage_location` and `location` columns (uses `storage_location` first)
- The code handles both `expected_expiry_date` and `expiry_date` columns (uses `expected_expiry_date` first)
- Households are automatically created for new users
- Users are linked between `auth.users` and `public.users` via email matching

