# 🚀 Deploy Aurora Assist to Render (Public Hosting)

## Overview
This guide will help you deploy Aurora Assist to Render.com for free public hosting with HTTPS!

---

## 📋 Prerequisites

1. **GitHub Account** - You'll need your code on GitHub
2. **Render Account** - Sign up at https://render.com (free)
3. **Gemini API Key** - For Nutri-Track meal analysis (optional for AI News and To Do)

---

## Step 1: Push Code to GitHub

### Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `rora-assist`
3. Make it **Public** (required for free Render hosting)
4. **Don't** initialize with README
5. Click "Create repository"

### Push Your Code
```bash
cd C:\Temp\ClaudeCode\nutri-track
git remote set-url origin https://github.com/YOUR_USERNAME/rora-assist.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Sign Up for Render

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Render to access your GitHub repositories

---

## Step 3: Create a New Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Find `rora-assist` in the list
   - Click **"Connect"**
   - (If you don't see it, click "Configure account" to grant access)

3. **Configure Service**
   - **Name**: `rora-assist` (or any name you like)
   - **Region**: Choose closest to you (Oregon, Frankfurt, Singapore, etc.)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`

4. **Select Plan**
   - Choose **"Free"** plan
   - Note: Free tier sleeps after 15 min of inactivity (first request takes ~30s to wake)

5. **Advanced Settings** (Click "Advanced")
   - **Python Version**: Select `3.11.0` or higher

---

## Step 4: Configure Environment Variables

Scroll down to **Environment Variables** section and add:

### Required Variables:

| Key | Value | Notes |
|-----|-------|-------|
| `SECRET_KEY` | Click "Generate" | Auto-generates a secure key |
| `GEMINI_API_KEY` | Your Gemini API key | Get from https://aistudio.google.com/apikey |

### Optional Variables:

| Key | Value | Default |
|-----|-------|---------|
| `FLASK_ENV` | `production` | Sets production mode |

**How to add:**
1. Click **"Add Environment Variable"**
2. Enter Key and Value
3. Repeat for each variable

---

## Step 5: Deploy!

1. Click **"Create Web Service"** button at the bottom
2. Render will start building your app
3. Watch the deployment logs in real-time

**Build Process:**
- Installing Python dependencies (~2-3 min)
- Setting up database
- Starting gunicorn server

**When you see:** `"Your service is live 🎉"`
- Your app is deployed!

---

## Step 6: Access Your App

### Your Live URLs:
- **Render URL**: `https://rora-assist.onrender.com`
- (Or your custom name: `https://YOUR-APP-NAME.onrender.com`)

### Features Available:
- ✅ HTTPS by default (secure!)
- ✅ Custom domain support (optional)
- ✅ Automatic deploys on git push
- ✅ Free SSL certificate

---

## Step 7: First Time Setup

1. **Visit Your App**
   - Go to `https://YOUR-APP-NAME.onrender.com`
   - May take 30 seconds on first load (free tier waking up)

2. **Create Account**
   - Click "Create one" on login page
   - Choose username and password
   - Set daily calorie target

3. **Test All Apps**
   - ✅ Nutri-Track: Upload meal photos
   - ✅ AI News: Browse latest AI news
   - ✅ To Do: Create shared tasks

---

## 🎨 Your App Features

### Aurora Assist Hub
- Beautiful aurora borealis background
- App selector with 3 apps
- Mobile-responsive burger menu

### Apps Included:
1. **Nutri-Track** 🍇
   - AI-powered meal analysis
   - Photo-based logging
   - Calorie & macro tracking

2. **AI News** 📰
   - Latest AI news from 5 sources
   - Bookmark articles
   - Compact mobile layout

3. **To Do** ✅
   - Shared task management
   - User assignments
   - Task tracking

---

## 🔧 Configuration Tips

### Custom Domain (Optional)
1. Go to Settings → Custom Domains
2. Add your domain (e.g., `rora-assist.com`)
3. Update DNS records as shown
4. Free SSL included!

