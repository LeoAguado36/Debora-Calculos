document.getElementById('calculate-difference').addEventListener('click', () => {
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    const diffYears = endDate.getFullYear() - startDate.getFullYear();

    document.getElementById('result-difference').textContent = 
        `Diferencia: ${diffDays} días, ${diffMonths} meses, ${diffYears} años`;
});

