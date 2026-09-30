# RDCM Poker Platform - Troubleshooting Guide

## Common Issues and Solutions

---

## Setup Issues

### Issue: "npm ERR! 404 Not Found"

**Symptoms:**
- Installation fails
- Error message mentions missing package

**Solutions:**

1. Clear cache and reinstall:
```bash
npm cache clean --force
npm install
```

2. Check Node version:
```bash
node -v  # Should be v16 or higher
npm -v   # Should be v8 or higher
```

3. Update npm:
```bash
npm install -g npm@latest
```

---

### Issue: ".env.local file not found"

**Symptoms:**
- App crashes on startup
- Error: "REACT_APP_SUPABASE_URL is undefined"

**Solutions:**

1. Create from template:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Verify file exists:
```bash
ls -la .env.local
```

---

### Issue: "Port 3000 already in use"

**Symptoms:**
- Error: "Something is already listening on port 3000"

**Solutions:**

1. Kill process on port 3000:

**On macOS/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

**On Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

2. Use different port:
```bash
PORT=3001 npm start
```

---

## Database Issues

### Issue: "Cannot connect to Supabase"

**Symptoms:**
- Login fails
- Error in console: "Failed to initialize Supabase client"
- Leaderboard shows "Loading..."

**Solutions:**

1. Verify Supabase credentials:
   - Check `.env.local` has correct values
   - Copy values from Supabase **Settings → API**
   - Ensure no extra spaces or quotes

2. Check Supabase project is active:
   - Go to Supabase dashboard
   - Verify project status is "Active"
   - Check project hasn't been paused

3. Verify API key is correct:
   - Use **Anon Key** (public), not **Service Role Key**
   - Anon Key should be ~40 characters
   - Service Role Key should be ~80 characters

4. Check network connectivity:
```bash
curl https://your-project.supabase.co/rest/v1/players
```

---

### Issue: "Authentication failed"

**Symptoms:**
- Sign up fails
- Login fails with "Invalid credentials"

**Solutions:**

1. Check Supabase Auth is enabled:
   - Go to **Authentication** in Supabase
   - Verify it's enabled

2. Verify email/password requirements:
   - Email must be valid format
   - Password must be 8+ characters
   - Try without special characters first

3. Check for existing account:
   - User already exists with that email
   - Try signing in instead
   - Or use different email

4. Verify RLS policies:
   - Go to **SQL Editor**
   - Run: `SELECT * FROM players LIMIT 1`
   - Should return results (or empty if no players)

---

### Issue: "Database migrations failed"

**Symptoms:**
- `Tables` section is empty
- Error executing `init.sql`

**Solutions:**

1. Manually create tables:
   - Go to **SQL Editor** in Supabase
   - Create each table individually
   - Or run `init.sql` line by line

2. Check for syntax errors:
   - Verify column types (UUID, INTEGER, TEXT)
   - Check constraints (NOT NULL, UNIQUE)
   - Ensure all commas are present

3. Clear and restart:
   - Delete project
   - Create new project
   - Re-run `init.sql`

---

## Authentication Issues

### Issue: "Sign up successful but account doesn't work"

**Symptoms:**
- Sign up completes
- But login fails
- Or app says "Not authenticated"

**Solutions:**

1. Check player record was created:
   - Go to Supabase **Table Editor**
   - Click `players` table
   - Should see your user entry

2. Verify user_id matches:
   - User in `auth.users` matches
   - Player in `players` table has same `user_id`

3. Check RLS policies:
   - Go to **Authentication → Policies**
   - Verify policies allow user to read own data

4. Clear browser storage:
```javascript
// Open browser console and run:
localStorage.clear()
location.reload()
```

---

### Issue: "Session expires immediately"

**Symptoms:**
- Login works briefly
- Then redirected to login screen
- Error: "Session expired"

**Solutions:**

1. Check session duration:
   - Supabase default is 1 hour
   - Check `.env.local` has correct URL

2. Verify clock sync:
   - Computer time must be correct
   - Check system date/time

3. Clear cache:
```bash
npm start -- --reset-cache
```

---

