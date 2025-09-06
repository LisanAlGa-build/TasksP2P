export default class Task {
  constructor(id, title, description, completed = false, starred = false, dueDate = null, subTasks = [], assignedTo = null) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.completed = completed;
    this.starred = starred;
    this.dueDate = dueDate;
    this.subTasks = subTasks;
    this.assignedTo = assignedTo;
  }
}
