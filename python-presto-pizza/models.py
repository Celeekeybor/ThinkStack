from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

# Pizza model
class Pizza(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    ingredients = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)

# Updated Order model
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pizza_id = db.Column(db.Integer, db.ForeignKey('pizza.id'), nullable=False)
    customer_name = db.Column(db.String(100))
    status = db.Column(db.String(50), default="Pending")

    # Relationship to Pizza model
    pizza = db.relationship('Pizza')
    # models.py
from app import db

# Orders table
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    pizza_id = db.Column(db.Integer, db.ForeignKey('pizza.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

# Pizza Menu table
class Pizza(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    price = db.Column(db.Float, nullable=False)
    ingredients = db.relationship('Ingredient', backref='pizza', cascade="all, delete-orphan")

# Ingredients needed per Pizza
class Ingredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity_required = db.Column(db.Float, nullable=False)  # e.g. grams or units
    pizza_id = db.Column(db.Integer, db.ForeignKey('pizza.id'), nullable=False)

# Admin User  login
class AdminUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    

