# Pantrix Mobile App UI Design

This is a code bundle for Pantrix Mobile App UI Design. The original project is available at https://www.figma.com/design/bLYWjfw1AJMbjQy1nVGXgh/Pantrix-Mobile-App-UI-Design.

## Features

- ✅ Full Supabase integration for authentication and database
- ✅ Anthropic Claude Vision API for receipt and product scanning
- ✅ Camera functionality with permissions handling
- ✅ Receipt scanning with item extraction
- ✅ Product scanning from packaging
- ✅ Inventory management with Supabase
- ✅ Automatic location assignment based on category
- ✅ Expiry date estimation based on category
- ✅ User profile editing with photo upload
- ✅ Customizable spoilage alert settings
- ✅ Push and email notification preferences
- ✅ Dark mode support
- ✅ Household management
- ✅ Comprehensive testing suite (Vitest + React Testing Library)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the SQL from `supabase-schema.sql` to create the database tables
3. Set up Storage for profile photos:
   - **Go to Storage → New bucket**
   - **Name**: `profile-photos`
   - **Public**: ✅ Check this box
   - See `STORAGE-SETUP-GUIDE.md` for detailed instructions
4. Copy your Supabase URL and anon key from Settings > API

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Get Your API Keys

- **Supabase**: Get from your Supabase project settings (Settings > API)
- **Anthropic**: Get from [console.anthropic.com](https://console.anthropic.com)

### 5. Run the Development Server

```bash
# Start the app only
npm run dev

# Or start app + proxy server (for receipt scanning)
npm run dev:all
```

**Note**: For receipt scanning to work, you need to run the proxy server. See `CAMERA-TESTING-GUIDE.md` for alternative testing methods.

## Database Schema

The app uses the following Supabase tables:

- `users`: User profiles with display names and profile photos
- `households`: Household groups for shared inventory
- `household_members`: Links users to households
- `inventory_items`: Stores all inventory items with household_id, name, quantity, category, location, dates, and prices
- `user_preferences`: User settings for notifications, themes, and alert preferences
- `shopping_lists`: Shared shopping lists per household
- `recipes`: Recipe database
- And more...

Run the SQL from `supabase-schema.sql` in your Supabase SQL Editor to set up the tables and Row Level Security policies.

For profile photo uploads, create a storage bucket:
1. Go to Supabase Dashboard → Storage
2. Click "New bucket" → Name: `profile-photos` → Public: ✅
3. See `STORAGE-SETUP-GUIDE.md` for detailed steps and RLS policies

## Camera Features

The receipt scanning screen includes:

- Full-screen camera view
- Frame guide with green corner indicators
- Gallery button to select from photos
- Large capture button
- Flip camera button (front/back)
- Instructions overlay
- Permission handling

## Receipt Scanning

The app uses Claude Vision API to:

- Extract items from receipts with quantities and prices
- Categorize items automatically
- Assign storage locations based on category
- Estimate expiry dates based on category
- Provide confidence levels for extracted data

## Product Scanning

You can also scan individual products to:

- Extract product name from packaging
- Identify category
- Read expiry dates from labels
- Auto-fill item details

## Running the code

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Start app + proxy server (for receipt scanning)
npm run dev:all

# Run tests
npm run test:run

# Run tests with UI
npm run test:ui
```

## Testing

See `MANUAL-TESTING-GUIDE.md` for comprehensive testing instructions.

See `CAMERA-TESTING-GUIDE.md` for camera testing without proxy (using ngrok, Capacitor, or Expo).

Run automated tests:

```bash
npm run test:run
```

## Tech Stack

- React + TypeScript
- Vite
- Supabase (Auth + Database)
- Anthropic Claude Vision API
- Tailwind CSS
- shadcn/ui components
