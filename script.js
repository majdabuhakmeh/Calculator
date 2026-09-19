let history = [];

const screen = document.querySelector("#screen");
const historyScreen = document.querySelector("#history");
const decimalButton = document.querySelector("#decimal");
const roundToTwo = (value) => Number(value.toFixed(2));

document.addEventListener("keydown", (event) => {
  if (event.key === "Backspace") backspaceEvent();
});

const add = (a, b) => {
  const result = roundToTwo(a + b);
  if (history.length >= 4) history.pop();
  history.push({ operation: `${a} + ${b}`, result });
  updateScreen(result);
  return result;
};
const subtract = (a, b) => {
  const result = roundToTwo(a - b);
  if (history.length >= 4) history.pop();
  history.push({ operation: `${a} - ${b}`, result });
  updateScreen(result);
  return result;
};
const multiply = (a, b) => {
  const result = roundToTwo(a * b);
  if (history.length >= 4) history.pop();
  history.push({ operation: `${a} * ${b}`, result });
  updateScreen(result);
  return result;
};
const divide = (a, b) => {
  if (b === 0) {
    updateScreen('Error: Division by zero');
    return NaN;
  }

  const result = roundToTwo(a / b);
  if(history.length >= 4) history.pop();
  history.push({ operation: `${a} / ${b}`, result });
  updateScreen(result);
  return result;
};

const updateScreen = (value) => {
  screen.value = value;
  const currentOperand = String(value).match(/(?:^|[+\-*/])([^+\-*/]*)$/)?.[1] || "";
  decimalButton.disabled = currentOperand.includes(".");
};

const backspaceEvent = () => {
  if (screen.value.length > 0) {
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
  historyScreen.innerHTML = "";
  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    const historyEntry = document.createElement("div");
    historyEntry.textContent = `${entry.operation} = ${entry.result}`;
    historyScreen.appendChild(historyEntry);
  }
};

function operate(operator, a, b) {
  switch (operator) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
    default:
      return null;
  }
}

function calculate() {
  const tokens = screen.value.match(/\d*\.?\d+|[+\-*/]/g) || [];
  const operands = tokens
    .filter((token) => !['+', '-', '*', '/'].includes(token))
    .map(Number);
  const operators = tokens.filter((token) => ['+', '-', '*', '/'].includes(token));

  if (operands.length === 0) return;

  // Resolve multiplication and division before addition and subtraction.
  for (let i = operators.length - 1; i >= 0; i--) {
    if (operators[i] === '*' || operators[i] === '/') {
      operands[i] = operate(operators[i], operands[i], operands[i + 1]);
      operands.splice(i + 1, 1);
      operators.splice(i, 1);
    }
  }

  let current = operands[0];
  for (let i = 0; i < operators.length; i++) {
    current = operate(operators[i], current, operands[i + 1]);
    if (Number.isNaN(current)) return;
  }

  updateScreen(roundToTwo(current));
  updateHistoryScreen();
}

// --- Button wiring: classic calculator UI -> your existing logic ---

const valueButtons = document.querySelectorAll(".key[data-value]");
for (let i = 0; i < valueButtons.length; i++) {
  const button = valueButtons[i];
  button.addEventListener("click", () => {
    if (screen.value === "0" || screen.value === "") {
      screen.value = button.dataset.value === "." ? "0." : button.dataset.value;
    } else {
      screen.value += button.dataset.value;
    }
    updateScreen(screen.value);
  });
}

const operatorButtons = document.querySelectorAll(".key--op[data-action]");
for (let i = 0; i < operatorButtons.length; i++) {
  const button = operatorButtons[i];
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "=") {
      calculate();
    } else {
      screen.value += action;
      updateScreen(screen.value);
    }
  });
}

const functionButtons = document.querySelectorAll(".key--fn[data-action]");
for (let i = 0; i < functionButtons.length; i++) {
  const button = functionButtons[i];
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "clear") {
      clearScreen();
      clearHistory();
    } else if (action === "backspace") {
      backspaceEvent();
    } else if (action === "clear-entry") {
      clearScreen();
    } else if (action === "sign") {
      if (screen.value) screen.value = String(parseFloat(screen.value) * -1);
    } else if (action === "percent") {
      if (screen.value) screen.value = String(parseFloat(screen.value) / 100);
    }
  });
}