## Game Logic Issues

### Issue: "Winner calculation seems wrong"

**Symptoms:**
- Wrong player wins hand
- Pot distributed incorrectly
- Hand rankings show incorrect winner

**Solutions:**

1. Check hand evaluation logic:
   - Open `src/utils/pokerLogic.js`
   - Verify `evaluateWinner()` function
   - Check hand rank values (ROYAL_FLUSH=10, HIGH_CARD=1)

2. Verify hand generation:
   - Check `generateRandomHand()` returns valid ranks
   - Ensure all hands in HAND_RANKS array

3. Test manually:
```javascript
// In browser console:
import { evaluateWinner, HAND_RANKS } from './src/utils/pokerLogic.js';

const players = [
  { hand: HAND_RANKS.HIGH_CARD },
  { hand: HAND_RANKS.ONE_PAIR }
];
console.log(evaluateWinner(players)); // Should return [1]
```

---

### Issue: "Chips not calculating correctly"

**Symptoms:**
- Balance doesn't update after game
- Pot shows wrong amount
- Statistics show incorrect totals

**Solutions:**

1. Check bet calculation in `PokerGame.jsx`:
   - Verify `calculatePayout()` in utils
   - Check `totalPot` calculation
   - Verify balance updates after game ends

2. Check database updates:
   - Go to Supabase **game_history** table
   - Verify records have `amount_won` and `amount_lost`
   - Check `players` table shows updated balance

3. Verify RLS allows updates:
```sql
-- Run in Supabase SQL Editor:
UPDATE players SET balance = balance + 100 
WHERE user_id = 'your-user-id';
```

---

## UI/Display Issues

### Issue: "Styling looks broken"

**Symptoms:**
- Colors are wrong
- Layout is misaligned
- Fonts look bad

**Solutions:**

1. Check CSS files loaded:
   - Open **Developer Tools** → **Network**
   - Filter to CSS files
   - Should see `pokerGame.css`, `leaderboard.css`, etc.

2. Clear browser cache:
```bash
# Hard refresh:
# Windows/Linux: Ctrl + Shift + R
# macOS: Cmd + Shift + R
```

3. Verify CSS imports in components:
   - Check `import '../styles/component.css'`
   - File path must be correct

4. Check for CSS conflicts:
   - Open **DevTools** → **Elements**
   - Inspect element
   - Check computed styles

---

### Issue: "Mobile layout broken"

**Symptoms:**
- Buttons too small on phone
- Text overlaps
- Can't see all poker table

**Solutions:**

1. Check responsive design:
   - Open **DevTools** → **Toggle Device Toolbar** (Ctrl+Shift+M)
   - Test common sizes: 320px, 768px, 1024px

2. Verify media queries in CSS:
   - Check `@media (max-width: 768px)`
   - Verify breakpoints match screen sizes

