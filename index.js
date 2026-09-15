
let history = [];

const screen = document.querySelector('#screen');
const historyScreen = document.querySelector('#history');
const decimalButton = document.querySelector('#decimal');

document.addEventListener('keydown', (event) => {
    if(event.key === 'Backspace') backspaceEvent();
});

const add = (a, b) => {
    if(history.length >= 4) history.pop();
    history.push({ operation: `${a} + ${b}`, result: a + b });
    updateScreen(a + b);
    return a + b;
};
const subtract = (a, b) => {
    if(history.length >= 4) history.pop();
    history.push({ operation: `${a} - ${b}`, result: a - b });
    updateScreen(a - b);
    return a - b;
};
const multiply = (a, b) => {
    if(history.length >= 4) history.pop();
    history.push({ operation: `${a} * ${b}`, result: a * b });
    updateScreen(a * b);
    return a * b;
};
const divide = (a, b) => {
    try {
        if(history.length >= 4) history.pop();
        history.push({ operation: `${a} / ${b}`, result: a / b });
        updateScreen(a / b);
        return a / b;
    } catch (error) {
        console.error(error.message);
        updateScreen('Error: Division by zero');
        return Infinity;
    }
}

const updateScreen = (value) => {
    if(screen.value.includes('.')) decimalButton.disabled = true;
    else decimalButton.disabled = false;
    screen.value = value;
}

const backspaceEvent = () => {
    if(screen.value.length > 0) {
        screen.value = screen.value.slice(0, -1);
        updateScreen(screen.value);
    }
};

const clearScreen = () => screen.value = "";
const clearHistory = () => history = [];
const updateHistoryScreen = () => {
    historyScreen.innerHTML = '';
    for(let i = 0; i < history.length; i++) {
        const entry = history[i];
        const historyEntry = document.createElement('div');
        historyEntry.textContent = `${entry.operation} = ${entry.result}`;
        historyScreen.appendChild(historyEntry);
    }
};

function operate(operator, a, b) {
    switch (operator) {
        case '+':
            return add(a, b);
        case '-':
            return subtract(a, b);
        case '*':
            return multiply(a, b);
        case '/':
            return divide(a, b);
        default:
            return null;
    }
}

function calculate() {
    const operands = screen.value.split(/[+\-*\/]/);
    const operators = screen.value.match(/[+\-*\/]/g) || [];
    const op1 = parseFloat(operands[0]);

    for (let i = 0; i < operators.length; i++) {
        // Stop when an operator has no following operand.
        if (i + 1 >= operands.length || operands[i + 1] === '') break;

        const nextOperand = parseFloat(operands[i + 1]);
        const result = operate(operators[i], op1, nextOperand);

        if(history.length >= 4) history.pop();
        history.push({ operation: `${op1} ${operators[i]} ${nextOperand}`, result: result });
    }

    updateScreen(result);
}