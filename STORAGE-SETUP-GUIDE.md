# Storage Setup Guide

Follow these steps to set up profile photo uploads.

## Step 1: Create Storage Bucket via UI

1. **Go to Supabase Dashboard**
   - Navigate to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - You'll see the Storage page

3. **Create New Bucket**
   - Click the "New bucket" button
   - Fill in the form:
     - **Name**: `profile-photos`
     - **Public**: ✅ Check this box (allows public read access)
     - **File size limit**: Leave default or set to 5MB
     - **Allowed MIME types**: Leave empty (allows all images)
   - Click "Create bucket"

4. **Verify Bucket Created**
   - You should see `profile-photos` in the bucket list
   - The "Public" badge should be visible

---

## Step 2: Set Up RLS Policies (Optional)

The bucket is public by default, but you can add Row Level Security policies for better control:

### Option A: Via SQL Editor (Recommended)

Go to SQL Editor and run:

```sql
-- Allow authenticated users to upload their own profile photo
CREATE POLICY "Users can upload their own profile photo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view profile photos
CREATE POLICY "Public can view profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- Allow users to update their own profile photos
CREATE POLICY "Users can update their own profile photo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile photos
CREATE POLICY "Users can delete their own profile photo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Option B: Via Storage Policies UI

1. Go to Storage → `profile-photos` bucket
2. Click "Policies" tab
3. Add policies using the UI:
   - **Upload**: Authenticated users only
   - **Select**: Public
   - **Update**: Authenticated users (own files)
   - **Delete**: Authenticated users (own files)

---

## Step 3: Test the Setup

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Go to Settings**

3. **Click on your profile**

4. **Click the camera icon**

5. **Upload a photo**

6. **Verify**:
   - Photo uploads successfully
   - Photo appears in settings
   - Photo appears in other screens
   - Check Supabase Storage to see the uploaded file

---

## Troubleshooting

### "Bucket not found" error
- Make sure you created the bucket in the Dashboard
- Check the bucket name is exactly `profile-photos` (lowercase, with hyphen)
- Verify the bucket is public

### "Permission denied" error
- Check RLS policies are set up correctly
- Verify user is authenticated
- Check file path format in the code

### "File too large" error
- Default limit is 5MB
- Adjust bucket settings if needed
- Check file size before uploading in the app

### Photo not displaying
- Check the public URL is correct
- Verify bucket is marked as public
- Check CORS settings if needed

---

## Alternative: Skip Storage, Use External Service

If you prefer not to use Supabase Storage:

### Option 1: Use Cloudinary
```typescript
// Install: npm install cloudinary
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret'
});

const result = await cloudinary.uploader.upload(file);
const photoUrl = result.secure_url;
```

### Option 2: Use Imgur
```typescript
// Simple API, no SDK needed
const formData = new FormData();
formData.append('image', file);

const response = await fetch('https://api.imgur.com/3/image', {
  method: 'POST',
  headers: {
    Authorization: 'Client-ID YOUR_CLIENT_ID'
  },
  body: formData
});

const { data } = await response.json();
const photoUrl = data.link;
```

### Option 3: Skip Photo Upload
Simply remove the photo upload feature and use initials only:

```typescript
// In ProfileEditModal.tsx
// Comment out or remove:
// - The file input
// - The handlePhotoUpload function
// - The camera button
```

---

## Summary

✅ **Required Steps**:
1. Create `profile-photos` bucket in Supabase Dashboard (public)
2. Optionally add RLS policies via SQL
3. Test by uploading a photo in Settings

🎉 **Done!** Profile photos should now work!

Need help? See `MANUAL-TESTING-GUIDE.md` for more details.