3. Check viewport meta tag:
   - Should be in `public/index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

### Issue: "Images/avatars not showing"

**Symptoms:**
- Broken image icons
- Avatar circles are empty
- No game graphics

**Solutions:**

1. Check image paths:
   - Verify path is correct relative to file
   - Use `/public/images/...` for public folder

2. Check image exists:
```bash
ls -la public/images/
```

3. Clear build cache:
```bash
rm -rf build/
npm run build
```

---

## Performance Issues

### Issue: "App is slow / laggy"

**Symptoms:**
- Takes > 5 seconds to load
- Games freeze during play
- Leaderboard takes forever to load

**Solutions:**

1. Check network in DevTools:
   - Open **DevTools** → **Network**
   - Sort by time
   - Look for slow requests (>1000ms)

2. Check for slow database queries:
   - In Supabase **Query Performance**
   - Look for queries > 1 second
   - Check indexes are created

3. Reduce component re-renders:
   - Check React DevTools Profiler
   - Look for unnecessary re-renders
   - Use React.memo() for components

4. Lazy load components:
```javascript
const Leaderboard = React.lazy(() => import('./Leaderboard'));
```

---

### Issue: "High memory usage / crashes"

**Symptoms:**
- Browser tab uses lots of RAM
- App crashes after playing many games
- Browser becomes unresponsive

**Solutions:**

1. Check for memory leaks:
   - Open **DevTools** → **Memory**
   - Take heap snapshot
   - Look for large objects

2. Verify subscriptions are cleaned up:
   - Check useEffect cleanup functions
   - Ensure `.unsubscribe()` is called

3. Limit game history display:
   - Only show last 50 games
   - Use pagination for older games

4. Clear old data:
```javascript
// Clear old game history from localStorage
localStorage.removeItem('gameHistory');
```

---

## Deployment Issues

### Issue: "Deployment fails on Vercel"

**Symptoms:**
- Build fails
- Error during deployment
- App shows error page

**Solutions:**

1. Check build logs:
   - Go to Vercel **Deployments**
   - Click failed deployment
   - Look for error message

2. Verify environment variables:
   - Go to **Settings → Environment Variables**
   - Ensure `REACT_APP_` variables are set
   - Redeploy after changes

3. Check Node version:
   - Vercel uses Node 18 by default
   - If needed, specify in `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "env": {
    "NODE_VERSION": "18.x"
  }
}
```

---

### Issue: "Works locally but not on Vercel"

**Symptoms:**
- App works fine with `npm start`
- But fails when deployed to Vercel
- Shows blank page or errors

**Solutions:**

1. Check environment variables are deployed:
   - Environment variables from `.env.local` don't deploy
   - Must be set in Vercel dashboard
   - Redeploy after setting them

2. Verify production build works:
```bash
npm run build
npm install -g serve
serve -s build
# Should work at http://localhost:3000
```

3. Check for absolute imports:
   - Vercel might not resolve absolute paths
   - Use relative imports instead

4. Check for Node-specific code:
   - Some npm packages don't work in browser
   - Check `browser` field in `package.json`

---

## Getting Help

### Debug Checklist

Before asking for help, check:

- [ ] Latest versions installed (`npm update`)
- [ ] `.env.local` configured correctly
- [ ] Supabase project is active
- [ ] No console errors (DevTools → Console)
- [ ] Network requests succeed (DevTools → Network)
- [ ] Correct Node/npm versions (`node -v`, `npm -v`)
- [ ] Clear browser cache (Hard refresh: Ctrl+Shift+R)
- [ ] Try incognito/private window
- [ ] Check project GitHub issues
- [ ] Read API documentation

### Where to Ask

1. **GitHub Issues:** Report bugs: https://github.com/rdcmnation-boop/gaming-platform
2. **Discord:** Join community: [Discord link]
3. **Email:** support@rdcmpoker.com
4. **Documentation:** Check README, API docs, setup guides

### Provide Information

When asking for help, include:

```
**Environment:**
- Node: 18.0.0
- npm: 8.0.0
- OS: macOS/Windows/Linux

**Issue:**
[Describe the problem]

**Steps to reproduce:**
1. ...
2. ...

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Console error:**
[Copy exact error message]

**Screenshots:**
[Include if helpful]
```

---

## Performance Optimization Tips

### For better game experience:

1. **Reduce update frequency:**
   - Update leaderboard every 10 seconds instead of every second
   - Use debouncing for betting actions

2. **Optimize database queries:**
   - Add indexes for frequently queried columns
   - Limit query results (pagination)

3. **Lazy load components:**
   - Load leaderboard only when tab is active
   - Load tournament mode on demand

4. **Use caching:**
   - Cache leaderboard in browser
   - Refresh every 30 seconds instead of live

5. **Compress assets:**
   - Minimize CSS and JavaScript
   - Optimize images
   - Enable gzip compression

---

## Quick Reference Commands

```bash
# Clear cache and reinstall
npm cache clean --force && npm install

# Run with fresh cache
npm start -- --reset-cache

# Build for production
npm run build

# Test before deploying
npm run build && serve -s build

# Check for outdated packages
npm outdated

# Update all packages
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

For more help, see:
- README_POKER.md - Feature overview
- API_DOCUMENTATION.md - API reference
- DEPLOYMENT_GUIDE.md - Deployment steps