### Auto-Deploy on Git Push
Already enabled! Just:
```bash
git add .
git commit -m "Update feature"
git push origin main
```
Render auto-deploys in ~2 minutes!

### Upgrade from Free Tier
If you need:
- No sleep time (always instant)
- More resources
- Background workers

Upgrade to Starter ($7/month) in Settings → Plan

---

## 📊 Monitoring Your App

### View Logs
1. Go to Render Dashboard
2. Click your service
3. Click **"Logs"** tab
4. See real-time application logs

### Check Status
- Green dot = Running
- Yellow = Building
- Red = Error (check logs)

### Metrics (Paid plans)
- CPU usage
- Memory usage
- Request rates

---

## 🐛 Troubleshooting

### Build Fails
**Error**: `No module named 'feedparser'`
- **Fix**: Ensure `feedparser==6.0.12` is in `requirements.txt`

**Error**: `Application failed to start`
- **Fix**: Check `Start Command` is `gunicorn run:app`

### App Shows 503 Error
- Free tier is waking up (wait 30 seconds)
- Or check logs for errors

### Database Issues
- SQLite is reset on each deploy (free tier)
- For persistent DB, upgrade to paid plan with PostgreSQL

### Gemini API Not Working
- Check `GEMINI_API_KEY` is set correctly
- Verify API key at https://aistudio.google.com

---

## 🔒 Security Best Practices

### Environment Variables
✅ **Do**: Store secrets in Render Environment Variables
❌ **Don't**: Commit `.env` file to GitHub

### API Keys
✅ **Do**: Use Render's "Secret File" for sensitive keys
❌ **Don't**: Hardcode API keys in code

### HTTPS
✅ Automatically enabled on all Render apps!

---

## 💾 Database Notes

### Free Tier (SQLite)
- ⚠️ Database resets on each deploy
- User accounts and data will be lost on redeploy
- Good for testing and demos

### Persistent Database (Upgrade)
For production with persistent data:
1. Upgrade to Starter plan
2. Add PostgreSQL database (free with Starter)
3. Update `config.py` with PostgreSQL connection

---

## 🚀 Post-Deployment

### Share Your App!
Your app is now live at:
```
https://YOUR-APP-NAME.onrender.com
```

Share with:
- Friends and family
- On social media
- In your portfolio

### Keep It Updated
Regular deployments:
```bash
# Make changes
git add .
git commit -m "Feature update"
git push origin main
# Auto-deploys to Render!
```

---

## 📞 Support Resources

### Render Documentation
- Docs: https://render.com/docs
- Status: https://status.render.com
- Community: https://community.render.com

### Aurora Assist Issues
- Check logs in Render dashboard
- Review `FIXES_APPLIED.md` for common issues
- Ensure all environment variables are set

---

## ✨ Success Checklist

Before going live, verify:

- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set (SECRET_KEY, GEMINI_API_KEY)
- [ ] Build completed successfully
- [ ] App accessible via Render URL
- [ ] HTTPS working (automatic)
- [ ] Can create user account
- [ ] All 3 apps work (Nutri-Track, AI News, To Do)
- [ ] Mobile responsive (test on phone)
- [ ] Aurora background displays correctly

---

## 🎉 You're Live!

Congratulations! Aurora Assist is now publicly accessible with:
- ✅ Beautiful aurora borealis theme
- ✅ HTTPS security
- ✅ Three fully functional apps
- ✅ Mobile-optimized design
- ✅ Free hosting!

**Your app URL**: `https://YOUR-APP-NAME.onrender.com`

Share it with the world! 🌍✨

---

## Quick Command Reference

```bash
# Initial setup
cd C:\Temp\ClaudeCode\nutri-track
git remote set-url origin https://github.com/YOUR_USERNAME/rora-assist.git
git push -u origin main

# Future updates
git add .
git commit -m "Update description"
git push origin main
# Auto-deploys!
```

---

**Need Help?** Check the logs in Render Dashboard or review the troubleshooting section above!
