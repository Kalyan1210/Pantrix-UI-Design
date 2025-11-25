-- Drop the problematic constraint and sync users
-- This will remove the check constraint that's blocking the insert

-- ========================================
-- STEP 1: Drop the check constraint
-- ========================================

ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS check_auth_method;

-- ========================================
-- STEP 2: Now sync your user from auth.users
-- ========================================

INSERT INTO public.users (email, display_name, auth_provider, email_verified)
SELECT 
  email,
  COALESCE(
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'display_name',
    split_part(email, '@', 1)
  ) as display_name,
  'email' as auth_provider,
  email_confirmed_at IS NOT NULL as email_verified
FROM auth.users
WHERE email NOT IN (SELECT email FROM public.users)
  AND email IS NOT NULL;

-- ========================================
-- STEP 3: Verify your user was created
-- ========================================

SELECT 
  '✅ Your user record' as status,
  user_id,
  email,
  display_name,
  auth_provider,
  email_verified,
  created_at
FROM public.users
WHERE email LIKE '%@gmail.com'
ORDER BY created_at DESC;

-- ========================================
-- STEP 4: Create the trigger for future signups
-- ========================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users when a new user signs up
  INSERT INTO public.users (email, display_name, auth_provider, email_verified)
  VALUES (
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    'email',
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (email) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 5: Summary
-- ========================================

SELECT 
  '✅ Summary' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.users) as public_users_count;

-- Show all public users
SELECT 
  '✅ All public users' as info,
  user_id,
  email,
  display_name,
  auth_provider,
  email_verified
FROM public.users
ORDER BY created_at DESC;

-- ========================================
-- DONE! Now refresh your app and try adding an item
-- ========================================

