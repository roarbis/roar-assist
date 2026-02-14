from app.extensions import db
from flask_login import UserMixin
from datetime import datetime, timezone


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    daily_calorie_target = db.Column(db.Integer, default=2000)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    meals = db.relationship('Meal', backref='user', lazy=True, cascade='all, delete-orphan')


class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    food_name = db.Column(db.String(200), nullable=False)
    calories = db.Column(db.Float, nullable=False)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fat = db.Column(db.Float, default=0)
    food_score = db.Column(db.Integer, default=5)
    health_benefits = db.Column(db.Text, default='[]')
    health_negatives = db.Column(db.Text, default='[]')
    image_data = db.Column(db.LargeBinary, nullable=True)
    logged_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class TodoTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    created_by = db.relationship('User', foreign_keys=[created_by_id], backref='tasks_created')
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id], backref='tasks_assigned')
