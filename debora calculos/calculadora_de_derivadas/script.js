document.getElementById('derivative-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const inputFunction = document.getElementById('function').value;
    calculateDerivative(inputFunction);
});

document.querySelectorAll('.key').forEach(function (button) {
    button.addEventListener('click', function () {
        const input = document.getElementById('function');
        const text = button.textContent;
        if (button.id === 'delete') {
            input.value = input.value.slice(0, -1);
        } else if (button.id === 'clear') {
            input.value = '';
        } else if (text === '¹') {
            input.value += '^1';
        } else if (text === '²') {
            input.value += '^2';
        } else if (text === '³') {
            input.value += '^3';
        } else if (text === '⁴') {
            input.value += '^4';
        } else if (text === '⁵') {
            input.value += '^5';
        } else if (text === '⁶') {
            input.value += '^6';
        } else if (text === '⁷') {
            input.value += '^7';
        } else if (text === '⁸') {
            input.value += '^8';
        } else if (text === '⁹') {
            input.value += '^9';
        } else if (text.includes('()')) {
            input.value += text.replace('()', '(') + ')';
        } else {
            input.value += text;
        }
        updateLatex();
    });
});

document.getElementById('function').addEventListener('input', updateLatex);

function updateLatex() {
    const input = document.getElementById('function').value;
    const latexContainer = document.getElementById('function-latex');
    latexContainer.textContent = `\\(${input}\\)`;
    renderMathInElement(latexContainer, {
        delimiters: [{ left: '\\(', right: '\\)', display: false }]
    });
}

function calculateDerivative(func) {
    func = func.replace(/\*/g, '()');
    const math = window.math;

    try {
        const node = math.parse(func);
        const derivative = math.derivative(node, 'x');
        const simplified = math.simplify(derivative);
        const result = simplified.toTex();
        const formattedResult = simplified.toString({ implicit: 'hide' }).replace(/\*/g, '');

        const steps = generateSteps(node, derivative, simplified, formattedResult);

        document.getElementById('result').innerHTML = `\\[ ${result} \\]`;
        document.getElementById('procedure').innerHTML = steps;

        renderMathInElement(document.getElementById('result'));
        renderMathInElement(document.getElementById('procedure'));
    } catch (error) {
        document.getElementById('result').textContent = 'Error al calcular la derivada. Por favor, revisa la función ingresada.';
        document.getElementById('procedure').textContent = '';
    }
}

function generateSteps(node, derivative, simplified, formattedResult) {
    let steps = `Función original: \\( ${node.toTex()} \\)\n\n`;

    steps += `1. Derivamos cada término:\n`;

    const terms = node.args || [node];
    terms.forEach(term => {
        const termDerivative = math.derivative(term, 'x').toTex();
        steps += `   - Derivada de \\( ${term.toTex()} \\) es \\( ${termDerivative} \\)\n`;
    });

    steps += `\n2. Sumamos las derivadas individuales para obtener la derivada de la función completa:\n`;
    steps += `   \\( ${derivative.toTex()} \\)\n`;

    steps += `\n3. Simplificamos la derivada obtenida:\n`;
    steps += `   \\( ${simplified.toTex()} \\)\n`;

    steps += `\n4. Resultado:\n`;
    steps += `   \\( ${formattedResult} \\)\n`;

    return steps;
}