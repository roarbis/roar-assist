// To Do App JavaScript
let allTasks = [];
let allUsers = [];
let currentFilter = 'all';
let currentUserId = null;

// DOM Elements
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const addTaskForm = document.getElementById('addTaskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const assignTo = document.getElementById('assignTo');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const tabBtns = document.querySelectorAll('.tab-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchCurrentUser();
    fetchUsers();
    fetchTasks();
    setupEventListeners();
});

function setupEventListeners() {
    addTaskForm.addEventListener('submit', handleAddTask);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
}

async function fetchCurrentUser() {
    try {
        const res = await fetch('/api/user');
        const data = await res.json();
        if (data.user_id) {
            currentUserId = data.user_id;
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
    }
}

async function fetchUsers() {
    try {
        const res = await fetch('/todo/api/users');
        const data = await res.json();

        if (data.success) {
            allUsers = data.users;
            populateUserDropdown();
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function populateUserDropdown() {
    assignTo.innerHTML = '<option value="">Unassigned</option>';

    allUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.username;
        assignTo.appendChild(option);
    });
}

async function fetchTasks() {
    try {
        const res = await fetch('/todo/api/tasks');
        const data = await res.json();

        if (data.success) {
            allTasks = data.tasks;
            renderTasks();
            updateStats();
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

async function handleAddTask(e) {
    e.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const assignedToId = assignTo.value ? parseInt(assignTo.value) : null;

    if (!title) return;

    try {
        const res = await fetch('/todo/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                assigned_to_id: assignedToId
            })
        });

        const data = await res.json();

        if (data.success) {
            taskTitle.value = '';
            taskDescription.value = '';
            assignTo.value = '';
            fetchTasks();
        } else {
            alert('Error creating task: ' + data.error);
        }
    } catch (error) {
        console.error('Error creating task:', error);
        alert('Failed to create task');
    }
}

function renderTasks() {
    const filteredTasks = filterTasks();

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tasksList.innerHTML = '';

    filteredTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksList.appendChild(taskCard);
    });
}

function filterTasks() {
    switch (currentFilter) {
        case 'pending':
            return allTasks.filter(t => !t.is_completed);
        case 'completed':
            return allTasks.filter(t => t.is_completed);
        case 'mine':
            return allTasks.filter(t =>
                t.created_by_id === currentUserId || t.assigned_to_id === currentUserId
            );
        case 'all':
        default:
            return allTasks;
    }
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.is_completed ? 'completed' : ''}`;

    const createdDate = new Date(task.created_at);
    const dateStr = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    card.innerHTML = `
        <div class="task-header">
            <input type="checkbox"
                   class="task-checkbox"
                   ${task.is_completed ? 'checked' : ''}
                   data-task-id="${task.id}">
            <div class="task-content">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}

                <div class="task-meta">
                    <div class="task-meta-item">
                        <span>👤</span>
                        <span>Created by: <strong>${escapeHtml(task.created_by)}</strong></span>
                    </div>
                    ${task.assigned_to ? `
                        <div class="task-meta-item">
                            <span>🎯</span>
                            <span>Assigned to: <strong>${escapeHtml(task.assigned_to)}</strong></span>
                        </div>
                    ` : ''}
                    <div class="task-meta-item">
                        <span>📅</span>
                        <span>${dateStr}</span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                ${task.created_by_id === currentUserId ? `
                    <button class="btn-delete-task"
                            data-task-id="${task.id}"
                            title="Delete task">
                        ×
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    // Add event listeners
    const checkbox = card.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const deleteBtn = card.querySelector('.btn-delete-task');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
    }

    return card;
}

async function toggleTask(taskId) {
    try {
        const res = await fetch(`/todo/api/tasks/${taskId}/toggle`, {
            method: 'POST'
        });

        const data = await res.json();

        if (data.success) {
            fetchTasks();
        }
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const res = await fetch(`/todo/api/tasks/${taskId}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (data.success) {
            fetchTasks();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
    }
}

function updateStats() {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.is_completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
