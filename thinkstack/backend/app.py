# app.py (Revamped)

from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from flask_mail import Mail
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
import json
import uuid
from db import db, User, Team, Challenge, Solution, LeaderboardEntry, Badge, UserBadge, TeamInvitation, TeamMember
from helper import get_current_user, login_required, update_leaderboard # Assuming these helpers exist
from flask_migrate import Migrate
from sqlalchemy import or_
import click
from flask.cli import with_appcontext
from werkzeug.exceptions import Unauthorized, NotFound, BadRequest

# --- App Configuration ---
# Your static_folder points to where the REACT build is.
# This is for PRODUCTION. In development, CORS handles it.
app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hackathon.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-super-secret-key-change-in-production' # IMPORTANT
app.config['SESSION_COOKIE_SAMESITE'] = 'None' # Required for cross-domain cookies
app.config['SESSION_COOKIE_SECURE'] = True # Required for cross-domain cookies
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'static/uploads')
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'celestinbor02@gmail.com'  
app.config['MAIL_PASSWORD'] = 'ajdf dnhe iyxx ehit'    
app.config['MAIL_DEFAULT_SENDER'] = 'celestinbor02@gmail.com'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- Initialize Extensions ---
db.init_app(app)

# CORRECT CORS Configuration
CORS(app, 
     origins=['http://localhost:3000'],  # Your React app's URL
     supports_credentials=True          # Allow credentials (sessions/cookies)
)

migrate = Migrate(app, db)
mail = Mail(app)

# --- CLI Commands (No Changes Here) ---
@click.command("init-db")
@with_appcontext
def init_db_command():
    """Initialize the database."""
    try:
        db.create_all()
        if not Badge.query.first():
            badges = [
                Badge(name='First Solution', description='Submitted your first solution', icon='star'),
                Badge(name='Team Player', description='Joined your first team', icon='users'),
                Badge(name='Challenge Creator', description='Created your first challenge', icon='plus-circle'),
                Badge(name='Top Scorer', description='Reached top 10 in leaderboard', icon='trophy'),
                Badge(name='Consistent Solver', description='Solved 5 challenges', icon='check-circle')
            ]
            for badge in badges:
                db.session.add(badge)
            db.session.commit()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        db.session.rollback()
app.cli.add_command(init_db_command)

# --- API Routes ---

