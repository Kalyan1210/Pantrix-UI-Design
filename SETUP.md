# Pantrix Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to **SQL Editor** in your Supabase dashboard
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click **Run** to execute the SQL
6. Go to **Settings > API** and copy:
   - Project URL (this is your `VITE_SUPABASE_URL`)
   - anon/public key (this is your `VITE_SUPABASE_ANON_KEY`)

### 3. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you'll need this for `VITE_ANTHROPIC_API_KEY`)

### 4. Create Environment File

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Important**: Replace the placeholder values with your actual keys!

### 5. Run the App

```bash
npm run dev
```

The app will start on `http://localhost:3000`

## Features Overview

### Camera & Scanning
- **Receipt Scanning**: Take a photo of a receipt to automatically extract items
- **Product Scanning**: Scan product packaging to auto-fill item details
- **Camera Controls**: Front/back camera switching, gallery selection

### Inventory Management
- **Automatic Categorization**: Items are automatically categorized
- **Smart Location Assignment**: Items are assigned to fridge/freezer/pantry/counter based on category
- **Expiry Tracking**: Automatic expiry date estimation based on category
- **Search & Filter**: Find items quickly with search and filters

### Authentication
- **Email/Password**: Sign up and sign in with email
- **Secure Storage**: All data is stored securely in Supabase with Row Level Security

## Troubleshooting

### Camera Not Working
- Make sure you're using HTTPS or localhost (required for camera access)
- Check browser permissions for camera access
- Try a different browser (Chrome/Edge recommended)

### API Errors
- Verify your `.env` file has the correct keys
- Check that your Supabase project is active
- Ensure you've run the SQL schema in Supabase

### Database Errors
- Make sure you've run `supabase-schema.sql` in your Supabase SQL Editor
- Check that Row Level Security policies are enabled
- Verify your user is authenticated

## Database Schema

The app uses one main table:

- **inventory_items**: Stores all inventory items with user isolation via RLS

All tables have Row Level Security enabled, so users can only see and modify their own data.

## Next Steps

1. Create your account in the app
2. Complete onboarding
3. Start scanning receipts or adding items manually
4. Manage your inventory!

