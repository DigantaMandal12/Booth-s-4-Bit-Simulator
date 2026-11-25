/**
 * Booth's 4-Bit Signed Multiplication Hardware Core
 * Pure, immutable hardware-level simulation logic independent of DOM.
 */

export const MIN_4BIT_SIGNED = -8;
export const MAX_4BIT_SIGNED = 7;

/**
 * Convert a signed integer [-8, +7] to 4-bit two's complement (0..15).
 * @param {number} n
 * @returns {number}
 */
export function to4BitTwosComplement(n) {
  return n & 0x0f;
}

/**
 * Convert a 4-bit two's complement value (0..15) to signed integer [-8, +7].
 * @param {number} val
 * @returns {number}
 */
export function from4BitTwosComplement(val) {
  const masked = val & 0x0f;
  return (masked & 0x08) !== 0 ? masked - 16 : masked;
}

/**
 * Convert an 8-bit two's complement value (0..255) to signed integer [-128, +127].
 * @param {number} val
 * @returns {number}
 */
export function from8BitTwosComplement(val) {
  const masked = val & 0xff;
  return (masked & 0x80) !== 0 ? masked - 256 : masked;
}

/**
 * Format an integer as a fixed-width binary string.
 * @param {number} val
 * @param {number} bits
 * @returns {string}
 */
export function formatBinary(val, bits = 4) {
  const mask = (1 << bits) - 1;
  return ((val & mask) >>> 0).toString(2).padStart(bits, '0');
}

/**
 * Validate a raw input value for a 4-bit signed register [-8, +7].
 * @param {string|number} raw
 * @returns {{ valid: boolean, value: number|null, error: string|null }}
 */
export function validateInput(raw) {
  if (raw === null || raw === undefined) {
    return { valid: false, value: null, error: 'Value is required.' };
  }
  const str = String(raw).trim();
  if (str === '') {
    return { valid: false, value: null, error: 'Input cannot be empty.' };
  }
  if (!/^[+-]?\d+$/.test(str)) {
    return { valid: false, value: null, error: 'Must be a valid integer.' };
  }
  const num = Number(str);
  if (!Number.isInteger(num) || num < MIN_4BIT_SIGNED || num > MAX_4BIT_SIGNED) {
    return {
      valid: false,
      value: null,
      error: `Value must be between ${MIN_4BIT_SIGNED} and +${MAX_4BIT_SIGNED}.`,
    };
  }
  return { valid: true, value: num, error: null };
}

/**
 * Compute all combinational logic signals from the current register state.
 * @param {object} state
 * @returns {object}
 */
export function computeCombinationalSignals(state) {
  const Q0 = state.Q & 0x01;
  const Q_1 = state.Q_1 & 0x01;

  // Control Unit Boolean Equations
  const ADD = ((~Q0) & 0x01) & Q_1;
  const SUB = Q0 & ((~Q_1) & 0x01);
  const OP = ADD | SUB;
  const NOP = (~OP) & 0x01;
  const ENABLE_R = OP;

  // 2x1 MUX
  const MUX_M = state.M & 0x0f;
  const MUX_NOT_M = (~MUX_M) & 0x0f;
  const MUX_OUT = SUB ? MUX_NOT_M : MUX_M;

  // 4-bit ADD/SUB Unit: S = A + MUX_OUT + Cin
  const Cin = SUB;
  const sumFull = (state.A & 0x0f) + MUX_OUT + Cin;
  const S = sumFull & 0x0f;
  const Cout = (sumFull >> 4) & 0x01;

  // Overflow: V = (A3 == MUX_OUT3) AND (S3 != A3), 0 when NOP
  const A3 = (state.A >> 3) & 0x01;
  const MUX_OUT3 = (MUX_OUT >> 3) & 0x01;
  const S3 = (S >> 3) & 0x01;
  const V_calc = OP ? (A3 === MUX_OUT3 && S3 !== A3 ? 1 : 0) : 0;

  // Overflow Correction: SX = R3 XOR V
  const R3 = (state.R >> 3) & 0x01;
  const SX = R3 ^ (state.V & 0x01);

  const operation = ADD ? 'ADD' : SUB ? 'SUB' : 'NOP';

  return Object.freeze({
    Q0,
    Q_1,
    ADD,
    SUB,
    OP,
    NOP,
    ENABLE_R,
    LOAD: state.lastAction === 'LOAD' ? 1 : 0,
    SHIFT: state.lastAction === 'SHIFT' ? 1 : 0,
    DONE: state.DONE & 0x01,
    MUX_M,
    MUX_NOT_M,
    MUX_OUT,
    Cin,
    S,
    Cout,
    V_calc,
    SX,
    operation,
  });
}

