from flask import render_template, jsonify, request
from flask_login import login_required, current_user
from app.todo import todo_bp
from app.models import TodoTask, User
from app.extensions import db
from datetime import datetime, timezone


@todo_bp.route('/')
@login_required
def index():
    """Render the To Do app page"""
    return render_template('todo.html')


@todo_bp.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    """Get all tasks"""
    try:
        tasks = TodoTask.query.order_by(TodoTask.created_at.desc()).all()

        task_list = []
        for task in tasks:
            task_list.append({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'created_by': task.created_by.username,
                'created_by_id': task.created_by_id,
                'assigned_to': task.assigned_to.username if task.assigned_to else None,
                'assigned_to_id': task.assigned_to_id,
                'is_completed': task.is_completed,
                'created_at': task.created_at.isoformat(),
                'completed_at': task.completed_at.isoformat() if task.completed_at else None
            })

        return jsonify({
            'success': True,
            'tasks': task_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@todo_bp.route('/api/tasks', methods=['POST'])
@login_required
def create_task():
    """Create a new task"""
    try:
        data = request.json
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        assigned_to_id = data.get('assigned_to_id')

        if not title:
            return jsonify({
                'success': False,
                'error': 'Task title is required'
            }), 400

        # Validate assigned_to_id if provided
        if assigned_to_id:
            user = User.query.get(assigned_to_id)
            if not user:
                return jsonify({
                    'success': False,
                    'error': 'Assigned user not found'
                }), 400

        task = TodoTask(
            title=title,
            description=description if description else None,
            created_by_id=current_user.id,
            assigned_to_id=assigned_to_id if assigned_to_id else None
        )

        db.session.add(task)
        db.session.commit()

        return jsonify({
            'success': True,
            'task': {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'created_by': task.created_by.username,
                'created_by_id': task.created_by_id,
                'assigned_to': task.assigned_to.username if task.assigned_to else None,
                'assigned_to_id': task.assigned_to_id,
                'is_completed': task.is_completed,
                'created_at': task.created_at.isoformat()
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@todo_bp.route('/api/tasks/<int:task_id>/toggle', methods=['POST'])
@login_required
def toggle_task(task_id):
    """Toggle task completion status"""
    try:
        task = TodoTask.query.get(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': 'Task not found'
            }), 404

        task.is_completed = not task.is_completed
        if task.is_completed:
            task.completed_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None

        db.session.commit()

        return jsonify({
            'success': True,
            'task': {
                'id': task.id,
                'is_completed': task.is_completed,
                'completed_at': task.completed_at.isoformat() if task.completed_at else None
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@todo_bp.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    """Delete a task (only creator can delete)"""
    try:
        task = TodoTask.query.get(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': 'Task not found'
            }), 404

        # Only the creator can delete the task
        if task.created_by_id != current_user.id:
            return jsonify({
                'success': False,
                'error': 'Only the task creator can delete it'
            }), 403

        db.session.delete(task)
        db.session.commit()

        return jsonify({
            'success': True
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@todo_bp.route('/api/users', methods=['GET'])
@login_required
def get_users():
    """Get all users for assignment"""
    try:
        users = User.query.all()
        user_list = [{'id': u.id, 'username': u.username} for u in users]

        return jsonify({
            'success': True,
            'users': user_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
