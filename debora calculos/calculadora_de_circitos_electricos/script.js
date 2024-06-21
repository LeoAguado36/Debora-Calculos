document.addEventListener('DOMContentLoaded', function () {
    const circuitArea = document.getElementById('circuit-area');
    const elements = document.querySelectorAll('.element');
    const procedureDiv = document.getElementById('procedure');
    const tbody = document.getElementById('results-table').querySelector('tbody');
    const undoButton = document.getElementById('undo');
    const redoButton = document.getElementById('redo');
    const exportButton = document.getElementById('export-design');
    const importButton = document.getElementById('import-design');
    const fileInput = document.getElementById('file-input');
    const controlsDiv = document.querySelector('.controls');

    let elementos = [];
    let history = [];
    let redoStack = [];
    let scale = 1;
    let simulationInterval;

    elements.forEach(element => {
        element.addEventListener('dragstart', dragStart);
    });

    circuitArea.addEventListener('dragover', dragOver);
    circuitArea.addEventListener('drop', dropElement);
    document.addEventListener('keydown', handleUndoRedo);
    undoButton.addEventListener('click', undo);
    redoButton.addEventListener('click', redo);
    exportButton.addEventListener('click', exportDesign);
    importButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importDesign);

    // Añadir botones de zoom
    const zoomInButton = document.createElement('button');
    zoomInButton.textContent = 'Acercar';
    zoomInButton.addEventListener('click', zoomIn);
    controlsDiv.appendChild(zoomInButton);

    const zoomOutButton = document.createElement('button');
    zoomOutButton.textContent = 'Alejar';
    zoomOutButton.addEventListener('click', zoomOut);
    controlsDiv.appendChild(zoomOutButton);

    // Añadir botón de validación
    const validateButton = document.createElement('button');
    validateButton.textContent = 'Validar Diseño';
    validateButton.addEventListener('click', () => validarDiseno(elementos));
    controlsDiv.appendChild(validateButton);

    // Añadir botón de simulación
    const simulateButton = document.createElement('button');
    simulateButton.textContent = 'Simular Dinámicamente';
    simulateButton.addEventListener('click', iniciarSimulacion);
    controlsDiv.appendChild(simulateButton);

    // Añadir botón para detener la simulación
    const stopSimulationButton = document.createElement('button');
    stopSimulationButton.textContent = 'Detener Simulación';
    stopSimulationButton.addEventListener('click', detenerSimulacion);
    controlsDiv.appendChild(stopSimulationButton);

    /**
     * Inicia el arrastre de un elemento.
     * @param {DragEvent} e Evento de arrastre.
     */
    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
    }

    /**
     * Permite el arrastre sobre el área del circuito.
     * @param {DragEvent} e Evento de arrastre.
     */
    function dragOver(e) {
        e.preventDefault();
    }

    /**
     * Suelta un elemento en el área del circuito.
     * @param {DragEvent} e Evento de arrastre.
     */
    function dropElement(e) {
        e.preventDefault();
        const elementType = e.dataTransfer.getData('text/plain');
        const newElement = document.createElement('div');
        newElement.classList.add('circuit-element', elementType);
        newElement.style.left = `${e.clientX - circuitArea.offsetLeft}px`;
        newElement.style.top = `${e.clientY - circuitArea.offsetTop}px`;

        let elemento = { tipo: '', id: elementos.length, position: { x: e.clientX, y: e.clientY } };

        if (elementType === 'horizontal-wire' || elementType === 'vertical-wire') {
            elemento.tipo = elementType === 'horizontal-wire' ? 'Cable Horizontal' : 'Cable Vertical';
            newElement.style.width = elementType === 'horizontal-wire' ? '100px' : '2px';
            newElement.style.height = elementType === 'horizontal-wire' ? '2px' : '100px';
            conectarConElementoMasCercano(elemento, newElement);
        } else if (elementType === 'ammeter' || elementType === 'voltmeter') {
            elemento.tipo = elementType === 'ammeter' ? 'Amperímetro' : 'Voltímetro';
        } else if (elementType === 'resistor') {
            elemento.tipo = 'Resistor';
            let resistencia = prompt('Introduce el valor de la resistencia (Ω):', '0');
            while (!validarValor(resistencia, 'Resistor')) {
                resistencia = prompt('Introduce el valor de la resistencia (Ω):', '0');
            }
            elemento.resistencia = resistencia;
        } else if (elementType === 'voltage-source') {
            elemento.tipo = 'Fuente de Voltaje';
            let voltaje = prompt('Introduce el valor del voltaje (V):', '0');
            while (!validarValor(voltaje, 'Fuente de Voltaje')) {
                voltaje = prompt('Introduce el valor del voltaje (V):', '0');
            }
            elemento.voltaje = voltaje;
        } else if (elementType === 'capacitor') {
            elemento.tipo = 'Capacitor';
            let capacitancia = prompt('Introduce el valor de la capacitancia (F):', '0');
            while (!validarValor(capacitancia, 'Capacitor')) {
                capacitancia = prompt('Introduce el valor de la capacitancia (F):', '0');
            }
            elemento.capacitancia = capacitancia;
        } else if (elementType === 'inductor') {
            elemento.tipo = 'Inductor';
            let inductancia = prompt('Introduce el valor de la inductancia (H):', '0');
            while (!validarValor(inductancia, 'Inductor')) {
                inductancia = prompt('Introduce el valor de la inductancia (H):', '0');
            }
            elemento.inductancia = inductancia;
        }

        circuitArea.appendChild(newElement);
        elementos.push(elemento);
        saveState();
        actualizarTabla(elementos);
        calcularProcedimiento(elementos);
        dibujarConexiones();
    }

    /**
     * Valida que el valor introducido sea un número positivo.
     * @param {string} input Valor introducido.
     * @param {string} tipo Tipo de elemento.
     * @returns {boolean} True si el valor es válido, de lo contrario false.
     */
    function validarValor(input, tipo) {
        const valor = parseFloat(input);
        if (isNaN(valor) || valor < 0) {
            alert(`Valor inválido para ${tipo}. Introduce un número positivo.`);
            return false;
        }
        return true;
    }

    /**
     * Conecta un nuevo elemento con el elemento más cercano.
     * @param {Object} nuevoElemento Nuevo elemento a añadir.
     * @param {HTMLElement} nuevoDivElement Elemento div del nuevo elemento.
     */
    function conectarConElementoMasCercano(nuevoElemento, nuevoDivElement) {
        let minDistancia = Infinity;
        let elementoCercano = null;
        elementos.forEach(el => {
            let dist = Math.sqrt(Math.pow(el.position.x - nuevoElemento.position.x, 2) + Math.pow(el.position.y - nuevoElemento.position.y, 2));
            if (dist < minDistancia) {
                minDistancia = dist;
                elementoCercano = el;
            }
        });
        if (elementoCercano) {
            nuevoDivElement.style.left = `${elementoCercano.position.x}px`;
            nuevoDivElement.style.top = `${elementoCercano.position.y}px`;
        }
    }

    /**
     * Actualiza los valores de un elemento.
     * @param {Event} e Evento de cambio de valor.
     */
    function updateElementValue(e) {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        const value = parseFloat(e.target.value);

        elementos.forEach(elemento => {
            if (elemento.id == id) {
                if (type === 'Resistor') {
                    elemento.resistencia = value;
                } else if (type === 'Fuente de Voltaje') {
                    elemento.voltaje = value;
                }
            }
        });

        saveState();
        calcularProcedimiento(elementos);
        actualizarTabla(elementos);
    }

    /**
     * Actualiza la tabla de resultados.
     * @param {Array} elementos Array de elementos en el circuito.
     */
    function actualizarTabla(elementos) {
        tbody.innerHTML = ''; // Limpiar tabla

        elementos.forEach((elemento, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${elemento.tipo} ${index + 1}</td>
                <td>${elemento.resistencia || elemento.capacitancia || elemento.inductancia || '-'}</td>
                <td>${elemento.voltaje || '-'}</td>
                <td>${elemento.intensidad || '-'}</td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Calcula el procedimiento del circuito.
     * @param {Array} elementos Array de elementos en el circuito.
     */
    function calcularProcedimiento(elementos) {
        let resistenciaTotal = 0;
        let voltajeTotal = 0;

        elementos.forEach(elemento => {
            if (elemento.resistencia) resistenciaTotal += parseFloat(elemento.resistencia);
            if (elemento.voltaje) voltajeTotal += parseFloat(elemento.voltaje);
        });

        let intensidad = voltajeTotal / resistenciaTotal;

        elementos.forEach(elemento => {
            if (elemento.resistencia) elemento.intensidad = intensidad;
        });

        procedureDiv.innerHTML = `
            Resistencia Total: ${resistenciaTotal.toFixed(2)} Ω<br>
            Voltaje Total: ${voltajeTotal.toFixed(2)} V<br>
            Intensidad: ${intensidad.toFixed(2)} A
        `;

        actualizarTabla(elementos);
    }

    /**
     * Dibuja las conexiones entre los elementos del circuito.
     */
    function dibujarConexiones() {
        const circuitElements = document.querySelectorAll('.circuit-element');
        document.querySelectorAll('.circuit-line').forEach(line => line.remove());

        circuitElements.forEach((element, index) => {
            if (index < circuitElements.length - 1) {
                const nextElement = circuitElements[index + 1];
                const x1 = element.offsetLeft + element.offsetWidth / 2;
                const y1 = element.offsetTop + element.offsetHeight / 2;
                const x2 = nextElement.offsetLeft + nextElement.offsetWidth / 2;
                const y2 = nextElement.offsetTop + nextElement.offsetHeight / 2;

                // Dibuja línea horizontal
                const hLine = document.createElement('div');
                hLine.classList.add('circuit-line');
                hLine.style.left = `${Math.min(x1, x2)}px`;
                hLine.style.top = `${y1}px`;
                hLine.style.width = `${Math.abs(x2 - x1)}px`;
                hLine.style.height = '2px';
                circuitArea.appendChild(hLine);

                // Dibuja línea vertical
                const vLine = document.createElement('div');
                vLine.classList.add('circuit-line');
                vLine.style.left = `${x2}px`;
                vLine.style.top = `${Math.min(y1, y2)}px`;
                vLine.style.height = `${Math.abs(y2 - y1)}px`;
                vLine.style.width = '2px';
                circuitArea.appendChild(vLine);
            }
        });
    }

    /**
     * Maneja las acciones de deshacer (Ctrl+Z) y rehacer (Ctrl+Y).
     * @param {KeyboardEvent} e Evento de teclado.
     */
    function handleUndoRedo(e) {
        if (e.ctrlKey && e.key === 'z') {
            undo();
        } else if (e.ctrlKey && e.key === 'y') {
            redo();
        }
    }

    /**
     * Guarda el estado actual de los elementos en el historial.
     */
    function saveState() {
        history.push(JSON.stringify(elementos));
        redoStack = [];
    }

    /**
     * Deshace la última acción.
     */
    function undo() {
        if (history.length > 1) {
            redoStack.push(history.pop());
            elementos = JSON.parse(history[history.length - 1]);
            renderCircuit();
        }
    }

    /**
     * Rehace la última acción deshecha.
     */
    function redo() {
        if (redoStack.length > 0) {
            history.push(redoStack.pop());
            elementos = JSON.parse(history[history.length - 1]);
            renderCircuit();
        }
    }

    /**
 * Renderiza el circuito basado en el estado actual de los elementos.
 */
    function renderCircuit() {
        circuitArea.innerHTML = '';
        elementos.forEach(elemento => {
            const newElement = document.createElement('div');
            newElement.classList.add('circuit-element', elemento.tipo);
            newElement.style.left = `${elemento.position.x - circuitArea.offsetLeft}px`;
            newElement.style.top = `${elemento.position.y - circuitArea.offsetTop}px`;

            if (elemento.tipo === 'Cable Horizontal' || elemento.tipo === 'Cable Vertical') {
                newElement.style.width = elemento.tipo === 'Cable Horizontal' ? '100px' : '2px';
                newElement.style.height = elemento.tipo === 'Cable Horizontal' ? '2px' : '100px';
            } else if (elemento.tipo === 'Resistor') {
                newElement.innerHTML = `R: ${elemento.resistencia}Ω`;
            } else if (elemento.tipo === 'Fuente de Voltaje') {
                newElement.innerHTML = `V: ${elemento.voltaje}V`;
            } else if (elemento.tipo === 'Capacitor') {
                newElement.innerHTML = `C: ${elemento.capacitancia}F`;
            } else if (elemento.tipo === 'Inductor') {
                newElement.innerHTML = `L: ${elemento.inductancia}H`;
            }

            circuitArea.appendChild(newElement);
        });

        actualizarTabla(elementos);
        calcularProcedimiento(elementos);
        dibujarConexiones();
        procedureDiv.innerHTML = `
        Voltaje Total: ${voltajeTotal.toFixed(2)} V<br>
        Resistencia Total: ${resistenciaTotal.toFixed(2)} Ω<br>
        Reactancia Capacitiva Total: ${reactanciaCapacitivaTotal.toFixed(2)} Ω<br>
        Reactancia Inductiva Total: ${reactanciaInductivaTotal.toFixed(2)} Ω<br>
        Impedancia Total: ${impedanciaTotal.toFixed(2)} Ω<br>
        Intensidad: ${intensidad.toFixed(2)} A
    `;
    }

    /**
     * Valida el diseño del circuito.
     * @param {Array} elementos Array de elementos en el circuito.
     */
    function validarDiseno(elementos) {
        let errors = [];
        // Validar si hay componentes desconectados o cortocircuitos
        elementos.forEach((elemento, index) => {
            if (elemento.tipo === 'Cable Horizontal' || elemento.tipo === 'Cable Vertical') {
                let conectado = false;
                elementos.forEach((otroElemento) => {
                    if (elemento !== otroElemento) {
                        let distancia = Math.sqrt(Math.pow(elemento.position.x - otroElemento.position.x, 2) + Math.pow(elemento.position.y - otroElemento.position.y, 2));
                        if (distancia < 10) {
                            conectado = true;
                        }
                    }
                });
                if (!conectado) {
                    errors.push(`El ${elemento.tipo} ${index + 1} no está conectado a ningún componente.`);
                }
            }
        });

        if (errors.length > 0) {
            alert("Errores encontrados:\n" + errors.join("\n"));
        } else {
            alert("El diseño es válido.");
        }
    }

    /**
     * Función de zoom para acercar.
     */
    function zoomIn() {
        scale += 0.1;
        updateZoom();
    }

    /**
     * Función de zoom para alejar.
     */
    function zoomOut() {
        scale = Math.max(0.1, scale - 0.1);
        updateZoom();
    }

    /**
     * Actualiza el zoom del área de trabajo.
     */
    function updateZoom() {
        circuitArea.style.transform = `scale(${scale})`;
    }
});