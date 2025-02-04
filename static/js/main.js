document.addEventListener('DOMContentLoaded', function() {
    initializeModals();
    initializeTheme();
    setupEventListeners();
    initializeCalendar();
    updateProgressBar();
});

async function toggleTask(taskId) {
    try {
        const response = await fetch(`/task/${taskId}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al actualizar tarea');
        const data = await response.json();

        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!taskCard) return;

        // Actualizar el estado visual de la tarea
        const taskList = document.getElementById(data.completed ? 'completedTasks' : 'pendingTasks');
        if (taskList) {
            taskCard.classList.toggle('completed', data.completed);
            taskList.appendChild(taskCard);

            // Actualizar el título
            const title = taskCard.querySelector('.task-title');
            if (title) {
                title.innerHTML = data.completed ? `<s>${title.textContent}</s>` : title.textContent;
            }
        }

        // Actualizar el progreso
        const progressCircle = document.querySelector('.progress-circle');
        const progressPercentage = document.querySelector('.progress-percentage');
        if (progressCircle && progressPercentage) {
            progressCircle.style.setProperty('--progress', data.progress);
            progressPercentage.textContent = `${Math.round(data.progress)}%`;
        }

        showNotification(data.completed ? 'Tarea completada' : 'Tarea pendiente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al actualizar la tarea', 'error');
    }
}

async function editTask(taskId) {
    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskCard) return;

    const title = taskCard.querySelector('.task-title').textContent.replace(/<\/?s>/g, '');
    const description = taskCard.querySelector('.task-description').textContent;
    const priority = taskCard.querySelector('.priority-badge').textContent.toLowerCase();

    // Abrir modal de edición
    const modal = document.getElementById('taskModal');
    if (!modal) return;

    const form = modal.querySelector('#taskForm');
    if (!form) return;

    // Rellenar el formulario
    form.querySelector('#title').value = title;
    form.querySelector('#description').value = description;
    form.querySelector('#priority').value = priority;

    // Mostrar modal
    modal.style.display = 'block';

    // Actualizar el manejador del formulario
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const formData = {
            title: form.querySelector('#title').value,
            description: form.querySelector('#description').value,
            priority: form.querySelector('#priority').value
        };

        try {
            const response = await fetch(`/task/${taskId}/edit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Error al editar tarea');

            // Actualizar la UI
            taskCard.querySelector('.task-title').textContent = formData.title;
            taskCard.querySelector('.task-description').textContent = formData.description;
            taskCard.querySelector('.priority-badge').textContent = formData.priority;

            modal.style.display = 'none';
            showNotification('Tarea actualizada correctamente', 'success');
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al editar la tarea', 'error');
        }
    };
}

// Gestión de modales
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal .close');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Funcion OpenModal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Gestión del tema
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}


// Función para actualizar el progreso circular
function updateProgress() {
    const progressCircle = document.querySelector('.progress-circle');
    const progressPercentage = document.querySelector('.progress-percentage');
    
    fetch('/api/tasks/progress')
        .then(response => response.json())
        .then(data => {
            progressCircle.style.setProperty('--progress', data.progress);
            progressPercentage.textContent = `${Math.round(data.progress)}%`;
        })
        .catch(error => console.error('Error al actualizar progreso:', error));
}

async function deleteTask(taskId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

    try {
        const response = await fetch(`/task/${taskId}/delete`, { 
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar tarea');
        
        // Eliminar el elemento del DOM
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
            updateProgress();
        }
        
        showNotification('Tarea eliminada correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar la tarea', 'error');
    }
}

// Agregar tareas sin recargar la página
async function addTaskAndUpdateList(taskData) {
    try {
        const response = await fetch('/task/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });

        if (!response.ok) throw new Error('Error al crear la tarea');
        const data = await response.json();

        // Agregar tarea a la lista
        const taskList = document.getElementById('pendingTasks');
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.dataset.taskId = data.task_id;
        taskElement.innerHTML = `
            <h3>${taskData.title}</h3>
            <p>${taskData.description}</p>
            <p><strong>Prioridad:</strong> ${taskData.priority}</p>
            <button class="btn btn-success" onclick="toggleTask(${data.task_id})">Completar</button>`;
        taskList.appendChild(taskElement);

        showNotification('Tarea creada exitosamente', 'success');
    } catch (error) {
        console.error('Error al crear la tarea:', error);
        showNotification('Error al crear la tarea', 'error');
    }
}

// Gestión de formularios
async function handleTaskForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        due_date: formData.get('dueDate'),
        priority: formData.get('priority')
    };

    addTaskAndUpdateList(taskData);
    document.getElementById('taskModal').style.display = 'none';
}

// Add to main.js

// Create notifications container if it doesn't exist
function createNotificationsContainer() {
    if (!document.querySelector('.notifications-container')) {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
}

// Updated showNotification function
function showNotification(message, type = 'info') {
    createNotificationsContainer();
    const container = document.querySelector('.notifications-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Updated calendar initialization
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        height: '100%',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: '/api/calendar/events',
        eventClick: function(info) {
            showTaskModal(info.event);
        },
        eventDidMount: function(info) {
            const task = info.event;
            const element = info.el;

            // Estilizar eventos según prioridad y estado
            element.classList.add(`priority-${task.extendedProps.priority}`);
            if (task.extendedProps.completed) {
                element.classList.add('completed');
            }
        }
    });

    calendar.render();
}

// Updated showTaskModal function for calendar events
function showTaskModal(event) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'taskDetailModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${event.title}</h2>
            <div class="task-details">
                <p class="description">${event.extendedProps.description || 'Sin descripción'}</p>
                <div class="metadata">
                    <span class="priority priority-${event.extendedProps.priority}">
                        Prioridad: ${event.extendedProps.priority}
                    </span>
                    <span class="due-date">
                        Fecha: ${new Date(event.start).toLocaleDateString('es-ES')}
                    </span>
                </div>
                <div class="status">
                    Estado: ${event.extendedProps.completed ? 'Completada' : 'Pendiente'}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.remove();
    };
    
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Utilidades
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function fetchNotifications() {
    try {
        const response = await fetch('/tasks/notifications');
        if (!response.ok) throw new Error('Error al obtener notificaciones');
        const notifications = await response.json();

        notifications.forEach(notification => {
            showNotification(
                `📌 ${notification.message} \n📅 Fecha límite: ${formatDate(notification.due_date)}`,
                'warning'
            );
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchNotifications);

// Event Listeners
function setupEventListeners() {
    // Form submissions
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskForm);
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Modal triggers
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal');
            document.getElementById(modalId).style.display = 'block';
        });
    });

    // Alert close buttons
    const alertCloseButtons = document.querySelectorAll('.alert .close-btn');
    alertCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.alert').remove();
        });
    });
}
