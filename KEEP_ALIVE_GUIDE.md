# Keep Render Backend Alive - Setup Guide

Your Render free tier service hibernates after 15 minutes of inactivity. Here are 4 methods to keep it awake:

## Option 1: GitHub Actions (Recommended ✅)

**Pros:** Free, reliable, no additional services needed
**Cons:** Requires GitHub repository

### Setup:
1. The `.github/workflows/keep-alive.yml` file has been created
2. Commit and push to GitHub
3. GitHub will automatically run the workflow every 10 minutes

```bash
git add .github/workflows/keep-alive.yml
git commit -m "Add GitHub Actions keep-alive cron job"
git push
```

### Manual Testing:
- Go to your GitHub repository → Actions tab
- Click "Keep Render Backend Alive" → "Run workflow"

---

## Option 2: UptimeRobot (External Service)

**Pros:** Simple setup, dedicated monitoring service
**Cons:** Requires external account

### Setup:
1. Go to [UptimeRobot.com](https://uptimerobot.com/)
2. Sign up for free account
3. Add Monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://bookly-hwx0.onrender.com/api/health`
   - Monitoring Interval: 10 minutes
   - Alert Contacts: Your email

---

## Option 3: Render Native Cron Job

**Pros:** Native to Render, no external dependencies
**Cons:** Costs $7/month for cron jobs on Render

### Setup:
1. The `keep_alive.py` script and updated `render.yaml` are ready
2. Commit and push to deploy:

```bash
git add order/backend/keep_alive.py order/backend/render.yaml
git commit -m "Add Render native cron job for keep-alive"
git push
```

3. In Render dashboard, the cron job will appear automatically

---

## Option 4: Local Cron Job (If you have a server)

**Pros:** Full control
**Cons:** Requires always-on machine

### Setup (Linux/Mac):
```bash
# Edit crontab
crontab -e

# Add this line (runs every 10 minutes)
*/10 * * * * curl -s https://bookly-hwx0.onrender.com/api/health > /dev/null
```

---

## Recommended Approach

1. **Start with Option 1 (GitHub Actions)** - It's free and reliable
2. **Add Option 2 (UptimeRobot)** as backup monitoring
3. Only use Option 3 if you upgrade to Render's paid plan

## Testing

To test if your backend is staying awake:
1. Check Render logs for regular activity
2. Monitor response times (should be fast, not slow from hibernation)
3. Check GitHub Actions runs or UptimeRobot reports

## Current Status

✅ GitHub Actions workflow created
✅ Render cron job files created  
✅ Keep-alive script ready
🔄 Choose your preferred method and deploy!
