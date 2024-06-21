const apiKey = '133b583e9bec1b6e4ee423f6';
const apiUrl = `https://v6.exchangerate-api.com/v6/133b583e9bec1b6e4ee423f6/latest/USD`;

document.addEventListener('DOMContentLoaded', () => {
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('API Data:', data); // Verificar los datos de la API
            if (data && data.conversion_rates) {
                updateCurrencies(data);
                updateChart(data);
                document.getElementById('last-updated').textContent += data.time_last_update_utc;
            } else {
                console.error('Invalid API response:', data);
            }
        })
        .catch(error => console.error('Error fetching exchange rates:', error));

    document.getElementById('convert').addEventListener('click', () => {
        const amount = document.getElementById('amount').value;
        const fromCurrency = document.getElementById('from-currency').value;
        const toCurrency = document.getElementById('to-currency').value;

        const conversionUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`;
        fetch(conversionUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Conversion Data:', data); // Verificar los datos de conversión
                const rate = data.conversion_rate;
                const result = amount * rate;
                document.getElementById('result-conversion').textContent = `Resultado: ${result.toFixed(2)} ${toCurrency}`;
            })
            .catch(error => console.error('Error fetching conversion rate:', error));
    });
});

function updateCurrencies(data) {
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');

    const currencies = Object.keys(data.conversion_rates);
    console.log('Currencies:', currencies); // Verificar las divisas obtenidas

    currencies.forEach(currency => {
        const option1 = document.createElement('option');
        option1.value = currency;
        option1.textContent = currency;
        fromCurrencySelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = currency;
        option2.textContent = currency;
        toCurrencySelect.appendChild(option2);
    });
}

function updateChart(data) {
    const ctx = document.getElementById('exchangeChart').getContext('2d');
    const labels = Object.keys(data.conversion_rates).slice(0, 10);
    const values = Object.values(data.conversion_rates).slice(0, 10);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Exchange Rate',
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}