# Manual Testing Guide

This guide will help you test all features of the Pantrix app manually.

## 🚀 Quick Start

### 1. Start the Development Server

```bash
# Install dependencies (if not already done)
npm install

# Start the app
npm run dev
```

The app will open at `http://localhost:3000`

### 2. Start the API Proxy (for receipt scanning)

**Important**: The receipt scanning feature requires the proxy server to work.

```bash
# In a separate terminal, start the proxy
npm run proxy

# OR start both together
npm run dev:all
```

## 📋 Testing Checklist

### ✅ Authentication Tests

#### Sign Up
- [ ] Go to the app
- [ ] Click "Get Started" or "Sign Up"
- [ ] Fill in:
  - Full Name
  - Email
  - Password (at least 6 characters)
  - Confirm Password
- [ ] Click "Create Account"
- [ ] **Expected**: Success message, redirected to onboarding or home
- [ ] **Check**: User appears in Supabase `auth.users` table
- [ ] **Check**: User appears in `public.users` table

#### Sign In
- [ ] Click "Sign In"
- [ ] Enter email and password
- [ ] Click "Sign In"
- [ ] **Expected**: Success message, redirected to home screen
- [ ] **Check**: Your name appears in the header (not "Doe")

#### Sign Out
- [ ] Go to Settings
- [ ] Click "Sign Out"
- [ ] **Expected**: Redirected to welcome/login screen

---

### ✅ Home Screen Tests

- [ ] **Check Stats Cards**:
  - [ ] "Expiring Today" shows correct count
  - [ ] "Running Low" shows correct count
  - [ ] "Total Items" shows correct count
  - [ ] All cards are clickable

- [ ] **Check Quick Actions**:
  - [ ] "Scan Receipt" button works
  - [ ] "Add Item" button navigates to Add Item screen
  - [ ] "Shopping List" button works

- [ ] **Check Navigation**:
  - [ ] Bottom nav shows all icons
  - [ ] Home icon is highlighted
  - [ ] Can navigate to Inventory, Shopping, Settings

---

### ✅ Add Item Tests

#### Manual Item Addition
- [ ] Click "Add Item" from home or inventory
- [ ] **Fill in the form**:
  - [ ] Item Name: "Milk"
  - [ ] Quantity: Use +/- buttons or type
  - [ ] Category: Select "Dairy"
  - [ ] Location: Select "Fridge"
  - [ ] Expiry Date: Select a future date
  - [ ] Price: Enter "3.99" (optional)
- [ ] Click "Add to Inventory"
- [ ] **Expected**: Success toast, item added to inventory
- [ ] **Check**: Item appears in Inventory screen
- [ ] **Check**: Item appears in Supabase `inventory_items` table

#### Scan Receipt Option
- [ ] Click "Scan Receipt" button in Add Item screen
- [ ] **Expected**: Navigates to camera/receipt scan screen

---

### ✅ Inventory Screen Tests

- [ ] **View Items**:
  - [ ] All items are displayed
  - [ ] Items show correct name, quantity, location
  - [ ] Expiry dates are shown correctly

- [ ] **Search**:
  - [ ] Type in search box
  - [ ] **Expected**: Items filter as you type

- [ ] **Filters**:
  - [ ] Click "All Items" - shows all items
  - [ ] Click "Expiring Soon" - shows only expiring items
  - [ ] Click "Running Low" - shows only low quantity items

- [ ] **Location Tabs**:
  - [ ] Click "Fridge" tab - shows only fridge items
  - [ ] Click "Freezer" tab - shows only freezer items
  - [ ] Click "Pantry" tab - shows only pantry items
  - [ ] Click "Counter" tab - shows only counter items

- [ ] **Add Item Button**:
  - [ ] Click the green + button (bottom right)
  - [ ] **Expected**: Navigates to Add Item screen

- [ ] **Item Details**:
  - [ ] Click on an item
  - [ ] **Expected**: Shows item detail screen

---

### ✅ Receipt Scanning Tests

**Prerequisites**: Make sure proxy server is running (`npm run proxy`)

#### Scan Receipt
- [ ] Click "Scan Receipt" from home or Add Item screen
- [ ] **Camera Permissions**:
  - [ ] Grant camera permission if prompted
  - [ ] **Expected**: Camera view appears

- [ ] **Take Photo**:
  - [ ] Position receipt in frame
  - [ ] Click capture button
  - [ ] **Expected**: "Analyzing Image" appears
  - [ ] **Expected**: Receipt items are extracted

