document.getElementById('dataForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const xNames = document.getElementById('xNames').value.split(',').map(name => name.trim());
    const yValues = document.getElementById('yValues').value.split(',').map(Number);
    const chartType = document.getElementById('chartType').value;

    const elementColors = xNames.map((_, index) => document.getElementById(`colorPicker${index}`).value);

    createChart(xNames, yValues, chartType, elementColors, 'chartCanvas');
});

document.getElementById('xNames').addEventListener('input', function () {
    const xNames = document.getElementById('xNames').value.split(',').map(name => name.trim());
    const colorPickersDiv = document.getElementById('colorPickers');
    colorPickersDiv.innerHTML = '';

    xNames.forEach((xName, index) => {
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';
        colorPicker.innerHTML = `
            <label>${xName}</label>
            <input type="color" id="colorPicker${index}" value="${randomColor()}">
        `;
        colorPickersDiv.appendChild(colorPicker);
    });
});

document.getElementById('linearRegressionBtn').addEventListener('click', function () {
    const xNames = document.getElementById('xNames').value.split(',').map(name => name.trim());
    const yValues = document.getElementById('yValues').value.split(',').map(Number);

    generateLinearRegression(xNames, yValues);
});

document.getElementById('saveChartBtn').addEventListener('click', function () {
    saveChartAsPDF('chartCanvas', 'grafica.pdf');
});

document.getElementById('saveRegressionBtn').addEventListener('click', function () {
    saveChartAsPDF('regressionCanvas', 'regresion.pdf');
});

let chart;
let regressionChart;

function createChart(xNames, yValues, chartType, elementColors, canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (canvasId === 'chartCanvas' && chart) {
        chart.destroy();
    } else if (canvasId === 'regressionCanvas' && regressionChart) {
        regressionChart.destroy();
    }

    const chartInstance = new Chart(ctx, {
        type: chartType,
        data: {
            labels: xNames,
            datasets: [{
                label: 'Datos',
                data: yValues,
                backgroundColor: elementColors,
                borderColor: elementColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    if (canvasId === 'chartCanvas') {
        chart = chartInstance;
    } else {
        regressionChart = chartInstance;
    }
}

function generateLinearRegression(xNames, yValues) {
    const xValues = xNames.map((_, i) => i + 1);
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const regressionYValues = xValues.map(x => slope * x + intercept);

    const elementColors = xNames.map((_, i) => document.getElementById(`colorPicker${i}`).value);

    createChart(xNames, regressionYValues, 'line', elementColors, 'regressionCanvas');
}

function saveChartAsPDF(canvasId, fileName) {
    const { jsPDF } = window.jspdf;
    const canvas = document.getElementById(canvasId);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();

    pdf.addImage(imgData, 'PNG', 10, 10, 180, 160);
    pdf.save(fileName);
}

function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}