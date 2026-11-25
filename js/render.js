/**
 * DOM & SVG Rendering Module.
 * Derives all visual states, wire activations, register cells, and trace rows
 * strictly from the immutable simulation state.
 */

import { formatBinary, getFinalResult } from './booth-core.js';

function setRegisterCells(svg, regId, value, bits, highlightShift = false) {
  for (let b = 0; b < bits; b++) {
    const bitVal = (value >> b) & 0x01;
    const textEl = svg.getElementById(`val-${regId}-${b}`);
    if (textEl) {
      textEl.textContent = String(bitVal);
    }
    const cellGroup = svg.querySelector(`[data-cell="${regId}-${b}"]`);
    if (cellGroup) {
      cellGroup.classList.toggle('shifted', highlightShift);
    }
  }
}

function setWireState(svg, signalName, stateClass) {
  const nodes = svg.querySelectorAll(`[data-wire="${signalName}"]`);
  nodes.forEach((node) => {
    node.classList.remove('active', 'active-add', 'active-sub', 'active-done');
    if (stateClass) {
      node.classList.add(stateClass);
    }
    if (node.tagName.toLowerCase() === 'path' && node.hasAttribute('marker-end')) {
      const markerMap = {
        active: 'url(#arrow-active)',
        'active-add': 'url(#arrow-add)',
        'active-sub': 'url(#arrow-sub)',
        'active-done': 'url(#arrow-done)',
      };
      node.setAttribute('marker-end', markerMap[stateClass] || 'url(#arrow-inactive)');
    }
  });
}

function setGateState(svg, gateId, stateClass) {
  const gate = svg.querySelector(`[data-gate="${gateId}"]`);
  if (!gate) return;
  gate.classList.remove('active', 'active-add', 'active-sub');
  if (stateClass) {
    gate.classList.add(stateClass);
  }
}

function setPillState(svg, id, value, activeClass) {
  const rect = svg.getElementById(`pill-${id}`);
  const text = svg.getElementById(`pill-text-${id}`);
  if (rect) {
    rect.classList.remove('on', 'on-add', 'on-sub', 'on-done');
    if (value && activeClass) {
      rect.classList.add(activeClass);
    }
  }
  if (text) {
    text.textContent = `${id}=${value ? 1 : 0}`;
  }
}

/**
 * Render the complete application UI from the current state.
 */
