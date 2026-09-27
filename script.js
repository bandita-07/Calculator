document.addEventListener('DOMContentLoaded', () => {

  let currentOperand = '0';
  let previousOperand = '';
  let operation = null;
  let resetOnNextInput = false;

  const prevDisplay = document.getElementById('prevDisplay');
  const currDisplay = document.getElementById('currDisplay');

  // Bubble sound generator
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function playPop(freq = 600) {
    try {
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {
      // Audio fallback
    }
  }

  // Update screen view
  function updateDisplay() {
    currDisplay.textContent = currentOperand;
    if (operation != null) {
      prevDisplay.textContent = `${previousOperand} ${operation}`;
    } else {
      prevDisplay.innerHTML = '&nbsp;';
    }
  }

  // Append Number (0-9, .)
  function appendNumber(val) {
    playPop(520);

    if (resetOnNextInput) {
      currentOperand = val === '.' ? '0.' : val;
      resetOnNextInput = false;
      updateDisplay();
      return;
    }

    if (val === '.') {
      if (currentOperand.includes('.')) return;
      currentOperand += '.';
      updateDisplay();
      return;
    }

    if (currentOperand === '0') {
      currentOperand = val;
    } else {
      currentOperand += val;
    }
    updateDisplay();
  }

  // Backspace / Delete button (⌫)
  function deleteNumber() {
    playPop(390);
    if (resetOnNextInput || currentOperand === 'Error') {
      currentOperand = '0';
      resetOnNextInput = false;
      updateDisplay();
      return;
    }

    if (currentOperand.length <= 1 || (currentOperand.length === 2 && currentOperand.startsWith('-'))) {
      currentOperand = '0';
    } else {
      currentOperand = currentOperand.slice(0, -1);
    }
    updateDisplay();
  }

  // Square Root (√)
  function squareRoot() {
    playPop(620);
    if (currentOperand === 'Error') return;

    const val = parseFloat(currentOperand);
    if (isNaN(val)) return;

    if (val < 0) {
      currentOperand = 'Error';
    } else {
      currentOperand = parseFloat(Math.sqrt(val).toFixed(8)).toString();
    }

    resetOnNextInput = true;
    updateDisplay();
  }

  // Choose operation (+, -, ×, ÷)
  function chooseOperation(op) {
    playPop(480);
    if (currentOperand === 'Error') clearAll();

    if (previousOperand !== '' && !resetOnNextInput) {
      compute();
    }

    operation = op;
    previousOperand = currentOperand;
    resetOnNextInput = true;
    updateDisplay();
  }

  // Compute result (=)
  function compute() {
    playPop(780);
    let result;
    const prev = parseFloat(previousOperand);
    const curr = parseFloat(currentOperand);

    if (isNaN(prev) || isNaN(curr)) return;

    switch (operation) {
      case '+':
        result = prev + curr;
        break;
      case '-':
        result = prev - curr;
        break;
      case '×':
        result = prev * curr;
        break;
      case '÷':
        if (curr === 0) {
          currentOperand = 'Error';
          operation = null;
          previousOperand = '';
          updateDisplay();
          return;
        }
        result = prev / curr;
        break;
      default:
        return;
    }

    currentOperand = parseFloat(result.toFixed(8)).toString();
    operation = null;
    previousOperand = '';
    resetOnNextInput = true;
    updateDisplay();
  }

  // Clear all (AC)
  function clearAll() {
    playPop(340);
    currentOperand = '0';
    previousOperand = '';
    operation = null;
    resetOnNextInput = false;
    updateDisplay();
  }

  // Percentage (%)
  function percentage() {
    playPop(500);
    if (currentOperand === 'Error') return;
    const val = parseFloat(currentOperand);
    if (isNaN(val)) return;
    currentOperand = (val / 100).toString();
    updateDisplay();
  }

  // Button Listeners
  document.querySelectorAll('.btn-num').forEach(button => {
    button.addEventListener('click', () => {
      appendNumber(button.getAttribute('data-num'));
    });
  });

  document.querySelectorAll('.btn-op').forEach(button => {
    button.addEventListener('click', () => {
      chooseOperation(button.getAttribute('data-op'));
    });
  });

  document.getElementById('btnSqrt').addEventListener('click', squareRoot);
  document.getElementById('btnDel').addEventListener('click', deleteNumber);
  document.getElementById('btnAC').addEventListener('click', clearAll);
  document.getElementById('btnPercent').addEventListener('click', percentage);
  document.getElementById('btnEquals').addEventListener('click', compute);

  // Mascot interaction
  document.getElementById('mascot').addEventListener('click', () => {
    playPop(900);
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
      appendNumber(e.key);
    }
    if (e.key === 'Backspace' || e.key === 'Delete') deleteNumber();
    if (e.key === '+') chooseOperation('+');
    if (e.key === '-') chooseOperation('-');
    if (e.key === '*') chooseOperation('×');
    if (e.key === '/') chooseOperation('÷');
    if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      compute();
    }
    if (e.key === 'Escape') clearAll();
    if (e.key === '%') percentage();
    if (e.key.toLowerCase() === 'r' || e.key.toLowerCase() === 's') squareRoot();
  });

  // Initial render
  updateDisplay();
});
