let tasksCache = [
  { id: "1", title: "Tarea de ejemplo", description: "Solo para probar el render", completed: false, priority: "medium", deadline: null }
];

function renderTasks() {
  const taskList = document.getElementById("task-list");
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

renderTasks();