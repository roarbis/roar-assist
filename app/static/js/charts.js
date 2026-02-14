// Chart.js wrapper functions
let macroChartInstance = null;
let weeklyChartInstance = null;

function renderMacroChart(protein, carbs, fat) {
    const ctx = document.getElementById('macroChart');
    if (!ctx) return;

    const total = protein + carbs + fat;

    if (macroChartInstance) {
        macroChartInstance.data.datasets[0].data = [protein, carbs, fat];
        macroChartInstance.update();
        return;
    }

    macroChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                data: [protein, carbs, fat],
                backgroundColor: ['#4CAF50', '#FF9800', '#f44336'],
                borderWidth: 0,
                cutout: '65%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.parsed}g`
                    }
                }
            }
        }
    });
}

function renderWeeklyChart(days, target) {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;

    const labels = days.map(d => d.day_name);
    const data = days.map(d => d.total_calories);

    if (weeklyChartInstance) {
        weeklyChartInstance.data.labels = labels;
        weeklyChartInstance.data.datasets[0].data = data;
        weeklyChartInstance.data.datasets[1].data = Array(7).fill(target);
        weeklyChartInstance.update();
        return;
    }

    weeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Calories',
                    data,
                    backgroundColor: data.map(v => v > target ? '#f44336' : '#4CAF50'),
                    borderRadius: 6,
                    barThickness: 28
                },
                {
                    label: 'Target',
                    data: Array(7).fill(target),
                    type: 'line',
                    borderColor: '#FF9800',
                    borderDash: [6, 4],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0f0f0' },
                    ticks: { font: { size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.parsed.y} kcal`
                    }
                }
            }
        }
    });
}
