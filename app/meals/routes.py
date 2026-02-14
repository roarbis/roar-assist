import json
import base64
from datetime import datetime, timezone, timedelta
from flask import request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models import Meal
from app.meals import meals_bp
from app.meals.gemini_service import analyze_food_image, get_meal_suggestions
from PIL import Image
import io


def get_today_range(tz_offset_minutes=0):
    """Get start and end of today in user's timezone."""
    now = datetime.now(timezone.utc) - timedelta(minutes=tz_offset_minutes)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return start, end


@meals_bp.route('/analyze', methods=['POST'])
@login_required
def analyze():
    if 'image' not in request.files:
        return jsonify(error=True, message='No image provided'), 400

    file = request.files['image']
    image_bytes = file.read()
    mime_type = file.content_type or 'image/jpeg'

    if not image_bytes:
        return jsonify(error=True, message='Empty image file'), 400

    try:
        import os
        api_key = os.environ.get('GEMINI_API_KEY', '')
        if not api_key or api_key == 'PASTE_YOUR_GEMINI_API_KEY_HERE':
            return jsonify(error=True, message='Gemini API key not configured. Edit the .env file in the project root.'), 500

        result = analyze_food_image(image_bytes, mime_type)

        # Create a compressed thumbnail for storage
        thumbnail_b64 = None
        try:
            img = Image.open(io.BytesIO(image_bytes))
            img.thumbnail((300, 300))
            buf = io.BytesIO()
            img.save(buf, format='JPEG', quality=60)
            thumbnail_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        except Exception:
            pass

        result['thumbnail'] = thumbnail_b64
        return jsonify(result)

    except json.JSONDecodeError:
        return jsonify(error=True, message='Could not parse AI response. Please try again.'), 500
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify(error=True, message=f'Analysis failed: {str(e)}'), 500


@meals_bp.route('/log', methods=['POST'])
@login_required
def log_meal():
    data = request.get_json()

    if not data or 'food_name' not in data or 'calories' not in data:
        return jsonify(error=True, message='Missing required fields'), 400

    # Decode thumbnail if provided
    image_data = None
    if data.get('thumbnail'):
        try:
            image_data = base64.b64decode(data['thumbnail'])
        except Exception:
            pass

    meal = Meal(
        user_id=current_user.id,
        food_name=data['food_name'],
        calories=float(data['calories']),
        protein=float(data.get('protein', 0)),
        carbs=float(data.get('carbs', 0)),
        fat=float(data.get('fat', 0)),
        food_score=int(data.get('food_score', 5)),
        health_benefits=json.dumps(data.get('health_benefits', [])),
        health_negatives=json.dumps(data.get('health_negatives', [])),
        image_data=image_data
    )

    db.session.add(meal)
    db.session.commit()

    return jsonify(success=True, meal_id=meal.id)


@meals_bp.route('/today', methods=['GET'])
@login_required
def today():
    tz_offset = request.args.get('tz_offset', 0, type=int)
    start, end = get_today_range(tz_offset)

    meals = Meal.query.filter(
        Meal.user_id == current_user.id,
        Meal.logged_at >= start,
        Meal.logged_at < end
    ).order_by(Meal.logged_at.desc()).all()

    total_cal = sum(m.calories for m in meals)
    total_protein = sum(m.protein for m in meals)
    total_carbs = sum(m.carbs for m in meals)
    total_fat = sum(m.fat for m in meals)
    target = current_user.daily_calorie_target

    meals_data = []
    for m in meals:
        meal_dict = {
            'id': m.id,
            'food_name': m.food_name,
            'calories': m.calories,
            'protein': m.protein,
            'carbs': m.carbs,
            'fat': m.fat,
            'food_score': m.food_score,
            'health_benefits': json.loads(m.health_benefits),
            'health_negatives': json.loads(m.health_negatives),
            'logged_at': m.logged_at.isoformat(),
            'has_image': m.image_data is not None
        }
        meals_data.append(meal_dict)

    return jsonify(
        meals=meals_data,
        total_calories=round(total_cal, 1),
        total_protein=round(total_protein, 1),
        total_carbs=round(total_carbs, 1),
        total_fat=round(total_fat, 1),
        target=target,
        progress_pct=round((total_cal / target) * 100, 1) if target > 0 else 0
    )


@meals_bp.route('/<int:meal_id>', methods=['DELETE'])
@login_required
def delete_meal(meal_id):
    meal = Meal.query.filter_by(id=meal_id, user_id=current_user.id).first()
    if not meal:
        return jsonify(error=True, message='Meal not found'), 404

    db.session.delete(meal)
    db.session.commit()
    return jsonify(success=True)


@meals_bp.route('/image/<int:meal_id>', methods=['GET'])
@login_required
def get_meal_image(meal_id):
    meal = Meal.query.filter_by(id=meal_id, user_id=current_user.id).first()
    if not meal or not meal.image_data:
        return jsonify(error=True, message='Image not found'), 404

    return base64.b64encode(meal.image_data).decode('utf-8')


@meals_bp.route('/suggest', methods=['GET'])
@login_required
def suggest():
    remaining = request.args.get('remaining_cal', 500, type=int)
    tz_offset = request.args.get('tz_offset', 0, type=int)
    start, end = get_today_range(tz_offset)

    recent = Meal.query.filter(
        Meal.user_id == current_user.id,
        Meal.logged_at >= start,
        Meal.logged_at < end
    ).all()

    recent_names = [m.food_name for m in recent]

    try:
        suggestions = get_meal_suggestions(remaining, recent_names)
        return jsonify(suggestions=suggestions)
    except Exception as e:
        return jsonify(error=True, message=f'Suggestions failed: {str(e)}'), 500
