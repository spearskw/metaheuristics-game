import { parseInstance, computeDistanceMatrix, totalDistance, buildGreedySolution } from './cvrptw.js';
import { mutateSolution, undoMutation } from './mutations.js';
import { coolingSchedules, annealingAcceptor } from '../level_10/annealing.js';

const ROUTE_COLORS = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990',
  '#dcbeff', '#9A6324', '#800000', '#aaffc3', '#808000',
  '#000075', '#a9a9a9', '#e6beff', '#ffe119', '#ffd8b1',
  '#000000', '#fffac8', '#7cb9e8', '#c19a6b', '#b284be',
];

let running = false;

window.onload = main;

function main() {
  bindSliders();
  document.getElementById('start').addEventListener('click', toggleRun);
}

function bindSliders() {
  const sliders = ['iterations', 'temperature', 'speed'];
  for (const id of sliders) {
    const slider = document.getElementById(id);
    const display = document.getElementById(id + '-value');
    slider.addEventListener('input', () => {
      display.textContent = slider.value;
    });
  }
}

async function toggleRun() {
  if (running) {
    running = false;
    document.getElementById('start').textContent = 'Start';
    return;
  }

  running = true;
  document.getElementById('start').textContent = 'Stop';

  const numIterations = parseInt(document.getElementById('iterations').value);
  const initialTemp = parseInt(document.getElementById('temperature').value);
  const batchSize = parseInt(document.getElementById('speed').value);
  const scheduleName = document.getElementById('cooling-schedule').value;
  const coolingFn = coolingSchedules[scheduleName];

  const instanceFile = document.getElementById('instance').value;
  const response = await fetch(instanceFile);
  const text = await response.text();
  const instance = parseInstance(text);
  const dist = computeDistanceMatrix(instance.customers);
  const routes = buildGreedySolution(instance, dist);
  const currentDistance = totalDistance(routes, dist);

  const state = {
    routes,
    instance,
    dist,
    currentDistance,
    bestDistance: currentDistance,
    bestRoutes: deepCopyRoutes(routes),
    iteration: 0,
    numIterations,
    initialTemp,
    coolingFn,
    batchSize,
    scores: [currentDistance],
    plotInterval: Math.max(1, Math.floor(numIterations / 1000)),
  };

  renderRoutes(document.getElementById('route-canvas'), state.routes, state.instance);
  requestAnimationFrame(() => runBatch(state));
}

function deepCopyRoutes(routes) {
  return routes.map(r => [...r]);
}

function runBatch(state) {
  if (!running) return;

  const { batchSize, initialTemp, numIterations, coolingFn, plotInterval, instance, dist } = state;

  for (let b = 0; b < batchSize; b++) {
    if (state.iteration >= numIterations) break;

    const temperature = coolingFn(initialTemp, state.iteration, numIterations);

    const undo = mutateSolution(state.routes, instance, dist);
    if (undo.type === 'noop') {
      state.iteration++;
      if (state.iteration % plotInterval === 0) {
        state.scores.push(state.bestDistance);
      }
      continue;
    }

    const candidateDistance = totalDistance(state.routes, dist);

    if (annealingAcceptor(state.currentDistance, candidateDistance, temperature)) {
      state.currentDistance = candidateDistance;
      if (candidateDistance < state.bestDistance) {
        state.bestDistance = candidateDistance;
        state.bestRoutes = deepCopyRoutes(state.routes);
      }
    } else {
      undoMutation(state.routes, undo);
    }

    state.iteration++;

    if (state.iteration % plotInterval === 0) {
      state.scores.push(state.bestDistance);
    }
  }

  renderRoutes(document.getElementById('route-canvas'), state.routes, state.instance);
  renderScorePlot(document.getElementById('score-canvas'), state.scores);
  updateStats(state);

  if (state.iteration < numIterations) {
    requestAnimationFrame(() => runBatch(state));
  } else {
    running = false;
    document.getElementById('start').textContent = 'Start';
  }
}

function renderRoutes(canvas, routes, instance) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const customers = instance.customers;

  // Compute coordinate bounds with padding
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const c of customers) {
    if (c.x < minX) minX = c.x;
    if (c.x > maxX) maxX = c.x;
    if (c.y < minY) minY = c.y;
    if (c.y > maxY) maxY = c.y;
  }

  const padding = 20;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scaleX = (canvas.width - 2 * padding) / rangeX;
  const scaleY = (canvas.height - 2 * padding) / rangeY;

  function toCanvasX(x) {
    return padding + (x - minX) * scaleX;
  }

  function toCanvasY(y) {
    // Flip Y so up is up
    return canvas.height - padding - (y - minY) * scaleY;
  }

  // Draw each route as colored lines
  for (let r = 0; r < routes.length; r++) {
    const route = routes[r];
    if (route.length === 0) continue;

    const color = ROUTE_COLORS[r % ROUTE_COLORS.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Depot to first customer
    const depot = customers[0];
    ctx.moveTo(toCanvasX(depot.x), toCanvasY(depot.y));

    for (const cid of route) {
      const c = customers[cid];
      ctx.lineTo(toCanvasX(c.x), toCanvasY(c.y));
    }

    // Last customer back to depot
    ctx.lineTo(toCanvasX(depot.x), toCanvasY(depot.y));
    ctx.stroke();
  }

  // Draw customer dots
  for (let i = 1; i < customers.length; i++) {
    const c = customers[i];
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(toCanvasX(c.x), toCanvasY(c.y), 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw depot as larger black square
  const depot = customers[0];
  const dx = toCanvasX(depot.x);
  const dy = toCanvasY(depot.y);
  ctx.fillStyle = '#000';
  ctx.fillRect(dx - 6, dy - 6, 12, 12);
}

function renderScorePlot(canvas, scores) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (scores.length < 2) return;

  const maxScore = scores[0];
  let minScore = maxScore;
  for (let i = 1; i < scores.length; i++) {
    if (scores[i] < minScore) minScore = scores[i];
  }
  const yRange = maxScore - minScore || 1;

  ctx.beginPath();
  ctx.strokeStyle = '#e31f1f';
  ctx.lineWidth = 2;

  for (let i = 0; i < scores.length; i++) {
    const x = (i / (scores.length - 1)) * canvas.width;
    const y = canvas.height - ((scores[i] - minScore) / yRange) * (canvas.height * 0.9) - canvas.height * 0.05;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#333';
  ctx.font = '12px Calibri, sans-serif';
  ctx.fillText(`Best: ${minScore.toFixed(2)}`, 5, 15);
  ctx.fillText(`Initial: ${maxScore.toFixed(2)}`, 5, 30);
}

function updateStats(state) {
  const temperature = state.coolingFn(state.initialTemp, state.iteration, state.numIterations);
  document.getElementById('iteration-display').textContent = `${state.iteration} / ${state.numIterations}`;
  document.getElementById('distance-display').textContent = state.bestDistance.toFixed(2);
  document.getElementById('routes-display').textContent = state.bestRoutes.length;
  document.getElementById('temp-display').textContent = temperature.toFixed(2);
}
