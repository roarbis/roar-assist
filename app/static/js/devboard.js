// Dev Board functionality

let allLogs = [];
let currentFilters = {
    search: '',
    category: '',
    status: ''
};

document.addEventListener('DOMContentLoaded', () => {
    initDevBoard();
    loadLogs();
    loadStats();
});

function initDevBoard() {
    // Add Entry button
    document.getElementById('addLogBtn').addEventListener('click', openAddModal);

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Form submit
    document.getElementById('logForm').addEventListener('submit', handleFormSubmit);

    // Filters
    document.getElementById('searchFilter').addEventListener('input', handleFilterChange);
    document.getElementById('categoryFilter').addEventListener('change', handleFilterChange);
    document.getElementById('statusFilter').addEventListener('change', handleFilterChange);

    // Close modal on background click
    document.getElementById('logModal').addEventListener('click', (e) => {
        if (e.target.id === 'logModal') {
            closeModal();
        }
    });
}

async function loadLogs() {
    try {
        const params = new URLSearchParams();
        if (currentFilters.search) params.append('search', currentFilters.search);
        if (currentFilters.category) params.append('category', currentFilters.category);
        if (currentFilters.status) params.append('status', currentFilters.status);

        const response = await fetch(`/api/devboard/logs?${params}`);
        const data = await response.json();

        allLogs = data.logs || [];
        renderLogs(allLogs);
    } catch (err) {
        console.error('Failed to load logs:', err);
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/devboard/stats');
        const data = await response.json();

        document.getElementById('totalLogs').textContent = data.total_logs || 0;
        document.getElementById('completedLogs').textContent = data.statuses?.completed || 0;
        document.getElementById('inProgressLogs').textContent = data.statuses?.in_progress || 0;
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

function renderLogs(logs) {
    const timeline = document.getElementById('timeline');

    if (!logs || logs.length === 0) {
        timeline.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No dev logs found.</p>
            </div>
        `;
        return;
    }

    timeline.innerHTML = logs.map(log => `
        <div class="log-entry">
            <div class="log-header">
                <h3 class="log-title">${escapeHtml(log.title)}</h3>
                <div class="log-meta">
                    <span class="log-category category-${log.category}">${log.category}</span>
                    <span class="log-status status-${log.status}">${formatStatus(log.status)}</span>
                    <span class="log-timestamp">${formatTimestamp(log.created_at)}</span>
                </div>
            </div>

            ${log.description ? `<p class="log-description">${escapeHtml(log.description)}</p>` : ''}

            <div class="log-footer">
                <div>
                    ${log.commit_url ? `<a href="${log.commit_url}" target="_blank" class="commit-link">🔗 View Commit</a>` : ''}
                    ${log.commit_hash && !log.commit_url ? `<span class="commit-link">📝 ${log.commit_hash.substring(0, 7)}</span>` : ''}
                </div>
                <div class="btn-group">
                    <button class="btn-sm" onclick="editLog(${log.id})">Edit</button>
                    <button class="btn-sm" onclick="deleteLog(${log.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function handleFilterChange() {
    currentFilters.search = document.getElementById('searchFilter').value;
    currentFilters.category = document.getElementById('categoryFilter').value;
    currentFilters.status = document.getElementById('statusFilter').value;
    loadLogs();
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Dev Log Entry';
    document.getElementById('logForm').reset();
    document.getElementById('logId').value = '';
    document.getElementById('logModal').classList.add('active');
}

function closeModal() {
    document.getElementById('logModal').classList.remove('active');
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const logId = document.getElementById('logId').value;
    const data = {
        title: document.getElementById('logTitle').value,
        description: document.getElementById('logDescription').value,
        category: document.getElementById('logCategory').value,
        status: document.getElementById('logStatus').value,
        commit_hash: document.getElementById('logCommitHash').value || null,
        commit_url: document.getElementById('logCommitUrl').value || null
    };

    try {
        const url = logId ? `/api/devboard/logs/${logId}` : '/api/devboard/logs';
        const method = logId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            closeModal();
            loadLogs();
            loadStats();
        } else {
            alert(result.message || 'Failed to save log');
        }
    } catch (err) {
        console.error('Failed to save log:', err);
        alert('Failed to save log. Please try again.');
    }
}

async function editLog(logId) {
    const log = allLogs.find(l => l.id === logId);
    if (!log) return;

    document.getElementById('modalTitle').textContent = 'Edit Dev Log Entry';
    document.getElementById('logId').value = log.id;
    document.getElementById('logTitle').value = log.title;
    document.getElementById('logDescription').value = log.description || '';
    document.getElementById('logCategory').value = log.category;
    document.getElementById('logStatus').value = log.status;
    document.getElementById('logCommitHash').value = log.commit_hash || '';
    document.getElementById('logCommitUrl').value = log.commit_url || '';

    document.getElementById('logModal').classList.add('active');
}

async function deleteLog(logId) {
    if (!confirm('Are you sure you want to delete this log entry?')) return;

    try {
        const response = await fetch(`/api/devboard/logs/${logId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            loadLogs();
            loadStats();
        } else {
            alert('Failed to delete log');
        }
    } catch (err) {
        console.error('Failed to delete log:', err);
        alert('Failed to delete log. Please try again.');
    }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatStatus(status) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
