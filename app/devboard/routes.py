import json
from datetime import datetime, timezone
from flask import request, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from app.models import DevLog
from app.devboard import devboard_bp


@devboard_bp.route('/logs', methods=['GET'])
@login_required
def get_logs():
    """Get all dev logs with optional filtering"""
    # Get query parameters
    category = request.args.get('category')
    status = request.args.get('status')
    search = request.args.get('search')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Build query
    query = DevLog.query

    if category:
        query = query.filter(DevLog.category == category)

    if status:
        query = query.filter(DevLog.status == status)

    if search:
        search_pattern = f'%{search}%'
        query = query.filter(
            (DevLog.title.ilike(search_pattern)) |
            (DevLog.description.ilike(search_pattern))
        )

    if start_date:
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(DevLog.created_at >= start)
        except:
            pass

    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(DevLog.created_at <= end)
        except:
            pass

    # Order by newest first
    logs = query.order_by(DevLog.created_at.desc()).all()

    # Format response
    logs_data = []
    for log in logs:
        logs_data.append({
            'id': log.id,
            'title': log.title,
            'description': log.description,
            'category': log.category,
            'status': log.status,
            'commit_hash': log.commit_hash,
            'commit_url': log.commit_url,
            'verbosity_level': log.verbosity_level,
            'created_at': log.created_at.isoformat(),
            'created_by': log.created_by.username
        })

    return jsonify(logs=logs_data)


@devboard_bp.route('/logs', methods=['POST'])
@login_required
def create_log():
    """Create a new dev log entry"""
    data = request.get_json()

    if not data or 'title' not in data or 'category' not in data:
        return jsonify(error=True, message='Missing required fields'), 400

    log = DevLog(
        title=data['title'],
        description=data.get('description', ''),
        category=data['category'],
        status=data.get('status', 'completed'),
        commit_hash=data.get('commit_hash'),
        commit_url=data.get('commit_url'),
        verbosity_level=int(data.get('verbosity_level', 1)),
        created_by_id=current_user.id
    )

    db.session.add(log)
    db.session.commit()

    return jsonify(success=True, log_id=log.id)


@devboard_bp.route('/logs/<int:log_id>', methods=['PUT'])
@login_required
def update_log(log_id):
    """Update an existing dev log entry"""
    log = DevLog.query.get_or_404(log_id)
    data = request.get_json()

    if 'title' in data:
        log.title = data['title']
    if 'description' in data:
        log.description = data['description']
    if 'category' in data:
        log.category = data['category']
    if 'status' in data:
        log.status = data['status']
    if 'commit_hash' in data:
        log.commit_hash = data['commit_hash']
    if 'commit_url' in data:
        log.commit_url = data['commit_url']
    if 'verbosity_level' in data:
        log.verbosity_level = int(data['verbosity_level'])

    db.session.commit()

    return jsonify(success=True)


@devboard_bp.route('/logs/<int:log_id>', methods=['DELETE'])
@login_required
def delete_log(log_id):
    """Delete a dev log entry"""
    log = DevLog.query.get_or_404(log_id)

    db.session.delete(log)
    db.session.commit()

    return jsonify(success=True)


@devboard_bp.route('/stats', methods=['GET'])
@login_required
def get_stats():
    """Get development statistics"""
    total_logs = DevLog.query.count()

    # Count by category
    categories = db.session.query(
        DevLog.category,
        db.func.count(DevLog.id)
    ).group_by(DevLog.category).all()

    category_stats = {cat: count for cat, count in categories}

    # Count by status
    statuses = db.session.query(
        DevLog.status,
        db.func.count(DevLog.id)
    ).group_by(DevLog.status).all()

    status_stats = {status: count for status, count in statuses}

    return jsonify(
        total_logs=total_logs,
        categories=category_stats,
        statuses=status_stats
    )
