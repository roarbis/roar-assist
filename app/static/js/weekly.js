// Weekly Summary View

async function loadWeekly() {
    const data = await API.get('/api/dashboard/weekly');
    if (!data) return;

    renderWeeklyChart(data.days, data.target);
    renderWeeklyStats(data);
}

function renderWeeklyStats(data) {
    const statsEl = document.getElementById('weeklyStats');
    if (!statsEl) return;

    const days = data.days;
    const activeDays = days.filter(d => d.total_calories > 0);
    const avgCal = data.average_calories;
    const maxDay = activeDays.length > 0
        ? activeDays.reduce((a, b) => a.total_calories > b.total_calories ? a : b)
        : null;
    const minDay = activeDays.length > 0
        ? activeDays.reduce((a, b) => a.total_calories < b.total_calories ? a : b)
        : null;

    const totalProtein = days.reduce((s, d) => s + d.total_protein, 0);
    const totalCarbs = days.reduce((s, d) => s + d.total_carbs, 0);
    const totalFat = days.reduce((s, d) => s + d.total_fat, 0);
    const avgProtein = activeDays.length > 0 ? Math.round(totalProtein / activeDays.length) : 0;
    const avgCarbs = activeDays.length > 0 ? Math.round(totalCarbs / activeDays.length) : 0;
    const avgFat = activeDays.length > 0 ? Math.round(totalFat / activeDays.length) : 0;

    statsEl.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${Math.round(avgCal)}</div>
            <div class="stat-label">Avg Daily Calories</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${data.target}</div>
            <div class="stat-label">Daily Target</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${maxDay ? Math.round(maxDay.total_calories) : '-'}</div>
            <div class="stat-label">Highest Day${maxDay ? ' (' + maxDay.day_name + ')' : ''}</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${minDay ? Math.round(minDay.total_calories) : '-'}</div>
            <div class="stat-label">Lowest Day${minDay ? ' (' + minDay.day_name + ')' : ''}</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${avgProtein}g</div>
            <div class="stat-label">Avg Protein</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${avgCarbs}g / ${avgFat}g</div>
            <div class="stat-label">Avg Carbs / Fat</div>
        </div>
    `;
}

function initExport() {
    const btn = document.getElementById('exportBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            const end = new Date().toISOString().split('T')[0];
            const start = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
            window.open(`/api/export/csv?start=${start}&end=${end}`, '_blank');
        });
    }
}
