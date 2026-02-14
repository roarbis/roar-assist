import feedparser
from datetime import datetime
import requests
from urllib.parse import urlparse

# AI News RSS Feeds - using free, reliable sources
AI_NEWS_FEEDS = [
    {
        'name': 'TechCrunch AI',
        'url': 'https://techcrunch.com/category/artificial-intelligence/feed/',
        'source': 'TechCrunch'
    },
    {
        'name': 'MIT Technology Review AI',
        'url': 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
        'source': 'MIT Technology Review'
    },
    {
        'name': 'VentureBeat AI',
        'url': 'https://venturebeat.com/category/ai/feed/',
        'source': 'VentureBeat'
    },
    {
        'name': 'The Verge AI',
        'url': 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
        'source': 'The Verge'
    },
    {
        'name': 'AI News',
        'url': 'https://www.artificialintelligence-news.com/feed/',
        'source': 'AI News'
    }
]

def parse_feed(feed_config):
    """Parse a single RSS feed and return formatted articles"""
    articles = []
    try:
        feed = feedparser.parse(feed_config['url'])

        for entry in feed.entries[:5]:  # Get top 5 articles from each feed
            # Parse publish date
            pub_date = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                pub_date = datetime(*entry.published_parsed[:6])
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                pub_date = datetime(*entry.updated_parsed[:6])

            # Get description/summary
            description = ''
            if hasattr(entry, 'summary'):
                description = entry.summary
            elif hasattr(entry, 'description'):
                description = entry.description

            # Clean HTML tags from description
            import re
            description = re.sub('<[^<]+?>', '', description)
            description = description.strip()[:300]  # Limit to 300 chars

            # Get image if available
            image_url = None
            if hasattr(entry, 'media_content') and entry.media_content:
                image_url = entry.media_content[0].get('url')
            elif hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
                image_url = entry.media_thumbnail[0].get('url')
            elif hasattr(entry, 'enclosures') and entry.enclosures:
                for enclosure in entry.enclosures:
                    if 'image' in enclosure.get('type', ''):
                        image_url = enclosure.get('href')
                        break

            article = {
                'title': entry.title if hasattr(entry, 'title') else 'No Title',
                'link': entry.link if hasattr(entry, 'link') else '#',
                'description': description,
                'source': feed_config['source'],
                'published': pub_date.isoformat() if pub_date else datetime.now().isoformat(),
                'published_readable': pub_date.strftime('%B %d, %Y at %I:%M %p') if pub_date else 'Recently',
                'image': image_url
            }
            articles.append(article)
    except Exception as e:
        print(f"Error parsing feed {feed_config['name']}: {str(e)}")

    return articles

def get_ai_news():
    """Fetch AI news from multiple RSS feeds"""
    all_articles = []

    for feed_config in AI_NEWS_FEEDS:
        articles = parse_feed(feed_config)
        all_articles.extend(articles)

    # Sort by published date (newest first)
    all_articles.sort(key=lambda x: x['published'], reverse=True)

    # Return top 30 articles
    return all_articles[:30]
