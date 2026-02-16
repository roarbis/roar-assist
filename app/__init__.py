from flask import Flask, render_template, jsonify, redirect, url_for
from flask_login import login_required, current_user
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

    # Root route - redirect to app selector if logged in, otherwise login
    @app.route('/')
    def index():
        if current_user.is_authenticated:
            return redirect(url_for('apps'))
        return redirect(url_for('auth.login'))

    # App selector route
    @app.route('/apps')
    @login_required
    def apps():
        return render_template('app_selector.html')

    # Nutri-Track app route
    @app.route('/nutri-track')
    @login_required
    def nutri_track():
        return render_template('index.html')

    # Dev Board app route
    @app.route('/devboard')
    @login_required
    def devboard():
        return render_template('devboard.html')

    # API endpoint to get current user info
    @app.route('/api/user')
    @login_required
    def get_user():
        return jsonify({
            'user_id': current_user.id,
            'username': current_user.username
        })

    # Register blueprints
    from app.auth import auth_bp
    from app.meals import meals_bp
    from app.dashboard import dashboard_bp
    from app.export import export_bp
    from app.news import news_bp
    from app.todo import todo_bp
    from app.devboard import devboard_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(meals_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(news_bp)
    app.register_blueprint(todo_bp)
    app.register_blueprint(devboard_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
