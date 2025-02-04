# 📝 Task Manager

Task Manager es una aplicación web para la gestión de tareas personales. Permite a los usuarios registrar, crear, editar, eliminar y visualizar el progreso de sus tareas mediante una interfaz intuitiva basada en **Flask (Python) en el backend** y **JavaScript con FullCalendar en el frontend**.

## 🚀 Características Principales

✅ **Registro y Autenticación**: Los usuarios pueden registrarse e iniciar sesión de manera segura.
✅ **Gestión de Tareas**: Creación, edición, eliminación y completado de tareas.
✅ **Organización**: Clasificación por **categorías** y **prioridades**.
✅ **Notificaciones**: Recordatorios sobre tareas próximas a vencer.
✅ **Visualización de Progreso**: Se muestra el progreso de tareas completadas vs. pendientes.
✅ **Calendario Integrado**: Uso de **FullCalendar.js** para organizar visualmente las tareas.

## 📂 Estructura del Proyecto

```csharp
task_manager/
│   app.py                 # Aplicación principal en Flask
│   requirements.txt        # Dependencias del proyecto
│   TaskManager.puml        # Diagramas UML del sistema
│   tasks.db                # Base de datos SQLite
│   patrones.md             # Documentación de patrones de diseño
│
├───static
│   ├───css                 # Archivos CSS
│   │   │   style.css
│   │   │   fullcalendar.css
│   │
│   ├───js                  # Archivos JavaScript
│   │   │   main.js
│   │   │   TaskManager.js
│   │   │   fullcalendar.js
│   │   │
│   │   ├───components      # Componentes reutilizables
│   │   │   │   Calendar.js
│   │   │
│   │   ├───models          # Modelos de datos en frontend
│   │   │   │   Progress.js
│   │   │   │   Task.js
│   │   │   │   User.js
│   │   │
│   │   └───utils           # Utilidades
│   │       │   NotificationManager.js
│   │
│   ├───img                 # Imágenes y logos
│   │   │   logo.png
│   │
└───templates               # Plantillas HTML
    │   base.html
    │   index.html
    │   login.html
    │   register.html
    │   tasks.html
    │   calendar.html
    │   404.html
    │   500.html
```

## 🛠 Instalación y Configuración

### **1️⃣ Requisitos Previos**
- Python 3.x  
- Pip  
- Virtualenv (Opcional, pero recomendado)  

### **2️⃣ Instalación**

Clona el repositorio y navega dentro del proyecto:

```sh
git clone https://github.com/tu-usuario/task-manager.git
cd task-manager
```

### **3️⃣ Crear y Activar un Entorno Virtual**
```sh
python -m venv env
source env/bin/activate  # En Windows: env\Scripts\activate
```

### **4️⃣ Instalar Dependencias**
```sh
pip install -r requirements.txt
```

### **5️⃣ Configurar Base de Datos**
```sh
python -c "from app import init_db; init_db()"
```

### **6️⃣ Ejecutar la Aplicación**
```sh
python app.py
```

La aplicación estará disponible en `http://127.0.0.1:5000`.

---

## 📜 Patrones de Diseño Aplicados

Este proyecto implementa principios de diseño **SOLID** y varios **patrones de diseño** para garantizar una arquitectura escalable y mantenible.

### **1️⃣ Factory Method**
- `TaskManager` centraliza la creación de tareas para evitar instancias dispersas.

### **2️⃣ Observer**
- `NotificationManager` se suscribe a eventos y envía notificaciones sobre tareas.

### **3️⃣ Singleton**
- `TaskManager` se usa como una única instancia global.

### **4️⃣ Aplicación de SOLID**
✅ **S** (Single Responsibility): Cada clase tiene una única responsabilidad (`Task`, `User`, `Progress`, etc.).  
✅ **O** (Open/Closed): `TaskManager` es extensible sin modificar su código base.  
✅ **L** (Liskov Substitution): `Progress` puede ser reemplazado sin afectar otras clases.  
✅ **I** (Interface Segregation): Se evita la sobrecarga de métodos en las clases.  
✅ **D** (Dependency Inversion): `NotificationManager` usa métodos desacoplados.  

---

## 📌 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| `GET` | `/` | Página de inicio con tareas del usuario |
| `POST` | `/login` | Iniciar sesión |
| `POST` | `/register` | Registrar un nuevo usuario |
| `GET` | `/tasks` | Lista de tareas del usuario |
| `POST` | `/task/create` | Crear una nueva tarea |
| `POST` | `/task/<task_id>/toggle` | Marcar una tarea como completada |
| `PUT` | `/task/<task_id>/edit` | Editar una tarea |
| `DELETE` | `/task/<task_id>/delete` | Eliminar una tarea |
| `GET` | `/calendar` | Ver el calendario de tareas |
| `GET` | `/api/calendar/events` | Obtener eventos del calendario |
| `GET` | `/tasks/notifications` | Obtener notificaciones de tareas pendientes |

---

## 🖥 Tecnologías Utilizadas

- **Backend:** Flask, Flask-Login, Flask-SQLAlchemy  
- **Frontend:** HTML5, CSS3, JavaScript (ES6)  
- **Base de Datos:** SQLite  
- **Frameworks:** FullCalendar.js  
- **Autenticación:** Flask-Login  
- **Patrones de Diseño:** Factory Method, Singleton, Observer  

---

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License**.
