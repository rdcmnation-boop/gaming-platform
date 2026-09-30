# RDCM Poker Platform - Deployment Guide

Complete guide for deploying the poker platform to production.

## Prerequisites

- GitHub account with the repository
- Vercel account (free tier available)
- Supabase account (free tier available)
- Node.js v16 or higher
- npm or yarn

## Step 1: Prepare GitHub Repository

### 1.1 Ensure Repository is Up to Date
```bash
git status
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 1.2 Create Production Branch (Optional)
```bash
git checkout -b production
git push origin production
```

---

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Sign Up" or "Sign In"
3. Click "New Project"
4. Fill in:
   - Project name: "rdcm-poker-prod"
   - Database password: (strong password - save it!)
   - Region: "us-east-1" (or closest to users)
5. Click "Create new project"
6. Wait 2-3 minutes for initialization

### 2.2 Initialize Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/init.sql` from your project
4. Copy entire file content
5. Paste into SQL Editor
6. Click **Run**
7. Verify: Check **Tables** section - should see:
   - `players`
   - `game_sessions`
   - `game_players`
   - `game_history`
   - `tournaments` (if you added it)

### 2.3 Get API Credentials

1. Go to **Settings** → **API**
2. Copy **Project URL**
3. Copy **Anon Key** (public key)
4. Save these - you'll need them for Vercel

### 2.4 Enable RLS (Row Level Security)

1. Go to **Authentication** → **Policies**
2. Verify RLS is enabled (should be by default)
3. Confirm policies are active for all tables

---

## Step 3: Vercel Deployment

### 3.1 Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Sign In" with GitHub
3. Click "Import Project"
4. Search for "gaming-platform"
5. Select your repository
6. Click "Import"

### 3.2 Configure Environment Variables

1. In Vercel project settings, go to **Environment Variables**
2. Add the following variables:

```
REACT_APP_SUPABASE_URL = [your project URL from Step 2.3]
REACT_APP_SUPABASE_ANON_KEY = [your anon key from Step 2.3]
```

3. Click "Add" for each variable
4. Make sure they're added to all environments (Production, Preview, Development)

### 3.3 Configure Build Settings

1. Go to **Settings** → **Build & Development**
2. Verify settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`
3. Click **Save**

### 3.4 Deploy

1. In **Deployments** tab, click **Deploy**
2. Wait for build to complete (~3-5 minutes)
3. When complete, click the URL to view your live app

---

## Step 4: Verification

### 4.1 Test Deployment

1. Open your Vercel URL
2. Create a test account with email/password
3. Verify login works
4. Play a test game
5. Check that stats update in leaderboard

### 4.2 Monitor Logs

1. In Vercel dashboard, go to **Functions** → **Logs**
2. Check for any errors
3. In Supabase, go to **Logs** to see database activity

---

## Step 5: Performance Optimization

### 5.1 Enable Caching

In Vercel **Settings** → **Caching**:
- Static: 31536000 (1 year)
- Dynamic: 60 seconds

### 5.2 Enable Analytics

In Vercel **Settings** → **Analytics**:
- Enable Web Analytics
- Enable Real Experience Monitoring

### 5.3 Configure Domain (Optional)

1. Purchase domain or use Vercel's free domain
2. Go to **Settings** → **Domains**
3. Add your custom domain
4. Configure DNS records

---

## Step 6: Continuous Deployment

### 6.1 Set Up GitHub Actions

Vercel automatically deploys on push to main. To customize:

1. Create `.github/workflows/ci.yml` (already created)
2. Pushes to `main` → Production deployment
3. Pushes to other branches → Preview deployment

### 6.2 Monitor Deployments

In Vercel dashboard:
- **Deployments** tab shows all deployments
- Click deployment to see logs
- Revert to previous version if needed

---

## Step 7: Database Maintenance

### 7.1 Backup Strategy

**Supabase Free Tier includes:**
- Automatic backups
- 7-day backup retention
- Point-in-time recovery

**Enable backups:**
1. Go to **Settings** → **Backups**
2. Automatic backups are enabled by default
3. For manual backup, click **Create Backup**

### 7.2 Monitor Database Usage

In Supabase **Settings** → **Database**:
- Monitor storage usage (500 MB free tier)
- Monitor concurrent connections
- Check replication status

### 7.3 Optimize Database

```sql
-- Create indexes for better performance
CREATE INDEX idx_players_balance ON players(balance);
CREATE INDEX idx_game_history_created ON game_history(played_at);

