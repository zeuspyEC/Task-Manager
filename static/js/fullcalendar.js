// fullcalendar.js

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');

    if (!calendarEl) {
        console.error('Elemento del calendario no encontrado.');
        return;
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es', // Cambiar al idioma español
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: '/calendar',
        eventClick: function (info) {
            if (!info.event.extendedProps) {
                console.error('Error: Datos incompletos en el evento.');
                return;
            }
            alert(`Tarea: ${info.event.title}\nDescripción: ${info.event.extendedProps.description}\nPrioridad: ${info.event.extendedProps.priority}`);
        }
    });

    calendar.render();
});