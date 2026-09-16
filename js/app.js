const SUPABASE_URL = "https://uwbyqwhktanhtrpauqtd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KsmCfLOtrAYc1522SyNeFg_srNUQzem";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const form = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const formError = document.getElementById("form-error");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasksCache = [];
let currentFilter = "all";


// ==============================
// CARGAR TAREAS
// ==============================

async function fetchTasks() {
  const { data, error } = await supabaseClient
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ERROR AL CARGAR TAREAS:", error);

    formError.textContent = `Error al cargar tareas: ${error.message}`;
    return;
  }

  console.log("Tareas cargadas:", data);

  tasksCache = data;
  renderTasks();
}


// ==============================
// CREAR TAREA
// ==============================

async function createTask(task) {
  const { data, error } = await supabaseClient
    .from("tasks")
    .insert([task])
    .select();

  if (error) {
    console.error("ERROR COMPLETO DE SUPABASE:", error);

    formError.textContent =
      `No se pudo guardar la tarea: ${error.message}`;

    return false;
  }

  console.log("Tarea guardada correctamente:", data);

  await fetchTasks();

  return true;
}


// ==============================
// COMPLETAR / REABRIR TAREA
// ==============================

async function toggleTaskCompleted(id, completed) {
  const { error } = await supabaseClient
    .from("tasks")
    .update({
      completed: !completed
    })
    .eq("id", id);

  if (error) {
    console.error("ERROR AL ACTUALIZAR TAREA:", error);

    formError.textContent =
      `No se pudo actualizar la tarea: ${error.message}`;

    return;
  }

  await fetchTasks();
}


// ==============================
// ELIMINAR TAREA
// ==============================

async function deleteTask(id) {
  const { error } = await supabaseClient
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("ERROR AL ELIMINAR TAREA:", error);

    formError.textContent =
      `No se pudo eliminar la tarea: ${error.message}`;

    return;
  }

  await fetchTasks();
}


// ==============================
// MOSTRAR TAREAS
// ==============================

function renderTasks() {
  taskList.innerHTML = "";

  const filtered = tasksCache.filter(task => {

    if (currentFilter === "pending") {
      return !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });


  if (filtered.length === 0) {
    taskList.innerHTML = "<p>No hay tareas para mostrar.</p>";
    return;
  }


  filtered.forEach(task => {

    const li = document.createElement("li");

    li.className =
      `task-item priority-${task.priority} ${
        task.completed ? "completed" : ""
      }`;

    li.innerHTML = `
      <div class="task-item-header">

        <strong>
          ${escapeHtml(task.title)}
        </strong>

        <div class="task-actions">

          <button
            data-action="toggle"
            data-id="${task.id}"
            data-completed="${task.completed}"
          >
            ${task.completed ? "Reabrir" : "Completar"}
          </button>

          <button
            data-action="delete"
            data-id="${task.id}"
          >
            Eliminar
          </button>

        </div>

      </div>

      <p>
        ${escapeHtml(task.description || "")}
      </p>

      <div class="task-meta">
        Prioridad: ${task.priority}
        ·
        Límite: ${task.deadline || "sin definir"}
      </div>
    `;

    taskList.appendChild(li);
  });
}


// ==============================
// PROTEGER EL HTML
// ==============================

function escapeHtml(str) {
  const div = document.createElement("div");

  div.textContent = str;

  return div.innerHTML;
}


// ==============================
// FORMULARIO
// ==============================

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  formError.textContent = "";


  const title =
    document.getElementById("title").value.trim();

  const description =
    document.getElementById("description").value.trim();

  const deadline =
    document.getElementById("deadline").value || null;

  const priority =
    document.getElementById("priority").value;


  if (!title) {

    formError.textContent =
      "El título es obligatorio.";

    return;
  }


  const saved = await createTask({

    title,
    description,
    deadline,
    priority,
    completed: false

  });


  // Solo limpiar el formulario
  // si realmente se guardó

  if (saved) {
    form.reset();
  }

});


// ==============================
// BOTONES DE TAREAS
// ==============================

taskList.addEventListener("click", (e) => {

  const btn = e.target.closest("button");

  if (!btn) {
    return;
  }


  const id = btn.dataset.id;


  if (btn.dataset.action === "delete") {

    deleteTask(id);

  }


  if (btn.dataset.action === "toggle") {

    const completed =
      btn.dataset.completed === "true";

    toggleTaskCompleted(id, completed);

  }

});


// ==============================
// FILTROS
// ==============================

filterButtons.forEach(btn => {

  btn.addEventListener("click", () => {

    filterButtons.forEach(b => {
      b.classList.remove("active");
    });


    btn.classList.add("active");


    currentFilter =
      btn.dataset.filter;


    renderTasks();

  });

});


// ==============================
// INICIAR APLICACIÓN
// ==============================

fetchTasks();