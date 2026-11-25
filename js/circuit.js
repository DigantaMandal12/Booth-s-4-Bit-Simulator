/**
 * Interactive SVG Hardware Circuit Schematic for Booth's 4-Bit Multiplier.
 * Constructs editable SVG elements with proper viewBox, logic gates,
 * register bit cells, junctions, arrows, and signal-tagged wires.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, textContent = null) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    node.setAttribute(k, String(v));
  }
  if (textContent !== null) {
    node.textContent = textContent;
  }
  return node;
}

/**
 * Create a 4-bit or N-bit register block with individual bit cells.
 */
function createRegisterBlock(parent, { id, label, sublabel, x, y, bits, bitLabels, cellWidth = 38, cellHeight = 38 }) {
  const g = el('g', { id: `reg-${id}`, class: 'hw-block hw-register' });
  const totalWidth = Math.max(bits * cellWidth + 24, 90);
  const startX = x + (totalWidth - bits * cellWidth) / 2;

  g.appendChild(
    el('rect', {
      x,
      y,
      width: totalWidth,
      height: cellHeight + 44,
      rx: 4,
      class: 'block-box register-box',
    })
  );

  g.appendChild(
    el(
      'text',
      {
        x: x + 10,
        y: y + 18,
        class: 'block-title',
      },
      label
    )
  );

  if (sublabel) {
    g.appendChild(
      el(
        'text',
        {
          x: x + totalWidth - 10,
          y: y + 18,
          'text-anchor': 'end',
          class: 'block-sublabel',
        },
        sublabel
      )
    );
  }

  for (let i = 0; i < bits; i++) {
    const bitIndex = bits - 1 - i;
    const cx = startX + i * cellWidth;
    const cy = y + 26;

    const cellGroup = el('g', {
      class: 'bit-cell-group',
      'data-cell': `${id}-${bitIndex}`,
    });

    cellGroup.appendChild(
      el('rect', {
        x: cx,
        y: cy,
        width: cellWidth - 2,
        height: cellHeight,
        rx: 2,
        class: 'bit-cell-rect',
      })
    );

    cellGroup.appendChild(
      el(
        'text',
        {
          x: cx + (cellWidth - 2) / 2,
          y: cy + cellHeight / 2 + 5,
          'text-anchor': 'middle',
          class: 'bit-cell-value',
          id: `val-${id}-${bitIndex}`,
        },
        '0'
      )
    );

    cellGroup.appendChild(
      el(
        'text',
        {
          x: cx + (cellWidth - 2) / 2,
          y: cy + cellHeight + 12,
          'text-anchor': 'middle',
          class: 'bit-cell-label',
        },
        bitLabels ? bitLabels[i] : `${id}${bitIndex}`
      )
    );

    g.appendChild(cellGroup);
  }

  parent.appendChild(g);
  return { x, y, width: totalWidth, height: cellHeight + 44 };
}

/**
 * Create an IEEE/ANSI logic gate symbol.
 */