export function renderAll(state, runtime = {}) {
  const svg = document.getElementById('booth-circuit-svg');
  if (!svg) return;

  const sig = state.signals;
  const isShift = state.lastAction === 'SHIFT';

  // 1. Update SVG Register Bit Cells
  setRegisterCells(svg, 'M', state.M, 4, false);
  setRegisterCells(svg, 'R', state.R, 4, false);
  setRegisterCells(svg, 'V', state.V, 1, false);
  setRegisterCells(svg, 'A', state.A, 4, isShift);
  setRegisterCells(svg, 'Q', state.Q, 4, isShift);
  setRegisterCells(svg, 'Q_1', state.Q_1, 1, isShift);
  setRegisterCells(svg, 'C', state.C, 2, isShift);

  // 2. Update SVG Labels (MUX, ALU, SX, Product Bus)
  const setTxt = (id, txt) => {
    const el = svg.getElementById(id);
    if (el) el.textContent = txt;
  };

  setTxt('svg-m-val', `M: ${formatBinary(sig.MUX_M, 4)}`);
  setTxt('svg-notm-val', `~M: ${formatBinary(sig.MUX_NOT_M, 4)}`);
  setTxt('svg-mux-out', `OUT: ${formatBinary(sig.MUX_OUT, 4)}`);
  setTxt('svg-mux-sel', `SEL (SUB): ${sig.SUB}`);

  setTxt('svg-alu-mode', `MODE: ${sig.operation}`);
  setTxt('svg-alu-s', `S = ${formatBinary(sig.S, 4)}`);
  setTxt('svg-alu-cin', `Cin = ${sig.Cin}`);
  setTxt('svg-alu-cout', `Cout = ${sig.Cout}`);
  setTxt('svg-alu-vcalc', `V_calc = ${sig.V_calc}`);
  setTxt('svg-sx-val', `SX = ${sig.SX}`);
  setTxt('svg-product-bus', `PRODUCT BUS [A : Q] = ${formatBinary(state.A, 4)} ${formatBinary(state.Q, 4)}`);

  // 3. Update SVG Wires & Logic Gates from actual simulation state
  const activeOpClass = sig.ADD ? 'active-add' : sig.SUB ? 'active-sub' : null;
  const loaded = state.loaded;

  setWireState(svg, 'M_BUS', loaded && !sig.SUB ? 'active' : null);
  setWireState(svg, 'NOT_M_BUS', loaded && sig.SUB ? 'active-sub' : null);
  setWireState(svg, 'MUX_OUT', loaded ? (activeOpClass || null) : null);
  setWireState(svg, 'SUB', loaded && sig.SUB ? 'active-sub' : null);
  setWireState(svg, 'ADD', loaded && sig.ADD ? 'active-add' : null);
  setWireState(svg, 'OP', loaded && sig.OP ? activeOpClass : null);
  setWireState(svg, 'NOP', loaded && sig.NOP ? 'active' : null);
  setWireState(svg, 'ENABLE_R', loaded && sig.ENABLE_R ? activeOpClass : null);
  setWireState(svg, 'A_FEEDBACK', loaded ? 'active' : null);
  setWireState(svg, 'Q0_FB', loaded && sig.Q0 ? 'active' : null);
  setWireState(svg, 'Q_1_FB', loaded && sig.Q_1 ? 'active' : null);
  setWireState(svg, 'NOT_Q0', loaded && !sig.Q0 ? 'active' : null);
  setWireState(svg, 'NOT_Q_1', loaded && !sig.Q_1 ? 'active' : null);
  setWireState(svg, 'R_TO_SHIFT', loaded && isShift ? 'active' : null);
  setWireState(svg, 'V_TO_XOR', loaded && state.V ? 'active' : null);
  setWireState(svg, 'SHIFT', loaded && isShift ? 'active' : null);
  setWireState(svg, 'DONE', state.DONE ? 'active-done' : null);

  setGateState(svg, 'NOT_M', loaded && sig.SUB ? 'active-sub' : null);
  setGateState(svg, 'NOT_Q0', loaded && !sig.Q0 ? 'active' : null);
  setGateState(svg, 'NOT_Q_1', loaded && !sig.Q_1 ? 'active' : null);
  setGateState(svg, 'AND_ADD', loaded && sig.ADD ? 'active-add' : null);
  setGateState(svg, 'AND_SUB', loaded && sig.SUB ? 'active-sub' : null);
  setGateState(svg, 'OR_OP', loaded && sig.OP ? activeOpClass : null);
  setGateState(svg, 'NOT_OP', loaded && sig.NOP ? 'active' : null);
  setGateState(svg, 'SX_XOR', loaded && (isShift || state.nextPhase === 'SHIFT') ? 'active' : null);

  // Control Unit SVG Pills
  setPillState(svg, 'ADD', sig.ADD, 'on-add');
  setPillState(svg, 'SUB', sig.SUB, 'on-sub');
  setPillState(svg, 'OP', sig.OP, sig.ADD ? 'on-add' : 'on-sub');
  setPillState(svg, 'NOP', sig.NOP, 'on');
  setPillState(svg, 'ENABLE_R', sig.ENABLE_R, sig.ADD ? 'on-add' : 'on-sub');
  setPillState(svg, 'LOAD', sig.LOAD, 'on');
  setPillState(svg, 'SHIFT', sig.SHIFT, 'on');
  setPillState(svg, 'DONE', sig.DONE, 'on-done');

  // 4. Explanation Bar
  const expBar = document.getElementById('explanation-bar');
  if (expBar) {
    expBar.textContent = state.explanation;
  }

  // 5. Right Sidebar Status & Control Signals
  const iterDisplay = state.loaded ? `${state.completedIterations} / 4` : '0 / 4';
  document.getElementById('status-iteration').textContent = iterDisplay;
  document.getElementById('status-edge').textContent = `${state.edgeCount} / 8`;

  const phaseEl = document.getElementById('status-phase');
  const phaseText = !state.loaded ? 'IDLE' : state.DONE ? 'DONE' : state.nextPhase;
  phaseEl.textContent = phaseText;
  phaseEl.className = 'status-value phase-badge';
  if (phaseText === 'EXECUTE') phaseEl.classList.add('phase-execute');
  else if (phaseText === 'SHIFT') phaseEl.classList.add('phase-shift');
  else if (phaseText === 'DONE') phaseEl.classList.add('phase-done');

  document.getElementById('status-done').textContent = String(state.DONE);

  const signalPairs = [
    ['ADD', sig.ADD, 'active-add'],
    ['SUB', sig.SUB, 'active-sub'],
    ['OP', sig.OP, sig.ADD ? 'active-add' : 'active-sub'],
    ['NOP', sig.NOP, 'active'],
    ['ENABLE_R', sig.ENABLE_R, sig.ADD ? 'active-add' : 'active-sub'],
    ['LOAD', sig.LOAD, 'active'],
    ['SHIFT', sig.SHIFT, 'active'],
    ['DONE', sig.DONE, 'active-done'],
  ];
  for (const [name, val, cls] of signalPairs) {
    const el = document.getElementById(`sig-${name}`);
    if (el) {
      el.textContent = String(val);
      el.className = 'sig-val mono';
      if (val) el.classList.add(cls);
    }
  }

  // 6. Button States
  const isRunning = Boolean(runtime.isRunning);
  const canStep = state.loaded && state.DONE === 0 && !isRunning;
  document.getElementById('btn-clock').disabled = !canStep;
  document.getElementById('btn-next').disabled = !canStep;
  document.getElementById('btn-run').disabled = !canStep;
  document.getElementById('btn-pause').disabled = !isRunning;
  document.getElementById('btn-prev').disabled = !runtime.canPrev || isRunning;

  // 7. Register Monitor
  document.getElementById('mon-M').textContent = formatBinary(state.M, 4);
  document.getElementById('mon-A').textContent = formatBinary(state.A, 4);
  document.getElementById('mon-Q').textContent = formatBinary(state.Q, 4);
  document.getElementById('mon-Q_1').textContent = String(state.Q_1);
  document.getElementById('mon-R').textContent = formatBinary(state.R, 4);
  document.getElementById('mon-C').textContent = formatBinary(state.C, 2);
  document.getElementById('mon-V').textContent = String(state.V);
  document.getElementById('mon-SX').textContent = String(sig.SX);

  // 8. Final Output
  const finalBody = document.getElementById('final-result-body');
  const finalRes = getFinalResult(state);
  if (!finalRes) {
    finalBody.innerHTML =
      '<p class="result-pending">Complete all 4 iterations (8 clock edges) to latch DONE = 1 and view verified 8-bit signed product.</p>';
  } else {
    const badgeClass = finalRes.match ? 'verify-match' : 'verify-mismatch';
    const badgeText = finalRes.match ? 'MATCH' : 'MISMATCH';
    finalBody.innerHTML = `
      <div class="result-grid">
        <div class="result-cell"><span class="result-cell-label">Original M</span><span class="result-cell-value">${finalRes.Morig} (${formatBinary(state.M, 4)})</span></div>
        <div class="result-cell"><span class="result-cell-label">Original Q</span><span class="result-cell-value">${finalRes.Qorig} (${formatBinary(state.Qorig & 0xf, 4)})</span></div>
        <div class="result-cell"><span class="result-cell-label">Final [A : Q]</span><span class="result-cell-value">${finalRes.A} : ${finalRes.Q}</span></div>
        <div class="result-cell"><span class="result-cell-label">8-bit Binary</span><span class="result-cell-value">${finalRes.binary8}</span></div>
        <div class="result-cell"><span class="result-cell-label">Signed Decimal</span><span class="result-cell-value">${finalRes.signedResult}</span></div>
        <div class="result-cell"><span class="result-cell-label">Verification (${finalRes.Morig}×${finalRes.Qorig}=${finalRes.expectedResult})</span><span class="verify-badge ${badgeClass}">${badgeText}</span></div>
      </div>
    `;
  }

  // 9. Execution Trace Table
  const tbody = document.getElementById('trace-tbody');
  if (state.trace.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="12">No clock edges executed yet.</td></tr>';
  } else {
    tbody.innerHTML = state.trace
      .map((row, idx) => {
        const isLast = idx === state.trace.length - 1;
        return `
          <tr class="${isLast ? 'current-row' : ''}">
            <td>${row.iteration}</td>
            <td>${row.edge}</td>
            <td>${row.phase}</td>
            <td>${row.q0q_1}</td>
            <td class="op-${row.operation}">${row.operation}</td>
            <td>${row.aBefore}</td>
            <td>${row.s}</td>
            <td>${row.v}</td>
            <td>${row.aAfter}</td>
            <td>${row.qAfter}</td>
            <td>${row.q_1After}</td>
            <td>${row.cAfter}</td>
          </tr>
        `;
      })
      .join('');
  }
}
