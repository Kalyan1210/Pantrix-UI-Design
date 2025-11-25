# Browser Testing Guide - Pantrix Mobile App

## 🎯 Purpose
This guide will help you test the Pantrix mobile app as if you were using it on an iPhone. We'll test every feature systematically and identify what works and what doesn't.

---

## ✅ Pre-Testing Setup

### Servers Status
- ✅ Dev Server: **http://localhost:3000/**
- ✅ API Proxy: **http://localhost:3001/**
- ✅ Credentials: Loaded from `.env` file
- ✅ Model Fix: Updated from `claude-3-5-sonnet-20241022` to `claude-3-5-sonnet-20240620`

### Before You Start
1. **Open Chrome/Firefox** in a new window
2. **Open Developer Tools** (Press F12 or Right-click → Inspect)
3. **Switch to Mobile View**:
   - Click the device icon in DevTools (looks like a phone)
   - Select "iPhone 12 Pro" or similar from the dropdown
   - This will make the app look like a mobile app
4. **Open the Console tab** in DevTools to watch for errors

---

## 📱 Testing Scenarios

## Part 1: Authentication & Onboarding (15 minutes)

### Test 1.1: Welcome Screen
**URL:** http://localhost:3000/

**What to check:**
- [ ] Page loads without errors
- [ ] "Welcome" screen appears
- [ ] App logo visible
- [ ] "Get Started" button visible

**Console Check:** Look for errors in red

**Expected Result:** Clean welcome screen with no console errors

**If it fails:**
- Screenshot the error
- Copy console error messages

---

### Test 1.2: Sign Up Flow
**Action:** Click "Get Started" → "Sign Up"

**What to do:**
1. Enter test email: `test@pantrix.com`
2. Enter password: `Test1234!`
3. Enter name: `Test User`
4. Click "Sign Up"

**What to check:**
- [ ] Sign up form appears
- [ ] Can type in all fields
- [ ] "Sign Up" button works
- [ ] Loading indicator appears
- [ ] Success or error message appears

**Console Check:** Watch for Supabase errors

**Expected Result:**
- Success: Redirects to onboarding screen
- Possible error: "User already exists" (if you tested before)

**If it fails:**
- Note the exact error message
- Check if error mentions:
  - "fetch failed" → Database connection issue
  - "relation does not exist" → Database tables missing
  - "Invalid credentials" → API key issue

---

### Test 1.3: Login Flow (if signup worked)
**Action:** If signup succeeded, log out and try logging in

**What to do:**
1. Go to Settings → Sign Out (if you can)
2. Or refresh page to get back to welcome
3. Click "Login"
4. Enter same email/password from signup
5. Click "Sign In"

**What to check:**
- [ ] Login form appears
- [ ] Credentials are accepted
- [ ] Redirects to home screen

**Expected Result:** Successfully logs in and shows home screen

---

### Test 1.4: Onboarding (First-time setup)
**Action:** After signup, onboarding should appear

**What to check:**
- [ ] Onboarding screens appear
- [ ] Can swipe/click through screens
- [ ] "Complete" button works
- [ ] Redirects to home screen

**Expected Result:** Smooth onboarding flow, lands on home screen

---

## Part 2: Home Screen & Dashboard (10 minutes)

### Test 2.1: Home Screen
**URL:** Should be at home after login/onboarding

**What to check:**
- [ ] Home screen loads
- [ ] Stats cards visible (Expiring Today, Running Low, Total Items)
- [ ] Stats show numbers (might be 0 if no data)
- [ ] Quick actions visible (Scan Receipt, Add Item, Shopping List)
- [ ] Recent activity section visible
- [ ] Navigation bar at bottom visible
- [ ] Notification bell icon visible

**Console Check:** Look for inventory loading errors

**Expected Result:**
- If database tables exist: Stats load correctly
- If tables missing: Console shows "relation does not exist" errors

---

### Test 2.2: Navigation Bar
**Action:** Test all bottom navigation tabs

**What to check:**
- [ ] Click "Home" → Goes to home
- [ ] Click "Inventory" → Shows inventory screen
- [ ] Click "Scan" → Shows camera/scan screen
- [ ] Click "Shopping" → Shows shopping list
- [ ] Click "Settings" → Shows settings screen

**Expected Result:** All tabs navigate correctly

---

## Part 3: Inventory Management (20 minutes)

### Test 3.1: Add Item Manually
**Action:** Home → Click "Add Item" button

