"""
Quick test script to verify AI News functionality
"""
import sys
import os
import io

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Ensure the project root is on the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.news.news_service import get_ai_news

def test_news_fetch():
    print("Testing AI News RSS feed fetching...")
    print("-" * 50)

    try:
        news = get_ai_news()

        if not news:
            print("❌ No news articles fetched")
            return False

        print(f"✅ Successfully fetched {len(news)} news articles")
        print("\nFirst 3 articles:")
        print("-" * 50)

        for i, article in enumerate(news[:3], 1):
            print(f"\n{i}. {article['title']}")
            print(f"   Source: {article['source']}")
            print(f"   Date: {article['published_readable']}")
            print(f"   Link: {article['link'][:80]}...")
            if article['description']:
                print(f"   Description: {article['description'][:100]}...")

        print("\n" + "-" * 50)
        print(f"✅ AI News service is working correctly!")
        return True

    except Exception as e:
        print(f"❌ Error fetching news: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    test_news_fetch()
