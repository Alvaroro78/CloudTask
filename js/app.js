const STORAGE_KEY = "cloudtasks_local";

const form = document.getElementById("task-form");
const taskList = document.getElementById("task-list");

let tasksCache = [];

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  tasksCache = raw ? JSON.parse(raw) : [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksCache));
}

function generateId() {
  return crypto.randomUUID();
}

function createTask(task) {
  const newTask = {
    id: generateId(),
    created_at: new Date().toISOString(),
    ...task,
  };
  tasksCache.unshift(newTask);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasksCache.length === 0) {
    taskList.innerHTML = "<p>No hay tareas para mostrar.</p>";
    return;
  }

  tasksCache.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item priority-${task.priority} ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
      <div class="task-item-header">
        <strong>${escapeHtml(task.title)}</strong>
      </div>
      <p>${escapeHtml(task.description || "")}</p>
      <div class="task-meta">
        Prioridad: ${task.priority} · Límite: ${task.deadline || "sin definir"}
      </div>
    `;
    taskList.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const deadline = document.getElementById("deadline").value || null;
  const priority = document.getElementById("priority").value;

  createTask({ title, description, deadline, priority, completed: false });
  form.reset();
});

loadTasks();
renderTasks();