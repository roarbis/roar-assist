# 🚀 Getting Started with Nutri-Track

Welcome! Here's everything you need to start using Nutri-Track.

---

## ⚡ Quick Start (5 minutes)

### Step 1: Get Your Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API Key"** in the top right
4. Click **"Create API key in new project"**
5. Copy the key (starts with `AIza...`)

### Step 2: Add the Key to Nutri-Track

1. Open this file: `C:\Temp\ClaudeCode\nutri-track\.env`
2. Replace this line:
   ```
   GEMINI_API_KEY=PASTE_YOUR_GEMINI_API_KEY_HERE
   ```
   With your actual key:
   ```
   GEMINI_API_KEY=AIzaSy...your-key-here
   ```
3. Save the file

### Step 3: Start the Server

**Option A: Double-click `start.bat`**
- Just double-click the `start.bat` file in the nutri-track folder

**Option B: Run from command line**
```bash
C:\Temp\ClaudeCode\python313\python.exe C:\Temp\ClaudeCode\nutri-track\run.py
```

You'll see:
```
Nutri-Track is running!
Local:   http://localhost:5000
Network: http://192.168.x.x:5000
(Use the Network URL on your iPhone)
```

### Step 4: Access from Your iPhone

1. Make sure your iPhone is on the **same Wi-Fi** as your computer
2. Open Safari on your iPhone
3. Type the **Network URL** (e.g., `http://192.168.x.x:5000`)
4. Create an account (choose any username/password)
5. Set your daily calorie target
6. Start tracking meals!

### Step 5 (Optional): Add to Home Screen

1. In Safari, tap the Share button (square with arrow)
2. Scroll down and tap **"Add to Home Screen"**
3. Name it "Nutri-Track"
4. Tap **Add**

Now it opens like a real app!

---

## 🌙 Dark Mode

Dark mode activates automatically based on your phone's settings. To manually control it:

1. Open the app
2. Tap the ⚙️ **Settings** icon (top right)
3. Choose **Auto**, **Light**, or **Dark**

Your choice is saved and persists across sessions.

---

## 📸 How to Use

### Log a Meal

1. Tap the **+ button** at the bottom
2. Tap **"Take Photo"** (uses camera) or **"Choose from Gallery"**
3. Take/select a photo of your food
4. Wait 2-3 seconds while AI analyzes it
5. Review the results:
   - Food name
   - Calories
   - Protein, carbs, fat
   - Food score (1-10, higher = healthier)
   - Health benefits (green tags)
   - Health warnings (red tags)
6. Tap **"Log This Meal"**

### View Progress

- The **top bar** shows your daily calorie progress
- Turns **green** → **yellow** → **red** as you approach your limit
- Tap **Dashboard** to see macro breakdown (pie chart)

### Check History

- Tap **History** at the bottom
- Use the date picker to browse past days
- See calories, macros, and food scores

### Weekly Summary

- Tap **Weekly** at the bottom
- See a 7-day bar chart
- View average calories, best/worst days
- Tap **Export to CSV** to download your log

---

## 🔧 Troubleshooting

### "Can't connect" from iPhone

1. Make sure both devices are on the **same Wi-Fi**
2. Check that Windows Firewall isn't blocking port 5000:
   - Open **PowerShell as Administrator**
   - Run:
     ```powershell
     netsh advfirewall firewall add rule name="NutriTrack" dir=in action=allow protocol=TCP localport=5000
     ```

### "API key invalid" error

1. Check that you pasted the key correctly in `.env`
2. Make sure there are **no quotes** around the key
3. Make sure there are **no spaces** before or after the key
4. Run the diagnostic:
   ```
   C:\Temp\ClaudeCode\python313\python.exe C:\Temp\ClaudeCode\nutri-track\test_api_key.py
   ```

### Photo analysis is slow

- Gemini API can take 2-5 seconds
- If it takes longer, check your internet connection
- Free tier has rate limits (15 requests/min)

### App looks weird / broken

- Try clearing your browser cache
- On iPhone: Settings → Safari → Clear History and Website Data
- Reload the page

### Want to reset everything

Delete the database file:
```
C:\Temp\ClaudeCode\nutri-track\instance\nutri_track.db
```

Next time you start the server, it will create a fresh database.

---

## 🌐 Want Public Access?

Currently, Nutri-Track only works on your local network. To access it from anywhere:

**See [HOSTING.md](HOSTING.md)** for deployment options including:
- Free hosting on Render.com or Railway.app
- Self-hosting with Cloudflare Tunnel
- Professional hosting on Heroku or DigitalOcean

---

## 🎯 Tips for Best Results

### Photo Tips
- Take photos in **good lighting**
- Get the **whole plate/meal** in frame
- Photos from **above** work best
- Close-ups are fine, but show the portion size if possible

### Accuracy
- AI estimates are **approximate** (±10-20%)
- For precise tracking, weigh food and use nutrition labels
- The app is best for **general awareness** and trends

### Privacy
- Your data stays on your computer (or chosen hosting)
- Photos are compressed and stored as thumbnails
- No data is sent to third parties (only Google Gemini for analysis)

---

## ❓ FAQ

**Q: Is Gemini API free?**
A: Yes! Free tier: 15 requests/min, 1500/day. Plenty for personal use.

**Q: Can I use this offline?**
A: Photo analysis requires internet (Gemini API). Browsing history works offline thanks to the service worker.

**Q: Can multiple people use it?**
A: Yes! Each person creates their own account. Data is separated by user.

**Q: How accurate is the calorie count?**
A: AI estimates are good for general tracking (±10-20% accuracy). Not a substitute for weighing food.

**Q: Can I change my calorie target?**
A: Yes! Tap Settings (⚙️) → change "Daily Calorie Target" → Save.

**Q: What if I eat the same meal every day?**
A: You'll need to snap a photo each time (no meal templates yet — could be a future feature!).

**Q: Does it work on Android?**
A: Yes! The web app works on any modern browser.

---

## 🆘 Need Help?

- Check [HOSTING.md](HOSTING.md) for deployment help
- Check [README.md](README.md) for technical details
- Run `test_api_key.py` to diagnose API issues

**Enjoy tracking!** 🍎