/**
 * Create the empty (unloaded) initial hardware state.
 * @returns {object}
 */
export function createEmptyState() {
  const base = {
    loaded: false,
    Morig: null,
    Qorig: null,
    M: 0,
    A: 0,
    Q: 0,
    Q_1: 0,
    R: 0,
    C: 3, // 11 in 2-bit binary
    V: 0,
    DONE: 0,
    nextPhase: 'EXECUTE',
    lastAction: 'IDLE',
    edgeCount: 0,
    completedIterations: 0,
    trace: Object.freeze([]),
    explanation: 'Enter signed 4-bit inputs M and Q (-8 to +7) and click Load Inputs.',
  };
  return Object.freeze({
    ...base,
    signals: computeCombinationalSignals(base),
  });
}

/**
 * Load signed inputs M and Q into the hardware registers.
 * @param {number} mSigned
 * @param {number} qSigned
 * @returns {object}
 */
export function loadInputs(mSigned, qSigned) {
  if (
    !Number.isInteger(mSigned) ||
    mSigned < MIN_4BIT_SIGNED ||
    mSigned > MAX_4BIT_SIGNED ||
    !Number.isInteger(qSigned) ||
    qSigned < MIN_4BIT_SIGNED ||
    qSigned > MAX_4BIT_SIGNED
  ) {
    throw new RangeError('Inputs M and Q must be integers in [-8, +7].');
  }

  const base = {
    loaded: true,
    Morig: mSigned,
    Qorig: qSigned,
    M: to4BitTwosComplement(mSigned),
    A: 0,
    Q: to4BitTwosComplement(qSigned),
    Q_1: 0,
    R: 0,
    C: 3, // 11
    V: 0,
    DONE: 0,
    nextPhase: 'EXECUTE',
    lastAction: 'LOAD',
    edgeCount: 0,
    completedIterations: 0,
    trace: Object.freeze([]),
    explanation: `Loaded M = ${mSigned} (${formatBinary(to4BitTwosComplement(mSigned), 4)}) and Q = ${qSigned} (${formatBinary(to4BitTwosComplement(qSigned), 4)}). Ready for Edge 1 (EXECUTE).`,
  };

  return Object.freeze({
    ...base,
    signals: computeCombinationalSignals(base),
  });
}

/**
 * Reset the simulator: restores post-LOAD state if loaded, or empty state otherwise.
 * @param {object} state
 * @returns {object}
 */
export function resetState(state) {
  if (state && state.loaded && state.Morig !== null && state.Qorig !== null) {
    return loadInputs(state.Morig, state.Qorig);
  }
  return createEmptyState();
}

/**
 * Advance the hardware by exactly one clock edge (EXECUTE or SHIFT).
 * @param {object} state
 * @returns {{ state: object, accepted: boolean, reason?: string }}
 */
