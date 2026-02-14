from flask import request, jsonify, render_template, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models import User
from app.auth import auth_bp


@auth_bp.route('/login', methods=['GET'])
def login_page():
    if current_user.is_authenticated:
        return redirect('/')
    return render_template('login.html')


@auth_bp.route('/register', methods=['GET'])
def register_page():
    return render_template('register.html')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    calorie_target = data.get('calorie_target', 2000)

    if not username or not password:
        return jsonify(error=True, message='Username and password are required'), 400

    if len(username) < 3:
        return jsonify(error=True, message='Username must be at least 3 characters'), 400

    if len(password) < 6:
        return jsonify(error=True, message='Password must be at least 6 characters'), 400

    if User.query.filter_by(username=username).first():
        return jsonify(error=True, message='Username already taken'), 400

    try:
        calorie_target = int(calorie_target)
        if calorie_target < 500 or calorie_target > 10000:
            calorie_target = 2000
    except (ValueError, TypeError):
        calorie_target = 2000

    user = User(
        username=username,
        password_hash=generate_password_hash(password),
        daily_calorie_target=calorie_target
    )
    db.session.add(user)
    db.session.commit()

    login_user(user)
    return jsonify(success=True, message='Account created', user_id=user.id)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify(error=True, message='Invalid username or password'), 401

    login_user(user, remember=True)
    return jsonify(success=True, user_id=user.id, username=user.username)


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify(success=True)


@auth_bp.route('/status', methods=['GET'])
def status():
    if current_user.is_authenticated:
        return jsonify(
            logged_in=True,
            username=current_user.username,
            calorie_target=current_user.daily_calorie_target
        )
    return jsonify(logged_in=False)
