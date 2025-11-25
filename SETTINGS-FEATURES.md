# Settings Features

This document describes all the features available in the Settings screen.

## ✅ Profile Management

### Edit Profile
Click on your profile (name/email) to:
- Change your display name
- Upload a profile photo (max 5MB)
- View your email (cannot be changed)

### Profile Photo
- Click the camera icon to upload a photo
- Supports all image formats
- Automatically updates across the app
- Stored in Supabase Storage

---

## ✅ Notification Settings

### Push Notifications
- Toggle push notifications on/off
- Get alerts for expiring items
- Saved to user preferences

### Email Notifications
- Toggle weekly summary emails
- Saved to user preferences

---

## ✅ Spoilage Alert Settings

Click "Spoilage Alert Settings" to customize when you receive alerts:

- **1 day before** - Get notified one day before expiry
- **2 days before** - Two days advance warning
- **3 days before** - Three days advance warning (default)
- **5 days before** - Five days advance warning
- **1 week before** - One week advance warning

Settings are saved to your user preferences in Supabase.

---

## ✅ Dark Mode

Toggle dark/light mode for the entire app:
- Persists across sessions
- Saved to user preferences
- Applies immediately

---

## ✅ Household Management

Click "My Household" to:
- View household members
- Manage member roles
- Share inventory with family
- Create/join households

---

## ✅ Support

### Help & Support
Click to access:
- **Email Support**: Direct email to support@pantrix.app
- **Live Chat**: Available Mon-Fri, 9am-5pm EST
- **FAQ & Guides**: Browse common questions

Common topics:
- How to scan receipts
- Managing household members
- Setting up notifications
- Understanding expiry dates

### About Pantrix
Click to view:
- App version (1.0.0)
- Features list
- Privacy Policy
- Terms of Service
- App description and credits

---

## 🗄️ Database Tables Used

### `users`
Stores user profile information:
- `user_id`
- `display_name`
- `email`
- `profile_photo_url`
- `created_at`, `updated_at`

### `user_preferences`
Stores user settings:
- `user_id`
- `enable_push_notifications`
- `enable_email_notifications`
- `spoilage_alert_advance_days`
- `theme` ('system', 'light', 'dark')
- `default_household_id`
- And more...

---

## 📦 Storage Buckets

### `profile-photos`
- Stores user profile photos
- Public read access
- Authenticated write access (own photos only)
- **Create via Supabase Dashboard UI** (Storage → New bucket)
- See `STORAGE-SETUP-GUIDE.md` for setup instructions

---

## 🔧 Implementation Files

- `src/components/SettingsScreen.tsx` - Main settings UI
- `src/components/ProfileEditModal.tsx` - Profile editing modal
- `src/components/SpoilageAlertModal.tsx` - Spoilage alert settings modal
- `src/components/SupportModal.tsx` - Help & About modals
- `src/lib/preferences.ts` - User preferences management
- `setup-storage.sql` - Storage bucket setup

---

## 🎯 Key Features

### ✅ Removed
- ❌ "Whole Foods Market" hardcoded store (removed)

### ✅ Added
- ✨ Profile editing with photo upload
- ✨ Working spoilage alert settings
- ✨ Support section with overlays
- ✨ Help & About modals
- ✨ User preference persistence
- ✨ Toast notifications for feedback

---

## 🚀 Usage

1. **Change your name**: Tap profile → Edit name → Save
2. **Upload photo**: Tap profile → Tap camera icon → Select photo
3. **Set alerts**: Tap "Spoilage Alert Settings" → Choose days → Save
4. **Enable notifications**: Toggle switches for push/email
5. **Get help**: Tap "Help & Support" → Choose contact method
6. **View app info**: Tap "About Pantrix" → See features & version

---

## 📝 Notes

- All settings are saved automatically to Supabase
- Profile photos are stored in Supabase Storage
- Toast notifications confirm successful updates
- Settings persist across sessions and devices
- Dark mode applies to entire app

---

## ✅ Testing

Test all settings features:
- [ ] Can edit profile name
- [ ] Can upload profile photo
- [ ] Photo appears in settings and other screens
- [ ] Can toggle notifications
- [ ] Can change spoilage alert days
- [ ] Dark mode toggles correctly
- [ ] Support modals open and display content
- [ ] Settings persist after logout/login

See `MANUAL-TESTING-GUIDE.md` for detailed testing steps.

