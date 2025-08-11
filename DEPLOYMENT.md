# Deployment Guide

## Frontend (Netlify) - ✅ Done
Your React app is already deployed to Netlify.

## Backend (Render) - 🚧 Ready for Deployment

### Step 1: Deploy to Render
1. **Go to [Render.com](https://render.com)** and sign up/login with GitHub
2. **Click "New +"** → "Web Service"
3. **Connect your GitHub repository** (OrderAgain)
4. **Configure the service:**
   - **Name:** `orderagain-backend`
   - **Root Directory:** `order/backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance Type:** Free tier is fine for testing

### Step 2: Configure Environment Variables in Render
In Render's service dashboard, add these environment variables:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
FLASK_ENV=production
```

### Step 3: Update Netlify Environment Variables
In Netlify site settings → Environment variables, add:
```
VITE_API_BASE_URL=https://your-render-service-name.onrender.com/api
```

### Step 4: Redeploy Frontend
After setting the environment variable, trigger a new Netlify deployment to pick up the API URL.

## Files Created for Render:
- ✅ `render.yaml` - Optional configuration file
- ✅ `requirements.txt` - Updated with gunicorn
- ✅ CORS configured for Netlify domains
- ✅ Port configuration for Render

## Local Development
Create `order/.env.local`:
```
VITE_API_BASE_URL=http://localhost:3001/api
```
