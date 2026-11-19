# Booth's 4-Bit Multiplication Algorithm Simulator

**Group:** Group B | **Project Number:** 2 | **Subject Area:** Computer Organization and Architecture  
**Live Project URL:** `[INSERT ACTUAL GITHUB PAGES URL]`

## Project Introduction
An interactive, browser-based educational simulator that demonstrates **Booth's Multiplication Algorithm** for signed 4-bit binary integers (`-8` to `+7`). Built purely with HTML5, CSS3, and Vanilla JavaScript, it visualizes two's complement conversion, bit-level register updates (`A`, `Q`, `Q₋₁`, `M`), addition/subtraction decisions, arithmetic right shifts, and the final 8-bit binary and decimal product across exactly four iterations.

## Features
- **Strict Signed 4-Bit Input Validation:** Accepts only integers in `[-8, +7]` with live 4-bit two's complement binary preview.
- **5-Bit Internal Accumulator & Sign-Extended M:** Prevents overflow on edge cases such as `-8 × -8 = +64`.
- **Hardware Register Visualization:** Bit-cell display for `A` (5-bit internal), `Q` (4-bit), `Q₋₁` (1-bit), and `M` (4-bit).
- **Interactive Controls:** Start Simulation, Reset, Next Step, Previous Step, Run All Steps, and Pause.
- **4-Iteration Trace Table:** Displays `Q₀ Q₋₁`, selected operation, `A` before/after operation, `Q` and `Q₋₁` after shift, and plain-English explanations.
- **Educational & Documentation Suite:** Dedicated `algorithm.html` guide, `about.html` overview, SVG block diagram & flowchart, and print-ready academic report.

## Technologies Used
- **HTML5** (Semantic multi-page structure)
- **CSS3** (Dark navy & cyan/teal responsive Grid/Flexbox UI)
- **Vanilla JavaScript (ES6+)** (Pure binary register simulation engine, zero external libraries)
- **SVG** (Editable technical block diagram, flowchart, and architecture diagram)

## Folder Structure
```text
Booths_4bit_Multiplication_Simulator/
├── index.html
├── simulator.html
├── algorithm.html
├── about.html
├── style.css
├── script.js
├── README.md
├── PROJECT_REPORT.md
├── PROJECT_REPORT.html
├── assets/
│   ├── block-diagram.svg
│   ├── flowchart.svg
│   └── architecture.svg
└── presentation/
    ├── VIDEO_SCRIPT.md
    ├── PRESENTATION_GUIDE.md
    └── TEST_CASES.md
```

## Installation & How to Run Locally
No installation, server, database, or API key is required.
1. Download or clone the `Booths_4bit_Multiplication_Simulator` folder.
2. Open `index.html` directly in any modern web browser (Chrome, Firefox, Edge, Safari).
3. *(Optional)* Serve locally using any static server, e.g.:
   ```bash
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000/index.html`.

## How to Use the Simulator
1. Open `simulator.html` (or click **Open Simulator** on the Home page).
2. Enter integer values between `-8` and `+7` for **Multiplicand (M)** and **Multiplier (Q)**.
3. Observe the automatic 4-bit two's complement binary previews.
4. Click **Start Simulation** to initialize `A = 00000`, `Q`, `Q₋₁ = 0`, and sign-extended `M`.
5. Use **Next Step** / **Previous Step** to inspect each of the 4 iterations, or **Run All Steps** / **Pause** for automated playback.
6. After Iteration 4, inspect the **Final 8-Bit Binary Product** and **Final Decimal Product**.

## Algorithm Summary
| `Q₀` | `Q₋₁` | Operation |
| :---: | :---: | :--- |
| `0` | `0` | No Operation (Arithmetic Right Shift only) |
| `0` | `1` | `A = A + M` (then Arithmetic Right Shift) |
| `1` | `0` | `A = A - M` (then Arithmetic Right Shift) |
| `1` | `1` | No Operation (Arithmetic Right Shift only) |

After 4 iterations, the final 8-bit product is formed from the **lower 4 bits of `A`** followed by **`Q`**.

## Verified Test Cases
All **256 valid input combinations** (`M ∈ [-8, +7]`, `Q ∈ [-8, +7]`) passed exhaustive Node.js verification (`256/256 passed, 0 failed`), including:

| M | Q | Expected Decimal | Expected 8-Bit Binary | Status |
| :---: | :---: | :---: | :---: | :---: |
| -5 | 3 | -15 | `11110001` | PASS |
| 3 | 2 | 6 | `00000110` | PASS |
| -8 | -8 | 64 | `01000000` | PASS |
| -8 | 7 | -56 | `11001000` | PASS |
| 7 | 7 | 49 | `00110001` | PASS |
| -4 | -3 | 12 | `00001100` | PASS |
| 0 | 7 | 0 | `00000000` | PASS |

## GitHub Pages Deployment Instructions
1. Create a new public repository on GitHub (e.g., `booths-4bit-simulator`).
2. Upload all files and folders from `Booths_4bit_Multiplication_Simulator/` so `index.html` is in the repository root.
3. Open your repository **Settings**.
4. In the left sidebar, click **Pages**.
5. Under **Build and deployment → Source**, select **Deploy from a branch**.
6. Choose the **`main`** branch.
7. Choose the **`/ (root)`** directory.
8. Click **Save**.
9. Wait 1–2 minutes, then open the published URL shown at the top of the Pages settings page and verify all pages, CSS, JS, and SVG diagrams load cleanly.
