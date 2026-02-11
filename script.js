// Elementos
const titleInput = document.getElementById('title-input');
const descInput = document.getElementById('desc-input');
const dueDateInput = document.getElementById('due-date-input');
const prioritySelect = document.getElementById('priority-select');
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
let editingIndex = -1; // Para controle de edição

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

function getPriorityValue(priority) {
  return priority === 'high' ? 3 : priority === 'medium' ? 2 : 1;
}

function sortTasks(taskArray) {
  return taskArray.sort((a, b) => {
    const prioA = getPriorityValue(a.priority || 'medium');
    const prioB = getPriorityValue(b.priority || 'medium');
    if (prioA !== prioB) return prioB - prioA;

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}

function enterEditMode(index) {
  editingIndex = index;
  renderTasks();
}

function saveEdit(index) {
  const task = tasks[index];
  const newTitle = taskList.querySelector(`[data-index="${index}"] .edit-title`).value.trim();
  const newDesc = taskList.querySelector(`[data-index="${index}"] .edit-desc`).value.trim();
  const newDue = taskList.querySelector(`[data-index="${index}"] .edit-due`).value;
  const newPriority = taskList.querySelector(`[data-index="${index}"] .edit-priority`).value;

  if (!newTitle) return; // Não permite título vazio

  task.title = newTitle;
  task.description = newDesc;
  task.dueDate = newDue;
  task.priority = newPriority;

  editingIndex = -1;
  saveTasks();
  renderTasks();
  renderCalendar();
}

function cancelEdit(index) {
  editingIndex = -1;
  renderTasks();
}

function createTaskElement(task, index) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''} ${isOverdue(task) ? 'overdue' : ''} priority-${task.priority || 'medium'}`;
  li.dataset.index = index;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.onchange = () => toggleComplete(index);

  if (editingIndex === index) {
    // Modo edição
    li.classList.add('edit-mode');

    const editTitle = document.createElement('input');
    editTitle.className = 'edit-title';
    editTitle.value = task.title;

    const editDesc = document.createElement('input');
    editDesc.className = 'edit-desc';
    editDesc.value = task.description || '';

    const editDue = document.createElement('input');
    editDue.className = 'edit-due';
    editDue.type = 'date';
    editDue.value = task.dueDate || '';

    const editPriority = document.createElement('select');
    editPriority.className = 'edit-priority';
    ['low', 'medium', 'high'].forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa';
      if (p === (task.priority || 'medium')) opt.selected = true;
      editPriority.appendChild(opt);
    });

    const editButtons = document.createElement('div');
    editButtons.className = 'edit-buttons';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Salvar';
    saveBtn.onclick = () => saveEdit(index);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.onclick = () => cancelEdit(index);

    editButtons.append(saveBtn, cancelBtn);

    const content = document.createElement('div');
    content.className = 'task-content';
    content.append(editTitle, editDesc, editDue, editPriority, editButtons);

    li.append(checkbox, content);
  } else {
    // Modo normal
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

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = () => enterEditMode(index);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.onclick = () => deleteTask(index);

    actions.append(editBtn, deleteBtn);

    li.append(checkbox, content, actions);
  }

  return li;
}

function renderTasks() {
  taskList.innerHTML = '';
  let filteredTasks = tasks.slice();
  if (currentFilter === 'pending') filteredTasks = filteredTasks.filter(t => !t.completed);
  if (currentFilter === 'completed') filteredTasks = filteredTasks.filter(t => t.completed);

  const sorted = sortTasks(filteredTasks);
  sorted.forEach((task, sortedIndex) => {
    const originalIndex = tasks.indexOf(task);
    taskList.appendChild(createTaskElement(task, originalIndex));
  });
  updateCount();
}

function addTask() {
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = prioritySelect.value;
  if (!title) return;

  tasks.push({ title, description, dueDate, priority, completed: false });
  saveTasks();
  renderTasks();
  renderCalendar();
  titleInput.value = '';
  descInput.value = '';
  dueDateInput.value = '';
  prioritySelect.value = 'medium';
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

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendarDays.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement('div');
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dayEl.textContent = day;

    const dayTasks = getTasksForDate(dateStr);
    if (dayTasks.length > 0) {
      const badge = document.createElement('span');
      badge.className = 'day-badge';
      badge.textContent = dayTasks.length;
      dayEl.appendChild(badge);
    }

    const today = new Date();
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayEl.classList.add('today');
    }

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
    li.className = `modal-task priority-${task.priority || 'medium'}`;
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
  calendarDays.classList.add('fade');
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
  setTimeout(() => calendarDays.classList.remove('fade'), 400);
};

nextMonthBtn.onclick = () => {
  calendarDays.classList.add('fade');
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
  setTimeout(() => calendarDays.classList.remove('fade'), 400);
};

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

addBtn.onclick = addTask;
titleInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());
descInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());
dueDateInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());

// Init
renderTasks();
renderCalendar();