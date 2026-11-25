/**
 * Simulation Controller: manages immutable history snapshots,
 * user controls, automatic clock timer, and input validation.
 */

import {
  createEmptyState,
  loadInputs,
  resetState,
  stepClockEdge,
  validateInput,
  to4BitTwosComplement,
  formatBinary,
} from './booth-core.js';

export class SimulationController {
  constructor(onStateChange) {
    this.onStateChange = onStateChange;
    this.history = [createEmptyState()];
    this.autoTimerId = null;
    this.speedMs = 600;
  }

  get currentState() {
    return this.history[this.history.length - 1];
  }

  get isRunning() {
    return this.autoTimerId !== null;
  }

  get canPrev() {
    return this.history.length > 1;
  }

  notify() {
    this.onStateChange(this.currentState, {
      isRunning: this.isRunning,
      canPrev: this.canPrev,
    });
  }

  stopAuto() {
    if (this.autoTimerId !== null) {
      clearInterval(this.autoTimerId);
      this.autoTimerId = null;
    }
  }

  handleLoad(rawM, rawQ) {
    this.stopAuto();
    const mCheck = validateInput(rawM);
    if (!mCheck.valid) {
      return { ok: false, error: `Multiplicand M: ${mCheck.error}` };
    }
    const qCheck = validateInput(rawQ);
    if (!qCheck.valid) {
      return { ok: false, error: `Multiplier Q: ${qCheck.error}` };
    }

    const loaded = loadInputs(mCheck.value, qCheck.value);
    this.history = [loaded];
    this.notify();
    return { ok: true, error: '' };
  }

  handleReset() {
    this.stopAuto();
    const restored = resetState(this.currentState);
    this.history = [restored];
    this.notify();
  }

  handleClockPulse() {
    const res = stepClockEdge(this.currentState);
    if (!res.accepted) {
      this.stopAuto();
      this.notify();
      return false;
    }
    this.history.push(res.state);
    if (res.state.DONE === 1) {
      this.stopAuto();
    }
    this.notify();
    return true;
  }

  handleNextStep() {
    this.stopAuto();
    if (!this.currentState.loaded || this.currentState.DONE === 1) {
      return;
    }
    // Complete the current iteration (if at EXECUTE -> do EXECUTE + SHIFT; if at SHIFT -> do SHIFT)
    if (this.currentState.nextPhase === 'EXECUTE') {
      const first = stepClockEdge(this.currentState);
      if (first.accepted) {
        this.history.push(first.state);
      }
      const second = stepClockEdge(this.currentState);
      if (second.accepted) {
        this.history.push(second.state);
      }
    } else {
      const only = stepClockEdge(this.currentState);
      if (only.accepted) {
        this.history.push(only.state);
      }
    }
    this.notify();
  }

  handlePreviousStep() {
    this.stopAuto();
    if (this.history.length > 1) {
      this.history.pop();
      this.notify();
    }
  }

  handleRunAuto() {
    if (this.isRunning) return;
    if (!this.currentState.loaded || this.currentState.DONE === 1) return;

    this.autoTimerId = setInterval(() => {
      const stepped = this.handleClockPulse();
      if (!stepped || this.currentState.DONE === 1) {
        this.stopAuto();
        this.notify();
      }
    }, this.speedMs);
    this.notify();
  }

  handlePause() {
    this.stopAuto();
    this.notify();
  }

  setSpeed(ms) {
    this.speedMs = Number(ms);
    if (this.isRunning) {
      this.stopAuto();
      this.handleRunAuto();
    }
  }

  static getPreviewBinary(raw) {
    const check = validateInput(raw);
    if (!check.valid) return '----';
    return formatBinary(to4BitTwosComplement(check.value), 4);
  }
}