**What to do:**
1. Fill in item details:
   - Name: `Milk`
   - Quantity: `1`
   - Category: Select `Dairy`
   - Location: Select `Fridge`
   - Purchase Date: Today's date
   - Expiry Date: Tomorrow's date
   - Price: `3.99` (optional)
2. Click "Save"

**What to check:**
- [ ] Add item form appears
- [ ] All fields are editable
- [ ] Dropdowns work (category, location)
- [ ] Date pickers work
- [ ] Save button works
- [ ] Success message appears
- [ ] Redirects to inventory

**Console Check:** Watch for database insert errors

**Expected Result:**
- Success: Item saved, appears in inventory
- Failure: Error message about database

---

### Test 3.2: View Inventory
**Action:** Navigate to Inventory tab

**What to check:**
- [ ] Inventory screen loads
- [ ] Search bar visible
- [ ] Filter buttons visible (All Items, Expiring Soon, Running Low)
- [ ] Storage tabs visible (All, Fridge, Freezer, Pantry, Counter)
- [ ] Items appear in list (if you added any)
- [ ] Each item shows: name, quantity, expiry days, category

**What to test:**
1. **Search:** Type "milk" in search → Should filter items
2. **Filters:** Click "Expiring Soon" → Should show only items expiring in 5 days
3. **Location Tabs:** Click "Fridge" → Should show only fridge items

**Expected Result:** All filtering and search works

---

### Test 3.3: Item Details
**Action:** Click on an inventory item

**What to check:**
- [ ] Item detail screen appears
- [ ] Shows all item information
- [ ] "Edit" button visible
- [ ] "Delete" button visible
- [ ] "Add to Shopping List" button visible
- [ ] Back button works

**What to test:**
1. Click "Edit" → Should allow editing
2. Click "Delete" → Should ask for confirmation, then delete
3. Click "Add to Shopping List" → Should add to list

**Expected Result:** Can view, edit, and delete items

---

### Test 3.4: Edit Item
**Action:** From item details, click "Edit"

**What to do:**
1. Change quantity from 1 to 2
2. Change expiry date to a different date
3. Click "Save"

**What to check:**
- [ ] Edit form pre-filled with current values
- [ ] Can modify fields
- [ ] Save button works
- [ ] Changes are saved
- [ ] Updated values appear in inventory

**Expected Result:** Item updates successfully

---

## Part 4: Receipt Scanning (15 minutes)

### Test 4.1: Camera Access
**Action:** Home → Click "Scan Receipt" or use Scan tab

**What to check:**
- [ ] Camera permission prompt appears
- [ ] Click "Allow"
- [ ] Camera view appears
- [ ] Can see camera feed

**Browser Note:** Camera only works on HTTPS or localhost

**If camera doesn't work:**
- Try clicking the camera icon in browser address bar
- Check browser settings → Site permissions

---

### Test 4.2: Upload Receipt Image
**Action:** On scan screen, click "Gallery" or upload button

**What to do:**
1. Download a sample receipt image from internet
2. Click gallery/upload button
3. Select the receipt image
4. Wait for analysis

**What to check:**
- [ ] Upload button works
- [ ] File picker opens
- [ ] Image uploads
- [ ] Loading indicator appears
- [ ] Analysis completes (this will take 10-30 seconds)

**Console Check:** Watch for:
- Anthropic API errors
- Model errors
- CORS errors

**Expected Result:**
- **Success:** Items extracted from receipt, review screen appears
- **404 Error:** Model name still wrong (check console)
- **CORS Error:** Proxy not working (should not happen since we started proxy)
- **Network Error:** Anthropic API key issue

**If it works:**
- [ ] Extracted items appear
- [ ] Each item shows: name, quantity, price, category
- [ ] Confidence level shown (high/medium/low)
- [ ] Can edit items before saving
- [ ] "Add All to Inventory" button works

---

### Test 4.3: Product Scanning
**Action:** On scan screen, try scanning individual product

**What to do:**
1. Take photo or upload image of a single product
2. Wait for analysis

**What to check:**
- [ ] Same as receipt scanning
- [ ] Product name extracted
- [ ] Category detected
- [ ] Expiry date detected (if visible on package)
- [ ] Item details pre-filled in add form

**Expected Result:** Product details extracted and ready to save

---

## Part 5: Shopping List (10 minutes)

### Test 5.1: View Shopping List
**Action:** Navigate to Shopping tab

