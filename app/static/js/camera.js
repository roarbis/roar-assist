// Camera / Photo capture and analysis

let currentAnalysis = null;

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
}

async function handleLogMeal() {
    if (!currentAnalysis) return;

    const btn = document.getElementById('logMealBtn');
    btn.disabled = true;
    btn.textContent = 'Logging...';

    try {
        const res = await API.post('/api/meals/log', {
            food_name: currentAnalysis.food_name,
            calories: currentAnalysis.calories,
            protein: currentAnalysis.protein,
            carbs: currentAnalysis.carbs,
            fat: currentAnalysis.fat,
            food_score: currentAnalysis.food_score,
            health_benefits: currentAnalysis.health_benefits,
            health_negatives: currentAnalysis.health_negatives,
            thumbnail: currentAnalysis.thumbnail
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
    document.getElementById('photoInput').value = '';
    document.getElementById('cameraSection').style.display = 'block';
    document.getElementById('analysisLoading').style.display = 'none';
    document.getElementById('analysisResult').style.display = 'none';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