function createLogicGate(parent, { id, type, x, y, label }) {
  const g = el('g', { id: `gate-${id}`, class: 'logic-gate', 'data-gate': id });

  if (type === 'AND') {
    g.appendChild(
      el('path', {
        d: `M ${x} ${y} L ${x + 18} ${y} A 14 14 0 0 1 ${x + 18} ${y + 28} L ${x} ${y + 28} Z`,
        class: 'gate-body',
      })
    );
  } else if (type === 'OR') {
    g.appendChild(
      el('path', {
        d: `M ${x} ${y} Q ${x + 8} ${y + 14} ${x} ${y + 28} L ${x + 14} ${y + 28} Q ${x + 28} ${y + 28} ${x + 34} ${y + 14} Q ${x + 28} ${y} ${x + 14} ${y} Z`,
        class: 'gate-body',
      })
    );
  } else if (type === 'NOT') {
    g.appendChild(
      el('path', {
        d: `M ${x} ${y} L ${x + 22} ${y + 11} L ${x} ${y + 22} Z`,
        class: 'gate-body',
      })
    );
    g.appendChild(
      el('circle', {
        cx: x + 26,
        cy: y + 11,
        r: 3.5,
        class: 'gate-body',
      })
    );
  } else if (type === 'XOR') {
    g.appendChild(
      el('path', {
        d: `M ${x - 5} ${y} Q ${x + 3} ${y + 14} ${x - 5} ${y + 28}`,
        class: 'gate-arc',
      })
    );
    g.appendChild(
      el('path', {
        d: `M ${x} ${y} Q ${x + 8} ${y + 14} ${x} ${y + 28} L ${x + 14} ${y + 28} Q ${x + 28} ${y + 28} ${x + 34} ${y + 14} Q ${x + 28} ${y} ${x + 14} ${y} Z`,
        class: 'gate-body',
      })
    );
  }

  if (label) {
    g.appendChild(
      el(
        'text',
        {
          x: x + 15,
          y: y - 5,
          'text-anchor': 'middle',
          class: 'gate-label',
        },
        label
      )
    );
  }

  parent.appendChild(g);
}

/**
 * Create a wire path with optional arrowhead and signal tag.
 */
function createWire(parent, { id, d, signal, arrow = false, bus = false }) {
  const attrs = {
    id: `wire-${id}`,
    d,
    class: `wire ${bus ? 'wire-bus' : ''}`,
    'data-wire': signal,
  };
  if (arrow) {
    attrs['marker-end'] = 'url(#arrow-inactive)';
  }
  parent.appendChild(el('path', attrs));
}

/**
 * Create a wire junction dot.
 */
function createJunction(parent, { x, y, signal }) {
  parent.appendChild(
    el('circle', {
      cx: x,
      cy: y,
      r: 3.5,
      class: 'junction',
      'data-wire': signal,
    })
  );
}

/**
 * Build the complete Booth Multiplier SVG schematic inside container.
 * @param {HTMLElement} container
 * @returns {SVGSVGElement}
 */
