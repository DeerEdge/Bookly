# Deployment Guide

## Frontend (Netlify) - ✅ Done
Your React app is already deployed to Netlify.

## Backend (Railway) - 🚧 In Progress

### Step 1: Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `OrderAgain` repository
5. Set **Root Directory** to `order/backend`
6. Railway will auto-detect Python and deploy

### Step 2: Configure Environment Variables in Railway
Add these in Railway's dashboard under "Variables":
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=8080
```

### Step 3: Update Netlify Environment Variables
In Netlify site settings → Environment variables, add:
```
VITE_API_BASE_URL=https://your-railway-app-name.railway.app/api
```

### Step 4: Redeploy Frontend
After setting the environment variable, trigger a new Netlify deployment to pick up the API URL.

## Alternative: Use Supabase Edge Functions
If you prefer serverless, you could migrate the Flask API to Supabase Edge Functions.

## Local Development
Create `order/.env.local`:
```
VITE_API_BASE_URL=http://localhost:3001/api
```
