# 🚀 IMMEDIATE SETUP (5 Minutes)

## Step 1: Run Setup Script (1 min)

```bash
cd /home/claude/gaming-platform-deploy
bash SETUP_NOW.sh
```

This installs npm packages and prepares the app.

---

## Step 2: Create Supabase Account (2 min)

**Go to:** https://supabase.com

1. Click **"Start your project"**
2. Sign up with email (no credit card - FREE)
3. Verify email
4. Create organization (any name)
5. Create new project:
   - Name: `rdcm-poker`
   - Database password: anything (you won't need it)
   - Region: closest to you
   - Click **"Create new project"** (takes ~1 min)

---

## Step 3: Create Database Tables (1 min)

**In Supabase Dashboard:**

1. Left sidebar → **"SQL Editor"**
2. Click **"+ New Query"**
3. **Delete the template** (SELECT 1)
4. **Copy ENTIRE contents** from `/home/claude/gaming-platform-deploy/supabase/init.sql`
5. **Paste** into SQL editor
6. Click **"Run"** button (blue arrow, top right)
7. Wait for success message ✓

---

## Step 4: Get Your Credentials (1 min)

**Still in Supabase Dashboard:**

1. Left sidebar → **"Settings"** → **"API"**
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **Anon Key** (long string starting with `eyJ...`)

---

## Step 5: Configure App (30 sec)

Edit file: `/home/claude/gaming-platform-deploy/.env.local`

Replace:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

With your actual credentials from Step 4.

**Example:**
```
REACT_APP_SUPABASE_URL=https://abcdef123456.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 6: Start App (30 sec)

```bash
npm start
```

Wait for:
```
> webpack compiled successfully
Compiled successfully!
```

---

## Step 7: Play! 🃏

**Visit:** http://localhost:3000

1. Click **Sign In** (top right)
2. Click **Sign Up**
3. Enter email + password + username
4. Click **Create Account**
5. Confirm email (check inbox)
6. Sign in with that account
7. Click **🃏 Poker** tab
8. Set your bet → **Start Hand** → Play!

---

## What You Get

✅ Fully functional multiplayer poker
✅ 5 AI opponents with personalities
✅ Persistent player stats
✅ Practice mode
✅ Professional UI
✅ Mobile responsive
✅ 100% free forever

---

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install
```

### "REACT_APP_SUPABASE_URL is undefined"
1. Check `.env.local` exists
2. Check you copied credentials correctly
3. Restart dev server: stop with Ctrl+C, run `npm start` again

### "Auth error"
1. Check Supabase project is active
2. Verify .env.local credentials match exactly
3. Check SQL tables were created (Supabase → Table Editor)

### "No response from database"
1. Ensure SQL was run successfully
2. Check Supabase project status (not paused)
3. Verify RLS policies are enabled

---

## Success Indicators

✓ Can sign up
✓ Can sign in
✓ Poker tab works
✓ Can see 5 players (you + 4 AI)
✓ Can place bet and start hand
✓ Game log shows action
✓ Can see winner

---

## That's It! 🎉

Your real multiplayer poker platform is live.

**Next** (optional):
- Deploy to Vercel: `vercel`
- Add more features from `POKER_SETUP.md`
- Customize AI personalities

---

## Need Help?

All code is documented. Check:
- `src/components/PokerGame.jsx` - Game logic
- `src/contexts/AuthContext.jsx` - Auth flow
- `src/utils/pokerLogic.js` - Hand evaluation

Files are Claude-friendly - modify freely!
