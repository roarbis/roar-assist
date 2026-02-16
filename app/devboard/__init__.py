from flask import Blueprint

devboard_bp = Blueprint('devboard', __name__, url_prefix='/api/devboard')

from app.devboard import routes
