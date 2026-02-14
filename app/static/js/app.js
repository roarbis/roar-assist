// Main App Controller

// Initialize theme BEFORE DOMContentLoaded to prevent flash
initTheme();

document.addEventListener('DOMContentLoaded', async () => {
    // Check auth status
    const status = await API.get('/auth/status');
    if (!status || !status.logged_in) {
        window.location.href = '/auth/login';
        return;
    }

    // Set user info
    document.getElementById('settingsUsername').textContent = status.username;
    document.getElementById('targetInput').value = status.calorie_target;
    document.getElementById('caloriesTarget').textContent = status.calorie_target;

    // Initialize all modules
    initNavigation();
    initCamera();
    initHistory();
    initExport();
    initSettings();
    initThemeToggle();

    // Load dashboard data
    loadDashboard();
});

// ===== Tab Navigation =====
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
}

function switchView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.add('active');

    // Load data for the view
    switch (viewName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'history':
            loadHistory();
            break;
        case 'weekly':
            loadWeekly();
            break;
        case 'add':
            // Reset camera state when switching to add
            break;
    }
}

// ===== Settings Modal =====
function initSettings() {
    const modal = document.getElementById('settingsModal');
    const openBtn = document.getElementById('settingsBtn');
    const closeBtn = document.getElementById('closeSettings');
    const saveBtn = document.getElementById('saveTarget');
    const logoutBtn = document.getElementById('logoutBtn');

    openBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    saveBtn.addEventListener('click', async () => {
        const target = parseInt(document.getElementById('targetInput').value);
        if (isNaN(target) || target < 500 || target > 10000) {
            alert('Target must be between 500 and 10,000');
            return;
        }

        const res = await API.put('/api/dashboard/target', { target });
        if (res && res.success) {
            document.getElementById('caloriesTarget').textContent = res.new_target;
            modal.style.display = 'none';
            loadDashboard();
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await API.post('/auth/logout', {});
        window.location.href = '/auth/login';
    });
}

// ===== Dark Mode / Theme System =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    applyTheme(savedTheme);
}

function initThemeToggle() {
    const themeButtons = document.querySelectorAll('.theme-option');
    const savedTheme = localStorage.getItem('theme') || 'auto';

    // Mark active button
    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            localStorage.setItem('theme', theme);
            applyTheme(theme);

            // Update active state
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function applyTheme(theme) {
    const root = document.documentElement;

    if (theme === 'auto') {
        root.removeAttribute('data-theme');
    } else {
        root.setAttribute('data-theme', theme);
    }
}

// ===== Root Route =====
// The Flask app needs to serve index.html at /
