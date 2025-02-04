### **Patrones de diseño aplicados**:
1. **Factory Method**:  
   - `TaskManager` gestiona la creación y manipulación de tareas, centralizando la lógica y evitando instancias dispersas.
   
2. **Observer**:  
   - `NotificationManager` actúa como un observador que notifica cambios a los usuarios.
   
3. **Singleton**:  
   - `TaskManager` se usa como una instancia única que maneja las tareas de la aplicación.

### **Aplicación de SOLID**:
- **S (Single Responsibility - Responsabilidad Única)**:  
  - Cada clase se encarga de una tarea específica: `User`, `Task`, `Progress`, etc.
  
- **O (Open/Closed - Abierto/Cerrado)**:  
  - `TaskManager` permite agregar nuevas funcionalidades sin modificar su código base, ya que las tareas pueden extenderse mediante nuevas clases que hereden o interactúen con él.

- **L (Liskov Substitution - Sustitución de Liskov)**:  
  - `Progress` puede ser sustituido por cualquier otra implementación que calcule progreso sin romper la funcionalidad.

- **I (Interface Segregation - Segregación de Interfaces)**:  
  - Se evita que las clases tengan métodos que no usan, asegurando que cada entidad tenga solo la funcionalidad relevante.

- **D (Dependency Inversion - Inversión de Dependencias)**:  
  - `NotificationManager` usa métodos estáticos para evitar acoplamiento directo con otras clases.