export function stepClockEdge(state) {
  if (!state.loaded) {
    return { state, accepted: false, reason: 'Inputs are not loaded.' };
  }
  if (state.DONE === 1) {
    return { state, accepted: false, reason: 'Multiplication is DONE. Further clock pulses are rejected.' };
  }

  const comb = computeCombinationalSignals(state);
  const nextEdgeCount = state.edgeCount + 1;
  const currentIteration = Math.floor(state.edgeCount / 2) + 1;

  if (state.nextPhase === 'EXECUTE') {
    const nextR = comb.OP ? comb.S : state.A;
    const nextV = comb.OP ? comb.V_calc : 0;

    let explanation = '';
    if (comb.ADD) {
      explanation = `Q0 Q-1 = 01 → ADD: R <- A + M (${formatBinary(state.A, 4)} + ${formatBinary(state.M, 4)} = ${formatBinary(nextR, 4)})`;
    } else if (comb.SUB) {
      explanation = `Q0 Q-1 = 10 → SUB: R <- A - M (${formatBinary(state.A, 4)} + ${formatBinary(comb.MUX_OUT, 4)} + 1 = ${formatBinary(nextR, 4)})`;
    } else {
      explanation = `Q0 Q-1 = ${comb.Q0}${comb.Q_1} → NOP: R <- A (${formatBinary(nextR, 4)}), A remains unchanged`;
    }

    const traceRow = Object.freeze({
      iteration: currentIteration,
      edge: nextEdgeCount,
      phase: 'EXECUTE',
      q0q_1: `${comb.Q0}${comb.Q_1}`,
      operation: comb.operation,
      aBefore: formatBinary(state.A, 4),
      s: comb.OP ? formatBinary(comb.S, 4) : '----',
      v: nextV,
      aAfter: formatBinary(state.A, 4),
      qAfter: formatBinary(state.Q, 4),
      q_1After: state.Q_1,
      cAfter: formatBinary(state.C, 2),
      explanation,
    });

    const nextBase = {
      ...state,
      R: nextR,
      V: nextV,
      nextPhase: 'SHIFT',
      lastAction: 'EXECUTE',
      edgeCount: nextEdgeCount,
      trace: Object.freeze([...state.trace, traceRow]),
      explanation,
    };

    return {
      accepted: true,
      state: Object.freeze({
        ...nextBase,
        signals: computeCombinationalSignals(nextBase),
      }),
    };
  }

  // EDGE 2: SHIFT
  const R3 = (state.R >> 3) & 0x01;
  const SX = R3 ^ (state.V & 0x01);

  const nextA = ((SX << 3) | ((state.R >> 1) & 0x07)) & 0x0f;
  const nextQ = (((state.R & 0x01) << 3) | ((state.Q >> 1) & 0x07)) & 0x0f;
  const nextQ_1 = state.Q & 0x01;

  let nextC = state.C;
  let nextDONE = 0;
  if (state.C === 0) {
    nextDONE = 1;
    nextC = 0;
  } else {
    nextC = (state.C - 1) & 0x03;
  }

  const nextCompletedIterations = state.completedIterations + 1;
  const explanation = nextDONE
    ? `SHIFT: Arithmetic right shift performed (SX=${SX}). Counter was 00 → DONE = 1.`
    : `SHIFT: Arithmetic right shift performed (SX=${SX}). Counter ${formatBinary(state.C, 2)} → ${formatBinary(nextC, 2)}.`;

  const traceRow = Object.freeze({
    iteration: currentIteration,
    edge: nextEdgeCount,
    phase: 'SHIFT',
    q0q_1: `${comb.Q0}${comb.Q_1}`,
    operation: 'SHIFT',
    aBefore: formatBinary(state.A, 4),
    s: formatBinary(state.R, 4),
    v: state.V,
    aAfter: formatBinary(nextA, 4),
    qAfter: formatBinary(nextQ, 4),
    q_1After: nextQ_1,
    cAfter: formatBinary(nextC, 2),
    explanation,
  });

  const nextBase = {
    ...state,
    A: nextA,
    Q: nextQ,
    Q_1: nextQ_1,
    C: nextC,
    DONE: nextDONE,
    nextPhase: nextDONE ? 'DONE' : 'EXECUTE',
    lastAction: 'SHIFT',
    edgeCount: nextEdgeCount,
    completedIterations: nextCompletedIterations,
    trace: Object.freeze([...state.trace, traceRow]),
    explanation,
  };

  return {
    accepted: true,
    state: Object.freeze({
      ...nextBase,
      signals: computeCombinationalSignals(nextBase),
    }),
  };
}

/**
 * Compute the final 8-bit result and verification against Morig * Qorig.
 * @param {object} state
 * @returns {object|null}
 */
export function getFinalResult(state) {
  if (!state.loaded || state.DONE !== 1) {
    return null;
  }
  const combined8 = ((state.A & 0x0f) << 4) | (state.Q & 0x0f);
  const signedResult = from8BitTwosComplement(combined8) || 0;
  const expectedResult = (state.Morig * state.Qorig) || 0;
  return {
    Morig: state.Morig,
    Qorig: state.Qorig,
    A: formatBinary(state.A, 4),
    Q: formatBinary(state.Q, 4),
    binary8: formatBinary(combined8, 8),
    signedResult,
    expectedResult,
    match: signedResult === expectedResult,
  };
}
