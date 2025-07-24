import os
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash

# ========================================
# App Configuration
# ========================================
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24).hex())

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'presto.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Ensure instance folder exists
os.makedirs(app.instance_path, exist_ok=True)

# Initialize Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)


# Models
# ========================================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    pizza_type = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

# ========================================
# Routes
# ========================================

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/menu')
def menu():
    return render_template('menu.html')

@app.route('/order')
def order():
    return render_template('order.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/admin')
def admin_dashboard():
    user_id = session.get('user_id')
    if not user_id:
        flash("Please log in as admin.", "warning")
        return redirect(url_for('login'))

    user = User.query.get(user_id)
    if not user or not user.is_admin:
        flash("Unauthorized access!", "danger")
        return redirect(url_for('home'))

    return render_template('admin.html', username=user.username)


# Auth: Register / Login / Logout
# ========================================

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        if not username or not email or not password or not confirm_password:
            flash('Please fill in all fields.', 'danger')
            return redirect(url_for('register'))

        if password != confirm_password:
            flash('Passwords do not match.', 'danger')
            return redirect(url_for('register'))

        if len(password) < 8:
            flash('Password should be at least 8 characters.', 'danger')
            return redirect(url_for('register'))

        # Check existing user
        if User.query.filter((User.username == username) | (User.email == email)).first():
            flash('Username or email already exists.', 'warning')
            return redirect(url_for('register'))

        hashed_pw = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_pw)
        db.session.add(new_user)
        db.session.commit()

        flash('Account created successfully! Please login.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email_or_username = request.form['email_or_username']
        password = request.form['password']

        user = User.query.filter(
            (User.email == email_or_username) | (User.username == email_or_username)
        ).first()

        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['is_admin'] = user.is_admin
            flash('Login successful.', 'success')
            return redirect(url_for('admin_dashboard') if user.is_admin else url_for('home'))
        else:
            flash('Invalid credentials.', 'danger')
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash("Logged out.", "info")
    return redirect(url_for('home'))
# CLI: Initialize DB (optional)
# ========================================
@app.cli.command('create-admin')
def create_admin():
    """Create a default admin user (CLI command)"""
    if User.query.filter_by(username="admin").first():
        print("Admin user already exists.")
        return
    admin = User(
        username="admin",
        email="admin@presto.com",
        password=generate_password_hash("admin123"),
        is_admin=True
    )
    db.session.add(admin)
    db.session.commit()
    print("Admin user created!")

# ========================================
# Run Server
# ========================================
if __name__ == '__main__':
    app.run(debug=True)
