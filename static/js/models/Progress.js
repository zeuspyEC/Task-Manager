class Progress {
    constructor(completedTasks, totalTasks) {
        this.completedTasks = completedTasks;
        this.totalTasks = totalTasks;
    }
    
    getProgress() {
        return this.totalTasks > 0 ? (this.completedTasks / this.totalTasks) * 100 : 0;
    }
}

export default Progress;