**What to check:**
- [ ] Shopping list screen loads
- [ ] Shows count of items to buy
- [ ] Items grouped by category
- [ ] Each item shows: name, quantity, reason (expiring/low/manual)
- [ ] Checkboxes work
- [ ] Shared household indicator visible

**What to test:**
1. Check an item → Should move to completed section
2. Uncheck an item → Should move back to active
3. Share button → Should work (may show share dialog)

**Expected Result:** Shopping list functional with mock data

**Note:** Shopping list may have hardcoded mock data or real database data

---

### Test 5.2: Add to Shopping List
**Action:** From inventory, add item to shopping list

**What to do:**
1. Go to Inventory
2. Click an item
3. Click "Add to Shopping List"
4. Go to Shopping tab

**What to check:**
- [ ] Item appears in shopping list
- [ ] Shows correct quantity
- [ ] Shows reason "manual"

**Expected Result:** Item added successfully

---

## Part 6: Settings & Profile (15 minutes)

### Test 6.1: Settings Screen
**Action:** Navigate to Settings tab

**What to check:**
- [ ] Settings screen loads
- [ ] Profile section shows:
  - User name
  - Email address
  - Profile picture placeholder or photo
- [ ] Settings sections visible:
  - Notifications
  - Appearance
  - Household
  - Support

**What to test:**
1. **Dark Mode Toggle:**
   - [ ] Switch works
   - [ ] Theme changes immediately
   - [ ] Refresh page → Dark mode persists

2. **Notifications:**
   - [ ] Push notifications toggle works
   - [ ] Email notifications toggle works
   - [ ] Spoilage alerts setting works

**Expected Result:** All settings toggles work and save

---

### Test 6.2: Edit Profile
**Action:** Settings → Click on profile section

**What to do:**
1. Click "Edit Profile"
2. Change display name to "John Doe"
3. Try uploading profile photo (optional)
4. Click "Save"

**What to check:**
- [ ] Edit modal appears
- [ ] Name field editable
- [ ] Photo upload button works
- [ ] Save button works
- [ ] Name updates in settings

**Console Check:** Watch for storage bucket errors if uploading photo

**Expected Result:**
- Name update: Should work
- Photo upload: May fail if storage bucket not set up

---

### Test 6.3: Spoilage Alert Settings
**Action:** Settings → Configure spoilage alerts

**What to do:**
1. Find spoilage alert days setting
2. Change from default (3 days) to 5 days
3. Save

**What to check:**
- [ ] Setting accessible
- [ ] Can adjust days
- [ ] Saves successfully

**Expected Result:** Setting saves and applies

---

## Part 7: Household Management (10 minutes)

### Test 7.1: Household Screen
**Action:** Settings → Household Management

**What to check:**
- [ ] Household screen loads
- [ ] Shows household name
- [ ] Shows member count (probably 0 or just you)
- [ ] Invite code displayed
- [ ] Copy button works
- [ ] QR code button visible
- [ ] Share link button visible

**What to test:**
1. Click "Copy" → Invite code copied to clipboard
2. Check members list → Should show empty or just you as admin

**Expected Result:** Household management screen functional

---

## Part 8: Recipes & Suggestions (10 minutes)

### Test 8.1: Recipe Suggestions
**Action:** Home → Navigate to recipes

**What to check:**
- [ ] Recipes screen loads
- [ ] Recipe cards visible
- [ ] Each recipe shows:
  - Name
  - Image
  - Prep time
  - Matched ingredients (you have)
  - Missing ingredients (you need)
- [ ] "View Recipe" button works
- [ ] "Add to list" button works

**Expected Result:** Recipes displayed with mock data

---

### Test 8.2: Spoilage Alerts Screen
**Action:** Home → View spoilage alerts

**What to check:**
- [ ] Alerts screen loads
- [ ] Shows expiring items
- [ ] Grouped by urgency (Critical, Warning, Info)
- [ ] Each alert shows days left
- [ ] "Add to List" button works
- [ ] "Mark Used" button works
- [ ] Recipe suggestions banner visible

**Expected Result:** Alerts displayed for expiring items

---

## Part 9: Notifications (5 minutes)

### Test 9.1: Notifications Screen
**Action:** Home → Click bell icon (top right)

**What to check:**
- [ ] Notifications screen loads
- [ ] Shows notification list
- [ ] Different types visible:
  - Expiring items
  - Shopping list updates
  - Household activity
- [ ] Timestamps visible
- [ ] Can mark as read
- [ ] Badge count on bell icon

