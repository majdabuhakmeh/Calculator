let history = [];

const screen = document.querySelector("#screen");
const historyScreen = document.querySelector("#history");
const decimalButton = document.querySelector("#decimal");
const roundToTwo = (value) => Number(value.toFixed(2));

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
  
  // Adjust font size dynamically to prevent overflow
  const len = String(value).length;
  if (len > 15) {
    screen.style.fontSize = "24px";
  } else if (len > 11) {
    screen.style.fontSize = "32px";
  } else if (len > 8) {
    screen.style.fontSize = "44px";
  } else {
    screen.style.fontSize = ""; // reset to CSS default
  }

  const currentOperand = String(value).match(/(?:^|[+\-*/])([^+\-*/]*)$/)?.[1] || "";
  decimalButton.disabled = currentOperand.includes(".");
};

const backspaceEvent = () => {
  if (screen.value.startsWith("Error")) {
    clearScreen();
    return;
  }
  if (screen.value.length > 0) {
    screen.value = screen.value.slice(0, -1);
    if (screen.value === "") screen.value = "0";
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

const appendValue = (value) => {
  if (value === "." && decimalButton.disabled) return;

  if (screen.value === "0" || screen.value === "" || screen.value.startsWith("Error")) {
    screen.value = value === "." ? "0." : value;
  } else if (value === "." && /[+\-*/]$/.test(screen.value)) {
    screen.value += "0.";
  } else {
    screen.value += value;
  }
  updateScreen(screen.value);
};

const appendOperator = (operator) => {
  const expression = screen.value;
  if (!expression || expression === "Error: Division by zero") return;

  const operatorMatch = expression.match(/^(-?(?:\d+\.?\d*|\.\d+))([+\-*/])(.*)$/);

  if (operatorMatch) {
    if (operatorMatch[3] === "") {
      screen.value = expression.slice(0, -1) + operator;
    } else {
      calculate();
      if (screen.value !== "Error: Division by zero" && !Number.isNaN(Number(screen.value))) {
        screen.value += operator;
      }
    }
  } else {
    screen.value += operator;
  }

  updateScreen(screen.value);
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
  const expression = screen.value;
  if (!expression || expression.startsWith("Error")) return;

  // Don't calculate if the expression is incomplete (ends with an operator)
  if (/[+\-*/]$/.test(expression)) return;

  const rawTokens = expression.match(/\d*\.?\d+|[+\-*/]/g) || [];
  const tokens = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];
    const previousToken = tokens[tokens.length - 1];
    const isUnaryMinus =
      token === "-" &&
      (tokens.length === 0 || ["+", "-", "*", "/"].includes(previousToken)) &&
      rawTokens[i + 1] !== undefined &&
      !["+", "-", "*", "/"].includes(rawTokens[i + 1]);

    if (isUnaryMinus) {
      tokens.push(`-${rawTokens[++i]}`);
    } else {
      tokens.push(token);
    }
  }
  const operands = tokens
    .filter((token) => !['+', '-', '*', '/'].includes(token))
    .map(Number);
  const operators = tokens.filter((token) => ['+', '-', '*', '/'].includes(token));

  if (operands.length === 0) return;

  // Resolve multiplication and division before addition and subtraction.
  for (let i = operators.length - 1; i >= 0; i--) {
    if (operators[i] === '*' || operators[i] === '/') {
      const res = operate(operators[i], operands[i], operands[i + 1]);
      if (Number.isNaN(res)) return; // Stop if Error occurred (e.g. division by zero)
      operands[i] = res;
      operands.splice(i + 1, 1);
      operators.splice(i, 1);
    }
  }

  let current = operands[0];
  if (Number.isNaN(current)) return;

  for (let i = 0; i < operators.length; i++) {
    current = operate(operators[i], current, operands[i + 1]);
    if (Number.isNaN(current)) return;
  }

  updateScreen(roundToTwo(current));
  updateHistoryScreen();
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const keyMap = {
    "+": '.key--op[data-action="+"]',
    "-": '.key--op[data-action="-"]',
    "*": '.key--op[data-action="*"]',
    "x": '.key--op[data-action="*"]',
    "X": '.key--op[data-action="*"]',
    "/": '.key--op[data-action="/"]',
    "=": '.key--op[data-action="="]',
    "Enter": '.key--op[data-action="="]',
    "Backspace": '.key--fn[data-action="backspace"]',
    "Escape": '.key--fn[data-action="clear"]',
    "c": '.key--fn[data-action="clear"]',
    "C": '.key--fn[data-action="clear"]',
    "Delete": '.key--fn[data-action="clear-entry"]'
  };

  let selector = keyMap[event.key];
  
  // Explicitly support all digits and decimal point
  if (/^\d$/.test(event.key) || event.key === ".") {
    selector = `.key[data-value="${event.key}"]`;
  }

  if (selector) {
    event.preventDefault();
    const button = document.querySelector(selector);
    if (button) {
      button.click();
      button.classList.add("is-active");
      setTimeout(() => button.classList.remove("is-active"), 100);
    }
  }
});

// --- Button wiring: classic calculator UI -> your existing logic ---

const valueButtons = document.querySelectorAll(".key[data-value]");
for (let i = 0; i < valueButtons.length; i++) {
  const button = valueButtons[i];
  button.addEventListener("click", () => {
    appendValue(button.dataset.value);
    button.blur();
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
      appendOperator(action);
    }
    button.blur();
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
    button.blur();
  });
}
