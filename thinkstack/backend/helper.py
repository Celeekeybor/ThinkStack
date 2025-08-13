from flask import session, jsonify
from db import db, User, LeaderboardEntry # Adjust the import path as needed

def get_current_user():
    if 'user_id' in session:
        return User.query.get(session['user_id'])
    return None

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def update_leaderboard(user_id, points=10):
    entry = LeaderboardEntry.query.filter_by(user_id=user_id).first()
    if not entry:
        entry = LeaderboardEntry(user_id=user_id, score=points, challenges_completed=1)
        db.session.add(entry)
    else:
        entry.score += points
        entry.challenges_completed += 1
    db.session.commit()