**Expected Result:** Notifications displayed (may be mock data)

---

## 🔍 Error Tracking

As you test, note any errors in this format:

### Error Log Template
```
Feature: [e.g., Add Item]
Action: [What you were doing]
Error Type: [Console error, UI error, crash]
Error Message: [Exact error from console]
Screenshot: [Yes/No]
```

---

## 📊 Feature Completeness Checklist

After testing, mark what works:

### Core Features
- [ ] **Authentication**
  - [ ] Sign Up
  - [ ] Login
  - [ ] Logout
  - [ ] Session persistence

- [ ] **Inventory Management**
  - [ ] Add item manually
  - [ ] View inventory
  - [ ] Edit item
  - [ ] Delete item
  - [ ] Search items
  - [ ] Filter by location
  - [ ] Filter by expiry

- [ ] **Receipt Scanning**
  - [ ] Camera access
  - [ ] Take photo
  - [ ] Upload photo
  - [ ] Item extraction
  - [ ] Add extracted items to inventory

- [ ] **Shopping List**
  - [ ] View list
  - [ ] Check/uncheck items
  - [ ] Add items
  - [ ] Remove items

- [ ] **Settings**
  - [ ] Edit profile
  - [ ] Upload photo
  - [ ] Toggle dark mode
  - [ ] Notification preferences
  - [ ] Spoilage alert settings

- [ ] **Household**
  - [ ] View household
  - [ ] Generate invite code
  - [ ] View members

- [ ] **Recipes**
  - [ ] View suggestions
  - [ ] See matched ingredients
  - [ ] See missing ingredients

- [ ] **Notifications**
  - [ ] View notifications
  - [ ] Badge counts

---

## 🐛 Common Issues & Solutions

### Issue 1: "Relation does not exist"
**Problem:** Database tables not created
**Solution:**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase-schema.sql`
4. Refresh the app

### Issue 2: "Failed to fetch" or Network errors
**Problem:** Supabase connection issue
**Solution:**
1. Check internet connection
2. Verify Supabase URL in `.env` is correct
3. Check if Supabase project is paused (free tier pauses after inactivity)

### Issue 3: Receipt scanning fails with 404
**Problem:** Model not found
**Solution:**
1. Check console for exact error
2. Verify Anthropic API key is valid
3. May need to use different model name

### Issue 4: CORS error on receipt scanning
**Problem:** Proxy server not working
**Solution:**
1. Check if proxy server is running (should see "API Proxy server running on http://localhost:3001")
2. Restart servers with `npm run dev:all`

### Issue 5: Profile photo upload fails
**Problem:** Storage bucket not created
**Solution:**
1. Go to Supabase Dashboard → Storage
2. Create bucket named `profile-photos`
3. Set it to PUBLIC
4. Try upload again

---

## 📝 Testing Notes

**Track your findings:**

**What Works:**
```
[List features that work perfectly]
```

**What Doesn't Work:**
```
[List broken features with error details]
```

**Database Status:**
```
[ ] Tables exist and work
[ ] Tables missing (need to run schema)
[ ] Some tables exist, some don't
```

**API Status:**
```
[ ] Supabase connection works
[ ] Anthropic API works
[ ] Receipt scanning works
[ ] Both APIs failing
```

---

## 🎯 Success Criteria

**Minimum Viable Product:**
- ✅ Can sign up and login
- ✅ Can add items manually
- ✅ Can view inventory
- ✅ Can edit/delete items
- ✅ Basic settings work

**Full Feature Set:**
- ✅ Receipt scanning works
- ✅ Shopping list syncs
- ✅ Household features work
- ✅ Notifications work
- ✅ Recipe suggestions appear

---

## 📸 Screenshots to Capture

If you find issues, capture:
1. Welcome/Login screen
2. Home dashboard with stats
3. Inventory list view
4. Add item form
5. Receipt scan result (if it works)
6. Settings screen
7. Any error screens

---

## ⏱️ Estimated Time

- **Quick Test (30 min):** Authentication + Inventory + One scan attempt
- **Thorough Test (90 min):** All features systematically
- **Deep Dive (2+ hours):** Every edge case and feature

---

## 🚀 Ready to Test!

1. **Open http://localhost:3000/ in your browser**
2. **Open DevTools (F12)**
3. **Switch to mobile view (click device icon)**
4. **Follow the test scenarios above**
5. **Report back what works and what doesn't!**

---

**Good luck! Let me know what you find! 🎉**
