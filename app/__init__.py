from flask import Flask, render_template
from flask_login import login_required
from config import Config
from app.extensions import db, login_manager
from app.models import User


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    # Root route - serve the main app
    @app.route('/')
    def index():
        return render_template('index.html')

    # Register blueprints
    from app.auth import auth_bp
    from app.meals import meals_bp
    from app.dashboard import dashboard_bp
    from app.export import export_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(meals_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(export_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
