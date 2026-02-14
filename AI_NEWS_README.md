# AI News Feature

## Overview
The AI News feature has been successfully integrated into your Nutri-Track application. It provides a curated feed of the latest artificial intelligence news from reputable sources around the world.

## Features

### 1. **Vertical Sidebar Navigation**
- A permanent sidebar on the left displays all available apps
- Currently includes:
  - 🍇 Nutri-Track (nutrition tracking)
  - 📰 AI News (AI news aggregator)
- Easy to add more apps in the future

### 2. **AI News Page** (`/news`)
- **Real-time News Fetching**: Aggregates news from multiple RSS feeds
- **Card Layout**: Clean, modern card-based design for easy reading
- **Source Attribution**: Each article clearly shows its source
- **Date Filtering**: Filter news by specific dates
- **Read Tracking**: Articles you've read are marked with reduced opacity
- **Bookmark System**: Save interesting articles for later reading
- **Manual Refresh**: Refresh button to fetch the latest news

### 3. **News Sources**
The application aggregates AI news from these trusted sources:
- **TechCrunch AI**: Latest AI technology news
- **MIT Technology Review**: In-depth AI analysis and research
- **VentureBeat AI**: AI business and startup news
- **The Verge AI**: Consumer-focused AI news
- **AI News**: Dedicated AI news publication

## Technical Implementation

### Backend (Python/Flask)
- **Blueprint**: `app/news/` directory contains the news module
- **Routes**:
  - `/news` - Main AI news page
  - `/news/api/fetch` - API endpoint to fetch latest news
- **Service**: `news_service.py` uses `feedparser` library to parse RSS feeds

### Frontend
- **Template**: `ai_news.html` - News page layout
- **Styling**: `sidebar.css` - Sidebar navigation and news card styles
- **JavaScript**: `ai_news.js` - Handles fetching, filtering, bookmarking, and read tracking

### Data Storage
- **Bookmarks**: Stored in browser's localStorage
- **Read Articles**: Tracked in localStorage
- **No server-side storage**: All user preferences are client-side

## Usage

1. **Navigate to AI News**: Click "AI News" in the sidebar
2. **Browse News**: Scroll through the latest articles in card format
3. **Filter by Date**: Use the date picker to see articles from specific dates
4. **Bookmark Articles**: Click the star icon (☆) to save an article
5. **View Bookmarks**: Click the floating bookmark button in the bottom-right
6. **Read Articles**: Click the arrow (→) button to open the article in a new tab
7. **Refresh News**: Click the refresh button (🔄) to fetch the latest articles

## Responsive Design
- **Desktop**: Full sidebar with labels, multi-column news grid
- **Tablet**: Narrower sidebar, two-column news grid
- **Mobile**: Icon-only sidebar (70px wide), single-column news grid

## Future Enhancements
Potential improvements you could add:
- Search functionality for news articles
- Category filtering (research, business, consumer tech, etc.)
- Social sharing buttons
- Email digest of saved articles
- Dark mode support
- Keyword alerts
- RSS feed customization

## Dependencies
- `feedparser==6.0.12` - RSS feed parsing
- `sgmllib3k==1.0.0` - Required by feedparser

## Notes
- News is fetched fresh each time you visit the page or click refresh
- No API keys required - all sources use public RSS feeds
- Articles are not stored on the server
- The app respects source copyright - only displays titles, descriptions, and links
