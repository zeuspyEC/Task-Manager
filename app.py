from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
from functools import wraps
import os
import json
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, ValidationError

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
    'sqlite:///' + os.path.join(basedir, 'tasks.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Forms
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField('Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    tasks = db.relationship('Task', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    completed = db.Column(db.Boolean, default=False)
    priority = db.Column(db.String(20), default='medium')
    category = db.Column(db.String(50))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('index')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/')
@login_required
def index():
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    completed_tasks = sum(1 for task in tasks if task.completed)
    total_tasks = len(tasks)
    progress = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
    return render_template('index.html', tasks=tasks, progress=progress)

@app.route('/tasks', methods=['GET'])
@login_required
def tasks_view():
    tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.due_date.asc()).all()
    completed_tasks = sum(1 for task in tasks if task.completed)
    total_tasks = len(tasks)
    progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    return render_template('tasks.html', tasks=tasks, progress=progress)

@app.route('/tasks/progress', methods=['GET'])
@login_required
def get_progress():
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    completed = sum(1 for task in tasks if task.completed)
    total = len(tasks)
    progress = (completed / total * 100) if total > 0 else 0
    return jsonify({'progress': progress})

@app.route('/tasks/notifications')
@login_required
def task_notifications():
    tasks = Task.query.filter(
        Task.user_id == current_user.id,
        Task.completed == False,
        Task.due_date.isnot(None)
    ).all()

    notifications = []
    now = datetime.now(timezone.utc)
    
    for task in tasks:
        if task.due_date and (task.due_date.replace(tzinfo=timezone.utc) - now).days <= 2:
            notifications.append({
                'title': task.title,
                'due_date': task.due_date.isoformat(),
                'message': f"La tarea '{task.title}' está próxima a vencer."
            })

    return jsonify(notifications)

@app.route('/calendar')
@login_required
def calendar():
    return render_template('calendar.html')

# API Routes
@app.route('/api/calendar/events')
@login_required
def get_calendar_events():
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    events = []

    for task in tasks:
        if task.due_date:
            events.append({
                'id': task.id,
                'title': task.title,
                'start': task.due_date.isoformat(),
                'description': task.description,
                'priority': task.priority,
                'completed': task.completed,
                'allDay': True
            })

    return jsonify(events)

@app.route('/task/create', methods=['POST'])
@login_required
def create_task():
    try:
        data = request.get_json()
        due_date = datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
        task = Task(
            title=data['title'],
            description=data.get('description', ''),
            due_date=due_date,
            priority=data.get('priority', 'medium'),
            category=data.get('category', 'general'),
            user_id=current_user.id
        )
        db.session.add(task)
        db.session.commit()

        return jsonify({'status': 'success', 'task_id': task.id}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/task/<int:task_id>/toggle', methods=['POST'])
@login_required
def toggle_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    task.completed = not task.completed
    db.session.commit()
    
    # Calcular nuevo progreso
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    completed_tasks = sum(1 for t in tasks if t.completed)
    total_tasks = len(tasks)
    progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    return jsonify({
        'status': 'success',
        'completed': task.completed,
        'task_id': task.id,
        'progress': progress
    })

@app.route('/task/<int:task_id>/edit', methods=['PUT'])  # Cambiado a PUT
@login_required
def edit_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return jsonify({'error': 'No autorizado'}), 403
    
    data = request.json
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.priority = data.get('priority', task.priority)
    task.category = data.get('category', task.category)
    db.session.commit()
    return jsonify({'message': 'Tarea actualizada correctamente'}), 200

@app.route('/task/<int:task_id>/delete', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return jsonify({'error': 'No autorizado'}), 403

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Tarea eliminada correctamente'}), 200

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500

# Database initialization
def init_db():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
