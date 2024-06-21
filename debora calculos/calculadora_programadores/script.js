const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');
let currentBase = 10;

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
                    .replace('<<', '<<')
                    .replace('>>', '>>'));
            } catch {
                display.value = 'Error';
            }
        } else if (value === 'bin' || value === 'oct' || value === 'dec' || value === 'hex') {
            convertBase(value);
        } else if (value === 'AND' || value === 'OR' || value === 'XOR' || value === 'NOT' || value === '<<' || value === '>>') {
            display.value += ' ' + value + ' ';
        } else {
            display.value += value;
        }
    });
});

function convertBase(base) {
    let num = parseInt(display.value, currentBase);
    switch(base) {
        case 'bin':
            display.value = num.toString(2);
            currentBase = 2;
            break;
        case 'oct':
            display.value = num.toString(8);
            currentBase = 8;
            break;
        case 'dec':
            display.value = num.toString(10);
            currentBase = 10;
            break;
        case 'hex':
            display.value = num.toString(16).toUpperCase();
            currentBase = 16;
            break;
    }
}
