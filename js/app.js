const SUPABASE_URL = "https://uwbyqwhktanhtrpauqtd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KsmCfLOtrAYc1522SyNeFg_srNUQzem";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const formError = document.getElementById("form-error");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasksCache = [];
let currentFilter = "all";

async function fetchTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    formError.textContent = "Error al cargar tareas.";
    return;
  }
  tasksCache = data;
  renderTasks();
}

async function createTask(task) {
  const { error } = await supabase.from("tasks").insert([task]);
  if (error) {
    console.error(error);
    formError.textContent = "No se pudo guardar la tarea.";
    return;
  }
  await fetchTasks();
}

async function toggleTaskCompleted(id, completed) {
  const { error } = await supabase
    .from("tasks")
    .update({ completed: !completed })
    .eq("id", id);
  if (error) console.error(error);
  await fetchTasks();
}

async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) console.error(error);
  await fetchTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  const filtered = tasksCache.filter(t => {
    if (currentFilter === "pending") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  if (filtered.length === 0) {
    taskList.innerHTML = "<p>No hay tareas para mostrar.</p>";
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item priority-${task.priority} ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
      <div class="task-item-header">
        <strong>${escapeHtml(task.title)}</strong>
        <div class="task-actions">
          <button data-action="toggle" data-id="${task.id}" data-completed="${task.completed}">
            ${task.completed ? "Reabrir" : "Completar"}
          </button>
          <button data-action="delete" data-id="${task.id}">Eliminar</button>
        </div>
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const deadline = document.getElementById("deadline").value || null;
  const priority = document.getElementById("priority").value;

  if (!title) {
    formError.textContent = "El título es obligatorio.";
    return;
  }

  await createTask({ title, description, deadline, priority, completed: false });
  form.reset();
});

taskList.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.action === "delete") deleteTask(id);
  if (btn.dataset.action === "toggle") {
    toggleTaskCompleted(id, btn.dataset.completed === "true");
  }
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

fetchTasks();