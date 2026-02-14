from flask import Blueprint

news_bp = Blueprint('news', __name__, url_prefix='/news')

from app.news import routes