@app.route('/api/register', methods=['POST'])
def register():
    # YOUR REGISTER CODE IS PERFECT - NO CHANGES NEEDED
    try:
        data = request.get_json()
        if not data: return jsonify({'error': 'No data provided'}), 400
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        role = data.get('role', 'SOLVER').upper()
        if not all([name, email, password]): return jsonify({'error': 'Missing required fields'}), 400
        if len(password) < 6: return jsonify({'error': 'Password must be at least 6 characters'}), 400
        if role not in ['SOLVER', 'CHALLENGER', 'ADMIN']: return jsonify({'error': 'Invalid role'}), 400
        if User.query.filter_by(email=email).first(): return jsonify({'error': 'Email already registered'}), 400
        
        user = User(name=name, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()
        
        leaderboard_entry = LeaderboardEntry(user_id=user.id)
        db.session.add(leaderboard_entry)
        
        db.session.commit()
        return jsonify({'message': 'Registration successful', 'user': user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed. Please try again.'}), 500 



@app.route('/api/admin-register', methods=['POST'])
def admin_register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        # Optional: Secret key check
        admin_secret = data.get('admin_secret')
        if admin_secret != os.getenv('ADMIN_SECRET'):  # or hardcode for now
            return jsonify({'error': 'Unauthorized admin registration'}), 403

        # Basic validations
        if not all([name, email, password]):
            return jsonify({'error': 'Missing required fields'}), 400
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400

        # Create admin user
        user = User(name=name, email=email, role='ADMIN', is_verified=True)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        # Optional: Skip leaderboard entry for admins
        db.session.commit()

        return jsonify({'message': 'Admin registered successfully', 'user': user.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Admin registration error: {e}")
        return jsonify({'error': 'Admin registration failed'}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        user = User.query.filter_by(email=email, role='ADMIN').first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401

        return jsonify({
            'message': 'Admin login successful',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        print(f"Admin login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500



@app.route('/api/login', methods=['POST'])
def login():
    # YOUR LOGIN CODE IS PERFECT - NO CHANGES NEEDED
    try:
        data = request.get_json()
        if not data: return jsonify({'error': 'No data provided'}), 400
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        if not email or not password: return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password) and not user.is_suspended:
            session['user_id'] = user.id
            return jsonify({'message': 'Login successful', 'user': user.to_dict()}), 200
        
        return jsonify({'error': 'Invalid credentials or account suspended'}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed. Please try again.'}), 500


    

@app.route('/api/logout', methods=['POST'])
def logout():
    # YOUR LOGOUT CODE IS PERFECT - NO CHANGES NEEDED
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

# REVAMPED: This route is crucial for the frontend to check for an active session
@app.route('/api/me', methods=['GET'])
def get_current_user_info():
    user_id = session.get('user_id')
    if not user_id:
        # Return an explicit 'no user' response, not an error
        return jsonify({'user': None}), 200
        
    user = User.query.get(user_id)
    if user:
        return jsonify({'user': user.to_dict()}), 200
    
    # If user_id from session doesn't exist in DB (edge case)
    return jsonify({'user': None}), 200

# REVAMPED: This now correctly filters and orders the leaderboard
@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        # Query, filter only users with score > 0, and order them
        top_solvers = db.session.query(
            User,
            LeaderboardEntry.score,
            LeaderboardEntry.challenges_completed
        ).join(User, User.id == LeaderboardEntry.user_id)\
         .filter(LeaderboardEntry.score > 0)\
         .order_by(LeaderboardEntry.score.desc(), LeaderboardEntry.challenges_completed.desc())\
         .limit(100).all()

        leaderboard_data = [
            {
                "user_name": user.name,
                "score": score,
                "challenges_completed": completed
            }
            for user, score, completed in top_solvers
        ]
        return jsonify(leaderboard_data), 200
    except Exception as e:
        print(f"Leaderboard error: {str(e)}")
        return jsonify({'error': 'Could not retrieve leaderboard.'}), 500

# --- OTHER ROUTES (No Changes Needed) ---

@app.route('/api/challenges', methods=['GET'])
def get_challenges():
    try:
        print("Fetching challenges...")  # Debug log
        
        # Build query
        query = Challenge.query
        status = request.args.get('status', 'APPROVED')
        
        if status:
            query = query.filter(Challenge.status == status.upper())
            
        print(f"Query filter: status = {status}")  # Debug log
        
        challenges = query.order_by(Challenge.created_at.desc()).limit(50).all()
        print(f"Found {len(challenges)} challenges")  # Debug log
        
        # Check if to_dict() method exists and works
        challenges_data = []
        for challenge in challenges:
            try:
                challenge_dict = challenge.to_dict()
                challenges_data.append(challenge_dict)
            except Exception as e:
                print(f"Error converting challenge to dict: {e}")
                # Fallback manual conversion
                challenge_dict = {
                    'id': challenge.id,
                    'title': challenge.title,
                    'description': challenge.description,
                    'category': challenge.category,
                    'prize': challenge.cash_prize_cents / 100 if hasattr(challenge, 'cash_prize_cents') and challenge.cash_prize_cents else 0,
                    'created_by': str(challenge.created_by_id) if hasattr(challenge, 'created_by_id') else 'Unknown'
                }
                challenges_data.append(challenge_dict)
        
        return jsonify({
            'challenges': challenges_data,
            'total': len(challenges_data)
        }), 200
        
    except Exception as e:
        print(f"ERROR in get_challenges: {e}")  # More detailed logging
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


from flask import request, jsonify
from werkzeug.exceptions import BadRequest, Unauthorized, NotFound

@app.route('/api/challenges/<int:challenge_id>/status', methods=['PATCH'])
def update_challenge_status(challenge_id):
    try:
        # 1. Authentication check
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise Unauthorized('Missing or invalid authorization token')
        
        token = auth_header.split(' ')[1]
        # Here you would typically verify the token - this is a placeholder
        # In a real app, you might use a function like:
        # current_user = verify_token(token)
        
        # 2. Get the challenge
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            raise NotFound('Challenge not found')
        
        # 3. Validate the request data
        data = request.get_json()
        if not data or 'status' not in data:
            raise BadRequest('Status is required')
        
        new_status = data['status'].upper()
        valid_statuses = ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED']
        if new_status not in valid_statuses:
            raise BadRequest(f'Invalid status. Must be one of: {", ".join(valid_statuses)}')
        
        # 4. Authorization check (optional - ensure user can modify this challenge)
        # For example, maybe only admins or the challenge creator can modify status
        # if current_user.id != challenge.created_by_id and not current_user.is_admin:
        #     raise Unauthorized('You are not authorized to update this challenge')
        
        # 5. Update the challenge
        challenge.status = new_status
        db.session.commit()
        
        # 6. Return success response
        return jsonify({
            'success': True,
            'message': f'Challenge status updated to {new_status}',
            'challenge': challenge.to_dict()
        }), 200
        
    except Unauthorized as e:
        return jsonify({'success': False, 'error': str(e)}), 401
    except NotFound as e:
        return jsonify({'success': False, 'error': str(e)}), 404
    except BadRequest as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


from functools import wraps

# def admin_required(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         user_id = session.get('user_id')
#         if not user_id:
#             return jsonify({'error': 'Unauthorized'}), 401
#         user = User.query.get(user_id)
#         if not user or user.role != 'ADMIN':
#             return jsonify({'error': 'Admin access required'}), 403
#         return f(*args, **kwargs)
#     return decorated_function

@app.route('/api/admin/challenges', methods=['GET'])
# @admin_required
def get_all_challenges_admin():
    try:
        query = Challenge.query.order_by(Challenge.created_at.desc())

        challenges = query.limit(100).all()

        challenges_data = []
        for challenge in challenges:
            try:
                challenge_dict = {
                    'id': challenge.id,
                    'title': challenge.title,
                    'description': challenge.description,
                    'category': challenge.category,
                    'status': challenge.status,
                    'cashPrize': challenge.cash_prize_cents / 100,
                    'createdAt': challenge.created_at.isoformat(),
                    'deadline': challenge.deadline.isoformat() if challenge.deadline else None,
                    'createdBy': challenge.created_by.name if challenge.created_by else 'Unknown',
                    'participationType': challenge.participation_type
                }
                challenges_data.append(challenge_dict)
            except Exception as e:
                print(f"Error processing challenge {challenge.id}: {str(e)}")
                continue

        return jsonify({
            'success': True,
            'challenges': challenges_data,
            'total': len(challenges_data)
        }), 200

    except Exception as e:
        print(f"ERROR in get_all_challenges_admin: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500







@app.route('/api/challenges/<int:challenge_id>', methods=['GET'])
def get_challenge_by_id(challenge_id):
    """
    Get a single challenge by its ID - Returns format matching React expectations
    """
    try:
        # Query for the specific challenge
        challenge = Challenge.query.filter_by(id=challenge_id).first()
        
        if not challenge:
            return jsonify({
                'error': 'Challenge not found',
                'message': f'No challenge exists with ID {challenge_id}'
            }), 404
        
        # Format the challenge data to match React expectations
        try:
            challenge_dict = {
                # Basic fields React expects
                'id': challenge.id,
                'title': challenge.title,
                'description': challenge.description,
                'category': challenge.category,
                'status': challenge.status,
                
                # React expects 'prize', not 'cashPrize'
                'prize': challenge.cash_prize_cents / 100 if challenge.cash_prize_cents else 0,
                
                # React expects 'type', not 'participationType'  
                'type': challenge.participation_type,
                
                # Date fields
                'deadline': challenge.deadline.isoformat() if challenge.deadline else None,
                'createdAt': challenge.created_at.isoformat() if challenge.created_at else None,
                
                # Creator info
                'created_by': challenge.created_by.name if challenge.created_by else 'Unknown',
                'createdBy': challenge.created_by.name if challenge.created_by else 'Unknown',  # Both formats for flexibility
                
                # Additional fields
                'additionalRequirements': getattr(challenge, 'additional_requirements', None),
                'maxParticipants': getattr(challenge, 'max_participants', None),
                'currentParticipants': getattr(challenge, 'current_participants', 0)
            }
            
            # Return challenge object directly (no wrapper)
            return jsonify(challenge_dict), 200
            
        except AttributeError as attr_err:
            print(f"AttributeError processing challenge {challenge_id}: {str(attr_err)}")
            # Return minimal challenge data
            basic_challenge_dict = {
                'id': challenge.id,
                'title': getattr(challenge, 'title', 'Untitled Challenge'),
                'description': getattr(challenge, 'description', ''),
                'category': getattr(challenge, 'category', 'General'),
                'status': getattr(challenge, 'status', 'active'),
                'prize': (getattr(challenge, 'cash_prize_cents', 0) or 0) / 100,
                'type': getattr(challenge, 'participation_type', 'individual'),
                'deadline': challenge.deadline.isoformat() if hasattr(challenge, 'deadline') and challenge.deadline else None,
                'created_by': challenge.created_by.name if hasattr(challenge, 'created_by') and challenge.created_by else 'Unknown'
            }
            
            return jsonify(basic_challenge_dict), 200
            
    except Exception as e:
        print(f"ERROR in get_challenge_by_id: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

# Optional: Enhanced version with relationships and additional data
@app.route('/api/challenges/<int:challenge_id>/detailed', methods=['GET'])
def get_challenge_detailed(challenge_id):
    """
    Get a single challenge with additional details (participants, submissions, etc.)
    """
    try:
        # Query with relationships loaded
        challenge = Challenge.query.options(
            db.joinedload(Challenge.created_by),
            db.joinedload(Challenge.participants),
            db.joinedload(Challenge.submissions)
        ).filter_by(id=challenge_id).first()
        
        if not challenge:
            return jsonify({
                'success': False,
                'error': 'Challenge not found',
                'message': f'No challenge exists with ID {challenge_id}'
            }), 404
        
        try:
            # Basic challenge info
            challenge_dict = {
                'id': challenge.id,
                'title': challenge.title,
                'description': challenge.description,
                'category': challenge.category,
                'status': challenge.status,
                'cashPrize': challenge.cash_prize_cents / 100 if challenge.cash_prize_cents else 0,
                'createdAt': challenge.created_at.isoformat() if challenge.created_at else None,
                'deadline': challenge.deadline.isoformat() if challenge.deadline else None,
                'createdBy': challenge.created_by.name if challenge.created_by else 'Unknown',
                'participationType': challenge.participation_type,
                'additionalRequirements': getattr(challenge, 'additional_requirements', None),
                'maxParticipants': getattr(challenge, 'max_participants', None),
                'currentParticipants': len(challenge.participants) if hasattr(challenge, 'participants') else 0
            }
            
            # Add participant info if available
            if hasattr(challenge, 'participants'):
                participants_data = []
                for participant in challenge.participants:
                    participant_info = {
                        'id': participant.id,
                        'name': getattr(participant, 'name', 'Unknown'),
                        'email': getattr(participant, 'email', ''),
                        'joinedAt': getattr(participant, 'joined_at', None)
                    }
                    participants_data.append(participant_info)
                challenge_dict['participants'] = participants_data
            
            # Add submission count if available
            if hasattr(challenge, 'submissions'):
                challenge_dict['submissionCount'] = len(challenge.submissions)
            
            return jsonify({
                'success': True,
                'challenge': challenge_dict
            }), 200
            
        except Exception as processing_err:
            print(f"Error processing detailed challenge {challenge_id}: {str(processing_err)}")
            # Fall back to basic endpoint
            return get_challenge_by_id(challenge_id)
            
    except Exception as e:
        print(f"ERROR in get_challenge_detailed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


# Optional: Join challenge endpoint
@app.route('/api/challenges/<int:challenge_id>/join', methods=['POST'])
def join_challenge(challenge_id):
    """
    Join a challenge
    """
    try:
        # Get current user (you'll need to implement your auth logic)
        # current_user = get_current_user()  # Implement this based on your auth system
        
        data = request.get_json()
        user_id = data.get('userId')  # Or get from current_user
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'Authentication required',
                'message': 'User must be logged in to join a challenge'
            }), 401
        
        # Check if challenge exists
        challenge = Challenge.query.filter_by(id=challenge_id).first()
        if not challenge:
            return jsonify({
                'success': False,
                'error': 'Challenge not found',
                'message': f'No challenge exists with ID {challenge_id}'
            }), 404
        
        # Check if challenge is still active
        if challenge.status != 'active':
            return jsonify({
                'success': False,
                'error': 'Challenge not available',
                'message': 'This challenge is no longer accepting participants'
            }), 400
        
        # Check if user already joined (implement based on your relationship model)
        # This assumes you have a many-to-many relationship or separate participation table
        
        # Add user to challenge (implement based on your model structure)
        # Example: challenge.participants.append(user)
        # db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Successfully joined the challenge',
            'challengeId': challenge_id
        }), 200
        
    except Exception as e:
        print(f"ERROR in join_challenge: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500








# @app.route('/api/admin/challenges/<int:challenge_id>/status', methods=['PUT'])
# # @admin_required
# def update_challenge_status(challenge_id):
#     try:
#         data = request.get_json()
#         new_status = data.get('status', '').upper()

#         if new_status not in ['APPROVED', 'REJECTED', 'PENDING']:
#             return jsonify({'success': False, 'error': 'Invalid status'}), 400

#         challenge = Challenge.query.get(challenge_id)
#         if not challenge:
#             return jsonify({'success': False, 'error': 'Challenge not found'}), 404

#         challenge.status = new_status
#         db.session.commit()

#         return jsonify({'success': True, 'message': 'Status updated'}), 200

#     except Exception as e:
#         print(f"Error updating challenge status: {e}")
#         return jsonify({'success': False, 'error': str(e)}), 500
    

@app.route('/api/challenges/<int:challenge_id>', methods=['GET'])
def get_challenge(challenge_id):
    """
    Get a specific challenge by ID with detailed information
    """
    try:
        # Find the challenge with relationships loaded
        challenge = Challenge.query.options(
            db.joinedload(Challenge.created_by),
            db.joinedload(Challenge.solutions)
        ).get(challenge_id)
        
        if not challenge:
            return jsonify({'error': 'Challenge not found'}), 404
            
        # Convert to dictionary with additional details
        challenge_data = challenge.to_dict()
        
        # Add additional information for detailed view
        challenge_data.update({
            'created_by_id': challenge.created_by_id,
            'is_expired': challenge.deadline < datetime.utcnow(),
            'days_remaining': (challenge.deadline - datetime.utcnow()).days if challenge.deadline > datetime.utcnow() else 0
        })
        
        return jsonify(challenge_data), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch challenge'}), 500


# backend/app.py (Revamped create_challenge function)

@app.route('/api/challenges/create', methods=['POST'])
@login_required
def create_challenge():
    """
    REVAMPED: This route now uses the correct column names from the DB model.
    """
    try:
        current_user = get_current_user()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # --- VALIDATION (matches frontend validation) ---
        required_fields = ['title', 'description', 'category', 'deadline', 'cashPrize', 'participationType']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # --- PARSE AND PREPARE DATA ---
        try:
            deadline = datetime.fromisoformat(data['deadline'])
            if deadline <= datetime.now():
                return jsonify({'error': 'Deadline must be in the future'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid deadline format'}), 400
            
        try:
            prize_cents = int(float(data['cashPrize']) * 100)
            if prize_cents <= 0:
                return jsonify({'error': 'Prize amount must be greater than 0'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid prize amount'}), 400

        # --- CREATE THE CHALLENGE OBJECT WITH CORRECT KEYWORDS ---
        new_challenge = Challenge(
            title=data['title'].strip(),
            description=data['description'].strip(),
            category=data['category'],
            # FIX #1: Use 'participation_type' to match the model
            participation_type=data.get('participationType', 'individual').upper(),
            # FIX #2: Use 'cash_prize_cents' to match the model
            cash_prize_cents=prize_cents,
            deadline=deadline,
            # FIX #3: Use 'additional_requirements' to match the model
            additional_requirements=data.get('additionalRequirements', '').strip(),
            created_by_id=current_user.id,
            status='PENDING'
        )
        # Note: min/max_team_size will use the defaults from the model for now.
        # You can add them here if you add them to the frontend form.
        
        # --- SAVE TO DATABASE ---
        db.session.add(new_challenge)
        db.session.commit()
        
        return jsonify({
            'message': 'Challenge created successfully and is pending approval',
            'challenge': new_challenge.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"ERROR Creating Challenge: {e}") # More detailed logging for you
        return jsonify({'error': 'An internal error occurred while creating the challenge.'}), 500


# Additional utility routes

@app.route('/api/challenges/categories', methods=['GET'])
def get_challenge_categories():
    """
    Get all available challenge categories
    """
    try:
        categories = db.session.query(Challenge.category).distinct().all()
        category_list = [cat[0] for cat in categories if cat[0]]
        return jsonify({'categories': category_list}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch categories'}), 500


@app.route('/api/user/challenges', methods=['GET'])
@login_required
def get_user_challenges():
    """
    Get challenges created by the current user
    """
    try:
        current_user = get_current_user()
        challenges = Challenge.query.filter_by(created_by_id=current_user.id)\
                                  .order_by(Challenge.created_at.desc()).all()
        
        challenges_data = []
        for challenge in challenges:
            challenge_dict = challenge.to_dict()
            # Add extra info for dashboard
            challenge_dict.update({
                'is_expired': challenge.deadline < datetime.utcnow(),
                'days_remaining': (challenge.deadline - datetime.utcnow()).days if challenge.deadline > datetime.utcnow() else 0
            })
            challenges_data.append(challenge_dict)
            
        return jsonify(challenges_data), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user challenges'}), 500


@app.route('/api/challenges/<int:challenge_id>', methods=['PUT'])
@login_required
def update_challenge(challenge_id):
    """
    Update a challenge (only by the creator or admin)
    """
    try:
        challenge = Challenge.query.get(challenge_id)
        current_user = get_current_user()
        
        if not challenge:
            return jsonify({'error': 'Challenge not found'}), 404
            
        # Check if user owns the challenge or is admin
        if challenge.created_by_id != current_user.id and not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403
            
        # Don't allow editing if challenge is already approved and has submissions
        if challenge.status == 'APPROVED' and challenge.solutions:
            return jsonify({'error': 'Cannot edit challenge with existing submissions'}), 400
            
        data = request.get_json()
        
        # Update allowed fields
        if 'title' in data:
            challenge.title = data['title'].strip()
        if 'description' in data:
            challenge.description = data['description'].strip()
        if 'category' in data:
            challenge.category = data['category']
        if 'deadline' in data:
            new_deadline = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00'))
            if new_deadline <= datetime.utcnow():
                return jsonify({'error': 'Deadline must be in the future'}), 400
            challenge.deadline = new_deadline
            
        db.session.commit()
        
        return jsonify({
            'message': 'Challenge updated successfully',
            'challenge': challenge.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update challenge'}), 500


@app.route('/api/challenges/<int:challenge_id>', methods=['DELETE'])
@login_required
def delete_challenge(challenge_id):
    """
    Delete a challenge (only by creator or admin, and only if no submissions)
    """
    try:
        challenge = Challenge.query.get(challenge_id)
        current_user = get_current_user()
        
        if not challenge:
            return jsonify({'error': 'Challenge not found'}), 404
            
        # Check permissions
        if challenge.created_by_id != current_user.id and not current_user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403
            
        # Don't allow deletion if there are submissions
        if challenge.solutions:
            return jsonify({'error': 'Cannot delete challenge with existing submissions'}), 400
            
        db.session.delete(challenge)
        db.session.commit()
        
        return jsonify({'message': 'Challenge deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete challenge'}), 500
    
    # backend/app.py

# ... (inside your app.py file, with your other routes)

@app.route('/api/solutions', methods=['POST'])
@login_required
def submit_solution():
    try:
        user = get_current_user()
        data = request.get_json()

        challenge_id = data.get('challenge_id')
        github_url = data.get('attachments')
        content = data.get('content', '') # Comments from the form

        if not all([challenge_id, github_url]):
            return jsonify({'error': 'Missing challenge ID or GitHub URL'}), 400

        # Check if the user has already submitted a solution for this challenge
        existing_solution = Solution.query.filter_by(
            challenge_id=challenge_id,
            submitted_by_user_id=user.id
        ).first()

        if existing_solution:
            return jsonify({'error': 'You have already submitted a solution for this challenge.'}), 409 # 409 Conflict

        # Create new solution
        new_solution = Solution(
            challenge_id=challenge_id,
            submitted_by_user_id=user.id,
            content=content,
            attachments=github_url,
            status='SUBMITTED'
        )

        db.session.add(new_solution)
        db.session.commit()

        return jsonify({
            'message': 'Solution submitted successfully!',
            'solution': new_solution.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"ERROR Submitting Solution: {e}")
        return jsonify({'error': 'An internal error occurred.'}), 500


# # Team Routes
# @app.route('/api/teams', methods=['GET'])
# @login_required
# def get_teams():
#     try:
#         all_teams = Team.query.all()
#         current_user = get_current_user()
#         my_teams = db.session.query(Team).join(TeamMember).filter(TeamMember.user_id == current_user.id).all()
        
#         return jsonify({
#             'all_teams': [team.to_dict() for team in all_teams],
#             'my_teams': [team.to_dict() for team in my_teams]
#         })
#     except Exception as e:
#         print(f"Get teams error: {str(e)}")
#         return jsonify({'error': 'Failed to get teams'}), 500

# @app.route('/api/teams', methods=['POST'])
# @login_required
# def create_team():
#     try:
#         data = request.get_json()
#         if not data:
#             return jsonify({'error': 'No data provided'}), 400
        
#         name = data.get('name', '').strip()
#         if not name:
#             return jsonify({'error': 'Team name is required'}), 400
        
#         current_user = get_current_user()
#         team = Team(name=name, created_by_id=current_user.id)
#         db.session.add(team)
#         db.session.flush()
        
#         # Add creator as team leader
#         member = TeamMember(team_id=team.id, user_id=current_user.id, role='LEADER')
#         db.session.add(member)
#         db.session.commit()
        
#         return jsonify({
#             'message': 'Team created successfully', 
#             'team': team.to_dict()
#         }), 201
        
#     except Exception as e:
#         db.session.rollback()
#         print(f"Create team error: {str(e)}")
#         return jsonify({'error': 'Failed to create team'}), 500

# @app.route('/api/teams/invite', methods=['POST'])
# @login_required
# def invite_to_team():
#     try:
#         data = request.get_json()
#         if not data:
#             return jsonify({'error': 'No data provided'}), 400
        
#         team_id = data.get('team_id')
#         email = data.get('email', '').strip().lower()
        
#         if not team_id or not email:
#             return jsonify({'error': 'Team ID and email are required'}), 400
        
#         team = Team.query.get_or_404(team_id)
#         invited_user = User.query.filter_by(email=email).first()
        
#         if not invited_user:
#             return jsonify({'error': 'User not found'}), 404
        
#         # Check if already a member
#         existing_member = TeamMember.query.filter_by(team_id=team_id, user_id=invited_user.id).first()
#         if existing_member:
#             return jsonify({'error': 'User is already a team member'}), 400
        
#         # Check if invitation already exists
#         existing_invite = TeamInvitation.query.filter_by(
#             team_id=team_id, 
#             invited_user_id=invited_user.id, 
#             status='PENDING'
#         ).first()
        
#         if existing_invite:
#             return jsonify({'error': 'Invitation already sent'}), 400
        
#         current_user = get_current_user()
#         invitation = TeamInvitation(
#             team_id=team_id,
#             invited_by_id=current_user.id,
#             invited_user_id=invited_user.id
#         )
        
#         db.session.add(invitation)
#         db.session.commit()
        
#         return jsonify({'message': 'Invitation sent successfully'}), 200
        
#     except Exception as e:
#         db.session.rollback()
#         print(f"Invite to team error: {str(e)}")
#         return jsonify({'error': 'Failed to send invitation'}), 500

# @app.route('/api/invitations', methods=['GET'])
# @login_required
# def get_invitations():
#     try:
#         current_user = get_current_user()
#         invitations = TeamInvitation.query.filter_by(
#             invited_user_id=current_user.id, 
#             status='PENDING'
#         ).all()
        
#         return jsonify([invitation.to_dict() for invitation in invitations])
#     except Exception as e:
#         print(f"Get invitations error: {str(e)}")
#         return jsonify({'error': 'Failed to get invitations'}), 500

# @app.route('/api/invitations/<int:invitation_id>/respond', methods=['POST'])
# @login_required
# def respond_invitation(invitation_id):
#     try:
#         data = request.get_json()
#         if not data:
#             return jsonify({'error': 'No data provided'}), 400
        
#         action = data.get('action')
#         if action not in ['accept', 'reject']:
#             return jsonify({'error': 'Invalid action'}), 400
        
#         invitation = TeamInvitation.query.get_or_404(invitation_id)
#         current_user = get_current_user()
        
#         if invitation.invited_user_id != current_user.id:
#             return jsonify({'error': 'Unauthorized'}), 403
        
#         invitation.status = 'ACCEPTED' if action == 'accept' else 'REJECTED'
#         invitation.responded_at = datetime.utcnow()
        
#         if action == 'accept':
#             member = TeamMember(
#                 team_id=invitation.team_id,
#                 user_id=current_user.id,
#                 role='MEMBER'
#             )
#             db.session.add(member)
        
#         db.session.commit()
        
#         return jsonify({'message': f'Invitation {action}ed successfully'}), 200
        
#     except Exception as e:
#         db.session.rollback()
#         print(f"Respond invitation error: {str(e)}")
#         return jsonify({'error': 'Failed to respond to invitation'}), 500

# # Leaderboard Routes
# @app.route('/api/leaderboard', methods=['GET'])
# def get_leaderboard():
#     try:
#         entries = LeaderboardEntry.query.join(User).order_by(LeaderboardEntry.score.desc()).limit(20).all()
#         return jsonify([entry.to_dict() for entry in entries])
#     except Exception as e:
#         print(f"Get leaderboard error: {str(e)}")
#         return jsonify({'error': 'Failed to get leaderboard'}), 500

# # Dashboard Routes
# @app.route('/api/dashboard', methods=['GET'])
# @login_required
# def get_dashboard_data():
#     try:
#         user = get_current_user()
        
#         my_challenges = Challenge.query.filter_by(created_by_id=user.id).all()
#         my_solutions = Solution.query.filter_by(submitted_by_user_id=user.id).all()
#         my_teams = db.session.query(Team).join(TeamMember).filter(TeamMember.user_id == user.id).all()
#         pending_invitations = TeamInvitation.query.filter_by(
#             invited_user_id=user.id, 
#             status='PENDING'
#         ).all()
        
#         return jsonify({
#             'user': user.to_dict(),
#             'challenges': [challenge.to_dict() for challenge in my_challenges],
#             'solutions': [solution.to_dict() for solution in my_solutions],
#             'teams': [team.to_dict() for team in my_teams],
#             'invitations': [invitation.to_dict() for invitation in pending_invitations]
#         })
#     except Exception as e:
#         print(f"Get dashboard error: {str(e)}")
#         return jsonify({'error': 'Failed to get dashboard data'}), 500

# # Error handlers
# @app.errorhandler(404)
# def not_found(error):
#     return jsonify({'error': 'Resource not found'}), 404

# @app.errorhandler(500)
# def internal_error(error):
#     db.session.rollback()
#     return jsonify({'error': 'Internal server error'}), 500

# def init_db():
#     with app.app_context():
#         try:
#             db.create_all()
            
#             # Create default badges
#             if not Badge.query.first():
#                 badges = [
#                     Badge(name='First Solution', description='Submitted your first solution', icon='star'),
#                     Badge(name='Team Player', description='Joined your first team', icon='users'),
#                     Badge(name='Challenge Creator', description='Created your first challenge', icon='plus-circle'),
#                     Badge(name='Top Scorer', description='Reached top 10 in leaderboard', icon='trophy'),
#                     Badge(name='Consistent Solver', description='Solved 5 challenges', icon='check-circle')
#                 ]
#                 for badge in badges:
#                     db.session.add(badge)
#                 db.session.commit()
#                 print("Database initialized successfully.")
#         except Exception as e:
#             print(f"Error initializing database: {str(e)}")
#             db.session.rollback()

# if __name__ == '__main__':
#     init_db()
#     app.run(debug=True)