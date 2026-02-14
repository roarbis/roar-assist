from flask import render_template, jsonify
from app.news import news_bp
from app.news.news_service import get_ai_news

@news_bp.route('/')
def index():
    """Render the AI News page"""
    return render_template('ai_news.html')

@news_bp.route('/api/fetch')
def fetch_news():
    """API endpoint to fetch latest AI news"""
    try:
        news_items = get_ai_news()
        return jsonify({
            'success': True,
            'news': news_items
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
