from flask import Flask, render_template, request, redirect, url_for, flash
import os
from models import db, User, Process

app = Flask(__name__)
app.secret_key = 'chave_secreta_super_segura'

# Configuração do Banco de Dados MySQL
# Formato: mysql+pymysql://usuario:senha@servidor/banco_de_dados
# Para facilitar os testes iniciais, caso você ainda não tenha o MySQL rodando,
# deixei configurado para usar o SQLite (banco em arquivo local).
# Para usar MySQL, descomente a linha abaixo e ajuste os dados:
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:sua_senha@localhost/visa_londrina'

# Usando SQLite como padrão inicial para não gerar erros se o MySQL não estiver pronto
basedir = os.path.abspath(os.path.dirname(__name__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Cria as tabelas se não existirem
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role')
        
        # Lógica simplificada para fins de demonstração
        if role == 'empresa':
            return redirect(url_for('portal'))
        elif role == 'analista':
            return redirect(url_for('dashboard'))
            
    return render_template('login.html')

@app.route('/portal', methods=['GET', 'POST'])
def portal():
    # Rota para o portal de envio de documentos (Imagem 1)
    if request.method == 'POST':
        # Aqui processaria os dados recebidos do formulário
        pass
    return render_template('portal.html')

@app.route('/dashboard')
def dashboard():
    # Rota para o dashboard do analista (Imagem 2)
    # Mock de dados baseados na imagem 2
    processos = [
        {"nome": "Clínica Estética Bella Vita", "id": "VISA-R2T5W9", "status": "Diligência", "risco": "Crítico (94)", "tipo": "Estético", "data": "27/04/2026", "completude": 37, "risco_class": "critical"},
        {"nome": "Restaurante Sabor do Norte", "id": "VISA-M4XBK2", "status": "Pendente", "risco": "Risco Alto (82)", "tipo": "Alimentício", "data": "27/04/2026", "completude": 62, "risco_class": "high"},
        {"nome": "Hospital São Lucas", "id": "VISA-F3G7B2", "status": "Em Análise", "risco": "Risco Alto (78)", "tipo": "Saúde", "data": "27/04/2026", "completude": 100, "risco_class": "high"},
        {"nome": "Farmácia Vida & Saúde", "id": "VISA-N7P3Q1", "status": "Em Análise", "risco": "Risco Médio (45)", "tipo": "Farmacêutico", "data": "27/04/2026", "completude": 100, "risco_class": "medium"},
        {"nome": "Pet Shop Animal Care", "id": "VISA-J6H4D8", "status": "Pendente", "risco": "Risco Médio (55)", "tipo": "Veterinário", "data": "27/04/2026", "completude": 100, "risco_class": "medium"},
        {"nome": "Padaria Pão de Ouro", "id": "VISA-K8L1M5", "status": "Aprovado", "risco": "Risco Baixo (12)", "tipo": "Alimentício", "data": "27/04/2026", "completude": 100, "risco_class": "low"}
    ]
    return render_template('dashboard.html', processos=processos)

if __name__ == '__main__':
    app.run(debug=True)
