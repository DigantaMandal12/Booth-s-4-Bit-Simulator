# Test Cases & Verification Report

**Project:** Booth's 4-Bit Multiplication Algorithm Simulator  
**Test Environment:** Node.js v18.20.4 executing `script.js` (`runBoothAlgorithm` & `validateSigned4Bit`)  

## 1. Required Benchmark Test Cases
All 7 required benchmark test cases were executed directly against `script.js`:

| # | M (Dec) | M (4-bit) | Q (Dec) | Q (4-bit) | Expected Dec | Actual Dec | Expected 8-bit Binary | Actual 8-bit Binary | Iterations | Status |
| :-: | :-: | :---: | :-: | :---: | :-: | :-: | :---: | :---: | :-: | :---: |
| 1 | -5 | `1011` | 3 | `0011` | -15 | -15 | `11110001` | `11110001` | 4 | **PASS** |
| 2 | 3 | `0011` | 2 | `0010` | 6 | 6 | `00000110` | `00000110` | 4 | **PASS** |
| 3 | -8 | `1000` | -8 | `1000` | 64 | 64 | `01000000` | `01000000` | 4 | **PASS** |
| 4 | -8 | `1000` | 7 | `0111` | -56 | -56 | `11001000` | `11001000` | 4 | **PASS** |
| 5 | 7 | `0111` | 7 | `0111` | 49 | 49 | `00110001` | `00110001` | 4 | **PASS** |
| 6 | -4 | `1100` | -3 | `1101` | 12 | 12 | `00001100` | `00001100` | 4 | **PASS** |
| 7 | 0 | `0000` | 7 | `0111` | 0 | 0 | `00000000` | `00000000` | 4 | **PASS** |

## 2. Exhaustive 256-Combination Verification
- **Input Domain:** `M ∈ [-8, +7]` (16 values) × `Q ∈ [-8, +7]` (16 values) = **256 total combinations**.
- **Oracle Comparison:** Compared `finalDecimal === M * Q`, `finalBinary === ((M * Q + 256) % 256).toString(2).padStart(8, '0')`, and `steps.length === 4`.
- **Result:** **256 / 256 PASSED (0 FAILED)**.

## 3. Input Validation Tests
| Input | Expected Valid | Actual Valid | Result |
| :--- | :---: | :---: | :---: |
| `-9` (below min) | `false` | `false` | **PASS** |
| `8` (above max) | `false` | `false` | **PASS** |
| `3.5` (non-integer) | `false` | `false` | **PASS** |
| `"abc"` (non-numeric) | `false` | `false` | **PASS** |
| `""` (empty) | `false` | `false` | **PASS** |
| `null` / `undefined` | `false` | `false` | **PASS** |
