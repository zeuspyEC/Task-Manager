import Task from './models/Task.js';
import Progress from './models/Progress.js';
import NotificationManager from './utils/NotificationManager.js';

class TaskManager {
    constructor() {
        this.tasks = [];
    }

    addTask(task) {
        this.tasks.push(task);
    }

    removeTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
    }

    updateTask(updatedTask) {
        const index = this.tasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
            this.tasks[index] = updatedTask;
        }
    }

    getTasks() {
        return this.tasks;
    }

    getProgress() {
        const completedTasks = this.tasks.filter(task => task.completed).length;
        return new Progress(completedTasks, this.tasks.length);
    }

    // Add other task management methods
}

export default TaskManager;
