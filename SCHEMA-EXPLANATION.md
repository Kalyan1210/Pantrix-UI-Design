# Supabase Schema Explanation

## Overview

Your Supabase database has multiple schemas, but **only the `public` schema needs verification for your app code**. Here's why:

## Schema Breakdown

### ✅ `public` Schema - **YOUR APPLICATION DATA**
**Status**: ✅ **Needs verification**

This is where **all your application tables** live:
- `inventory_items` - Your inventory data
- `users` - User profiles
- `households` - Household management
- `household_members` - Household membership
- `shopping_lists` - Shopping lists
- `products` - Product catalog
- `receipts` - Receipt storage
- etc.

**Why verify?** Your code directly queries these tables using `.from('table_name')`, so the schema must match exactly.

---

### ℹ️ `auth` Schema - **SUPABASE AUTH SYSTEM**
**Status**: ℹ️ **System managed - no verification needed**

Contains Supabase's authentication tables:
- `auth.users` - Authentication users
- `auth.sessions` - User sessions
- `auth.identities` - OAuth/social identities
- `auth.refresh_tokens` - Refresh tokens

**Why no verification?** 
- You access this via `supabase.auth.*` methods, not direct SQL
- Supabase manages this schema automatically
- Your code uses `supabase.auth.signUp()`, `supabase.auth.getUser()`, etc.

**How it links to your app:**
- `auth.users.id` links to `public.users` via email matching
- Your code handles this in `src/lib/auth.ts`

---

### ℹ️ `storage` Schema - **SUPABASE STORAGE SYSTEM**
**Status**: ℹ️ **System managed - no verification needed**

Contains file storage metadata:
- `storage.buckets` - Storage buckets
- `storage.objects` - Stored files
- `storage.migrations` - Storage migrations

**Why no verification?**
- You access this via `supabase.storage.*` methods
- Supabase manages this automatically
- Not used in your current app code

---

### ℹ️ `realtime` Schema - **SUPABASE REALTIME SYSTEM**
**Status**: ℹ️ **System managed - no verification needed**

Contains real-time subscription data:
- `realtime.subscription` - Active subscriptions
- `realtime.messages` - Real-time messages
- `realtime.schema_migrations` - Realtime migrations

**Why no verification?**
- System managed by Supabase
- Used for real-time features (not currently in your app)
- You'd access via `supabase.channel()` if needed

---

### ℹ️ `vault` Schema - **SUPABASE VAULT (ENCRYPTION)**
**Status**: ℹ️ **System managed - no verification needed**

Contains encryption/secrets management:
- `vault.secrets` - Encrypted secrets
- `vault.keys` - Encryption keys

**Why no verification?**
- System managed by Supabase
- Not directly used in your app code
- Used for secure secret storage

---

## What This Means for Your App

### ✅ **You Only Need to Verify:**
- `public` schema tables and columns
- Foreign key relationships in `public` schema
- Row Level Security (RLS) policies on `public` tables

### ℹ️ **You Don't Need to Verify:**
- `auth` schema (accessed via `supabase.auth.*`)
- `storage` schema (accessed via `supabase.storage.*`)
- `realtime` schema (system managed)
- `vault` schema (system managed)

## Verification Scripts

### For App Code (Recommended):
- **`verify-schema.sql`** - Checks only `public` schema (what your code uses)

### For Complete Overview:
- **`verify-all-schemas.sql`** - Checks all schemas (for reference)

## Code Access Patterns

```typescript
// ✅ PUBLIC SCHEMA - Direct queries (needs verification)
const { data } = await supabase
  .from('inventory_items')  // public.inventory_items
  .select('*');

// ℹ️ AUTH SCHEMA - Via methods (no verification needed)
const { data } = await supabase.auth.getUser();  // auth.users

// ℹ️ STORAGE SCHEMA - Via methods (no verification needed)
const { data } = await supabase.storage
  .from('bucket-name')  // storage.objects
  .list();
```

## Summary

**For your application code:**
- ✅ Verify `public` schema only
- ℹ️ Other schemas are system-managed and accessed via Supabase methods

**The `verify-schema.sql` script is correct** - it only checks what your code directly queries!

