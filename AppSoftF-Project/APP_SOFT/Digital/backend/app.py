from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, Operator, Machine, Log
from datetime import datetime, timedelta
import re
import random

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    CORS(app)

    db.init_app(app)

    # Main Routes for HTML pages
    @app.route('/')
    def index():
        return render_template('Default Login.html')

    @app.route('/sign-up.html')
    def signup_page():
        return render_template('sign up.html')
        
    @app.route('/Default Login.html')
    def login_page():
        return render_template('Default Login.html')

    @app.route('/admin_dashboard.html')
    def admin_dashboard():
        return render_template('admin_dashboard.html')

    @app.route('/operator_dashboard.html')
    def operator_dashboard():
        return render_template('operator_dashboard.html')

    # API Endpoints
    @app.route('/api/signup', methods=['POST'])
    def signup():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')

        if not all([username, password, email]):
            return jsonify({'message': 'Missing required fields'}), 400

        existing_user = Operator.query.filter_by(username=username).first()
        existing_email = Operator.query.filter_by(email=email).first()
        if existing_user or existing_email:
            return jsonify({'message': 'Username or email already exists'}), 409

        new_operator = Operator(username=username, password=password, email=email, is_admin=False)
        db.session.add(new_operator)
        db.session.commit()

        return jsonify({'message': 'Registration successful!'}), 201

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()
        username_or_email = data.get('username')
        password = data.get('password')

        if re.match(r'[^@]+@[^@]+\.[^@]+', username_or_email):
            operator = Operator.query.filter_by(email=username_or_email).first()
        else:
            operator = Operator.query.filter_by(username=username_or_email).first()

        if operator and operator.password == password:
            if operator.is_admin:
                return jsonify({'message': 'Login successful', 'is_admin': True, 'username': operator.username}), 200
            else:
                return jsonify({'message': 'Login successful', 'is_admin': False, 'username': operator.username}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    
    @app.route('/api/admin/dashboard_data', methods=['GET'])
    def get_admin_dashboard_data():
        machines = Machine.query.all()
        machine_data = []
        for machine in machines:
            machine_data.append({
                'id': machine.id,
                'name': machine.name,
                'status': machine.status,
                'last_maintenance': machine.last_maintenance.strftime('%Y-%m-%d %H:%M:%S')
            })
        return jsonify({'machines': machine_data})

    @app.route('/api/admin/get_all_logs', methods=['GET'])
    def get_all_logs():
        logs = Log.query.order_by(Log.timestamp.desc()).all()
        log_data = []
        for log in logs:
            operator_name = log.operator.username if log.operator else 'Unknown'
            machine_name = log.machine.name if log.machine else 'N/A'
            log_data.append({
                'id': log.id,
                'operator_name': operator_name,
                'machine_name': machine_name,
                'action': log.log_type,
                'details': log.details,
                'timestamp': log.timestamp.isoformat()
            })
        return jsonify(log_data)
        
    @app.route('/api/operator/get_logs/<username>', methods=['GET'])
    def get_operator_logs(username):
        operator = Operator.query.filter_by(username=username).first()
        if not operator:
            return jsonify({'message': 'Operator not found'}), 404
            
        logs = Log.query.filter_by(operator_id=operator.id).order_by(Log.timestamp.desc()).all()
        log_data = []
        for log in logs:
            log_data.append({
                'id': log.id,
                'action': log.log_type,
                'details': log.details,
                'timestamp': log.timestamp.isoformat()
            })
        return jsonify(log_data)

    @app.route('/api/operator/log_action', methods=['POST'])
    def log_operator_action():
        data = request.get_json()
        action = data.get('action')
        details = data.get('details')
        username = data.get('username')

        operator = Operator.query.filter_by(username=username).first()
        if not operator:
            return jsonify({'message': 'Operator not found'}), 404
        
        new_log = Log(operator_id=operator.id, log_type=action, details=details)
        db.session.add(new_log)
        db.session.commit()
        
        return jsonify({'message': 'Action logged successfully!'}), 200
    
    @app.route('/api/operator/calibrate_machine', methods=['POST'])
    def calibrate_machine():
        data = request.get_json()
        username = data.get('username')
        details = data.get('details')

        operator = Operator.query.filter_by(username=username).first()
        if not operator:
            return jsonify({'message': 'Operator not found'}), 404

        new_log = Log(operator_id=operator.id, log_type='calibration', details=details)
        db.session.add(new_log)
        db.session.commit()

        return jsonify({'message': 'Machine calibrated successfully!'}), 200

    @app.route('/api/machines/<int:machine_id>/report', methods=['POST'])
    def report_machine_issue(machine_id):
        machine = Machine.query.get(machine_id)
        if not machine:
            return jsonify({'message': 'Machine not found'}), 404
        
        machine.status = 'down'
        db.session.commit()
        
        admin_user = Operator.query.filter_by(is_admin=True).first()
        if admin_user:
            new_log = Log(
                operator_id=admin_user.id,
                machine_id=machine_id,
                log_type='machine_issue',
                details=f"Admin reported an issue with machine {machine.name}."
            )
            db.session.add(new_log)
            db.session.commit()
        
        return jsonify({'message': f'Issue reported for machine {machine.name}'}), 200
        
    @app.route('/api/admin/fix_machine/<int:machine_id>', methods=['POST'])
    def fix_machine(machine_id):
        machine = Machine.query.get(machine_id)
        if not machine:
            return jsonify({'message': 'Machine not found'}), 404

        machine.status = 'running'
        db.session.commit()

        admin_user = Operator.query.filter_by(is_admin=True).first()
        if admin_user:
            new_log = Log(
                operator_id=admin_user.id,
                machine_id=machine_id,
                log_type='machine_fixed',
                details=f"Admin fixed machine {machine.name}. Status is now running."
            )
            db.session.add(new_log)
            db.session.commit()
        
        return jsonify({'message': f'Machine {machine.name} has been fixed.'}), 200
    
    @app.route('/api/admin/add_machine', methods=['POST'])
    def add_machine():
        data = request.get_json()
        name = data.get('name')
        
        if not name:
            return jsonify({'message': 'Machine name is required'}), 400
        
        if Machine.query.filter_by(name=name).first():
            return jsonify({'message': 'Machine already exists'}), 409
            
        new_machine = Machine(name=name, status='running', last_maintenance=datetime.utcnow())
        db.session.add(new_machine)
        db.session.commit()
        return jsonify({'message': 'Machine added successfully'}), 201

    @app.route('/api/admin/add_operator', methods=['POST'])
    def add_operator():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')

        if not all([username, password, email]):
            return jsonify({'message': 'Missing required fields'}), 400
        
        if Operator.query.filter_by(username=username).first() or Operator.query.filter_by(email=email).first():
            return jsonify({'message': 'Username or email already exists'}), 409
            
        new_operator = Operator(username=username, password=password, email=email, is_admin=False)
        db.session.add(new_operator)
        db.session.commit()
        return jsonify({'message': 'Operator added successfully'}), 201

    @app.route('/api/admin/run_simulation', methods=['POST'])
    def run_simulation():
        try:
            operators = Operator.query.all()
            machines = Machine.query.all()
            
            if not operators or not machines:
                return jsonify({'message': 'Not enough data to run simulation. Add at least one operator and machine.'}), 400
                
            num_logs = random.randint(5, 20)
            
            for _ in range(num_logs):
                random_operator = random.choice(operators)
                random_machine = random.choice(machines)
                
                log_types = ['start_shift', 'break', 'machine_issue', 'calibration', 'end_shift']
                random_log_type = random.choice(log_types)
                
                details = f"Simulated event: {random_log_type} at machine {random_machine.name}"
                
                if random_log_type == 'machine_issue' and random_machine.status != 'down':
                    random_machine.status = 'down'
                    db.session.commit()
                elif random_log_type == 'calibration' and random_machine.status == 'down':
                    random_machine.status = 'running'
                    db.session.commit()

                new_log = Log(
                    operator_id=random_operator.id,
                    machine_id=random_machine.id,
                    log_type=random_log_type,
                    details=details,
                    timestamp=datetime.utcnow() - timedelta(minutes=random.randint(1, 120))
                )
                db.session.add(new_log)
                
            db.session.commit()
            return jsonify({'message': f'Simulation complete. Added {num_logs} new log entries.'}), 200
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Simulation failed: {str(e)}'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()
        
        with db.session.begin():
            if not Operator.query.filter_by(username='admin').first():
                admin_user = Operator(username='admin', password='password', email='admin@example.com', is_admin=True)
                db.session.add(admin_user)
            if not Operator.query.filter_by(username='operator').first():
                operator_user = Operator(username='operator', password='password', email='operator@example.com', is_admin=False)
                db.session.add(operator_user)
            if not Machine.query.first():
                machine1 = Machine(name='CNC-001', status='running', last_maintenance=datetime(2025, 8, 20))
                machine2 = Machine(name='Lathe-002', status='down', last_maintenance=datetime(2025, 8, 15))
                machine3 = Machine(name='Drill-003', status='running', last_maintenance=datetime(2025, 8, 22))
                db.session.add_all([machine1, machine2, machine3])
        db.session.commit()

    app.run(debug=True)