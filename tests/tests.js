import assert from 'node:assert/strict';
import {
  createEmptyState,
  loadInputs,
  resetState,
  stepClockEdge,
  getFinalResult,
  formatBinary,
  to4BitTwosComplement,
  from4BitTwosComplement,
  from8BitTwosComplement,
  validateInput,
} from '../js/booth-core.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    failed++;
    console.error(`FAIL: ${name}`);
    console.error(`  ${err.message}`);
  }
}

// 1. Input Validation Tests
test('Input validation rejects empty, non-integer, and out-of-range values', () => {
  assert.equal(validateInput('').valid, false);
  assert.equal(validateInput('   ').valid, false);
  assert.equal(validateInput('3.5').valid, false);
  assert.equal(validateInput('abc').valid, false);
  assert.equal(validateInput('-9').valid, false);
  assert.equal(validateInput('8').valid, false);
  assert.equal(validateInput('-8').valid, true);
  assert.equal(validateInput('7').valid, true);
  assert.equal(validateInput('+3').value, 3);
});

// 2. Two's Complement Conversion Tests
test('4-bit and 8-bit two\'s complement conversions', () => {
  assert.equal(formatBinary(to4BitTwosComplement(-8), 4), '1000');
  assert.equal(formatBinary(to4BitTwosComplement(-4), 4), '1100');
  assert.equal(formatBinary(to4BitTwosComplement(-1), 4), '1111');
  assert.equal(formatBinary(to4BitTwosComplement(0), 4), '0000');
  assert.equal(formatBinary(to4BitTwosComplement(3), 4), '0011');
  assert.equal(formatBinary(to4BitTwosComplement(7), 4), '0111');
  assert.equal(from4BitTwosComplement(0b1000), -8);
  assert.equal(from4BitTwosComplement(0b0111), 7);
  assert.equal(from8BitTwosComplement(0b11110100), -12);
});

// 3. Exhaustive 256-Combination Test (M in [-8..7], Q in [-8..7])
const exhaustiveFailures = [];

for (let m = -8; m <= 7; m++) {
  for (let q = -8; q <= 7; q++) {
    test(`Exhaustive multiplication: ${m} * ${q} = ${m * q}`, () => {
      let state = loadInputs(m, q);
      assert.equal(state.C, 3, 'Initial counter C must be 11 (3)');
      assert.equal(state.DONE, 0, 'Initial DONE must be 0');

      const expectedCSequence = [3, 2, 2, 1, 1, 0, 0, 0];

      for (let edge = 1; edge <= 8; edge++) {
        const res = stepClockEdge(state);
        assert.equal(res.accepted, true, `Edge ${edge} must be accepted`);
        state = res.state;
        assert.equal(state.edgeCount, edge);
        assert.equal(state.C, expectedCSequence[edge - 1], `Counter mismatch at edge ${edge}`);
      }

      assert.equal(state.DONE, 1, 'DONE must be 1 after 8 clock edges');
      assert.equal(state.completedIterations, 4, 'Completed iterations must be 4');

      // Verify no execution after DONE
      const postDone = stepClockEdge(state);
      assert.equal(postDone.accepted, false, 'Clock pulse after DONE must be rejected');

      const result = getFinalResult(state);
      assert.ok(result !== null, 'Final result must be available when DONE=1');
      if (!result.match) {
        exhaustiveFailures.push({ m, q, expected: m * q, got: result.signedResult, bin: result.binary8 });
      }
      assert.equal(
        result.signedResult,
        (m * q) || 0,
        `M=${m}, Q=${q}: expected ${(m * q) || 0}, got ${result.signedResult} (${result.binary8})`
      );
    });
  }
}

// 4. Explicit Required Cases
const explicitCases = [
  [3, 4, 12],
  [3, -4, -12],
  [-3, 4, -12],
  [-3, -4, 12],
  [7, 1, 7],
  [-8, 1, -8],
  [7, 7, 49],
  [-8, -8, 64],
  [7, -8, -56],
  [-8, -1, 8],
  [0, 5, 0],
  [5, 0, 0],
];

for (const [m, q, expected] of explicitCases) {
  test(`Explicit case: ${m} * ${q} = ${expected}`, () => {
    let state = loadInputs(m, q);
    for (let i = 0; i < 8; i++) {
      state = stepClockEdge(state).state;
    }
    const res = getFinalResult(state);
    assert.equal(res.signedResult, expected);
    assert.equal(res.match, true);
  });
}

// 5. Hardware Control, MUX, Overflow, SX, Clock Sequencing, History & Reset Validation
test('ADD/SUB/NOP, MUX, Overflow V, SX, and clock-edge isolation', () => {
  // M = -8 (1000), Q = 1 (0001) -> Edge 1: Q0=1, Q-1=0 -> SUB
  let s = loadInputs(-8, 1);
  assert.equal(s.signals.SUB, 1);
  assert.equal(s.signals.ADD, 0);
  assert.equal(s.signals.NOP, 0);
  assert.equal(s.signals.MUX_OUT, 0b0111); // ~1000 = 0111
  assert.equal(s.signals.Cin, 1);

  // EXECUTE edge: A=0000, MUX_OUT=0111, Cin=1 -> S=1000, V=1, R=1000
  s = stepClockEdge(s).state;
  assert.equal(s.R, 0b1000);
  assert.equal(s.V, 1);
  assert.equal(s.signals.SX, 0); // R3(1) ^ V(1) = 0
  assert.equal(s.A, 0, 'A must not change during EXECUTE');
  assert.equal(s.Q, 1, 'Q must not change during EXECUTE');
  assert.equal(s.Q_1, 0, 'Q-1 must not change during EXECUTE');
  assert.equal(s.C, 3, 'C must not change during EXECUTE');

  // SHIFT edge: A <- {SX=0, R3..R1=100} = 0100, Q <- {R0=0, Q3..Q1=000} = 0000, Q-1 <- 1, C <- 2
  s = stepClockEdge(s).state;
  assert.equal(s.A, 0b0100);
  assert.equal(s.Q, 0b0000);
  assert.equal(s.Q_1, 1);
  assert.equal(s.C, 2);
});

test('History snapshot & Reset behavior', () => {
  const empty = createEmptyState();
  assert.equal(stepClockEdge(empty).accepted, false);

  const loaded = loadInputs(3, -4);
  const history = [loaded];
  let curr = loaded;

  for (let i = 0; i < 4; i++) {
    curr = stepClockEdge(curr).state;
    history.push(curr);
  }
  assert.equal(history.length, 5);
  assert.equal(curr.edgeCount, 4);

  // Previous Step simulation via popping snapshot
  history.pop();
  const prev = history[history.length - 1];
  assert.equal(prev.edgeCount, 3);
  assert.equal(prev.trace.length, 3);

  // Reset restores exact post-load state
  const afterReset = resetState(curr);
  assert.deepEqual(afterReset, loaded);

  // Reset on unloaded restores empty state
  const emptyReset = resetState(empty);
  assert.deepEqual(emptyReset, empty);
});

console.log(`\n=== Booth 4-Bit Hardware Simulator Test Summary ===`);
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (exhaustiveFailures.length > 0) {
  console.log(`Exhaustive failures:`, exhaustiveFailures);
}

if (failed > 0) {
  process.exit(1);
}
