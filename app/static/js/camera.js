// Camera / Photo capture and analysis

let currentAnalysis = null;
let portionMultiplier = 1.0;

function initCamera() {
    const photoInput = document.getElementById('photoInput');
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    const galleryBtn = document.getElementById('galleryBtn');
    const logMealBtn = document.getElementById('logMealBtn');
    const retakeBtn = document.getElementById('retakeBtn');

    takePhotoBtn.addEventListener('click', () => {
        photoInput.setAttribute('capture', 'environment');
        photoInput.click();
    });

    galleryBtn.addEventListener('click', () => {
        photoInput.removeAttribute('capture');
        photoInput.click();
    });

    photoInput.addEventListener('change', handlePhotoSelected);
    logMealBtn.addEventListener('click', handleLogMeal);
    retakeBtn.addEventListener('click', resetCamera);
}

async function handlePhotoSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show loading
    document.getElementById('cameraSection').style.display = 'none';
    document.getElementById('analysisLoading').style.display = 'block';
    document.getElementById('analysisResult').style.display = 'none';

    // Show preview image
    const reader = new FileReader();
    reader.onload = (ev) => {
        document.getElementById('resultImage').src = ev.target.result;
    };
    reader.readAsDataURL(file);

    // Send to API
    const formData = new FormData();
    formData.append('image', file);

    try {
        const data = await API.postForm('/api/meals/analyze', formData);

        if (!data || data.error) {
            alert(data?.message || 'Analysis failed. Please try again.');
            resetCamera();
            return;
        }

        currentAnalysis = data;
        displayAnalysisResult(data);
    } catch (err) {
        alert('Failed to analyze image. Please try again.');
        resetCamera();
    }
}

function displayAnalysisResult(data) {
    document.getElementById('analysisLoading').style.display = 'none';
    document.getElementById('analysisResult').style.display = 'block';

    document.getElementById('resultFoodName').textContent = data.food_name;
    document.getElementById('resultCalories').textContent = Math.round(data.calories);
    document.getElementById('resultProtein').textContent = `${Math.round(data.protein)}g`;
    document.getElementById('resultCarbs').textContent = `${Math.round(data.carbs)}g`;
    document.getElementById('resultFat').textContent = `${Math.round(data.fat)}g`;

    // Food score
    const scoreEl = document.getElementById('resultFoodScore');
    scoreEl.querySelector('.score-value').textContent = data.food_score;
    const scoreVal = scoreEl.querySelector('.score-value');
    scoreVal.style.color = data.food_score >= 7 ? '#4CAF50' : data.food_score >= 4 ? '#FF9800' : '#f44336';

    // Portion estimate
    const portionEl = document.getElementById('resultPortion');
    if (data.portion_estimate) {
        portionEl.textContent = `Estimated portion: ${data.portion_estimate}`;
        portionEl.style.display = 'block';
    } else {
        portionEl.style.display = 'none';
    }

    // Health benefits
    const benefitsEl = document.getElementById('benefitsTags');
    benefitsEl.innerHTML = (data.health_benefits || []).map(b =>
        `<span class="tag tag-benefit">${escapeHtml(b)}</span>`
    ).join('');

    // Health negatives
    const negativesEl = document.getElementById('negativesTags');
    negativesEl.innerHTML = (data.health_negatives || []).map(n =>
        `<span class="tag tag-negative">${escapeHtml(n)}</span>`
    ).join('');

    // Render portion adjuster
    renderPortionAdjuster();
}

function renderPortionAdjuster() {
    const adjusterEl = document.getElementById('portionAdjuster');
    adjusterEl.style.display = 'block';

    // Update current portion display
    document.getElementById('currentPortion').textContent =
        `${portionMultiplier}x (${currentAnalysis.portion_estimate || '1 serving'})`;

    // Set up portion button listeners
    const portionButtons = adjusterEl.querySelectorAll('.portion-btn[data-multiplier]');
    portionButtons.forEach(btn => {
        btn.addEventListener('click', handlePortionButtonClick);
    });

    // Set up custom input
    const applyCustomBtn = document.getElementById('applyCustom');
    if (applyCustomBtn) {
        applyCustomBtn.addEventListener('click', handleCustomMultiplier);
    }
}

