# 🚀 Deploy in 10 Minutes

## What You Need
- Supabase account (free)
- Vercel account (already linked to GitHub)
- 10 minutes

---

## Step 1: Create Supabase Project
Go to https://supabase.com/dashboard
- Click "New Project"
- Name: `rdcm-poker`
- Set password
- Click Create

Waits 5-10 min... Continue to next step while waiting.

---

## Step 2: Get Supabase Keys
Once created:
- Go to Settings → API
- Copy:
  - `Project URL` (looks like `https://xxx.supabase.co`)
  - `anon key` (looks like `eyJ...`)
  - `service_role secret` (looks like `eyJ...`)

---

## Step 3: Create .env.local
In project root, create file `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJ...xxxxx
```

Replace values with your actual keys.

---

## Step 4: Run SQL Migration
In Supabase dashboard:
1. Click **SQL Editor**
2. Click **New Query**
3. Open file: `supabase/migrations/create_bot_tables.sql`
4. Copy ALL contents
5. Paste into Supabase
6. Click **RUN**

Done! Tables created ✅

---

## Step 5: Deploy to Vercel
Push to GitHub:
```bash
git add .
git commit -m "Deploy backend to production"
git push
```

Vercel auto-deploys. Takes 2-3 minutes.

---

## Step 6: Add Environment Variables in Vercel
1. Go to vercel.com
2. Click your project
3. Settings → Environment Variables
4. Add three variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click "Save & Redeploy"

---

## Step 7: Test It Works
Open DevTools (F12) in your poker game and:
1. Click "Start Hand"
2. Watch Network tab
3. See requests to `/api/bots/decision`
4. See responses with bot actions

---

## Done! ✅
Your backend is live and running on Vercel + Supabase.
Cost: $0/month forever.
