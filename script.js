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
    if(String(screen.value).includes('.')) decimalButton.disabled = true;
    else decimalButton.disabled = false;
    screen.value = value;
}

const backspaceEvent = () => {
    if(screen.value.length > 0) {
        screen.value = screen.value.slice(0, -1);
        updateScreen(screen.value);
    }
};

const clearScreen = () => {
    screen.value = "";
    decimalButton.disabled = false;
};
const clearHistory = () => {
    history = [];
    updateHistoryScreen();
};
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
    // Lookbehind (?<=[0-9.]) means: only treat +-*/ as an operator
    // when it comes right after a digit or decimal point. That way
    // a leading "-" (a negative number, e.g. from +/-) stays attached
    // to its number instead of being split off into an empty operand.
    const operands = screen.value.split(/(?<=[0-9.])[+\-*/]/);
    const operators = screen.value.match(/(?<=[0-9.])[+\-*/]/g) || [];

    // `current` carries the running total forward into each step,
    // instead of always reusing the first operand.
    let current = parseFloat(operands[0]);

    for (let i = 0; i < operators.length; i++) {
        // Stop when an operator has no following operand.
        if (i + 1 >= operands.length || operands[i + 1] === '') break;

        const nextOperand = parseFloat(operands[i + 1]);
        // operate() -> add/subtract/multiply/divide already updates
        // the screen and pushes its own history entry, so we don't
        // duplicate that here.
        current = operate(operators[i], current, nextOperand);
    }

    updateHistoryScreen();
}

// --- Button wiring: classic calculator UI -> your existing logic ---

const valueButtons = document.querySelectorAll('.key[data-value]');
for (let i = 0; i < valueButtons.length; i++) {
    const button = valueButtons[i];
    button.addEventListener('click', () => {
        if (screen.value === '0' || screen.value === '') {
            screen.value = button.dataset.value === '.' ? '0.' : button.dataset.value;
        } else {
            screen.value += button.dataset.value;
        }
        updateScreen(screen.value);
    });
}

const operatorButtons = document.querySelectorAll('.key--op[data-action]');
for (let i = 0; i < operatorButtons.length; i++) {
    const button = operatorButtons[i];
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === '=') {
            calculate();
        } else {
            screen.value += action;
        }
    });
}

const functionButtons = document.querySelectorAll('.key--fn[data-action]');
for (let i = 0; i < functionButtons.length; i++) {
    const button = functionButtons[i];
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'clear') {
            clearScreen();
            clearHistory();
        } else if (action === 'sign') {
            if (screen.value) screen.value = String(parseFloat(screen.value) * -1);
        } else if (action === 'percent') {
            if (screen.value) screen.value = String(parseFloat(screen.value) / 100);
        }
    });
}