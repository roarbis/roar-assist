# 🚀 Quick Start - Deploy to Render in 5 Minutes

## Step-by-Step Deployment

### 1. Create GitHub Repository (2 minutes)
```bash
# Go to: https://github.com/new
# Name: rora-assist
# Visibility: Public
# Click: Create repository

# Then push your code:
cd C:\Temp\ClaudeCode\nutri-track
git remote set-url origin https://github.com/YOUR_USERNAME/rora-assist.git
git push -u origin main
```

### 2. Deploy to Render (2 minutes)
1. Go to: https://render.com
2. Sign up with GitHub
3. Click: **New +** → **Web Service**
4. Select: `rora-assist` repository
5. Settings:
   - Name: `rora-assist`
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn run:app`
   - Plan: **Free**
6. Add Environment Variables:
   - `SECRET_KEY`: Click "Generate"
   - `GEMINI_API_KEY`: Your API key from https://aistudio.google.com/apikey
7. Click: **Create Web Service**

### 3. Access Your App (1 minute)
Wait for build to complete (~2-3 minutes), then visit:
```
https://YOUR-APP-NAME.onrender.com
```

## That's It! 🎉

Your Aurora Assist is now live with:
- ✅ HTTPS (secure)
- ✅ Public URL
- ✅ Auto-deploy on git push
- ✅ All 3 apps working

**Need more details?** See `RENDER_DEPLOYMENT_GUIDE.md`
