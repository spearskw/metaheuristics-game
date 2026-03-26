import { createRandomSolution, mutateSolution } from './polygon.js';
import { computeMSE } from './fitness.js';
import { geometricCooling, annealingAcceptor } from './annealing.js';

const FITNESS_WIDTH = 64;
const FITNESS_HEIGHT = 96;
const BETA = 0.99999;

let running = false;

window.onload = main;

function main() {
  bindSliders();
  document.getElementById('start').addEventListener('click', toggleRun);
}

function bindSliders() {
  const sliders = ['polygons', 'iterations', 'temperature', 'speed'];
  for (const id of sliders) {
    const slider = document.getElementById(id);
    const display = document.getElementById(id + '-value');
    slider.addEventListener('input', () => {
      display.textContent = slider.value;
    });
  }
}

function toggleRun() {
  if (running) {
    running = false;
    document.getElementById('start').textContent = 'Start';
    return;
  }

  running = true;
  document.getElementById('start').textContent = 'Stop';

  const numPolygons = parseInt(document.getElementById('polygons').value);
  const numIterations = parseInt(document.getElementById('iterations').value);
  const initialTemp = parseInt(document.getElementById('temperature').value);
  const batchSize = parseInt(document.getElementById('speed').value);

  loadTargetImage('mona.jpg', (targetPixels) => {
    const solution = createRandomSolution(numPolygons, FITNESS_WIDTH, FITNESS_HEIGHT);
    const fitnessCanvas = new OffscreenCanvas(FITNESS_WIDTH, FITNESS_HEIGHT);
    const currentMSE = evaluateSolution(solution, fitnessCanvas, targetPixels);

    const state = {
      solution,
      currentMSE,
      bestSolution: solution,
      bestMSE: currentMSE,
      iteration: 0,
      numIterations,
      initialTemp,
      batchSize,
      targetPixels,
      fitnessCanvas,
      scores: [currentMSE],
    };

    renderPolygons(document.getElementById('polygon-canvas'), state.solution, FITNESS_WIDTH, FITNESS_HEIGHT);
    requestAnimationFrame(() => runBatch(state));
  });
}

function loadTargetImage(src, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = new OffscreenCanvas(FITNESS_WIDTH, FITNESS_HEIGHT);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, FITNESS_WIDTH, FITNESS_HEIGHT);
    const targetPixels = ctx.getImageData(0, 0, FITNESS_WIDTH, FITNESS_HEIGHT).data;
    callback(targetPixels);
  };
  img.src = src;
}

function evaluateSolution(solution, offscreenCanvas, targetPixels) {
  const ctx = offscreenCanvas.getContext('2d');
  ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  drawPolygons(ctx, solution);
  const rendered = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height).data;
  return computeMSE(rendered, targetPixels);
}

function drawPolygons(ctx, solution) {
  for (const poly of solution) {
    ctx.fillStyle = `rgba(${poly.color.r},${poly.color.g},${poly.color.b},${poly.color.a})`;
    ctx.beginPath();
    ctx.moveTo(poly.vertices[0].x, poly.vertices[0].y);
    for (let i = 1; i < poly.vertices.length; i++) {
      ctx.lineTo(poly.vertices[i].x, poly.vertices[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function runBatch(state) {
  if (!running) return;

  const { batchSize, initialTemp, numIterations, targetPixels, fitnessCanvas } = state;

  for (let b = 0; b < batchSize; b++) {
    if (state.iteration >= numIterations) break;

    const temperature = geometricCooling(initialTemp, state.iteration, BETA);
    const candidate = mutateSolution(state.solution, temperature, FITNESS_WIDTH, FITNESS_HEIGHT);
    const candidateMSE = evaluateSolution(candidate, fitnessCanvas, targetPixels);

    if (annealingAcceptor(state.currentMSE, candidateMSE, temperature)) {
      state.solution = candidate;
      state.currentMSE = candidateMSE;
      if (candidateMSE < state.bestMSE) {
        state.bestSolution = candidate;
        state.bestMSE = candidateMSE;
      }
    }

    state.scores.push(state.bestMSE);
    state.iteration++;
  }

  renderPolygons(document.getElementById('polygon-canvas'), state.bestSolution, FITNESS_WIDTH, FITNESS_HEIGHT);
  renderScorePlot(document.getElementById('score-canvas'), state.scores, state.numIterations);
  updateStats(state);

  if (state.iteration < numIterations) {
    requestAnimationFrame(() => runBatch(state));
  } else {
    running = false;
    document.getElementById('start').textContent = 'Start';
  }
}

function renderPolygons(canvas, solution, solutionWidth, solutionHeight) {
  const ctx = canvas.getContext('2d');
  const scaleX = canvas.width / solutionWidth;
  const scaleY = canvas.height / solutionHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const poly of solution) {
    ctx.fillStyle = `rgba(${poly.color.r},${poly.color.g},${poly.color.b},${poly.color.a})`;
    ctx.beginPath();
    ctx.moveTo(poly.vertices[0].x * scaleX, poly.vertices[0].y * scaleY);
    for (let i = 1; i < poly.vertices.length; i++) {
      ctx.lineTo(poly.vertices[i].x * scaleX, poly.vertices[i].y * scaleY);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function renderScorePlot(canvas, scores, numIterations) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (scores.length < 2) return;

  const maxMSE = scores[0];
  const minMSE = Math.min(...scores);
  const yRange = maxMSE - minMSE || 1;

  ctx.beginPath();
  ctx.strokeStyle = '#e31f1f';
  ctx.lineWidth = 2;

  for (let i = 0; i < scores.length; i++) {
    const x = (i / numIterations) * canvas.width;
    const y = canvas.height - ((scores[i] - minMSE) / yRange) * (canvas.height * 0.9) - canvas.height * 0.05;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#333';
  ctx.font = '12px Calibri, sans-serif';
  ctx.fillText(`MSE: ${Math.round(minMSE)}`, 5, 15);
  ctx.fillText(`Max: ${Math.round(maxMSE)}`, 5, 30);
}

function updateStats(state) {
  const temperature = geometricCooling(state.initialTemp, state.iteration, BETA);
  document.getElementById('iteration-display').textContent = `${state.iteration} / ${state.numIterations}`;
  document.getElementById('mse-display').textContent = Math.round(state.bestMSE);
  document.getElementById('temp-display').textContent = temperature.toFixed(2);
}
