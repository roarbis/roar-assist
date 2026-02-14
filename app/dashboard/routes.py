from datetime import datetime, timezone, timedelta
from flask import request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import func
from app.extensions import db
from app.models import Meal
from app.dashboard import dashboard_bp


@dashboard_bp.route('/summary', methods=['GET'])
@login_required
def summary():
    tz_offset = request.args.get('tz_offset', 0, type=int)
    now = datetime.now(timezone.utc) - timedelta(minutes=tz_offset)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)

    meals = Meal.query.filter(
        Meal.user_id == current_user.id,
        Meal.logged_at >= start,
        Meal.logged_at < end
    ).all()

    total_cal = sum(m.calories for m in meals)
    total_protein = sum(m.protein for m in meals)
    total_carbs = sum(m.carbs for m in meals)
    total_fat = sum(m.fat for m in meals)
    target = current_user.daily_calorie_target

    return jsonify(
        total_calories=round(total_cal, 1),
        total_protein=round(total_protein, 1),
        total_carbs=round(total_carbs, 1),
        total_fat=round(total_fat, 1),
        target=target,
        remaining=round(max(0, target - total_cal), 1),
        progress_pct=round((total_cal / target) * 100, 1) if target > 0 else 0,
        meal_count=len(meals)
    )


@dashboard_bp.route('/weekly', methods=['GET'])
@login_required
def weekly():
    tz_offset = request.args.get('tz_offset', 0, type=int)
    now = datetime.now(timezone.utc) - timedelta(minutes=tz_offset)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    days = []
    for i in range(6, -1, -1):
        day_start = today_start - timedelta(days=i)
        day_end = day_start + timedelta(days=1)

        meals = Meal.query.filter(
            Meal.user_id == current_user.id,
            Meal.logged_at >= day_start,
            Meal.logged_at < day_end
        ).all()

        total_cal = sum(m.calories for m in meals)
        total_protein = sum(m.protein for m in meals)
        total_carbs = sum(m.carbs for m in meals)
        total_fat = sum(m.fat for m in meals)

        days.append({
            'date': day_start.strftime('%Y-%m-%d'),
            'day_name': day_start.strftime('%a'),
            'total_calories': round(total_cal, 1),
            'total_protein': round(total_protein, 1),
            'total_carbs': round(total_carbs, 1),
            'total_fat': round(total_fat, 1),
            'meal_count': len(meals)
        })

    # Calculate averages
    cal_values = [d['total_calories'] for d in days if d['total_calories'] > 0]
    avg_cal = round(sum(cal_values) / len(cal_values), 1) if cal_values else 0

    return jsonify(
        days=days,
        average_calories=avg_cal,
        target=current_user.daily_calorie_target
    )


@dashboard_bp.route('/target', methods=['PUT'])
@login_required
def update_target():
    data = request.get_json()
    target = data.get('target')

    if target is None:
        return jsonify(error=True, message='Target is required'), 400

    try:
        target = int(target)
        if target < 500 or target > 10000:
            return jsonify(error=True, message='Target must be between 500 and 10,000'), 400
    except (ValueError, TypeError):
        return jsonify(error=True, message='Invalid target value'), 400

    current_user.daily_calorie_target = target
    db.session.commit()

    return jsonify(success=True, new_target=target)
