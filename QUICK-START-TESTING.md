# Quick Start Testing Guide

## 🚀 Start Testing in 3 Steps

### Step 1: Start the App

```bash
# Terminal 1: Start the app
npm run dev
```

The app will open at `http://localhost:3000`

### Step 2: Start the Proxy (for receipt scanning)

```bash
# Terminal 2: Start the proxy server
npm run proxy
```

**OR** start both together:
```bash
npm run dev:all
```

### Step 3: Test Key Features

#### ✅ Test 1: Sign Up
1. Click "Get Started"
2. Fill in name, email, password
3. Click "Create Account"
4. **Check**: You're redirected to home screen

#### ✅ Test 2: Add an Item
1. Click "Add Item" button
2. Fill in:
   - Name: "Milk"
   - Category: "Dairy"
   - Location: "Fridge"
   - Quantity: 1
3. Click "Add to Inventory"
4. **Check**: Success message appears
5. **Check**: Item shows in Inventory screen

#### ✅ Test 3: View Inventory
1. Click "Inventory" in bottom nav
2. **Check**: Your item appears
3. Try the search box
4. Try clicking filter buttons
5. **Check**: Items filter correctly

#### ✅ Test 4: Scan Receipt (Optional)
1. Click "Scan Receipt"
2. Grant camera permission
3. Take photo of a receipt
4. **Check**: Items are extracted
5. Click "Add to Inventory"
6. **Check**: Items are added

---

## 🔍 Check for Errors

### Browser Console
1. Press `F12` to open DevTools
2. Go to "Console" tab
3. **Check**: No red error messages

### Network Tab
1. In DevTools, go to "Network" tab
2. Try adding an item
3. **Check**: API calls return 200 status (green)

---

## ✅ Quick Verification

After testing, verify in Supabase:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Table Editor** → `inventory_items`
4. **Check**: Your items are there!

---

## 🐛 Troubleshooting

### "Connection error" when scanning?
→ Make sure proxy is running: `npm run proxy`

### Items not appearing?
→ Check browser console (F12) for errors

### Name shows as "Doe"?
→ Sign out and sign in again

---

## 📝 Test Checklist

- [ ] Can sign up
- [ ] Can sign in
- [ ] Can add item manually
- [ ] Items appear in inventory
- [ ] Filters work
- [ ] Search works
- [ ] No console errors
- [ ] Name displays correctly (not "Doe")

---

That's it! You're ready to test! 🎉

