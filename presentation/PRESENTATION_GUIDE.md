# Presentation & Viva Voce Guide

**Project:** Booth's 4-Bit Multiplication Algorithm Simulator (Group B — Project #2)

## 1. Presentation Structure (5–7 Slides / Verbal Walkthrough)
1. **Title & Problem Statement:** Why unsigned shift-and-add fails for negative two's complement numbers.
2. **Objectives & Scope:** Signed 4-bit inputs (`-8` to `+7`), 8-bit signed output (`-56` to `+64`), 4-iteration visualization.
3. **System Architecture:** Pure client-side HTML5 + CSS3 + Vanilla JS (`index.html`, `simulator.html`, `algorithm.html`, `about.html`).
4. **Core Algorithm & 5-Bit Internal Accumulator:** Explain why `A` is 5 bits and `M` is sign-extended to 5 bits (`-8 × -8 = +64` edge case).
5. **Live Demo:** Walk through `-5 × 3 = -15` step-by-step and `-8 × -8 = +64` via Run All Steps.
6. **Testing & Verification:** 256/256 exhaustive combinations passed + input validation checks.

## 2. Common Viva Questions & Model Answers
- **Q1: Why do we need `Q₋₁` in Booth's Algorithm?**  
  *A:* `Q₋₁` remembers the bit shifted out of `Q₀` in the previous cycle so the controller can detect transitions (`01` = end of 1s → add `M`; `10` = start of 1s → subtract `M`).
- **Q2: Why does the simulator use a 5-bit internal Accumulator `A` instead of 4 bits?**  
  *A:* In 4-bit two's complement, `-8` is `1000₂`, and its negation `+8` cannot fit in 4 bits. Sign-extending `M` to 5 bits (`11000`) and using a 5-bit `A` (`00000`) allows `-M = 01000` (`+8`) to be represented without overflow, ensuring `-8 × -8 = +64` works accurately.
- **Q3: What is the difference between Logical Right Shift and Arithmetic Right Shift?**  
  *A:* Logical shift inserts `0` at the MSB, which corrupts negative numbers. Arithmetic Right Shift duplicates the sign bit `A[0]` so the sign of the partial product is preserved.
- **Q4: How is the final 8-bit product formed?**  
  *A:* After 4 iterations, we concatenate the lower 4 bits of `A` (`A[3:0]`) with the 4 bits of `Q` (`Q[3:0]`).
