from flask import Blueprint

meals_bp = Blueprint('meals', __name__, url_prefix='/api/meals')

from app.meals import routes  # noqa: E402, F401
