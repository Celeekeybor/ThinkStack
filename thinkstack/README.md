# ThinkStack Hackathon Portal
A sleek platform for hackathon submissions and reviews.

## Features
- User registration/login with JWT
- Project submission with GitHub URL and tech stack
- Leaderboard with score-based ranking and badges
- Admin dashboard with Chart.js visualizations
- Tech stack analysis and logout functionality

## Setup
### Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
export FLASK_APP=app.py
flask db init
flask db migrate
flask db upgrade
python app.py