- [ ] **Review Items**:
  - [ ] Check extracted items list
  - [ ] Edit item names if needed
  - [ ] Adjust quantities
  - [ ] Change categories
  - [ ] Delete unwanted items
  - [ ] Click "Add to Inventory"
  - [ ] **Expected**: All items added to inventory

#### Scan Product
- [ ] Click "Scan Receipt" (or use camera)
- [ ] Take photo of a single product (packaging)
- [ ] **Expected**: Product detected (not receipt)
- [ ] **Expected**: Product name, category, expiry extracted
- [ ] Click "Add to Inventory"
  - [ ] **Expected**: Single product added

#### Gallery Upload
- [ ] Click gallery button
- [ ] Select a receipt/product image
- [ ] **Expected**: Image is analyzed
- [ ] **Expected**: Items are extracted

---

### ✅ Shopping List Tests

- [ ] Navigate to Shopping List
- [ ] **Check**: List is displayed
- [ ] **Add Item**:
  - [ ] Click + button
  - [ ] Add item to list
  - [ ] **Expected**: Item appears in list
- [ ] **Check/Uncheck Items**:
  - [ ] Click checkbox
  - [ ] **Expected**: Item is marked complete/incomplete

---

### ✅ Settings Tests

- [ ] Navigate to Settings
- [ ] **Check User Info**:
  - [ ] Your name is displayed (not "Doe")
  - [ ] Your email is displayed
  - [ ] Initials are shown correctly
- [ ] **Sign Out**:
  - [ ] Click Sign Out
  - [ ] **Expected**: Logged out, redirected to login

---

### ✅ Error Handling Tests

#### Network Errors
- [ ] Disconnect internet
- [ ] Try to add an item
- [ ] **Expected**: Error message shown
- [ ] **Expected**: Retry option available

#### Invalid Input
- [ ] Try to add item without name
- [ ] **Expected**: Error message "Please enter an item name"
- [ ] Try to sign in with wrong password
- [ ] **Expected**: Error message shown

#### Camera Errors
- [ ] Deny camera permission
- [ ] Try to scan receipt
- [ ] **Expected**: Permission error message

---

## 🔍 Browser Console Checks

While testing, open browser console (F12) and check:

- [ ] **No Red Errors**: Should see no red error messages
- [ ] **Network Tab**: API calls should return 200 status
- [ ] **Console Logs**: Check for any warnings

---

## 🗄️ Database Verification

After adding items, verify in Supabase:

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Check `inventory_items` table:
   - [ ] Items have correct `custom_name`
   - [ ] Items have correct `household_id`
   - [ ] Items have correct `storage_location`
   - [ ] Items have correct `category`
   - [ ] Items have correct `quantity`

4. Check `households` table:
   - [ ] Household was created for your user
   - [ ] Household name is correct

5. Check `household_members` table:
   - [ ] You are a member of the household
   - [ ] Your role is "admin"

---

## 🐛 Common Issues & Solutions

### Issue: "Connection error" when scanning
**Solution**: Make sure proxy server is running (`npm run proxy`)

### Issue: Items not appearing
**Solution**: 
- Check browser console for errors
- Verify you're signed in
- Check Supabase RLS policies

### Issue: "Failed to add item"
**Solution**:
- Check database schema matches (run `verify-schema.sql`)
- Check browser console for specific error
- Verify all required columns exist

### Issue: Name shows as "Doe"
**Solution**:
- Sign out and sign in again
- Check `public.users` table has your `display_name`

---

## 📊 Test Results Template

Use this to track your testing:

```
Date: ___________
Tester: ___________

Authentication: [ ] Pass [ ] Fail
Home Screen: [ ] Pass [ ] Fail
Add Item: [ ] Pass [ ] Fail
Inventory: [ ] Pass [ ] Fail
Receipt Scanning: [ ] Pass [ ] Fail
Shopping List: [ ] Pass [ ] Fail
Settings: [ ] Pass [ ] Fail

Issues Found:
1. 
2. 
3. 
```

---

## 🎯 Quick Test Commands

```bash
# Run automated tests
npm run test:run

# Test database connection
npm run test:db

# Start app
npm run dev

# Start app + proxy
npm run dev:all
```

---

## ✅ Success Criteria

Your app is working correctly if:
- ✅ You can sign up and sign in
- ✅ You can add items manually
- ✅ You can scan receipts (with proxy running)
- ✅ Items appear in inventory
- ✅ Filters work correctly
- ✅ No console errors
- ✅ All navigation works
- ✅ Your name appears (not "Doe")

Happy Testing! 🎉

