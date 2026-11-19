# PROJECT REPORT: BOOTH'S MULTIPLICATION ALGORITHM SIMULATOR (SIGNED 4-BIT)

**Project Category:** Mini Project | **Group:** Group B | **Project Number:** 2  
**Subject Area:** Computer Organization and Architecture  
**LIVE PROJECT URL:** `[INSERT ACTUAL GITHUB PAGES URL]`

---

## Cover Page Details (Editable Placeholders)
- **Project Title:** Booth's Multiplication Algorithm Simulator (Signed 4-Bit)
- **Submitted By:** `[INSERT STUDENT NAME(S) & ROLL NUMBER(S)]`
- **Group:** Group B — Project #2
- **Course / Department:** `[INSERT DEPARTMENT / DEGREE PROGRAM]`
- **Institution:** `[INSERT COLLEGE / UNIVERSITY NAME]`
- **Academic Year:** `[INSERT ACADEMIC YEAR]`
- **Project Guide:** `[INSERT FACULTY GUIDE NAME]`

---

## Certificate
This is to certify that the mini project entitled **"Booth's Multiplication Algorithm Simulator (Signed 4-Bit)"** has been carried out by `[INSERT STUDENT NAME(S)]` of Group B (Project #2) in partial fulfillment of the requirements for the course **Computer Organization and Architecture** during the academic year `[INSERT ACADEMIC YEAR]`.

- **Internal Guide Signature:** `___________________________`
- **Head of Department Signature:** `___________________________`
- **External Examiner Signature:** `___________________________`
- **Date:** `___________________________`

---

## Acknowledgement
We express our sincere gratitude to `[INSERT FACULTY GUIDE NAME]`, `[INSERT HOD NAME]`, and the Department of `[INSERT DEPARTMENT NAME]` at `[INSERT COLLEGE / UNIVERSITY NAME]` for their guidance and support throughout this mini project.

---

## Abstract
Booth's Multiplication Algorithm Simulator is an interactive, client-side web application built with HTML5, CSS3, and Vanilla JavaScript to demonstrate signed 4-bit binary multiplication (`-8` to `+7`). The simulator performs genuine bit-level two's complement conversion, 5-bit internal Accumulator (`A`) arithmetic, `Q₀Q₋₁` bit-pair decision branching, and Arithmetic Right Shifts across four cycles to produce an 8-bit signed binary and decimal product. Exhaustive testing across all 256 valid input combinations confirmed 100% accuracy (256/256 passed).

---

## 1. Introduction
Signed binary multiplication is a fundamental operation in Computer Organization and Architecture (COA). Unlike unsigned multiplication, signed multiplication in two's complement form requires preserving sign bits and handling negative operands uniformly. Booth's Algorithm (1950) accomplishes this by inspecting adjacent multiplier bits (`Q₀`, `Q₋₁`) and performing addition, subtraction, or no operation followed by an Arithmetic Right Shift.

## 2. Problem Statement
Students learning COA often struggle to trace register transitions (`A`, `Q`, `Q₋₁`, `M`) manually across iterations—especially for negative numbers and boundary cases like `-8 × -8 = +64`. Static textbook tables do not let learners step forward/backward or observe live bit-level shifts.

## 3. Objectives
1. Accept strictly signed 4-bit integers (`-8` to `+7`) with real-time 4-bit binary conversion.
2. Implement authentic binary register operations (5-bit internal `A`, 5-bit sign-extended `M`, 4-bit `Q`, 1-bit `Q₋₁`).
3. Provide interactive controls (Start, Reset, Next Step, Previous Step, Run All Steps, Pause).
4. Visually highlight each of the 4 iterations with clear explanations.
5. Verify all 256 possible input pairs exhaustively.

## 4. Existing System
Traditional learning relies on manual pen-and-paper tracing or generic calculators that output only the final decimal product without exposing intermediate register states or bit-level shifts.

## 5. Proposed System
A zero-dependency, responsive dark-themed web application (`index.html`, `simulator.html`, `algorithm.html`, `about.html`) powered by a pure binary simulation engine (`script.js`) and accompanied by SVG diagrams (`block-diagram.svg`, `flowchart.svg`, `architecture.svg`).

## 6. Hardware Requirements
- Dual-core processor (x86_64 or ARM64)
- Minimum 2 GB RAM
- < 5 MB storage
- Display: Mobile (360px+) to Desktop (1080p+)

## 7. Software Requirements
- Modern Web Browser (Chrome, Firefox, Edge, Safari)
- OS: Windows, macOS, Linux, Android, or iOS
- Optional: Node.js v18+ for running the automated 256-case test suite

## 8. System Architecture
The application separates presentation (HTML5 + shared `style.css`), interactive simulation logic (`script.js` loaded only on `simulator.html`), and technical SVG diagrams (`assets/`). See `assets/architecture.svg`.

## 9. Block Diagram
Refer to `assets/block-diagram.svg`:  
`User Input → Input Validation → 4-bit Binary Conversion → Booth's Algorithm Controller → A, Q, Q-1 Registers → Addition / Subtraction Unit → Arithmetic Right Shift → Four Iterations → Final 8-bit Binary Output → Decimal Result`.

## 10. Flowchart
Refer to `assets/flowchart.svg` for the complete ANSI/ISO flowchart including `Start`, `Input M and Q`, `Initialize Registers`, `Check Q0Q-1`, `A = A + M` / `A = A - M` / `No Op`, `Arithmetic Right Shift`, `Count == 0?` loop, `Generate Final Product`, `Display Output`, and `End`.

## 11. Algorithm Explanation
1. Initialize `A = 00000` (5-bit), `Q = 4-bit(Q)`, `Q₋₁ = 0`, and sign-extend `M` to 5 bits.
2. Check `Q₀Q₋₁`: `01` → `A = A + M`; `10` → `A = A - M`; `00` or `11` → No operation.
3. Perform Arithmetic Right Shift on `[A, Q, Q₋₁]`, preserving `A[0]`.
4. Repeat 4 times.
5. Form 8-bit product from lower 4 bits of `A` followed by `Q`.

## 12. Mathematical Example (`-5 × 3 = -15`)
- `M = -5 → 1011₂` (5-bit: `11011`, `-M = 00101`), `Q = 3 → 0011₂`, `A = 00000`, `Q₋₁ = 0`.
- **Iter 1 (`10`):** `A = A - M = 00101` → ARS → `A = 00010, Q = 1001, Q₋₁ = 1`.
- **Iter 2 (`11`):** No Op → ARS → `A = 00001, Q = 0100, Q₋₁ = 1`.
- **Iter 3 (`01`):** `A = A + M = 11100` → ARS → `A = 11110, Q = 0010, Q₋₁ = 0`.
- **Iter 4 (`00`):** No Op → ARS → `A = 11111, Q = 0001, Q₋₁ = 0`.
- **Final 8-bit Product:** `1111` (lower 4 of `A`) + `0001` (`Q`) = `11110001₂` = **`-15₁₀`**.

## 13. Implementation Details & 14. Source Code Overview
- `index.html`: Landing page, project scope, example, navigation.
- `simulator.html`: Interactive register view, controls, 4-iteration table, final result card.
- `algorithm.html`: Beginner-friendly theory, solved example, embedded SVGs.
- `about.html`: Academic specifications and methodology.
- `style.css`: Shared dark-navy & cyan/teal responsive stylesheet.
- `script.js`: Binary conversion, 5-bit ALU, ARS shifter, validation, and DOM controller.

## 15. Screenshots (Placeholders)
- `[INSERT SCREENSHOT 1: Home Page (index.html)]`
- `[INSERT SCREENSHOT 2: Simulator Execution (-5 × 3 = -15) (simulator.html)]`
- `[INSERT SCREENSHOT 3: Algorithm Page & SVG Diagrams (algorithm.html)]`

## 16. Testing and Results
Executed in Node.js v18.20.4 directly against `script.js`:
- **Required Benchmark Cases:** 7/7 PASSED (`-5×3=-15`, `3×2=6`, `-8×-8=64`, `-8×7=-56`, `7×7=49`, `-4×-3=12`, `0×7=0`).
- **Exhaustive Domain Test (`M, Q ∈ [-8, +7]`):** **256 / 256 PASSED (0 FAILED)**.
- **Validation Tests:** Out-of-range (`-9`, `8`) and non-integer (`3.5`, `"abc"`, `""`) inputs cleanly rejected.

## 17. Advantages
- Zero external dependencies; runs offline or on GitHub Pages.
- Handles all signed 4-bit edge cases including `-8 × -8 = +64` via 5-bit internal `A`.
- Clear step-by-step visualization for COA students.

## 18. Limitations
- Strictly restricted to signed 4-bit integers (`-8` to `+7`).
- No backend persistence of simulation history.

## 19. Future Scope
- Configurable 8-bit/16-bit modes and Radix-4 Modified Booth comparison.
- Interactive practice quiz and CSV/PDF export.

## 20. Conclusion
The Booth's 4-Bit Multiplication Algorithm Simulator successfully delivers an accurate, responsive, and thoroughly verified educational tool for Computer Organization and Architecture.

## 21. References
1. A. D. Booth, *"A Signed Binary Multiplication Technique,"* Quarterly Journal of Mechanics and Applied Mathematics, Vol. 4, Pt. 2, pp. 236–240, 1951.
2. W. Stallings, *Computer Organization and Architecture: Designing for Performance*, Pearson.
3. M. Morris Mano, *Computer System Architecture*, Pearson.
