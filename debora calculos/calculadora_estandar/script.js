const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');
let memory = 0;

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent;

        switch (value) {
            case 'C':
                display.value = '';
                break;
            case 'CE':
                display.value = display.value.slice(0, -1);
                break;
            case '←':
                display.value = display.value.slice(0, -1);
                break;
            case '=':
                try {
                    display.value = eval(display.value.replace('×', '*').replace('÷', '/').replace('√', 'Math.sqrt'));
                } catch {
                    display.value = 'Error';
                }
                break;
            case 'MC':
                memory = 0;
                break;
            case 'MR':
                display.value = memory;
                break;
            case 'M+':
                memory += parseFloat(display.value);
                break;
            case 'M-':
                memory -= parseFloat(display.value);
                break;
            case 'MS':
                memory = parseFloat(display.value);
                break;
            case 'Mv':
                display.value = memory;
                break;
            case '±':
                display.value = parseFloat(display.value) * -1;
                break;
            case '%':
                display.value = parseFloat(display.value) / 100;
                break;
            default:
                display.value += value;
                break;
        }
    });
});
