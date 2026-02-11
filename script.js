// Elementos
const titleInput = document.getElementById('title-input');
const descInput = document.getElementById('desc-input');
const dueDateInput = document.getElementById('due-date-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const pendingCount = document.getElementById('pending-count');
const clearCompleted = document.getElementById('clear-completed');
const themeToggle = document.getElementById('theme-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const monthYearDisplay = document.getElementById('month-year');
const calendarDays = document.getElementById('calendar-days');
const modal = document.getElementById('day-modal');
const modalDate = document.getElementById('modal-date');
const modalTasks = document.getElementById('modal-tasks');
const closeModal = document.getElementById('close-modal');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentDate = new Date();

// ------------------- Tasks Functions -------------------
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateCount() {
  const pending = tasks.filter(t => !t.completed).length;
  pendingCount.textContent = pending;
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0,0,0,0);
  return due < today;
}

function createTaskElement(task, index) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '') + (isOverdue(task) ? ' overdue' : '');
  li.dataset.index = index;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.onchange = () => toggleComplete(index);

  const content = document.createElement('div');
  content.className = 'task-content';

  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = task.title;

  const desc = document.createElement('div');
  desc.className = 'task-desc';
  desc.textContent = task.description || '';

  const due = document.createElement('div');
  due.className = 'task-due';
  due.textContent = task.dueDate ? `Vence em: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}` : '';
  if (isOverdue(task)) due.textContent += ' (Atrasada!)';

  content.append(title, desc, due);

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.onclick = () => deleteTask(index);

  li.append(checkbox, content, deleteBtn);
  return li;
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const show = currentFilter === 'all' ||
                 (currentFilter === 'pending' && !task.completed) ||
                 (currentFilter === 'completed' && task.completed);
    if (show) {
      taskList.appendChild(createTaskElement(task, index));
    }
  });
  updateCount();
}

function addTask() {
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const dueDate = dueDateInput.value; // YYYY-MM-DD
  if (!title) return;

  tasks.push({ title, description, dueDate, completed: false });
  saveTasks();
  renderTasks();
  renderCalendar(); // Atualiza badges
  titleInput.value = '';
  descInput.value = '';
  dueDateInput.value = '';
  titleInput.focus();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
  renderCalendar();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
  renderCalendar();
}

clearCompleted.onclick = () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
  renderCalendar();
};

filterBtns.forEach(btn => {
  btn.onclick = () => {
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  };
});

// ------------------- Tabs -------------------
tabBtns.forEach(btn => {
  btn.onclick = () => {
    document.querySelector('.tab-btn.active').classList.remove('active');
    btn.classList.add('active');
    document.querySelectorAll('[id$="-view"]').forEach(view => view.classList.add('hidden'));
    document.getElementById(btn.dataset.view).classList.remove('hidden');
    if (btn.dataset.view === 'calendar-view') {
      renderCalendar();
    }
  };
});

// ------------------- Calendar Functions -------------------
function getTasksForDate(dateStr) {
  return tasks.filter(t => t.dueDate === dateStr);
}

function renderCalendar() {
  monthYearDisplay.textContent = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());

  calendarDays.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Células vazias
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendarDays.appendChild(empty);
  }

  // Dias
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement('div');
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dayEl.textContent = day;

    // Badge de tarefas
    const dayTasks = getTasksForDate(dateStr);
    if (dayTasks.length > 0) {
      const badge = document.createElement('span');
      badge.className = 'day-badge';
      badge.textContent = dayTasks.length;
      dayEl.appendChild(badge);
    }

    // Dia atual
    const today = new Date();
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayEl.classList.add('today');
    }

    // Clique no dia
    dayEl.onclick = () => showDayTasks(dateStr, dayTasks);

    calendarDays.appendChild(dayEl);
  }
}

function showDayTasks(dateStr, dayTasks) {
  if (dayTasks.length === 0) return;
  modalDate.textContent = new Date(dateStr).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  modalTasks.innerHTML = '';
  dayTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'modal-task';
    li.innerHTML = `
      <strong>${task.title}</strong><br>
      ${task.description ? task.description + '<br>' : ''}
      ${task.completed ? '<em>Concluída</em>' : '<em>Pendente</em>'}
      ${isOverdue(task) ? ' <strong style="color:#e74c3c">(Atrasada!)</strong>' : ''}
    `;
    modalTasks.appendChild(li);
  });
  modal.classList.remove('hidden');
}

closeModal.onclick = () => modal.classList.add('hidden');
modal.onclick = (e) => e.target === modal && modal.classList.add('hidden');

prevMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

nextMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

// ------------------- Theme -------------------
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Eventos
addBtn.onclick = addTask;
titleInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());
descInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());
dueDateInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());

// Init
renderTasks();
renderCalendar();