from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'empresa', 'analista'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Process(db.Model):
    __tablename__ = 'processes'
    id = db.Column(db.Integer, primary_key=True)
    process_number = db.Column(db.String(20), unique=True, nullable=False)
    company_name = db.Column(db.String(150), nullable=False)
    cnpj = db.Column(db.String(18), nullable=False)
    establishment_type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default='Pendente')
    risk_level = db.Column(db.String(50), nullable=True)
    risk_score = db.Column(db.Integer, nullable=True)
    completion_percentage = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relação com os documentos
    documents = db.relationship('Document', backref='process', lazy=True)

class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='Aguardando Análise')
    process_id = db.Column(db.Integer, db.ForeignKey('processes.id'), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
