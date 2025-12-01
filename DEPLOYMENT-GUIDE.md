# Vercel Deployment Guide

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Push to GitHub (Already Done)

All your code is committed and ready to push:

```bash
git push origin main
```

---

### Step 2: Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

---

### Step 3: Import Your Project

1. Click "Add New..." → "Project"
2. Find your repository: **Kalyan1210/Pantrix-UI-Design**
3. Click "Import"

---

### Step 4: Configure Project Settings

**Framework Preset:** Vite ✅ (should auto-detect)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Root Directory:** `./` (leave as is)

---

### Step 5: Add Environment Variables

Click "Environment Variables" and add these **3 variables**:

#### Variable 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: Your Supabase project URL
  - Get from: Supabase Dashboard → Settings → API → Project URL
  - Example: `https://yourproject.supabase.co`

#### Variable 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon/public key
  - Get from: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
  - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Variable 3:
- **Name**: `VITE_ANTHROPIC_API_KEY`
- **Value**: Your Anthropic API key
  - Get from: [console.anthropic.com](https://console.anthropic.com)
  - Example: `sk-ant-api03-...`

**Environment:** Select "Production, Preview, and Development" for all

---

### Step 6: Deploy!

1. Click "Deploy"
2. Wait 1-2 minutes for build to complete
3. You'll see a success screen with your deployment URL

---

### Step 7: Configure Supabase for Production

After deployment, update your Supabase settings:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to **Site URL**:
   - Example: `https://pantrix-ui-design.vercel.app`
3. Add to **Redirect URLs**:
   - `https://pantrix-ui-design.vercel.app/**`

---

## 🎉 Your App is Live!

Your deployment URL will be something like:
- `https://pantrix-ui-design.vercel.app`
- Or: `https://pantrix-ui-design-[your-username].vercel.app`

---

## 🔄 Automatic Deployments

From now on:
- Every push to `main` branch → Auto-deploys to production
- Every pull request → Creates a preview deployment
- Zero configuration needed!

---

## 🛠️ Post-Deployment Checklist

- [ ] Visit your deployment URL
- [ ] Test signup/login
- [ ] Test adding items
- [ ] Test all features work
- [ ] Check browser console for errors
- [ ] Test on mobile devices

---

## 📝 Optional: Custom Domain

Want to use your own domain?

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `pantrix.yourdomain.com`)
3. Update DNS records as instructed
4. Update Supabase redirect URLs

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel
- Verify all dependencies in `package.json`
- Make sure environment variables are set

### App Loads but Features Don't Work
- Check browser console (F12)
- Verify environment variables are correct
- Check Supabase URL configuration

### Authentication Issues
- Make sure Supabase redirect URLs include your Vercel domain
- Check CORS settings in Supabase

### Receipt Scanning Doesn't Work
- This requires the proxy server running locally
- For production, consider deploying the proxy as a separate Vercel function
- See `CAMERA-TESTING-GUIDE.md` for alternatives

---

## 📊 Monitor Your App

Vercel Dashboard provides:
- Real-time analytics
- Performance metrics
- Error tracking
- Deployment history
- Build logs

---

## 🎯 Need Help?

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Your app logs: Vercel Dashboard → Your Project → Deployments → View Logs

---

**Your Pantrix app is production-ready!** 🎉

