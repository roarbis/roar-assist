// Meal History View

function initHistory() {
    const dateInput = document.getElementById('historyDate');
    dateInput.value = new Date().toISOString().split('T')[0];
    dateInput.addEventListener('change', loadHistory);
}

async function loadHistory() {
    const dateInput = document.getElementById('historyDate');
    const dateStr = dateInput.value;

    // We query the today endpoint with a date parameter
    // For simplicity, we'll use the export-style query and the today endpoint
    const data = await API.get('/api/meals/today');
    if (!data) return;

    // Filter meals for selected date
    const selectedDate = dateInput.value;
    const allMeals = data.meals.filter(m => {
        const mealDate = new Date(m.logged_at).toLocaleDateString('en-CA'); // YYYY-MM-DD format
        return mealDate === selectedDate;
    });

    // If looking at a different date, we need a different approach
    // For now, the today endpoint only returns today's meals
    // We'll show all meals from the today endpoint when the date is today
    const today = new Date().toISOString().split('T')[0];

    if (selectedDate === today) {
        renderHistory(data.meals, data.total_calories, data.total_protein, data.total_carbs, data.total_fat);
    } else {
        // For past dates, show empty since we only have the today endpoint
        // In a more complete implementation, we'd add a date-specific endpoint
        renderHistory([], 0, 0, 0, 0);
    }
}

function renderHistory(meals, totalCal, totalProtein, totalCarbs, totalFat) {
    const summaryEl = document.getElementById('historySummary');
    const listEl = document.getElementById('historyList');

    // Summary pills
    summaryEl.innerHTML = `
        <div class="summary-pill">&#128293; <strong>${Math.round(totalCal)}</strong> kcal</div>
        <div class="summary-pill">&#129385; <strong>${Math.round(totalProtein)}g</strong> protein</div>
        <div class="summary-pill">&#127838; <strong>${Math.round(totalCarbs)}g</strong> carbs</div>
        <div class="summary-pill">&#129361; <strong>${Math.round(totalFat)}g</strong> fat</div>
    `;

    if (meals.length === 0) {
        listEl.innerHTML = `<div class="empty-state"><p>No meals found for this date</p></div>`;
        return;
    }

    listEl.innerHTML = meals.map(meal => {
        const time = new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const scoreClass = meal.food_score >= 7 ? 'score-high' : meal.food_score >= 4 ? 'score-mid' : 'score-low';

        return `
        <div class="meal-item">
            <div class="meal-thumb-placeholder">&#127869;</div>
            <div class="meal-info">
                <div class="meal-name">${escapeHtmlHist(meal.food_name)}</div>
                <div class="meal-meta">
                    <span>${time}</span>
                    <span>${Math.round(meal.protein)}p / ${Math.round(meal.carbs)}c / ${Math.round(meal.fat)}f</span>
                    <span class="food-score-badge ${scoreClass}">${meal.food_score}</span>
                </div>
            </div>
            <div class="meal-calories">${Math.round(meal.calories)} kcal</div>
        </div>`;
    }).join('');
}

function escapeHtmlHist(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
