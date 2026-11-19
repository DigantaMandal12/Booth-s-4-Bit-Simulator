/**
 * Booth's 4-Bit Multiplication Algorithm Simulator
 * Pure binary register implementation for signed 4-bit integers: [-8, +7].
 * Uses a 5-bit internal Accumulator (A) and 5-bit sign-extended Multiplicand (M)
 * so all 256 signed 4-bit combinations (including M = -8) execute accurately.
 */

(function (global) {
  'use strict';

  const MIN_4BIT = -8;
  const MAX_4BIT = 7;

  /**
   * Validates that a value is an integer in [-8, +7].
   */
  function validateSigned4Bit(value) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || !/^-?\d+$/.test(trimmed)) {
        return { valid: false, error: 'Please enter a valid integer between -8 and +7.' };
      }
      value = Number(trimmed);
    }
    if (typeof value !== 'number' || !Number.isInteger(value) || Number.isNaN(value)) {
      return { valid: false, error: 'Input must be a whole integer between -8 and +7.' };
    }
    if (value < MIN_4BIT || value > MAX_4BIT) {
      return { valid: false, error: `Value ${value} is out of range. Allowed signed 4-bit range is -8 to +7.` };
    }
    return { valid: true, value };
  }

  /**
   * Converts a signed integer to an N-bit two's complement bit array [MSB ... LSB].
   */
  function toTwosComplementBits(num, bitWidth) {
    const mod = 1 << bitWidth;
    let unsigned = ((num % mod) + mod) % mod;
    const bits = new Array(bitWidth);
    for (let i = bitWidth - 1; i >= 0; i--) {
      bits[i] = unsigned & 1;
      unsigned >>= 1;
    }
    return bits;
  }

  /**
   * Converts an N-bit two's complement bit array [MSB ... LSB] to a signed decimal integer.
   */
  function bitsToSignedDecimal(bits) {
    const width = bits.length;
    let unsigned = 0;
    for (let i = 0; i < width; i++) {
      unsigned = (unsigned << 1) | (bits[i] & 1);
    }
    const signMask = 1 << (width - 1);
    if (unsigned & signMask) {
      return unsigned - (1 << width);
    }
    return unsigned;
  }

  /**
   * Formats a bit array as a binary string (e.g. [1,0,1,1] -> "1011").
   */
  function bitsToString(bits) {
    return bits.join('');
  }

  /**
   * Computes the two's complement negation of a bit array of the same width.
   */
  function negateBits(bits) {
    const inverted = bits.map((b) => (b === 0 ? 1 : 0));
    const one = new Array(bits.length).fill(0);
    one[bits.length - 1] = 1;
    return addBinary(inverted, one);
  }

  /**
   * Performs N-bit binary addition, discarding carry-out beyond N bits.
   */
  function addBinary(aBits, bBits) {
    const width = aBits.length;
    const result = new Array(width).fill(0);
    let carry = 0;
    for (let i = width - 1; i >= 0; i--) {
      const sum = aBits[i] + bBits[i] + carry;
      result[i] = sum & 1;
      carry = (sum >> 1) & 1;
    }
    return result;
  }

  /**
   * Performs Arithmetic Right Shift on combined [A(5-bit), Q(4-bit), Q_minus_1(1-bit)].
   * Preserves A[0] (the sign bit of A).
   */
  function arithmeticRightShift(A, Q, Qm1) {
    const newQm1 = Q[Q.length - 1];
    const newQ = [A[A.length - 1], Q[0], Q[1], Q[2]];
    const newA = [A[0], A[0], A[1], A[2], A[3]];
    return { A: newA, Q: newQ, Qm1: newQm1 };
  }

  /**
   * Runs Booth's Multiplication Algorithm for signed 4-bit M and Q.
   * Returns complete step-by-step trace (4 iterations) and final 8-bit result.
   */
  function runBoothAlgorithm(mInput, qInput) {
    const mCheck = validateSigned4Bit(mInput);
    if (!mCheck.valid) {
      throw new Error(`Invalid Multiplicand (M): ${mCheck.error}`);
    }
    const qCheck = validateSigned4Bit(qInput);
    if (!qCheck.valid) {
      throw new Error(`Invalid Multiplier (Q): ${qCheck.error}`);
    }

    const M_dec = mCheck.value;
    const Q_dec = qCheck.value;

    const M4 = toTwosComplementBits(M_dec, 4);
    // Sign-extend M to 5 bits so -8 (1000 -> 11000) and -M (+8 -> 01000) never overflow
    const M5 = [M4[0], M4[0], M4[1], M4[2], M4[3]];
    const negM5 = negateBits(M5);

    let A = [0, 0, 0, 0, 0];
    let Q = toTwosComplementBits(Q_dec, 4);
    let Qm1 = 0;

    const initialState = {
      A: [...A],
      Q: [...Q],
      Qm1,
      M4: [...M4],
      M5: [...M5],
      negM5: [...negM5]
    };

    const steps = [];

    for (let iteration = 1; iteration <= 4; iteration++) {
      const q0 = Q[3];
      const pair = `${q0}${Qm1}`;
      const aBeforeOp = [...A];
      const qBeforeShift = [...Q];
      const qm1BeforeShift = Qm1;

      let operationCode = 'NOP';
      let operationLabel = 'No Operation';
      let explanation = '';

      if (pair === '01') {
        A = addBinary(A, M5);
        operationCode = 'ADD';
        operationLabel = 'A = A + M';
        explanation = `Q₀Q₋₁ = 01: Add 5-bit sign-extended M (${bitsToString(M5)}) to A (${bitsToString(aBeforeOp)}) → ${bitsToString(A)}, then Arithmetic Right Shift.`;
      } else if (pair === '10') {
        A = addBinary(A, negM5);
        operationCode = 'SUB';
        operationLabel = 'A = A - M';
        explanation = `Q₀Q₋₁ = 10: Subtract M by adding two's complement -M (${bitsToString(negM5)}) to A (${bitsToString(aBeforeOp)}) → ${bitsToString(A)}, then Arithmetic Right Shift.`;
      } else {
        operationCode = 'NOP';
        operationLabel = 'No Operation';
        explanation = `Q₀Q₋₁ = ${pair}: No arithmetic operation on A (${bitsToString(aBeforeOp)}), perform Arithmetic Right Shift directly.`;
      }

      const aAfterOp = [...A];
      const shifted = arithmeticRightShift(A, Q, Qm1);
      A = shifted.A;
      Q = shifted.Q;
      Qm1 = shifted.Qm1;

      steps.push({
        iteration,
        q0,
        qm1Before: qm1BeforeShift,
        pair,
        operationCode,
        operationLabel,
        aBeforeOp,
        aAfterOp,
        qBeforeShift,
        aAfterShift: [...A],
        qAfterShift: [...Q],
        qm1AfterShift: Qm1,
        explanation
      });
    }

    // Final 8-bit product = lower 4 bits of A (A[1..4]) + 4 bits of Q (Q[0..3])
    const finalBinaryBits = [A[1], A[2], A[3], A[4], Q[0], Q[1], Q[2], Q[3]];
    const finalBinary = bitsToString(finalBinaryBits);
    const finalDecimal = bitsToSignedDecimal(finalBinaryBits);

    return {
      M_dec,
      Q_dec,
      M4,
      M5,
      negM5,
      initialState,
      steps,
      finalA: [...A],
      finalQ: [...Q],
      finalQm1: Qm1,
      finalBinaryBits,
      finalBinary,
      finalDecimal
    };
  }

  // Export for Node.js testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      MIN_4BIT,
      MAX_4BIT,
      validateSigned4Bit,
      toTwosComplementBits,
      bitsToSignedDecimal,
      bitsToString,
      negateBits,
      addBinary,
      arithmeticRightShift,
      runBoothAlgorithm
    };
  }

  // ========================================================================
  // Browser UI Controller (only runs on simulator.html)
  // ========================================================================
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const mInputEl = document.getElementById('input-m');
      const qInputEl = document.getElementById('input-q');
      if (!mInputEl || !qInputEl) return;

      const mBinaryEl = document.getElementById('m-binary-preview');
      const qBinaryEl = document.getElementById('q-binary-preview');
      const errorEl = document.getElementById('sim-error');

      const btnStart = document.getElementById('btn-start');
      const btnReset = document.getElementById('btn-reset');
      const btnPrev = document.getElementById('btn-prev');
      const btnNext = document.getElementById('btn-next');
      const btnRunAll = document.getElementById('btn-run-all');
      const btnPause = document.getElementById('btn-pause');

      const statusTextEl = document.getElementById('sim-status-text');
      const iterBadgeEl = document.getElementById('sim-iter-badge');

      const regAEl = document.getElementById('reg-a-bits');
      const regQEl = document.getElementById('reg-q-bits');
      const regQm1El = document.getElementById('reg-qm1-bits');
      const regMEl = document.getElementById('reg-m-bits');

      const regAMetaEl = document.getElementById('reg-a-meta');
      const regQMetaEl = document.getElementById('reg-q-meta');
      const regQm1MetaEl = document.getElementById('reg-qm1-meta');
      const regMMetaEl = document.getElementById('reg-m-meta');

      const stepsBodyEl = document.getElementById('steps-table-body');
      const resultPanelEl = document.getElementById('result-panel');
      const resDecimalEl = document.getElementById('res-decimal');
      const resBinaryEl = document.getElementById('res-binary');
      const resRegistersEl = document.getElementById('res-registers');
      const resMessageEl = document.getElementById('res-message');

      let simulation = null;
      let currentStepIndex = -1; // -1 = initialized state (before Iteration 1), 0..3 = Iterations 1..4
      let autoPlayTimer = null;

      function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.add('visible');
      }

      function clearError() {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
      }

      function updateBinaryPreviews() {
        const mRes = validateSigned4Bit(mInputEl.value);
        const qRes = validateSigned4Bit(qInputEl.value);

        mBinaryEl.textContent = mRes.valid
          ? `4-bit: ${bitsToString(toTwosComplementBits(mRes.value, 4))}`
          : '4-bit: Invalid';

        qBinaryEl.textContent = qRes.valid
          ? `4-bit: ${bitsToString(toTwosComplementBits(qRes.value, 4))}`
          : '4-bit: Invalid';
      }

      function renderBitCells(container, bits, markSign = false, markLsb = false) {
        container.innerHTML = '';
        bits.forEach((bit, idx) => {
          const span = document.createElement('span');
          span.className = 'bit-cell';
          if (markSign && idx === 0) span.classList.add('sign-bit');
          if (markLsb && idx === bits.length - 1) span.classList.add('lsb-bit');
          span.textContent = String(bit);
          container.appendChild(span);
        });
      }

      function stopAutoPlay() {
        if (autoPlayTimer !== null) {
          clearInterval(autoPlayTimer);
          autoPlayTimer = null;
        }
        btnPause.disabled = true;
      }

      function updateControls() {
        if (!simulation) {
          btnPrev.disabled = true;
          btnNext.disabled = true;
          btnRunAll.disabled = true;
          btnPause.disabled = true;
          return;
        }
        btnPrev.disabled = currentStepIndex < 0;
        btnNext.disabled = currentStepIndex >= 3;
        btnRunAll.disabled = currentStepIndex >= 3 || autoPlayTimer !== null;
        btnPause.disabled = autoPlayTimer === null;
      }

      function renderRegistersAndTable() {
        if (!simulation) {
          renderBitCells(regAEl, [0, 0, 0, 0, 0], true, false);
          renderBitCells(regQEl, [0, 0, 0, 0], true, true);
          renderBitCells(regQm1El, [0], false, false);
          renderBitCells(regMEl, [0, 0, 0, 0], true, false);
          regAMetaEl.textContent = '5-bit internal (00000)';
          regQMetaEl.textContent = '4-bit (0000)';
          regQm1MetaEl.textContent = '1-bit (0)';
          regMMetaEl.textContent = '4-bit (0000)';
          iterBadgeEl.textContent = 'Iteration: 0 / 4';
          statusTextEl.textContent = 'Enter M and Q (-8 to +7) and click Start Simulation.';
          stepsBodyEl.innerHTML = '<tr><td colspan="8" class="muted">Click "Start Simulation" to initialize registers and begin the 4 iterations.</td></tr>';
          resultPanelEl.classList.remove('visible');
          updateControls();
          return;
        }

        let displayA, displayQ, displayQm1;
        if (currentStepIndex === -1) {
          displayA = simulation.initialState.A;
          displayQ = simulation.initialState.Q;
          displayQm1 = simulation.initialState.Qm1;
          iterBadgeEl.textContent = 'Iteration: 0 / 4 (Initialized)';
          statusTextEl.textContent = `Initialized A = 00000, Q = ${bitsToString(displayQ)} (${simulation.Q_dec}), Q₋₁ = 0, M = ${bitsToString(simulation.M4)} (${simulation.M_dec}). Ready for Iteration 1.`;
        } else {
          const step = simulation.steps[currentStepIndex];
          displayA = step.aAfterShift;
          displayQ = step.qAfterShift;
          displayQm1 = step.qm1AfterShift;
          iterBadgeEl.textContent = `Iteration: ${step.iteration} / 4`;
          statusTextEl.textContent = `Iteration ${step.iteration}: ${step.explanation}`;
        }

        renderBitCells(regAEl, displayA, true, false);
        renderBitCells(regQEl, displayQ, true, true);
        renderBitCells(regQm1El, [displayQm1], false, false);
        renderBitCells(regMEl, simulation.M4, true, false);

        regAMetaEl.textContent = `5-bit: ${bitsToString(displayA)} (dec: ${bitsToSignedDecimal(displayA)})`;
        regQMetaEl.textContent = `4-bit: ${bitsToString(displayQ)}`;
        regQm1MetaEl.textContent = `1-bit: ${displayQm1}`;
        regMMetaEl.textContent = `4-bit: ${bitsToString(simulation.M4)} | 5-bit: ${bitsToString(simulation.M5)}`;

        // Render all 4 iterations in the table, highlighting currentStepIndex
        stepsBodyEl.innerHTML = '';
        simulation.steps.forEach((step, idx) => {
          const tr = document.createElement('tr');
          tr.className = 'iteration-row';
          if (idx === currentStepIndex) {
            tr.classList.add('active-row');
          } else if (idx < currentStepIndex) {
            tr.classList.add('completed-row');
          }

          const opClass =
            step.operationCode === 'ADD'
              ? 'op-add'
              : step.operationCode === 'SUB'
              ? 'op-sub'
              : 'op-nop';

          tr.innerHTML = `
            <td><strong>#${step.iteration}</strong></td>
            <td class="mono">${step.q0} ${step.qm1Before}</td>
            <td><span class="op-badge ${opClass}">${step.operationLabel}</span></td>
            <td class="mono">${bitsToString(step.aBeforeOp)}</td>
            <td class="mono">${bitsToString(step.aAfterOp)}</td>
            <td class="mono">${bitsToString(step.qAfterShift)}</td>
            <td class="mono">${step.qm1AfterShift}</td>
            <td>${step.explanation}</td>
          `;
          stepsBodyEl.appendChild(tr);
        });

        // Show Final Result only after Iteration 4 is reached
        if (currentStepIndex === 3) {
          resDecimalEl.textContent = `${simulation.M_dec} × ${simulation.Q_dec} = ${simulation.finalDecimal}`;
          resBinaryEl.textContent = simulation.finalBinary;
          resRegistersEl.textContent = `A=${bitsToString(simulation.finalA)} (lower 4: ${bitsToString(simulation.finalA.slice(1))}), Q=${bitsToString(simulation.finalQ)}, Q₋₁=${simulation.finalQm1}`;
          resMessageEl.textContent = `Simulation completed in 4 iterations! Lower 4 bits of A (${bitsToString(simulation.finalA.slice(1))}) + Q (${bitsToString(simulation.finalQ)}) = ${simulation.finalBinary}₂ (${simulation.finalDecimal}₁₀).`;
          resultPanelEl.classList.add('visible');
        } else {
          resultPanelEl.classList.remove('visible');
        }

        updateControls();
      }

      function startSimulation() {
        stopAutoPlay();
        clearError();
        updateBinaryPreviews();

        const mCheck = validateSigned4Bit(mInputEl.value);
        const qCheck = validateSigned4Bit(qInputEl.value);

        if (!mCheck.valid) {
          showError(`Multiplicand (M): ${mCheck.error}`);
          return;
        }
        if (!qCheck.valid) {
          showError(`Multiplier (Q): ${qCheck.error}`);
          return;
        }

        simulation = runBoothAlgorithm(mCheck.value, qCheck.value);
        currentStepIndex = -1;
        renderRegistersAndTable();
      }

      function resetSimulation() {
        stopAutoPlay();
        clearError();
        simulation = null;
        currentStepIndex = -1;
        updateBinaryPreviews();
        renderRegistersAndTable();
      }

      function nextStep() {
        if (!simulation) {
          startSimulation();
          return;
        }
        if (currentStepIndex < 3) {
          currentStepIndex += 1;
          renderRegistersAndTable();
        }
        if (currentStepIndex >= 3) {
          stopAutoPlay();
        }
      }

      function prevStep() {
        stopAutoPlay();
        if (simulation && currentStepIndex >= 0) {
          currentStepIndex -= 1;
          renderRegistersAndTable();
        }
      }

      function runAllSteps() {
        if (!simulation) {
          startSimulation();
          if (!simulation) return;
        }
        if (currentStepIndex >= 3) return;

        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
          if (currentStepIndex < 3) {
            currentStepIndex += 1;
            renderRegistersAndTable();
          }
          if (currentStepIndex >= 3) {
            stopAutoPlay();
          }
        }, 700);
        updateControls();
      }

      mInputEl.addEventListener('input', updateBinaryPreviews);
      qInputEl.addEventListener('input', updateBinaryPreviews);
      btnStart.addEventListener('click', startSimulation);
      btnReset.addEventListener('click', resetSimulation);
      btnNext.addEventListener('click', nextStep);
      btnPrev.addEventListener('click', prevStep);
      btnRunAll.addEventListener('click', runAllSteps);
      btnPause.addEventListener('click', () => {
        stopAutoPlay();
        updateControls();
      });

      // Initialize default view on load
      updateBinaryPreviews();
      renderRegistersAndTable();
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
