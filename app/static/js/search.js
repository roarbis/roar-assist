// Text-based food search functionality

let currentSearchAnalysis = null;
let searchPortionMultiplier = 1.0;

function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const logSearchMealBtn = document.getElementById('logSearchMealBtn');
    const searchAgainBtn = document.getElementById('searchAgainBtn');
    const exampleChips = document.querySelectorAll('.example-chip');

    if (searchBtn) {
        searchBtn.addEventListener('click', handleFoodSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleFoodSearch();
        });
    }

    if (logSearchMealBtn) {
        logSearchMealBtn.addEventListener('click', handleLogSearchMeal);
    }

    if (searchAgainBtn) {
        searchAgainBtn.addEventListener('click', resetSearch);
    }

    exampleChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            const input = document.getElementById('searchInput');
            if (input) {
                input.value = e.target.dataset.example;
                handleFoodSearch();
            }
        });
    });
}

async function handleFoodSearch() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim();

    if (!query) {
        alert('Please enter a food item');
        return;
    }

    // Show loading
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('searchLoading').style.display = 'block';
    document.getElementById('searchResult').style.display = 'none';

    try {
        const data = await API.post('/api/meals/analyze-text', { query });

        if (!data || data.error) {
            alert(data?.message || 'Analysis failed');
            resetSearch();
            return;
        }

        currentSearchAnalysis = data;
        searchPortionMultiplier = 1.0;
        displaySearchResult(data);
    } catch (err) {
        console.error('Search error:', err);
        alert('Failed to analyze food. Please try again.');
        resetSearch();
    }
}

function displaySearchResult(data) {
    document.getElementById('searchLoading').style.display = 'none';
    document.getElementById('searchResult').style.display = 'block';

    // Populate result fields
    document.getElementById('searchResultFoodName').textContent = data.food_name;
    document.getElementById('searchResultCalories').textContent = Math.round(data.calories);
    document.getElementById('searchResultProtein').textContent = Math.round(data.protein) + 'g';
    document.getElementById('searchResultCarbs').textContent = Math.round(data.carbs) + 'g';
    document.getElementById('searchResultFat').textContent = Math.round(data.fat) + 'g';
    document.getElementById('searchResultPortion').textContent = data.portion_estimate;

    // Food score with color
    const scoreEl = document.getElementById('searchResultFoodScore');
    const scoreValue = scoreEl.querySelector('.score-value');
    scoreValue.textContent = data.food_score;
    scoreValue.style.color = data.food_score >= 7 ? '#4CAF50' : data.food_score >= 4 ? '#FF9800' : '#f44336';

    // Health tags
    const benefitsEl = document.getElementById('searchResultBenefits');
    benefitsEl.innerHTML = (data.health_benefits || []).map(b =>
        `<span class="tag tag-benefit">${escapeHtml(b)}</span>`
    ).join('');

    const negativesEl = document.getElementById('searchResultNegatives');
    negativesEl.innerHTML = (data.health_negatives || []).map(n =>
        `<span class="tag tag-negative">${escapeHtml(n)}</span>`
    ).join('');

    // Render portion adjuster
    renderSearchPortionAdjuster();
}

function renderSearchPortionAdjuster() {
    const adjusterEl = document.getElementById('searchPortionAdjuster');
    adjusterEl.style.display = 'block';

    // Update current portion display
    document.getElementById('searchCurrentPortion').textContent =
        `${searchPortionMultiplier}x (${currentSearchAnalysis.portion_estimate || '1 serving'})`;

    // Set up portion button listeners
    const portionButtons = document.querySelectorAll('#searchPortionButtons .portion-btn');
    portionButtons.forEach(btn => {
        btn.removeEventListener('click', handleSearchPortionButtonClick);
        btn.addEventListener('click', handleSearchPortionButtonClick);
    });

    // Set up custom input
    const applyCustomBtn = document.getElementById('searchApplyCustom');
    if (applyCustomBtn) {
        applyCustomBtn.removeEventListener('click', handleSearchCustomMultiplier);
        applyCustomBtn.addEventListener('click', handleSearchCustomMultiplier);
    }
}

