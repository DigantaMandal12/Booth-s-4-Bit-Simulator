# Video Demonstration Script (3–5 Minutes)

**Suggested Video Title:** Booth's 4-Bit Multiplication Algorithm Simulator | Interactive COA Mini Project (Group B, Project #2)

**Suggested Video Description:**  
An interactive web-based simulator demonstrating Booth's Multiplication Algorithm for signed 4-bit binary integers (-8 to +7) using HTML5, CSS3, and Vanilla JavaScript. Covers two's complement conversion, 5-bit internal Accumulator A, Q0/Q-1 decision logic, arithmetic right shift, and 8-bit binary product generation across 4 iterations.

---

## Narration Script (Approx. 4 Minutes)

### 1. Introduction (0:00 – 0:30)
> "Hello everyone. We are Group B, presenting Project Number 2 for Computer Organization and Architecture: **Booth's 4-Bit Multiplication Algorithm Simulator**.  
> Multiplying signed binary numbers in hardware is tricky because standard shift-and-add only works cleanly for unsigned numbers. Booth's Algorithm solves this by multiplying signed two's complement integers directly using a simple bit-pair inspection rule."

### 2. Home Page Walkthrough (0:30 – 0:55)
> "Here on our Home page (`index.html`), you can see the project objective, the strict signed 4-bit input range of **-8 to +7**, our zero-dependency tech stack—HTML5, CSS3, and Vanilla JavaScript—and a quick preview of `-5 × 3 = -15`. Let's click **Open Simulator** to see it in action."

### 3. Input Values & Binary Conversion (0:55 – 1:25)
> "On the Simulator page (`simulator.html`), we have two inputs: Multiplicand `M` and Multiplier `Q`. Notice that if I enter `-5` for `M`, the simulator immediately displays its 4-bit two's complement binary `1011`. When I enter `3` for `Q`, it displays `0011`. Out-of-range values like `-9` or `8` are blocked by validation."

### 4. Register Initialization (1:25 – 1:50)
> "When I click **Start Simulation**, the registers initialize: Accumulator `A` is set to `00000` (5 bits internally to prevent overflow on edge cases like `-8 × -8`), `Q` is loaded with `0011`, `Q₋₁` is `0`, and `M` is sign-extended to `11011`."

### 5. Iteration 1 — Subtraction Decision & ARS (1:50 – 2:30)
> "Let's click **Next Step** for Iteration 1. The simulator checks `Q₀` and `Q₋₁`, which are `1` and `0`. According to Booth's decision table, `10` means **Subtract M** (`A = A - M`). Adding `-M` (`00101`) to `00000` gives `00101`. Then, an Arithmetic Right Shift moves `[A, Q, Q₋₁]` right by one bit while preserving `A`'s sign bit, leaving `A = 00010`, `Q = 1001`, and `Q₋₁ = 1`."

### 6. Iterations 2, 3, and 4 (2:30 – 3:15)
> "In Iteration 2, `Q₀Q₋₁ = 11`, so no arithmetic operation is performed—only an Arithmetic Right Shift.  
> In Iteration 3, `Q₀Q₋₁ = 01`, so we **Add M** (`A = A + M`), then shift right.  
> In Iteration 4, `Q₀Q₋₁ = 00`, so we perform another Arithmetic Right Shift."

### 7. Final Result & Edge Case Demo (3:15 – 3:45)
> "After exactly 4 iterations, the simulator forms the 8-bit product from the lower 4 bits of `A` (`1111`) and `Q` (`0001`), giving `11110001₂`, which equals **-15** in decimal. We can also click **Run All Steps** on `-8 × -8` to see it compute `+64` (`01000000₂`) cleanly."

### 8. Algorithm Page & Conclusion (3:45 – 4:15)
> "Finally, our **Learn Algorithm** page (`algorithm.html`) explains two's complement, the decision table, and includes our SVG block diagram and flowchart, while **About Project** (`about.html`) covers system requirements and architecture. All 256 possible 4-bit input pairs have been exhaustively tested and verified. Thank you for watching!"

---

## Screen Recording Instructions & Checklist
> **Note:** No screen-recording tool was run automatically; follow this guide to record your submission video locally using OBS Studio, Xbox Game Bar (`Win + G`), or QuickTime (`Cmd + Shift + 5`).

### Screen-by-Screen Recording Checklist
- [ ] Set browser zoom to 100% and close unnecessary tabs/notifications.
- [ ] Start on `index.html`: show title, range (`-8` to `+7`), and click **Open Simulator**.
- [ ] On `simulator.html`: type `M = -5`, `Q = 3` and show live 4-bit binary previews.
- [ ] Click **Start Simulation** and point out `A`, `Q`, `Q₋₁`, and `M` registers.
- [ ] Click **Next Step** 4 times slowly, reading the highlighted row each time.
- [ ] Show the green **Final 8-Bit Product** card (`11110001`, `-15`).
- [ ] Click **Reset**, test `-8 × -8` with **Run All Steps** to show `64` (`01000000`).
- [ ] Open `algorithm.html` and scroll past the decision table, block diagram, and flowchart.
- [ ] Open `about.html` briefly to conclude.
