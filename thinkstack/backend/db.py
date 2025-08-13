# db.py (Revamped)

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='SOLVER')
    is_verified = db.Column(db.Boolean, default=False)
    is_suspended = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat()
        }

class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.relationship('User', backref='created_teams')
    members = db.relationship('TeamMember', backref='team', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_by': self.created_by.name if self.created_by else None,
            'created_at': self.created_at.isoformat(),
            'member_count': len(self.members)
        }

class TeamMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role = db.Column(db.String(20), default='MEMBER')
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref='team_memberships')

# backend/db.py

class Challenge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, default='General')
    
    # RENAMED from 'type' to 'participation_type' to be more descriptive
    participation_type = db.Column(db.String(20), nullable=False, default='INDIVIDUAL')
    
    # RENAMED from 'prize' to 'cash_prize_cents' to be explicit
    cash_prize_cents = db.Column(db.Integer, nullable=False, default=0)
    
    min_team_size = db.Column(db.Integer, nullable=False, default=1)
    max_team_size = db.Column(db.Integer, nullable=True)
    
    # NEW FIELD to match the form
    additional_requirements = db.Column(db.Text, nullable=True)

    deadline = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='PENDING')
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.relationship('User', backref='challenges')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'participationType': self.participation_type, # Use camelCase for JSON consistency
            'cashPrize': self.cash_prize_cents / 100.0, # Convert back to dollars for frontend
            'minTeamSize': self.min_team_size,
            'maxTeamSize': self.max_team_size,
            'additionalRequirements': self.additional_requirements,
            'deadline': self.deadline.isoformat(),
            'status': self.status,
            'createdBy': self.created_by.name if self.created_by else None,
            'createdAt': self.created_at.isoformat(),
            'solutionCount': len(self.solutions) if self.solutions else 0
        }

class Solution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenge.id'))
    challenge = db.relationship('Challenge', backref='solutions')
    submitted_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    submitted_by_user = db.relationship('User', backref='solutions', foreign_keys=[submitted_by_user_id])
    submitted_by_team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=True)
    submitted_by_team = db.relationship('Team', backref='solutions')
    content = db.Column(db.Text, nullable=False)
    attachments = db.Column(db.String(255))
    score = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='SUBMITTED')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'challenge_id': self.challenge_id,
            'content': self.content,
            'score': self.score,
            'status': self.status,
            'submitted_by': self.submitted_by_user.name if self.submitted_by_user else None,
            'submitted_by_team': self.submitted_by_team.name if self.submitted_by_team else None,
            'created_at': self.created_at.isoformat()
        }

class LeaderboardEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    score = db.Column(db.Integer, default=0)
    challenges_completed = db.Column(db.Integer, default=0)
    category_scores = db.Column(db.Text) # Storing as JSON string
    user = db.relationship('User', backref='leaderboard', uselist=False)
    
    def to_dict(self):
        return {
            'user_id': self.user_id,                                           # <-- ADDED for potential profile linking
            'user_name': self.user.name,
            'score': self.score,
            'challenges_completed': self.challenges_completed
        }

class Badge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(50), default='trophy')

class UserBadge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    badge_id = db.Column(db.Integer, db.ForeignKey('badge.id'))
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref='badges')
    badge = db.relationship('Badge')

class TeamInvitation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    invited_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    invited_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='PENDING')
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    responded_at = db.Column(db.DateTime, nullable=True)
    team = db.relationship('Team', backref='invitations')
    invited_by = db.relationship('User', foreign_keys=[invited_by_id])
    invited_user = db.relationship('User', foreign_keys=[invited_user_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'team_name': self.team.name,
            'invited_by': self.invited_by.name,
            'status': self.status,
            'sent_at': self.sent_at.isoformat()
        }

# ### Summary of Changes

# *   **In `Challenge` Model:**
#     *   Added `prize`: An integer to hold the cash prize value.
#     *   Added `min_team_size` and `max_team_size`: Integers to define team size restrictions.
# *   **In `Challenge.to_dict()`:**
#     *   Added the new `prize`, `min_team_size`, and `max_team_size` fields so they can be sent to the frontend.
# *   **In `LeaderboardEntry.to_dict()`:**
#     *   Added `user_id` for future convenience, like if you want to click a user's name to see their profile.

# ### IMPORTANT: Next Steps

# After you replace the content of your `db.py` file with this new code, you **must** update your database structure to match.

# 1.  **Stop** your Flask server if it's running.
# 2.  Open your backend terminal and run the **migration** command:
#     ```bash
#     flask db migrate -m "Add prize and team size to Challenge model"
#     ```
# 3.  After the migration script is created, run the **upgrade** command to apply the changes to your database:
#     ```bash
#     flask db upgrade
#     ```

# After these two commands, your database will be perfectly in sync with your models. Iko fiti sasa