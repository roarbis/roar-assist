# 🍎 Nutri-Track

**AI-powered calorie tracking from food photos**

Snap a photo of your meal → get instant calorie and nutrition analysis powered by Google Gemini AI.

![Nutri-Track](https://img.shields.io/badge/Status-Active-success) ![Python](https://img.shields.io/badge/Python-3.13-blue) ![Flask](https://img.shields.io/badge/Flask-3.1-lightgrey) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 📸 **Photo-Based Tracking** — Take a photo, get instant calorie estimates
- 🤖 **AI-Powered Analysis** — Gemini 2.0 Flash analyzes food, macros, and health benefits
- 📊 **Visual Progress** — Dynamic progress bar and macro breakdown charts
- 🔢 **Food Scoring** — Each meal gets a nutritional density score (1-10)
- 💡 **Smart Suggestions** — AI recommends meals when you're near your calorie limit
- 📅 **Weekly Summary** — 7-day calorie chart with stats
- 📥 **CSV Export** — Download your full meal log
- 🌙 **Beautiful Dark Mode** — Auto-switching based on system preference
- 📱 **PWA Support** — Add to home screen for app-like experience
- 👥 **Multi-User** — Each user has their own account and data

---

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.10+ (or use the included portable Python)
- Google Gemini API key ([Get one free](https://aistudio.google.com))

### Installation

1. **Clone or download** this repo
   ```bash
   git clone https://github.com/YOUR_USERNAME/nutri-track.git
   cd nutri-track
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure your API key**
   - Open `.env` file
   - Replace `PASTE_YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key

4. **Run the app**
   ```bash
   python run.py
   ```

5. **Access from your phone**
   - Open the URL shown in the terminal (e.g., `http://192.168.x.x:5000`)
   - Make sure your phone is on the same Wi-Fi network
   - Bookmark or add to home screen

---

## 📱 Mobile Setup

### iPhone/iPad (Safari)
1. Open the app URL in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Nutri-Track" and tap Add
5. Now it opens like a native app!

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the menu (three dots)
3. Tap **"Add to Home screen"**
4. Tap Add, then Add again

---

## 🌐 Public Hosting

Want to access Nutri-Track from anywhere? See **[HOSTING.md](HOSTING.md)** for deployment options:

- **Free:** Render.com, Railway.app (with limits)
- **Paid:** Heroku ($7/mo), DigitalOcean ($5/mo)
- **Self-hosted:** Cloudflare Tunnel (free, keeps data on your PC)

---

## 🎨 Dark Mode

Dark mode automatically activates based on your device's system preference. You can also manually toggle it:

1. Tap the ⚙️ Settings icon
2. Choose **Auto**, **Light**, or **Dark**
3. Your choice is saved across sessions

---

## 🧪 How It Works

1. **Photo Capture** — Uses your device's camera via HTML5 File API
2. **Image Upload** — Sends to Flask backend
3. **AI Analysis** — Gemini Vision API analyzes the food and returns:
   - Estimated calories
   - Protein, carbs, fat (in grams)
   - Portion size
   - Food score (nutritional density, 1-10)
   - Health benefits and negatives
4. **Storage** — Saves to SQLite database with a compressed thumbnail
5. **Visualization** — Updates progress bar, charts, and meal log

---

## 🗂️ Project Structure

```
nutri-track/
├── app/
│   ├── __init__.py           # App factory
│   ├── models.py             # User + Meal database models
│   ├── auth/                 # Login/register routes
│   ├── meals/                # Photo analysis + meal logging
│   │   └── gemini_service.py # Gemini API integration
│   ├── dashboard/            # Summary + weekly stats
│   ├── export/               # CSV export
│   ├── templates/            # HTML pages
│   └── static/
│       ├── css/style.css     # Mobile-first styles + dark mode
│       ├── js/               # Modular frontend code
│       ├── manifest.json     # PWA manifest
│       └── sw.js             # Service worker
├── config.py                 # Flask configuration
├── run.py                    # Entry point
├── requirements.txt          # Python dependencies
├── .env                      # API keys (not committed to git)
└── instance/
    └── nutri_track.db        # SQLite database (auto-created)
```

---

## 🔧 Tech Stack

- **Backend:** Python 3.13, Flask, SQLAlchemy
- **Frontend:** Vanilla JS, Chart.js, CSS Grid/Flexbox
- **Database:** SQLite (can upgrade to PostgreSQL for production)
- **AI:** Google Gemini 2.0 Flash (vision + text generation)
- **Auth:** Flask-Login (session-based)
- **PWA:** Service Worker, Web App Manifest

---

## 🛠️ Development

### Run in debug mode
```bash
python run.py
```

### Test API key
```bash
python test_api_key.py
```

### Add new features
The app uses a modular blueprint architecture:
- New API endpoints → add a blueprint in `app/`
- New pages → add to `app/templates/`
- Frontend logic → add to `app/static/js/`

---

## 🔐 Security Notes

- **Never commit `.env`** — it's in `.gitignore` for a reason
- **Change SECRET_KEY** before production deployment
- **Enable HTTPS** for public hosting (all recommended hosts provide this)
- **Rate limit** for public access (see HOSTING.md)

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Log in |
| `POST` | `/auth/logout` | Log out |
| `POST` | `/api/meals/analyze` | Upload photo → get AI analysis |
| `POST` | `/api/meals/log` | Save meal to database |
| `GET` | `/api/meals/today` | Get today's meals + totals |
| `DELETE` | `/api/meals/<id>` | Delete a meal |
| `GET` | `/api/meals/suggest` | Get AI meal suggestions |
| `GET` | `/api/dashboard/summary` | Today's calorie/macro summary |
| `GET` | `/api/dashboard/weekly` | 7-day aggregated data |
| `PUT` | `/api/dashboard/target` | Update daily calorie target |
| `GET` | `/api/export/csv` | Download meal log as CSV |

---

## 🤝 Contributing

Contributions welcome! Ideas for improvements:

- Barcode scanner for packaged foods
- Integration with fitness trackers (Fitbit, Apple Health)
- Meal planning / recipes
- Social features (share meals, follow friends)
- Better offline support
- Multi-language support

---

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

---

## 💬 Support

Issues? Questions? Open a GitHub issue or reach out!

**Enjoy tracking your nutrition with AI!** 🍎🤖
