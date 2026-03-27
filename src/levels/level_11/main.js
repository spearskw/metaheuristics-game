import { parseInstance, computeDistanceMatrix, totalCost, buildGreedySolution } from './cvrptw.js';
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
  const currentCost = totalCost(routes, instance, dist);

  const state = {
    routes,
    instance,
    dist,
    currentCost: { ...currentCost },
    bestFeasibleDist: currentCost.distance, // greedy start is always feasible
    bestRoutes: deepCopyRoutes(routes),
    iteration: 0,
    numIterations,
    initialTemp,
    coolingFn,
    batchSize,
    // Track current metrics + best feasible distance over time
    distanceHistory: [currentCost.distance],
    capacityHistory: [currentCost.capacityPenalty],
    twHistory: [currentCost.twPenalty],
    bestDistHistory: [currentCost.distance],
    plotInterval: Math.max(1, Math.floor(numIterations / 1000)),
  };

  renderRoutes(document.getElementById('route-canvas'), state.routes, state.instance);
  updateStats(state);
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

    const undo = mutateSolution(state.routes);
    if (undo.type === 'noop') {
      state.iteration++;
      if (state.iteration % plotInterval === 0) {
        state.distanceHistory.push(state.currentCost.distance);
        state.capacityHistory.push(state.currentCost.capacityPenalty);
        state.twHistory.push(state.currentCost.twPenalty);
        state.bestDistHistory.push(state.bestFeasibleDist);
      }
      continue;
    }

    const candidateCost = totalCost(state.routes, instance, dist);

    if (annealingAcceptor(state.currentCost.total, candidateCost.total, temperature)) {
      state.currentCost = { ...candidateCost };
      // Track best feasible solution separately
      if (candidateCost.capacityPenalty === 0 && candidateCost.twPenalty === 0
          && candidateCost.distance < state.bestFeasibleDist) {
        state.bestFeasibleDist = candidateCost.distance;
        state.bestRoutes = deepCopyRoutes(state.routes);
      }
    } else {
      undoMutation(state.routes, undo);
    }

    state.iteration++;

    if (state.iteration % plotInterval === 0) {
      state.distanceHistory.push(state.currentCost.distance);
      state.capacityHistory.push(state.currentCost.capacityPenalty);
      state.twHistory.push(state.currentCost.twPenalty);
      state.bestDistHistory.push(state.bestFeasibleDist);
    }
  }

  renderRoutes(document.getElementById('route-canvas'), state.routes, state.instance);
  renderScorePlot(document.getElementById('score-canvas'), state);
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

  function toCanvasX(x) { return padding + (x - minX) * scaleX; }
  function toCanvasY(y) { return canvas.height - padding - (y - minY) * scaleY; }

  for (let r = 0; r < routes.length; r++) {
    const route = routes[r];
    if (route.length === 0) continue;

    const color = ROUTE_COLORS[r % ROUTE_COLORS.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const depot = customers[0];
    ctx.moveTo(toCanvasX(depot.x), toCanvasY(depot.y));
    for (const cid of route) {
      ctx.lineTo(toCanvasX(customers[cid].x), toCanvasY(customers[cid].y));
    }
    ctx.lineTo(toCanvasX(depot.x), toCanvasY(depot.y));
    ctx.stroke();
  }

  for (let i = 1; i < customers.length; i++) {
    const c = customers[i];
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(toCanvasX(c.x), toCanvasY(c.y), 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const depot = customers[0];
  ctx.fillStyle = '#000';
  ctx.fillRect(toCanvasX(depot.x) - 6, toCanvasY(depot.y) - 6, 12, 12);
}

function renderScorePlot(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const { distanceHistory, capacityHistory, twHistory, bestDistHistory } = state;
  if (distanceHistory.length < 2) return;

  // Find Y range across all series
  let maxY = 0;
  for (let i = 0; i < distanceHistory.length; i++) {
    const combined = distanceHistory[i] + capacityHistory[i] + twHistory[i];
    if (combined > maxY) maxY = combined;
  }
  if (maxY === 0) maxY = 1;

  const plotTop = 55;
  const plotH = H - plotTop - 10;

  function drawLine(data, color, lineWidth) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 1.5;
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * W;
      const y = plotTop + plotH - (data[i] / maxY) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Draw current metrics
  drawLine(capacityHistory, '#c0392b');
  drawLine(twHistory, '#e67e22');
  drawLine(distanceHistory, '#4363d8');
  // Best feasible distance on top (thick green line)
  drawLine(bestDistHistory, '#27ae60', 3);

  // Legend
  ctx.font = '12px Calibri, sans-serif';

  ctx.fillStyle = '#27ae60';
  ctx.fillText(`Best feasible: ${state.bestFeasibleDist.toFixed(1)}`, 5, 14);

  ctx.fillStyle = '#4363d8';
  ctx.fillText(`Current distance: ${state.currentCost.distance.toFixed(1)}`, 5, 28);

  ctx.fillStyle = '#c0392b';
  ctx.fillText(`Capacity (hard): ${state.currentCost.capacityPenalty.toFixed(1)}`, 5, 42);

  ctx.fillStyle = '#e67e22';
  ctx.fillText(`Time Windows (soft): ${state.currentCost.twPenalty.toFixed(1)}`, 200, 42);
}

function updateStats(state) {
  const temperature = state.coolingFn(state.initialTemp, state.iteration, state.numIterations);
  document.getElementById('iteration-display').textContent = `${state.iteration} / ${state.numIterations}`;
  document.getElementById('distance-display').textContent = state.bestFeasibleDist.toFixed(2);
  document.getElementById('capacity-penalty-display').textContent = state.currentCost.capacityPenalty.toFixed(2);
  document.getElementById('tw-penalty-display').textContent = state.currentCost.twPenalty.toFixed(2);
  document.getElementById('routes-display').textContent = state.bestRoutes.length;
  document.getElementById('temp-display').textContent = temperature.toFixed(2);
}