-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM players ORDER BY total_profit LIMIT 10;
```

---

## Step 8: Production Monitoring

### 8.1 Error Tracking

Set up error monitoring (optional):

```bash
npm install @sentry/react
```

Configure in `src/index.js`:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

### 8.2 Performance Monitoring

In Vercel dashboard:
- **Analytics** → Monitor page load times
- **Function Logs** → Check for slow endpoints
- **Web Analytics** → Track user behavior

### 8.3 Health Checks

Create a health check endpoint:

```javascript
// src/pages/health.js
export default function Health() {
  return { status: 'ok', timestamp: new Date() };
}
```

---

## Step 9: Scaling Considerations

### 9.1 Supabase Free Tier Limits

- **Storage:** 500 MB
- **API calls:** 2M/month (~65K/day)
- **Concurrent connections:** Unlimited
- **Bandwidth:** 2 GB/month

**When to upgrade:**
- Storage exceeds 400 MB
- API calls exceed 1.5M/month
- Need advanced features (Realtime, Vector)

### 9.2 Vercel Free Tier Limits

- **Deployments:** Unlimited
- **Bandwidth:** 100 GB/month
- **Serverless Functions:** 100 hours/month

**When to upgrade:**
- Need custom domains (Pro plan)
- Bandwidth exceeds 100 GB/month
- Need more function execution time

### 9.3 Upgrade Path

1. **Supabase Pro:** $25/month
   - 8 GB storage
   - 10M API calls/month
   - Priority support

2. **Vercel Pro:** $20/month
   - Custom domains
   - Team collaboration
   - Advanced analytics

---

## Troubleshooting

### Build Fails

**Error:** `npm ERR! 404 Not Found`

**Solution:**
```bash
npm cache clean --force
npm install
```

### Environment Variables Not Loading

**Error:** `REACT_APP_SUPABASE_URL is undefined`

**Solution:**
1. Verify variables are in Vercel Settings
2. Rebuild deployment: Click **Redeploy**
3. Check variable names (must start with `REACT_APP_`)

### Database Connection Error

**Error:** `Failed to initialize Supabase client`

**Solution:**
1. Verify Supabase URL is correct
2. Verify Anon Key is correct
3. Check Supabase project is active
4. Check RLS policies allow anonymous access

### Game Logic Issues

**Error:** Game doesn't calculate winners correctly

**Solution:**
1. Check `src/utils/pokerLogic.js`
2. Review hand evaluation logic
3. Test with different hand combinations
4. Check console for error messages

---

## Post-Deployment Checklist

- [ ] Vercel deployment completed successfully
- [ ] Supabase database initialized
- [ ] Environment variables configured
- [ ] Test account created and login works
- [ ] Game plays without errors
- [ ] Leaderboard displays players
- [ ] Stats calculate correctly
- [ ] UI renders properly on mobile
- [ ] No console errors
- [ ] Performance acceptable (<3s load time)
- [ ] Database backups configured
- [ ] Error monitoring enabled
- [ ] Analytics enabled
- [ ] Custom domain configured (if applicable)
- [ ] SSL/TLS verified

---

## Monitoring Dashboard

### Key Metrics to Watch

**Vercel:**
- Build time (should be < 2 minutes)
- Deployment success rate (should be 100%)
- API response time (should be < 200ms)
- Error rate (should be < 1%)

**Supabase:**
- Database size (500 MB limit for free tier)
- Active connections (usually < 100)
- Slow queries (should optimize any > 1s)
- Backup status (should be daily)

### Daily Checks

```bash
# Check deployment status
vercel status

# Monitor Vercel logs
vercel logs --follow

# Database health (via Supabase dashboard)
# - Check for failed queries
# - Monitor storage usage
# - Review replication lag
```

---

## Rollback Procedure

If production has critical issues:

### Via Vercel
1. Go to **Deployments**
2. Click previous stable deployment
3. Click **Promote to Production**
4. Verify rollback success

### Via GitHub
```bash
git revert HEAD
git push origin main
# Vercel will auto-deploy
```

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **GitHub Issues:** Report bugs in your repo
- **Community Discord:** [Join our server](#)

---

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domain
3. Enable SSL/TLS certificate
4. Set up CDN for static assets
5. Implement analytics
6. Configure backup recovery plan
7. Document runbooks for team
8. Set up staging environment
