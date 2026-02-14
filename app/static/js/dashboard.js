// Dashboard - Progress bar, today's meals, macro chart, suggestions

async function loadDashboard() {
    const data = await API.get('/api/meals/today');
    if (!data) return;

    updateProgressBar(data.total_calories, data.target);
    updateMacroChart(data.total_protein, data.total_carbs, data.total_fat);
    updateTodayMeals(data.meals);

    // Update meal count
    const countEl = document.getElementById('mealCount');
    if (countEl) countEl.textContent = `${data.meals.length} meal${data.meals.length !== 1 ? 's' : ''}`;

    // Load suggestions if remaining < 500
    const remaining = data.target - data.total_calories;
    if (remaining > 0 && remaining < 500 && data.meals.length > 0) {
        loadSuggestions(Math.round(remaining));
    } else {
        const card = document.getElementById('suggestionsCard');
        if (card) card.style.display = 'none';
    }
}

function updateProgressBar(current, target) {
    const fill = document.getElementById('progressFill');
    const currentEl = document.getElementById('caloriesCurrent');
    const targetEl = document.getElementById('caloriesTarget');

    if (!fill) return;

    const pct = Math.min((current / target) * 100, 100);
    fill.style.width = pct + '%';

    fill.classList.remove('warning', 'danger');
    if (pct >= 100) {
        fill.classList.add('danger');
    } else if (pct >= 75) {
        fill.classList.add('warning');
    }

    currentEl.textContent = Math.round(current);
    targetEl.textContent = target;
}

function updateMacroChart(protein, carbs, fat) {
    renderMacroChart(protein, carbs, fat);

    const p = document.getElementById('legendProtein');
    const c = document.getElementById('legendCarbs');
    const f = document.getElementById('legendFat');
    if (p) p.textContent = `${Math.round(protein)}g`;
    if (c) c.textContent = `${Math.round(carbs)}g`;
    if (f) f.textContent = `${Math.round(fat)}g`;
}

function updateTodayMeals(meals) {
    const list = document.getElementById('todayMealsList');
    if (!list) return;

    if (meals.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>No meals logged yet today</p>
                <p class="text-muted">Tap the + button to add your first meal</p>
            </div>`;
        return;
    }

    list.innerHTML = meals.map(meal => {
        const time = new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const scoreClass = meal.food_score >= 7 ? 'score-high' : meal.food_score >= 4 ? 'score-mid' : 'score-low';

        return `
        <div class="meal-item" data-meal-id="${meal.id}">
            ${meal.has_image
                ? `<img class="meal-thumb" src="/api/meals/image/${meal.id}" onerror="this.style.display='none'">`
                : `<div class="meal-thumb-placeholder">&#127869;</div>`
            }
            <div class="meal-info">
                <div class="meal-name">${escapeHtml(meal.food_name)}</div>
                <div class="meal-meta">
                    <span>${time}</span>
                    <span class="food-score-badge ${scoreClass}">${meal.food_score}</span>
                </div>
            </div>
            <div class="meal-calories">${Math.round(meal.calories)} kcal</div>
            <button class="btn-delete" onclick="deleteMeal(${meal.id})" title="Delete">&#128465;</button>
        </div>`;
    }).join('');
}

async function deleteMeal(mealId) {
    if (!confirm('Delete this meal?')) return;
    const res = await API.delete(`/api/meals/${mealId}`);
    if (res && res.success) {
        loadDashboard();
    }
}

async function loadSuggestions(remaining) {
    try {
        const data = await API.get(`/api/meals/suggest?remaining_cal=${remaining}`);
        if (!data || !data.suggestions) return;

        const card = document.getElementById('suggestionsCard');
        const list = document.getElementById('suggestionsList');
        if (!card || !list) return;

        list.innerHTML = data.suggestions.map(s => `
            <div class="suggestion-item">
                <div class="suggestion-name">${escapeHtml(s.name)}</div>
                <div class="suggestion-meta">~${s.calories} kcal &middot; ${escapeHtml(s.reason)}</div>
            </div>
        `).join('');

        card.style.display = 'block';
    } catch (e) {
        // Silently fail for suggestions
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