function handlePortionButtonClick(e) {
    const multiplierStr = e.target.dataset.multiplier;

    if (multiplierStr === 'custom') {
        // Show custom input
        document.getElementById('customPortionInput').style.display = 'flex';
        return;
    }

    const multiplier = parseFloat(multiplierStr);
    updatePortionMultiplier(multiplier);

    // Update active button
    const portionButtons = document.querySelectorAll('.portion-btn');
    portionButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // Hide custom input
    document.getElementById('customPortionInput').style.display = 'none';
}

function handleCustomMultiplier() {
    const input = document.getElementById('customMultiplier');
    const multiplier = parseFloat(input.value);

    if (isNaN(multiplier) || multiplier <= 0 || multiplier > 10) {
        alert('Please enter a valid multiplier between 0.1 and 10');
        return;
    }

    updatePortionMultiplier(multiplier);

    // Update button states
    const portionButtons = document.querySelectorAll('.portion-btn');
    portionButtons.forEach(btn => btn.classList.remove('active'));

    // Hide custom input
    document.getElementById('customPortionInput').style.display = 'none';
}

function updatePortionMultiplier(multiplier) {
    portionMultiplier = multiplier;

    // Update current portion display
    document.getElementById('currentPortion').textContent =
        `${portionMultiplier}x (${currentAnalysis.portion_estimate || '1 serving'})`;

    // Update nutritional values with animation
    updateNutritionalValues();
}

function updateNutritionalValues() {
    const elements = [
        { id: 'resultCalories', value: Math.round(currentAnalysis.calories * portionMultiplier) },
        { id: 'resultProtein', value: `${Math.round(currentAnalysis.protein * portionMultiplier)}g` },
        { id: 'resultCarbs', value: `${Math.round(currentAnalysis.carbs * portionMultiplier)}g` },
        { id: 'resultFat', value: `${Math.round(currentAnalysis.fat * portionMultiplier)}g` }
    ];

    elements.forEach(({ id, value }) => {
        const el = document.getElementById(id);
        el.classList.add('nutrition-updating');
        el.textContent = value;
        setTimeout(() => el.classList.remove('nutrition-updating'), 300);
    });
}

async function handleLogMeal() {
    if (!currentAnalysis) return;

    const btn = document.getElementById('logMealBtn');
    btn.disabled = true;
    btn.textContent = 'Logging...';

    try {
        const res = await API.post('/api/meals/log', {
            food_name: currentAnalysis.food_name,
            calories: currentAnalysis.calories * portionMultiplier,
            protein: currentAnalysis.protein * portionMultiplier,
            carbs: currentAnalysis.carbs * portionMultiplier,
            fat: currentAnalysis.fat * portionMultiplier,
            food_score: currentAnalysis.food_score,
            health_benefits: currentAnalysis.health_benefits,
            health_negatives: currentAnalysis.health_negatives,
            thumbnail: currentAnalysis.thumbnail,
            portion_multiplier: portionMultiplier,
            original_portion: currentAnalysis.portion_estimate,
            original_calories: currentAnalysis.calories,
            original_protein: currentAnalysis.protein,
            original_carbs: currentAnalysis.carbs,
            original_fat: currentAnalysis.fat,
            entry_method: 'photo'
        });

        if (res && res.success) {
            // Switch to dashboard and refresh
            resetCamera();
            switchView('dashboard');
            loadDashboard();
        } else {
            alert(res?.message || 'Failed to log meal');
        }
    } catch (err) {
        alert('Failed to log meal. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '&#9989; Log This Meal';
    }
}

function resetCamera() {
    currentAnalysis = null;
    portionMultiplier = 1.0;
    document.getElementById('photoInput').value = '';
    document.getElementById('cameraSection').style.display = 'block';
    document.getElementById('analysisLoading').style.display = 'none';
    document.getElementById('analysisResult').style.display = 'none';
    document.getElementById('portionAdjuster').style.display = 'none';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
