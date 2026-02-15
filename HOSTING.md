# Nutri-Track Hosting Guide

This guide covers multiple options for hosting Nutri-Track publicly so you can access it from anywhere, not just your local network.

---

## Option 1: Free Hosting on Render.com (Recommended for Beginners)

**Pros:** Free tier, easy setup, HTTPS included, good for personal use
**Cons:** App sleeps after 15 min of inactivity (takes ~30s to wake up)

### Steps:

1. **Push to GitHub**
   ```bash
   cd C:\Temp\ClaudeCode\nutri-track
   git init
   git add .
   git commit -m "Initial commit"
   # Create a new repo on GitHub, then:
   git remote add origin https://github.com/roarbis/nutri-track.git
   git remote set-url origin https://github.com/roarbis/nutri-track.git
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com) and sign up (free)

3. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Choose "nutri-track"

4. **Configure the Service**
   - **Name:** `nutri-track` (or any name)
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
   - **Plan:** Free

5. **Add Environment Variables**
   - Click "Environment" tab
   - Add two variables:
     - `SECRET_KEY` = `your-random-secret-key-here`
     - `GEMINI_API_KEY` = `your-gemini-api-key`

6. **Add Gunicorn to requirements.txt**
   Before deploying, add this line to `requirements.txt`:
   ```
   gunicorn==21.2.0
   ```

7. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - You'll get a URL like `https://nutri-track.onrender.com`

**Cost:** FREE (with sleep after 15 min inactivity)

---

## Option 2: Railway.app (Good Free Tier)

**Pros:** $5 free credit/month, no sleep, fast, HTTPS included
**Cons:** Costs after free credit runs out (~$3-5/month)

### Steps:

1. Push to GitHub (same as Option 1)

2. Go to [railway.app](https://railway.app) and sign up

3. Click "New Project" → "Deploy from GitHub repo"

4. Select your `nutri-track` repo

5. Railway auto-detects Python. Add these environment variables:
   - `SECRET_KEY`
   - `GEMINI_API_KEY`
   - `PORT` = `5000`

6. Add a `Procfile` to your repo root:
   ```
   web: gunicorn -w 4 -b 0.0.0.0:$PORT run:app
   ```

7. Add `gunicorn==21.2.0` to `requirements.txt`

8. Push changes, Railway auto-deploys

**Cost:** FREE for ~500 hours/month ($5 credit)

---

## Option 3: PythonAnywhere (Easiest for Flask)

**Pros:** Made for Flask/Django, free tier available, always-on
**Cons:** Free tier has limited CPU, slow, HTTP only (HTTPS requires paid plan)

### Steps:

1. Sign up at [pythonanywhere.com](https://www.pythonanywhere.com)

2. Go to "Web" tab → "Add a new web app"

3. Choose "Flask" and Python 3.10

4. Upload your code via "Files" tab or use their bash console:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nutri-track.git
   cd nutri-track
   pip3.10 install --user -r requirements.txt
   ```

5. Configure the WSGI file:
   - Go to "Web" tab → click on the WSGI config file
   - Replace contents with:
   ```python
   import sys
   import os

   path = '/home/YOUR_USERNAME/nutri-track'
   if path not in sys.path:
       sys.path.append(path)

   os.environ['GEMINI_API_KEY'] = 'your-key-here'
   os.environ['SECRET_KEY'] = 'your-secret-here'

   from run import app as application
   ```

6. Reload the web app

**Cost:** FREE (with ads, 512MB RAM limit)

---

## Option 4: Heroku (Reliable, Paid)

**Pros:** Rock-solid reliability, great for production
**Cons:** No free tier anymore ($7/month minimum)

### Steps:

1. Install Heroku CLI: `winget install Heroku.HerokuCLI`

2. Create a `Procfile`:
   ```
   web: gunicorn -w 4 -b 0.0.0.0:$PORT run:app
   ```

3. Add `gunicorn==21.2.0` to `requirements.txt`

4. Deploy:
   ```bash
   heroku login
   heroku create nutri-track
   heroku config:set GEMINI_API_KEY=your-key
   heroku config:set SECRET_KEY=your-secret
   git push heroku main
   ```

**Cost:** $7/month (Eco tier)

---

## Option 5: Self-Host with Cloudflare Tunnel (Free, Full Control)

**Pros:** Free, no sleep, keep data on your PC, HTTPS included
**Cons:** Your PC must stay on, more technical setup

### Steps:

1. Install Cloudflare Tunnel (cloudflared):
   ```
   winget install Cloudflare.cloudflared
   ```

2. Login to Cloudflare:
   ```
   cloudflared tunnel login
   ```

3. Create a tunnel:
   ```
   cloudflared tunnel create nutri-track
   ```

4. Configure the tunnel (create `config.yml`):
   ```yaml
   tunnel: <TUNNEL-ID>
   credentials-file: C:\Users\YOUR_USER\.cloudflared\<TUNNEL-ID>.json

   ingress:
     - hostname: nutri.yourdomain.com
       service: http://localhost:5000
     - service: http_status:404
   ```

5. Route DNS:
   ```
   cloudflared tunnel route dns nutri-track nutri.yourdomain.com
   ```

6. Run the tunnel:
   ```
   cloudflared tunnel run nutri-track
   ```

7. Start Nutri-Track on your PC as usual

**Cost:** FREE (requires a Cloudflare account and domain)

---

## Option 6: DigitalOcean App Platform

**Pros:** Professional, scalable, fast
**Cons:** $5/month minimum

### Steps:

1. Push to GitHub
2. Sign up at [digitalocean.com](https://www.digitalocean.com)
3. Go to "Apps" → "Create App" → "GitHub"
4. Select repo, DigitalOcean auto-detects Python
5. Add environment variables
6. Deploy

**Cost:** $5/month

---

## Recommended Choice by Use Case

- **Just for yourself (hobby):** Render.com free tier
- **Share with friends (low traffic):** Railway.app
- **Production / business:** Heroku or DigitalOcean
- **Keep data private / on your PC:** Cloudflare Tunnel
- **Simplest for beginners:** PythonAnywhere

---

## Important Security Notes for Public Hosting

### 1. Use a Strong SECRET_KEY
Never use the default. Generate one:
```python
import secrets
print(secrets.token_hex(32))
```

### 2. Set Up HTTPS
All hosting options above provide HTTPS except PythonAnywhere free tier.

### 3. Database Considerations
The current SQLite setup works for low-traffic personal use. For production with multiple users, consider upgrading to PostgreSQL:
- Render, Railway, Heroku all offer free/cheap PostgreSQL
- Update `SQLALCHEMY_DATABASE_URI` in `config.py` to use PostgreSQL

### 4. Rate Limiting
For public access, add rate limiting to prevent abuse:
```bash
pip install Flask-Limiter
```

Add to `app/__init__.py`:
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
```

### 5. Gemini API Quota
Free tier: 15 requests/min. For higher usage, enable billing in Google Cloud Console.

---

## Next Steps After Deployment

1. Test all features (photo upload, login, meal logging)
2. Set up error monitoring (e.g., Sentry.io free tier)
3. Add your iPhone to home screen (PWA)
4. Consider adding user email verification for public access
5. Set up automated backups of the SQLite database

For any issues, check the platform's logs:
- **Render:** "Logs" tab
- **Railway:** "Deployments" → click deployment → "View Logs"
- **Heroku:** `heroku logs --tail`