export function buildCircuitSVG(container) {
  container.innerHTML = '';

  const svg = el('svg', {
    id: 'booth-circuit-svg',
    viewBox: '0 0 1200 720',
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': 'Booth 4-Bit Hardware Multiplier Circuit Diagram',
  });

  // Definitions: Arrowhead markers for inactive and active states
  const defs = el('defs');
  const markers = [
    { id: 'arrow-inactive', color: '#94A3B8' },
    { id: 'arrow-active', color: '#2563EB' },
    { id: 'arrow-add', color: '#16A34A' },
    { id: 'arrow-sub', color: '#D97706' },
    { id: 'arrow-done', color: '#15803D' },
  ];
  for (const m of markers) {
    const marker = el('marker', {
      id: m.id,
      viewBox: '0 0 10 10',
      refX: '8',
      refY: '5',
      markerWidth: '6',
      markerHeight: '6',
      orient: 'auto-start-reverse',
    });
    marker.appendChild(
      el('path', {
        d: 'M 0 1.5 L 9 5 L 0 8.5 z',
        fill: m.color,
      })
    );
    defs.appendChild(marker);
  }
  svg.appendChild(defs);

  // Subtle background grid & region labels
  const bgLayer = el('g', { id: 'layer-bg' });
  bgLayer.appendChild(el('rect', { x: 0, y: 0, width: 1200, height: 720, fill: '#FFFFFF' }));
  bgLayer.appendChild(
    el('text', { x: 24, y: 24, class: 'region-label' }, 'CONTROL & INPUT SELECTION')
  );
  bgLayer.appendChild(
    el('text', { x: 420, y: 24, class: 'region-label' }, 'ARITHMETIC & INTERMEDIATE DATAPATH')
  );
  bgLayer.appendChild(
    el('text', { x: 420, y: 412, class: 'region-label' }, 'ACCUMULATOR & SHIFT REGISTERS [A | Q | Q-1]')
  );
  bgLayer.appendChild(
    el('text', { x: 990, y: 24, class: 'region-label' }, 'FEEDBACK & CLOCK ROUTING')
  );
  svg.appendChild(bgLayer);

  const wireLayer = el('g', { id: 'layer-wires' });
  const blockLayer = el('g', { id: 'layer-blocks' });
  const labelLayer = el('g', { id: 'layer-labels' });

  svg.appendChild(wireLayer);
  svg.appendChild(blockLayer);
  svg.appendChild(labelLayer);

  // =========================================================================
  // UPPER CENTER: M Register, Add/Sub Unit, R Register, V Flip-Flop, SX XOR
  // =========================================================================
  createRegisterBlock(blockLayer, {
    id: 'M',
    label: 'M REGISTER',
    sublabel: '4-bit Multiplicand',
    x: 440,
    y: 42,
    bits: 4,
    bitLabels: ['M3', 'M2', 'M1', 'M0'],
  });

  // Add/Subtract Unit (4-bit)
  const addSubG = el('g', { id: 'block-addsub', class: 'hw-block' });
  addSubG.appendChild(
    el('rect', {
      x: 440,
      y: 162,
      width: 240,
      height: 118,
      rx: 4,
      class: 'block-box alu-box',
    })
  );
  addSubG.appendChild(el('text', { x: 452, y: 182, class: 'block-title' }, '4-BIT ADD / SUB UNIT'));
  addSubG.appendChild(
    el('text', { x: 668, y: 182, 'text-anchor': 'end', class: 'block-sublabel', id: 'svg-alu-mode' }, 'MODE: NOP')
  );
  addSubG.appendChild(
    el('text', { x: 452, y: 204, class: 'signal-mono', id: 'svg-alu-eq' }, 'S = A + MUX_OUT + Cin')
  );
  addSubG.appendChild(
    el('text', { x: 452, y: 226, class: 'signal-mono-bold', id: 'svg-alu-s' }, 'S = 0000')
  );
  addSubG.appendChild(
    el('text', { x: 560, y: 226, class: 'signal-mono', id: 'svg-alu-cin' }, 'Cin = 0')
  );
  addSubG.appendChild(
    el('text', { x: 452, y: 248, class: 'signal-mono', id: 'svg-alu-cout' }, 'Cout = 0')
  );
  addSubG.appendChild(
    el('text', { x: 560, y: 248, class: 'signal-mono', id: 'svg-alu-vcalc' }, 'V_calc = 0')
  );
  addSubG.appendChild(
    el('text', { x: 452, y: 268, class: 'signal-small' }, 'V = (A3 == MUX3) & (S3 != A3)')
  );
  blockLayer.appendChild(addSubG);

  // Intermediate Register R (4-bit)
  createRegisterBlock(blockLayer, {
    id: 'R',
    label: 'R REGISTER',
    sublabel: '4-bit Intermediate',
    x: 745,
    y: 168,
    bits: 4,
    bitLabels: ['R3', 'R2', 'R1', 'R0'],
  });

  // V Overflow Flip-Flop (1-bit)
  createRegisterBlock(blockLayer, {
    id: 'V',
    label: 'V',
    sublabel: 'Overflow',
    x: 785,
    y: 282,
    bits: 1,
    bitLabels: ['V'],
    cellWidth: 44,
    cellHeight: 34,
  });

  // Overflow Correction XOR Gate: SX = R3 XOR V
  const xorBox = el('g', { id: 'block-sx', class: 'hw-block' });
  xorBox.appendChild(
    el('rect', {
      x: 965,
      y: 196,
      width: 112,
      height: 92,
      rx: 4,
      class: 'block-box',
    })
  );
  xorBox.appendChild(el('text', { x: 975, y: 214, class: 'block-title' }, 'SIGN CORR.'));
  createLogicGate(xorBox, { id: 'SX_XOR', type: 'XOR', x: 992, y: 230, label: '' });
  xorBox.appendChild(
    el('text', { x: 1021, y: 276, 'text-anchor': 'middle', class: 'signal-mono-bold', id: 'svg-sx-val' }, 'SX = 0')
  );
  blockLayer.appendChild(xorBox);

  // =========================================================================
  // LEFT: 2x1 MUX, Control Unit (with AND/OR/NOT gates), 2-bit Down Counter
  // =========================================================================
  const muxG = el('g', { id: 'block-mux', class: 'hw-block' });
  muxG.appendChild(
    el('polygon', {
      points: '130,120 220,145 220,245 130,270',
      class: 'block-box mux-box',
    })
  );
  muxG.appendChild(el('text', { x: 175, y: 174, 'text-anchor': 'middle', class: 'block-title' }, '2×1 MUX'));
  muxG.appendChild(el('text', { x: 140, y: 158, class: 'signal-small' }, '0: M'));
  muxG.appendChild(el('text', { x: 140, y: 236, class: 'signal-small' }, '1: ~M'));
  muxG.appendChild(
    el('text', { x: 175, y: 198, 'text-anchor': 'middle', class: 'signal-mono-bold', id: 'svg-mux-out' }, 'OUT: 0000')
  );
  muxG.appendChild(
    el('text', { x: 175, y: 218, 'text-anchor': 'middle', class: 'signal-mono', id: 'svg-mux-sel' }, 'SEL (SUB): 0')
  );
  blockLayer.appendChild(muxG);

  // NOT gate for M -> ~M before MUX
  createLogicGate(blockLayer, { id: 'NOT_M', type: 'NOT', x: 74, y: 218, label: '~M' });
  labelLayer.appendChild(
    el('text', { x: 64, y: 152, class: 'signal-mono', id: 'svg-m-val' }, 'M: 0000')
  );
  labelLayer.appendChild(
    el('text', { x: 52, y: 256, class: 'signal-mono', id: 'svg-notm-val' }, '~M: 1111')
  );

  // Control Unit
  const cuG = el('g', { id: 'block-cu', class: 'hw-block' });
  cuG.appendChild(
    el('rect', {
      x: 34,
      y: 300,
      width: 320,
      height: 245,
      rx: 4,
      class: 'block-box cu-box',
    })
  );
  cuG.appendChild(el('text', { x: 46, y: 320, class: 'block-title' }, 'CONTROL UNIT (COMBINATIONAL + FSM)'));

  // Gates inside Control Unit:
  // NOT(Q0) -> AND_ADD
  createLogicGate(cuG, { id: 'NOT_Q0', type: 'NOT', x: 76, y: 342, label: 'NOT Q0' });
  createLogicGate(cuG, { id: 'AND_ADD', type: 'AND', x: 144, y: 340, label: 'ADD' });
  // NOT(Q-1) -> AND_SUB
  createLogicGate(cuG, { id: 'NOT_Q_1', type: 'NOT', x: 76, y: 406, label: 'NOT Q-1' });
  createLogicGate(cuG, { id: 'AND_SUB', type: 'AND', x: 144, y: 404, label: 'SUB' });
  // OR_OP -> NOT_OP
  createLogicGate(cuG, { id: 'OR_OP', type: 'OR', x: 220, y: 372, label: 'OP' });
  createLogicGate(cuG, { id: 'NOT_OP', type: 'NOT', x: 284, y: 432, label: 'NOP' });

  // Internal CU wires
  createWire(cuG, { id: 'cu-notq0-and', d: 'M 106 353 L 144 353', signal: 'NOT_Q0' });
  createWire(cuG, { id: 'cu-notq1-and', d: 'M 106 417 L 144 417', signal: 'NOT_Q_1' });
  createWire(cuG, { id: 'cu-add-or', d: 'M 176 354 L 198 354 L 198 378 L 220 378', signal: 'ADD' });
  createWire(cuG, { id: 'cu-sub-or', d: 'M 176 418 L 198 418 L 198 394 L 220 394', signal: 'SUB' });
  createWire(cuG, { id: 'cu-op-not', d: 'M 254 386 L 268 386 L 268 443 L 284 443', signal: 'OP' });

  // Live CU Signal Badges
  const cuSignals = [
    { id: 'ADD', x: 48, y: 486 },
    { id: 'SUB', x: 122, y: 486 },
    { id: 'OP', x: 196, y: 486 },
    { id: 'NOP', x: 270, y: 486 },
    { id: 'ENABLE_R', x: 48, y: 514 },
    { id: 'LOAD', x: 138, y: 514 },
    { id: 'SHIFT', x: 210, y: 514 },
    { id: 'DONE', x: 282, y: 514 },
  ];
  for (const sig of cuSignals) {
    cuG.appendChild(
      el('rect', {
        x: sig.x,
        y: sig.y,
        width: sig.id === 'ENABLE_R' ? 82 : 64,
        height: 20,
        rx: 3,
        class: 'sig-pill',
        id: `pill-${sig.id}`,
      })
    );
    cuG.appendChild(
      el(
        'text',
        {
          x: sig.x + (sig.id === 'ENABLE_R' ? 41 : 32),
          y: sig.y + 14,
          'text-anchor': 'middle',
          class: 'sig-pill-text',
          id: `pill-text-${sig.id}`,
        },
        `${sig.id}=0`
      )
    );
  }
  blockLayer.appendChild(cuG);

  // 2-bit Down Counter (C)
  createRegisterBlock(blockLayer, {
    id: 'C',
    label: '2-BIT COUNTER (C)',
    sublabel: '11→10→01→00',
    x: 64,
    y: 578,
    bits: 2,
    bitLabels: ['C1', 'C0'],
    cellWidth: 44,
    cellHeight: 36,
  });

  // =========================================================================
  // LOWER CENTER: A Register, Q Register, Q-1 Register
  // =========================================================================
  createRegisterBlock(blockLayer, {
    id: 'A',
    label: 'A REGISTER',
    sublabel: '4-bit Accumulator',
    x: 420,
    y: 442,
    bits: 4,
    bitLabels: ['A3', 'A2', 'A1', 'A0'],
  });

  createRegisterBlock(blockLayer, {
    id: 'Q',
    label: 'Q REGISTER',
    sublabel: '4-bit Multiplier',
    x: 620,
    y: 442,
    bits: 4,
    bitLabels: ['Q3', 'Q2', 'Q1', 'Q0'],
  });

  createRegisterBlock(blockLayer, {
    id: 'Q_1',
    label: 'Q-1',
    sublabel: '1-bit',
    x: 820,
    y: 442,
    bits: 1,
    bitLabels: ['Q-1'],
    cellWidth: 44,
    cellHeight: 38,
  });

  // =========================================================================
  // WIRES, BUSES, JUNCTIONS & FEEDBACK PATHS
  // =========================================================================
  // 1. M Register -> MUX (0: M) and NOT_M -> MUX (1: ~M)
  createWire(wireLayer, {
    id: 'm-to-mux',
    d: 'M 440 84 L 54 84 L 54 156 L 130 156',
    signal: 'M_BUS',
    arrow: true,
    bus: true,
  });
  createJunction(wireLayer, { x: 54, y: 156, signal: 'M_BUS' });
  createWire(wireLayer, {
    id: 'm-to-notm',
    d: 'M 54 156 L 54 229 L 74 229',
    signal: 'M_BUS',
    arrow: false,
    bus: true,
  });
  createWire(wireLayer, {
    id: 'notm-to-mux',
    d: 'M 104 229 L 130 229',
    signal: 'NOT_M_BUS',
    arrow: true,
    bus: true,
  });

  // 2. MUX_OUT -> ADD/SUB Unit
  createWire(wireLayer, {
    id: 'mux-to-alu',
    d: 'M 220 195 L 440 195',
    signal: 'MUX_OUT',
    arrow: true,
    bus: true,
  });
  labelLayer.appendChild(
    el('text', { x: 330, y: 187, 'text-anchor': 'middle', class: 'wire-label' }, 'MUX_OUT [3:0]')
  );

  // 3. SUB -> MUX Select & ADD/SUB Cin
  createWire(wireLayer, {
    id: 'sub-to-mux',
    d: 'M 175 486 L 175 456 L 385 456 L 385 256 L 175 256 L 175 258',
    signal: 'SUB',
    arrow: true,
  });
  createJunction(wireLayer, { x: 385, y: 256, signal: 'SUB' });
  createWire(wireLayer, {
    id: 'sub-to-cin',
    d: 'M 385 256 L 440 256',
    signal: 'SUB',
    arrow: true,
  });
  labelLayer.appendChild(
    el('text', { x: 412, y: 248, 'text-anchor': 'middle', class: 'wire-label' }, 'Cin')
  );

  // 4. ADD/SUB S[3:0] -> R Register, and V_calc -> V Flip-Flop
  createWire(wireLayer, {
    id: 'alu-to-r',
    d: 'M 680 205 L 745 205',
    signal: 'OP',
    arrow: true,
    bus: true,
  });
  labelLayer.appendChild(
    el('text', { x: 712, y: 197, 'text-anchor': 'middle', class: 'wire-label' }, 'S [3:0]')
  );
  createWire(wireLayer, {
    id: 'alu-to-v',
    d: 'M 680 250 L 725 250 L 725 322 L 785 322',
    signal: 'OP',
    arrow: true,
  });
  labelLayer.appendChild(
    el('text', { x: 706, y: 244, class: 'wire-label' }, 'V')
  );

  // 5. ENABLE_R -> R Register
  createWire(wireLayer, {
    id: 'enabler-to-r',
    d: 'M 354 386 L 404 386 L 404 142 L 833 142 L 833 168',
    signal: 'ENABLE_R',
    arrow: true,
  });
  labelLayer.appendChild(
    el('text', { x: 615, y: 136, 'text-anchor': 'middle', class: 'wire-label' }, 'ENABLE_R = OP (R ← OP ? S : A)')
  );

  // 6. R3 -> XOR, V -> XOR, XOR -> SX -> A Register
  createWire(wireLayer, {
    id: 'r3-to-xor',
    d: 'M 921 205 L 948 205 L 948 236 L 990 236',
    signal: 'R_TO_SHIFT',
    arrow: true,
  });
  createWire(wireLayer, {
    id: 'v-to-xor',
    d: 'M 875 322 L 948 322 L 948 252 L 990 252',
    signal: 'V_TO_XOR',
    arrow: true,
  });
  createWire(wireLayer, {
    id: 'sx-to-a',
    d: 'M 1026 244 L 1110 244 L 1110 388 L 456 388 L 456 442',
    signal: 'SHIFT',
    arrow: true,
  });
  labelLayer.appendChild(
    el('text', { x: 1096, y: 315, class: 'wire-label', transform: 'rotate(-90 1096 315)' }, 'SX = R3 XOR V')
  );

  // 7. R[3:1] -> A[2:0] and R0 -> Q3 during SHIFT
  createWire(wireLayer, {
    id: 'r-shift-a',
    d: 'M 833 250 L 833 366 L 520 366 L 520 442',
    signal: 'SHIFT',
    arrow: true,
    bus: true,
  });
  labelLayer.appendChild(
    el('text', { x: 675, y: 360, 'text-anchor': 'middle', class: 'wire-label' }, 'SHIFT: A ← {SX, R3, R2, R1}')
  );

  createWire(wireLayer, {
    id: 'r0-to-q3',
    d: 'M 890 250 L 890 348 L 656 348 L 656 442',
    signal: 'SHIFT',
    arrow: true,
  });
  labelLayer.appendChild(
    el('text', { x: 775, y: 342, 'text-anchor': 'middle', class: 'wire-label' }, 'R0 → Q3')
  );

  // 8. Q0 -> Q-1 during SHIFT
  createWire(wireLayer, {
    id: 'q0-to-q1',
    d: 'M 796 484 L 820 484',
    signal: 'SHIFT',
    arrow: true,
  });

  // 9. A[3:0] Feedback Bus -> ADD/SUB Unit (A input) & R (NOP bypass)
  createWire(wireLayer, {
    id: 'a-feedback-alu',
    d: 'M 508 524 L 508 560 L 1142 560 L 1142 126 L 394 126 L 394 226 L 440 226',
    signal: 'A_FEEDBACK',
    arrow: true,
    bus: true,
  });
  createJunction(wireLayer, { x: 785, y: 126, signal: 'A_FEEDBACK' });
  createWire(wireLayer, {
    id: 'a-bypass-r',
    d: 'M 785 126 L 785 168',
    signal: 'NOP',
    arrow: true,
    bus: true,
  });
  labelLayer.appendChild(
    el('text', { x: 1152, y: 340, class: 'wire-label', transform: 'rotate(-90 1152 340)' }, 'A [3:0] FEEDBACK BUS')
  );

  // 10. Q0 & Q-1 Feedback -> Control Unit
  createWire(wireLayer, {
    id: 'q0-feedback-cu',
    d: 'M 762 524 L 762 606 L 372 606 L 372 353 L 76 353',
    signal: 'Q0_FB',
    arrow: true,
  });
  createJunction(wireLayer, { x: 132, y: 353, signal: 'Q0_FB' });
  createWire(wireLayer, {
    id: 'q0-to-sub-and',
    d: 'M 132 353 L 132 412 L 144 412',
    signal: 'Q0_FB',
    arrow: true,
  });

  createWire(wireLayer, {
    id: 'q_1-feedback-cu',
    d: 'M 865 520 L 865 628 L 362 628 L 362 417 L 76 417',
    signal: 'Q_1_FB',
    arrow: true,
  });
  createJunction(wireLayer, { x: 124, y: 417, signal: 'Q_1_FB' });
  createWire(wireLayer, {
    id: 'q_1-to-add-and',
    d: 'M 124 417 L 124 362 L 144 362',
    signal: 'Q_1_FB',
    arrow: true,
  });
  labelLayer.appendChild(
    el('text', { x: 560, y: 600, 'text-anchor': 'middle', class: 'wire-label' }, 'Q0 FEEDBACK → CONTROL UNIT')
  );
  labelLayer.appendChild(
    el('text', { x: 560, y: 622, 'text-anchor': 'middle', class: 'wire-label' }, 'Q-1 FEEDBACK → CONTROL UNIT')
  );

  // 11. SHIFT -> Counter C & DONE latch
  createWire(wireLayer, {
    id: 'shift-to-counter',
    d: 'M 242 534 L 242 618 L 176 618',
    signal: 'SHIFT',
    arrow: true,
  });
  createWire(wireLayer, {
    id: 'counter-to-done',
    d: 'M 120 658 L 120 688 L 314 688 L 314 534',
    signal: 'DONE',
    arrow: true,
  });
  labelLayer.appendChild(
    el('text', { x: 215, y: 682, 'text-anchor': 'middle', class: 'wire-label' }, 'C == 00 ON SHIFT → DONE')
  );

  // 12. Clock (CLK) & Result Bus indicator
  labelLayer.appendChild(
    el(
      'text',
      { x: 640, y: 688, 'text-anchor': 'middle', class: 'signal-mono-bold', id: 'svg-product-bus' },
      'PRODUCT BUS [A : Q] = 0000 0000'
    )
  );

  container.appendChild(svg);
  return svg;
}