function handleSearchPortionButtonClick(e) {
    const multiplierStr = e.target.dataset.multiplier;

    if (multiplierStr === 'custom') {
        // Show custom input
        document.getElementById('searchCustomPortionInput').style.display = 'flex';
        return;
    }

    const multiplier = parseFloat(multiplierStr);
    updateSearchPortionMultiplier(multiplier);

    // Update active button
    const portionButtons = document.querySelectorAll('#searchPortionButtons .portion-btn');
    portionButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // Hide custom input
    document.getElementById('searchCustomPortionInput').style.display = 'none';
}

function handleSearchCustomMultiplier() {
    const input = document.getElementById('searchCustomMultiplier');
    const multiplier = parseFloat(input.value);

    if (isNaN(multiplier) || multiplier <= 0 || multiplier > 10) {
        alert('Please enter a valid multiplier between 0.1 and 10');
        return;
    }

    updateSearchPortionMultiplier(multiplier);

    // Update button states
    const portionButtons = document.querySelectorAll('#searchPortionButtons .portion-btn');
    portionButtons.forEach(btn => btn.classList.remove('active'));

    // Hide custom input
    document.getElementById('searchCustomPortionInput').style.display = 'none';
}

function updateSearchPortionMultiplier(multiplier) {
    searchPortionMultiplier = multiplier;

    // Update current portion display
    document.getElementById('searchCurrentPortion').textContent =
        `${searchPortionMultiplier}x (${currentSearchAnalysis.portion_estimate || '1 serving'})`;

    // Update nutritional values with animation
    updateSearchNutritionalValues();
}

function updateSearchNutritionalValues() {
    const elements = [
        { id: 'searchResultCalories', value: Math.round(currentSearchAnalysis.calories * searchPortionMultiplier) },
        { id: 'searchResultProtein', value: `${Math.round(currentSearchAnalysis.protein * searchPortionMultiplier)}g` },
        { id: 'searchResultCarbs', value: `${Math.round(currentSearchAnalysis.carbs * searchPortionMultiplier)}g` },
        { id: 'searchResultFat', value: `${Math.round(currentSearchAnalysis.fat * searchPortionMultiplier)}g` }
    ];

    elements.forEach(({ id, value }) => {
        const el = document.getElementById(id);
        el.classList.add('nutrition-updating');
        el.textContent = value;
        setTimeout(() => el.classList.remove('nutrition-updating'), 300);
    });
}

async function handleLogSearchMeal() {
    if (!currentSearchAnalysis) return;

    const btn = document.getElementById('logSearchMealBtn');
    btn.disabled = true;
    btn.textContent = 'Logging...';

    const mealData = {
        food_name: currentSearchAnalysis.food_name,
        calories: currentSearchAnalysis.calories * searchPortionMultiplier,
        protein: currentSearchAnalysis.protein * searchPortionMultiplier,
        carbs: currentSearchAnalysis.carbs * searchPortionMultiplier,
        fat: currentSearchAnalysis.fat * searchPortionMultiplier,
        food_score: currentSearchAnalysis.food_score,
        health_benefits: currentSearchAnalysis.health_benefits,
        health_negatives: currentSearchAnalysis.health_negatives,
        portion_multiplier: searchPortionMultiplier,
        original_portion: currentSearchAnalysis.portion_estimate,
        original_calories: currentSearchAnalysis.calories,
        original_protein: currentSearchAnalysis.protein,
        original_carbs: currentSearchAnalysis.carbs,
        original_fat: currentSearchAnalysis.fat,
        entry_method: 'text'
    };

    try {
        const result = await API.post('/api/meals/log', mealData);

        if (result && result.success) {
            // Success - switch to dashboard
            resetSearch();
            switchView('dashboard');
            loadDashboard();
        } else {
            alert(result?.message || 'Failed to log meal');
            btn.disabled = false;
            btn.innerHTML = '&#9989; Log This Meal';
        }
    } catch (err) {
        console.error('Log error:', err);
        alert('Failed to log meal');
        btn.disabled = false;
        btn.innerHTML = '&#9989; Log This Meal';
    }
}

function resetSearch() {
    currentSearchAnalysis = null;
    searchPortionMultiplier = 1.0;
    const input = document.getElementById('searchInput');
    if (input) input.value = '';
    document.getElementById('searchSection').style.display = 'block';
    document.getElementById('searchLoading').style.display = 'none';
    document.getElementById('searchResult').style.display = 'none';
    document.getElementById('searchPortionAdjuster').style.display = 'none';
}
