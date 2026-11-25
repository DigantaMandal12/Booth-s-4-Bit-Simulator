/**
 * Main Application Entry Point.
 * Connects circuit SVG construction, controller, rendering, and DOM events.
 */

import { buildCircuitSVG } from './circuit.js';
import { renderAll } from './render.js';
import { SimulationController } from './controller.js';

document.addEventListener('DOMContentLoaded', () => {
  const circuitContainer = document.getElementById('circuit-container');
  buildCircuitSVG(circuitContainer);

  const controller = new SimulationController((state, runtime) => {
    renderAll(state, runtime);
  });

  const inputM = document.getElementById('input-m');
  const inputQ = document.getElementById('input-q');
  const previewM = document.getElementById('preview-m');
  const previewQ = document.getElementById('preview-q');
  const validationMsg = document.getElementById('validation-msg');

  const updatePreviews = () => {
    previewM.textContent = SimulationController.getPreviewBinary(inputM.value);
    previewQ.textContent = SimulationController.getPreviewBinary(inputQ.value);
  };

  inputM.addEventListener('input', updatePreviews);
  inputQ.addEventListener('input', updatePreviews);
  updatePreviews();

  document.getElementById('input-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const res = controller.handleLoad(inputM.value, inputQ.value);
    validationMsg.textContent = res.ok ? '' : res.error;
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    validationMsg.textContent = '';
    controller.handleReset();
  });

  document.getElementById('btn-clock').addEventListener('click', () => {
    controller.handleClockPulse();
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    controller.handleNextStep();
  });

  document.getElementById('btn-prev').addEventListener('click', () => {
    controller.handlePreviousStep();
  });

  document.getElementById('btn-run').addEventListener('click', () => {
    controller.handleRunAuto();
  });

  document.getElementById('btn-pause').addEventListener('click', () => {
    controller.handlePause();
  });

  const speedSlider = document.getElementById('speed-slider');
  const speedLabel = document.getElementById('speed-label');
  speedSlider.addEventListener('input', () => {
    const ms = Number(speedSlider.value);
    speedLabel.textContent = `${ms} ms/edge`;
    controller.setSpeed(ms);
  });

  // Load default inputs (3 and -4) immediately so the circuit is live on open
  controller.handleLoad(inputM.value, inputQ.value);
});
