# Booth's Multiplication Algorithm — Hardware Circuit Simulator

A hardware-level 4-bit signed Booth's Multiplication Algorithm simulator built with HTML5, CSS3, Vanilla ES6+ JavaScript, and interactive SVG schematics.

## Project Structure

```
Booth-s-4-Bit-Simulator/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── booth-core.js
│   ├── circuit.js
│   ├── render.js
│   ├── controller.js
│   └── main.js
├── tests/
│   └── tests.js
└── README.md
```

## Hardware Architecture

- **Registers**: `M` (4-bit), `A` (4-bit), `Q` (4-bit), `Q-1` (1-bit), `R` (4-bit), `C` (2-bit down counter `11 → 10 → 01 → 00`), `V` (1-bit overflow), `DONE` (1-bit completion latch)
- **Control Unit**: `ADD = NOT(Q0) & Q-1`, `SUB = Q0 & NOT(Q-1)`, `OP = ADD | SUB`, `NOP = NOT(OP)`, `ENABLE_R = OP`
- **Datapath**: 2×1 MUX (`SUB ? ~M : M`), 4-bit ADD/SUB unit (`S = A + MUX_OUT + Cin`), overflow correction (`SX = R3 XOR V`), and atomic arithmetic right shift across `[A | Q | Q-1]`
- **Clocking**: 2 clock edges per iteration (`EXECUTE` followed by `SHIFT`), 4 iterations / 8 clock edges total.

## Running with VS Code Live Server

1. Open the project folder in VS Code.
2. Right-click `index.html` and select **Open with Live Server**.
3. Use the top bar to load signed 4-bit inputs (`-8` to `+7`) and step through the hardware schematic.

## Running Automated Tests

Requires Node.js:

```bash
node tests/tests.js
```

Runs 272 tests including all 256 signed input combinations (`M ∈ [-8, 7]`, `Q ∈ [-8, 7]`), edge-level register checks, counter sequencing, and history/reset validation.
