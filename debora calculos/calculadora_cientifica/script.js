const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;

        if (value === 'C') {
            display.value = '';
        } else if (value === 'CE') {
            display.value = display.value.slice(0, -1);
        } else if (value === '←') {
            display.value = display.value.slice(0, -1);
        } else if (value === '=') {
            try {
                display.value = eval(display.value
                    .replace('×', '*')
                    .replace('÷', '/')
                    .replace('^', '**')
                    .replace('π', 'Math.PI')
                    .replace('e', 'Math.E')
                    .replace('√', 'Math.sqrt')
                    .replace('sin', 'Math.sin')
                    .replace('cos', 'Math.cos')
                    .replace('tan', 'Math.tan')
                    .replace('log', 'Math.log10')
                    .replace('ln', 'Math.log')
                    .replace('!', 'factorial'));
            } catch {
                display.value = 'Error';
            }
        } else if (value === '±') {
            display.value = display.value * -1;
        } else if (value === '!' || value === 'π' || value === 'e' || value === '√' || value === 'sin' || value === 'cos' || value === 'tan' || value === 'log' || value === 'ln') {
            display.value += value;
        } else {
            display.value += value;
        }
    });
});

function factorial(n) {
    if (n < 0) return 'Error';
    if (n === 0) return 1;
    return n * factorial(n - 1);
}
