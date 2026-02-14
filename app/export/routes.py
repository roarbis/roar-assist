import csv
import io
import json
from datetime import datetime, timezone, timedelta
from flask import request, Response
from flask_login import login_required, current_user
from app.models import Meal
from app.export import export_bp


@export_bp.route('/csv', methods=['GET'])
@login_required
def export_csv():
    start_str = request.args.get('start')
    end_str = request.args.get('end')

    query = Meal.query.filter(Meal.user_id == current_user.id)

    if start_str:
        try:
            start = datetime.strptime(start_str, '%Y-%m-%d').replace(tzinfo=timezone.utc)
            query = query.filter(Meal.logged_at >= start)
        except ValueError:
            pass

    if end_str:
        try:
            end = datetime.strptime(end_str, '%Y-%m-%d').replace(tzinfo=timezone.utc) + timedelta(days=1)
            query = query.filter(Meal.logged_at < end)
        except ValueError:
            pass

    meals = query.order_by(Meal.logged_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Date', 'Time', 'Food', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Food Score', 'Health Benefits', 'Health Negatives'])

    for meal in meals:
        writer.writerow([
            meal.logged_at.strftime('%Y-%m-%d'),
            meal.logged_at.strftime('%H:%M'),
            meal.food_name,
            round(meal.calories, 1),
            round(meal.protein, 1),
            round(meal.carbs, 1),
            round(meal.fat, 1),
            meal.food_score,
            '; '.join(json.loads(meal.health_benefits)),
            '; '.join(json.loads(meal.health_negatives))
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename=nutri-track-export-{datetime.now().strftime("%Y%m%d")}.csv'}
    )
