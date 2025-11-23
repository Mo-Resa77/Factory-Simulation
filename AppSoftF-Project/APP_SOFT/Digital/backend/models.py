from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Operator(db.Model):
    __tablename__ = 'operators'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False) # New email field
    is_admin = db.Column(db.Boolean, default=False)

class Machine(db.Model):
    __tablename__ = 'machines'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    status = db.Column(db.String(50), default='running') # e.g., 'running', 'down', 'maintenance'
    last_maintenance = db.Column(db.DateTime, default=datetime.utcnow)

class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True)
    operator_id = db.Column(db.Integer, db.ForeignKey('operators.id'), nullable=False)
    machine_id = db.Column(db.Integer, db.ForeignKey('machines.id'), nullable=True)
    log_type = db.Column(db.String(50), nullable=False) # e.g., 'production', 'break', 'issue'
    details = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    operator = db.relationship('Operator', backref=db.backref('logs', lazy=True))
    machine = db.relationship('Machine', backref=db.backref('logs', lazy=True))