# Level 10: Mona Lisa Polygon Approximation - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a level where simulated annealing approximates the Mona Lisa using semi-transparent polygons, with live rendering on the left panel and a fitness (MSE) plot on the right panel.

**Architecture:** The solution is an array of 50 semi-transparent triangles. Each iteration, a forager mutates one polygon (change color or move vertex), renders the candidate to an offscreen canvas, computes MSE against a downscaled (64x96) target image, and an annealing acceptor decides whether to keep the mutation. The left canvas shows the current polygon rendering at display resolution; the right canvas plots MSE over time. Uses geometric cooling schedule (T_{i+1} = beta * T_i).

**Tech Stack:** Vanilla JS (ES modules), HTML5 Canvas, Vite (dev server + static serving), Vitest (unit tests), Playwright (e2e tests)

---

## File Structure

```
metaheuristics-game/
  package.json                          # NEW - vite, vitest, playwright
  vite.config.js                        # NEW - configure root as src/
  playwright.config.js                  # NEW - playwright config
  src/
    levels/
      level_10/
        index.html                      # NEW - page layout
        styles.css                      # NEW - level styles
        main.js                         # NEW - orchestration, render loop
        polygon.js                      # NEW - polygon data structures + mutation
        fitness.js                      # NEW - MSE computation
        annealing.js                    # NEW - cooling schedule + acceptor
        mona.jpg                        # EXISTS - target image
  tests/
    unit/
      polygon.test.js                   # NEW - polygon creation + mutation tests
      fitness.test.js                   # NEW - MSE computation tests
      annealing.test.js                 # NEW - cooling + acceptor tests
    e2e/
      level10.spec.js                   # NEW - playwright e2e tests
```

---

### Task 1: Project Tooling Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `playwright.config.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "metaheuristics-game",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "npx playwright test"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "vitest": "^3.0.0",
    "@playwright/test": "^1.50.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  publicDir: false,
  build: {
    outDir: '../dist',
  },
  test: {
    include: ['../tests/unit/**/*.test.js'],
  },
});
```

- [ ] **Step 3: Create playwright.config.js**

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npx vite --port 5174 src',
    port: 5174,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:5174',
  },
});
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: `node_modules` created, lock file generated.

- [ ] **Step 5: Install Playwright browsers**

Run: `npx playwright install chromium`
Expected: Chromium downloaded.

- [ ] **Step 6: Verify vite serves existing levels**

Run: `npx vite src --port 5174 &` then open `http://localhost:5174/levels/level_01/index.html` mentally (or curl).
Run: `curl -s http://localhost:5174/levels/level_01/index.html | head -5`
Expected: HTML content of level_01.
Then kill the server: `kill %1`

- [ ] **Step 7: Commit**

```bash
git add package.json vite.config.js playwright.config.js package-lock.json
git commit -m "chore: add vite, vitest, and playwright tooling"
```

---

### Task 2: Polygon Data Structures and Mutation

**Files:**
- Create: `src/levels/level_10/polygon.js`
- Create: `tests/unit/polygon.test.js`

- [ ] **Step 1: Write failing tests for polygon creation**

Create `tests/unit/polygon.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createRandomPolygon, createRandomSolution } from '../../src/levels/level_10/polygon.js';

describe('createRandomPolygon', () => {
  it('returns a polygon with 3 vertices and RGBA color', () => {
    const poly = createRandomPolygon(64, 96);
    expect(poly.vertices).toHaveLength(3);
    for (const v of poly.vertices) {
      expect(v.x).toBeGreaterThanOrEqual(0);
      expect(v.x).toBeLessThanOrEqual(64);
      expect(v.y).toBeGreaterThanOrEqual(0);
      expect(v.y).toBeLessThanOrEqual(96);
    }
    expect(poly.color.r).toBeGreaterThanOrEqual(0);
    expect(poly.color.r).toBeLessThanOrEqual(255);
    expect(poly.color.g).toBeGreaterThanOrEqual(0);
    expect(poly.color.g).toBeLessThanOrEqual(255);
    expect(poly.color.b).toBeGreaterThanOrEqual(0);
    expect(poly.color.b).toBeLessThanOrEqual(255);
    expect(poly.color.a).toBeGreaterThanOrEqual(0.05);
    expect(poly.color.a).toBeLessThanOrEqual(0.9);
  });
});

describe('createRandomSolution', () => {
  it('creates the requested number of polygons', () => {
    const solution = createRandomSolution(50, 64, 96);
    expect(solution).toHaveLength(50);
    for (const poly of solution) {
      expect(poly.vertices).toHaveLength(3);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/polygon.test.js`
Expected: FAIL - module not found.

- [ ] **Step 3: Implement polygon creation**

Create `src/levels/level_10/polygon.js`:

```js
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function createRandomPolygon(width, height) {
  return {
    vertices: [
      { x: randFloat(0, width), y: randFloat(0, height) },
      { x: randFloat(0, width), y: randFloat(0, height) },
      { x: randFloat(0, width), y: randFloat(0, height) },
    ],
    color: {
      r: randInt(0, 255),
      g: randInt(0, 255),
      b: randInt(0, 255),
      a: randFloat(0.05, 0.9),
    },
  };
}

export function createRandomSolution(numPolygons, width, height) {
  const solution = [];
  for (let i = 0; i < numPolygons; i++) {
    solution.push(createRandomPolygon(width, height));
  }
  return solution;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/polygon.test.js`
Expected: PASS

- [ ] **Step 5: Write failing tests for mutation**

Append to `tests/unit/polygon.test.js`:

```js
import { mutateSolution, cloneSolution } from '../../src/levels/level_10/polygon.js';

describe('cloneSolution', () => {
  it('deep clones so mutations do not affect original', () => {
    const original = createRandomSolution(5, 64, 96);
    const clone = cloneSolution(original);
    clone[0].vertices[0].x = -999;
    expect(original[0].vertices[0].x).not.toBe(-999);
  });
});

describe('mutateSolution', () => {
  it('returns a new solution that differs from the original', () => {
    const original = createRandomSolution(50, 64, 96);
    const mutated = mutateSolution(original, 100, 64, 96);
    expect(mutated).toHaveLength(50);
    // At least one polygon should differ (with very high probability)
    const changed = mutated.some((poly, i) => {
      const orig = original[i];
      return (
        poly.color.r !== orig.color.r ||
        poly.color.g !== orig.color.g ||
        poly.color.b !== orig.color.b ||
        poly.color.a !== orig.color.a ||
        poly.vertices.some((v, j) => v.x !== orig.vertices[j].x || v.y !== orig.vertices[j].y)
      );
    });
    expect(changed).toBe(true);
  });

  it('does not mutate the input solution', () => {
    const original = createRandomSolution(10, 64, 96);
    const snapshot = JSON.stringify(original);
    mutateSolution(original, 100, 64, 96);
    expect(JSON.stringify(original)).toBe(snapshot);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run tests/unit/polygon.test.js`
Expected: FAIL - `mutateSolution` and `cloneSolution` not found.

- [ ] **Step 7: Implement cloneSolution and mutateSolution**

Append to `src/levels/level_10/polygon.js`:

```js
export function cloneSolution(solution) {
  return solution.map((poly) => ({
    vertices: poly.vertices.map((v) => ({ x: v.x, y: v.y })),
    color: { ...poly.color },
  }));
}

export function mutateSolution(solution, temperature, width, height) {
  const clone = cloneSolution(solution);
  const polyIndex = randInt(0, clone.length - 1);
  const poly = clone[polyIndex];

  // 50/50: mutate color or mutate a vertex
  if (Math.random() < 0.5) {
    // Mutate color
    const channel = randInt(0, 3); // r, g, b, a
    if (channel < 3) {
      const channels = ['r', 'g', 'b'];
      const delta = Math.round((Math.random() * 2 - 1) * Math.min(temperature, 255));
      poly.color[channels[channel]] = Math.max(0, Math.min(255, poly.color[channels[channel]] + delta));
    } else {
      const delta = (Math.random() * 2 - 1) * Math.min(temperature / 255, 0.5);
      poly.color.a = Math.max(0.05, Math.min(0.9, poly.color.a + delta));
    }
  } else {
    // Mutate a vertex
    const vertIndex = randInt(0, poly.vertices.length - 1);
    const scale = Math.min(temperature / 10, Math.max(width, height));
    poly.vertices[vertIndex].x = Math.max(0, Math.min(width, poly.vertices[vertIndex].x + (Math.random() * 2 - 1) * scale));
    poly.vertices[vertIndex].y = Math.max(0, Math.min(height, poly.vertices[vertIndex].y + (Math.random() * 2 - 1) * scale));
  }

  return clone;
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run tests/unit/polygon.test.js`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/levels/level_10/polygon.js tests/unit/polygon.test.js
git commit -m "feat(level10): add polygon data structures and mutation"
```

---

### Task 3: Fitness (MSE) Computation

**Files:**
- Create: `src/levels/level_10/fitness.js`
- Create: `tests/unit/fitness.test.js`

- [ ] **Step 1: Write failing tests for MSE computation**

Create `tests/unit/fitness.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { computeMSE } from '../../src/levels/level_10/fitness.js';

describe('computeMSE', () => {
  it('returns 0 for identical pixel arrays', () => {
    const pixels = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
    expect(computeMSE(pixels, pixels)).toBe(0);
  });

  it('computes correct MSE for known difference', () => {
    // 1 pixel: rendered = (100, 100, 100, 255), target = (200, 200, 200, 255)
    const rendered = new Uint8ClampedArray([100, 100, 100, 255]);
    const target = new Uint8ClampedArray([200, 200, 200, 255]);
    // MSE = ((200-100)^2 + (200-100)^2 + (200-100)^2) / 1 pixel = 30000
    expect(computeMSE(rendered, target)).toBe(30000);
  });

  it('computes MSE across multiple pixels', () => {
    // 2 pixels
    const rendered = new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255]);
    const target = new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255]);
    // pixel1: 100 + 400 + 900 = 1400
    // pixel2: 1600 + 2500 + 3600 = 7700
    // MSE = (1400 + 7700) / 2 = 4550
    expect(computeMSE(rendered, target)).toBe(4550);
  });

  it('ignores alpha channel', () => {
    const rendered = new Uint8ClampedArray([100, 100, 100, 0]);
    const target = new Uint8ClampedArray([100, 100, 100, 255]);
    expect(computeMSE(rendered, target)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/fitness.test.js`
Expected: FAIL - module not found.

- [ ] **Step 3: Implement MSE computation**

Create `src/levels/level_10/fitness.js`:

```js
export function computeMSE(renderedPixels, targetPixels) {
  const numPixels = renderedPixels.length / 4;
  let sum = 0;
  for (let i = 0; i < renderedPixels.length; i += 4) {
    const dr = renderedPixels[i] - targetPixels[i];
    const dg = renderedPixels[i + 1] - targetPixels[i + 1];
    const db = renderedPixels[i + 2] - targetPixels[i + 2];
    sum += dr * dr + dg * dg + db * db;
  }
  return sum / numPixels;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/fitness.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/levels/level_10/fitness.js tests/unit/fitness.test.js
git commit -m "feat(level10): add MSE fitness computation"
```

---

### Task 4: Annealing (Cooling Schedule + Acceptor)

**Files:**
- Create: `src/levels/level_10/annealing.js`
- Create: `tests/unit/annealing.test.js`

- [ ] **Step 1: Write failing tests for cooling and acceptor**

Create `tests/unit/annealing.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { geometricCooling, annealingAcceptor } from '../../src/levels/level_10/annealing.js';

describe('geometricCooling', () => {
  it('returns initialTemp on iteration 0', () => {
    expect(geometricCooling(1000, 0, 0.99999)).toBe(1000);
  });

  it('temperature decreases over iterations', () => {
    const t0 = geometricCooling(1000, 0, 0.99999);
    const t1000 = geometricCooling(1000, 1000, 0.99999);
    const t10000 = geometricCooling(1000, 10000, 0.99999);
    expect(t1000).toBeLessThan(t0);
    expect(t10000).toBeLessThan(t1000);
  });

  it('temperature is always positive', () => {
    const t = geometricCooling(1000, 1000000, 0.99999);
    expect(t).toBeGreaterThan(0);
  });
});

describe('annealingAcceptor', () => {
  it('always accepts improvements (lower MSE)', () => {
    expect(annealingAcceptor(5000, 4000, 100)).toBe(true);
    expect(annealingAcceptor(5000, 0, 100)).toBe(true);
  });

  it('always accepts equal fitness', () => {
    expect(annealingAcceptor(5000, 5000, 100)).toBe(true);
  });

  it('may accept worse solutions at high temperature', () => {
    // At very high temp, exp(-delta/T) is close to 1, so almost always accepts
    let accepted = 0;
    for (let i = 0; i < 1000; i++) {
      if (annealingAcceptor(5000, 5001, 1000000)) accepted++;
    }
    expect(accepted).toBeGreaterThan(900);
  });

  it('rarely accepts much worse solutions at low temperature', () => {
    // At very low temp with big delta, almost never accepts
    let accepted = 0;
    for (let i = 0; i < 1000; i++) {
      if (annealingAcceptor(5000, 50000, 0.001)) accepted++;
    }
    expect(accepted).toBeLessThan(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/annealing.test.js`
Expected: FAIL - module not found.

- [ ] **Step 3: Implement cooling schedule and acceptor**

Create `src/levels/level_10/annealing.js`:

```js
export function geometricCooling(initialTemp, iteration, beta) {
  return initialTemp * Math.pow(beta, iteration);
}

export function annealingAcceptor(currentMSE, candidateMSE, temperature) {
  const delta = candidateMSE - currentMSE;
  if (delta <= 0) return true;
  return Math.random() < Math.exp(-delta / temperature);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/annealing.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/levels/level_10/annealing.js tests/unit/annealing.test.js
git commit -m "feat(level10): add geometric cooling schedule and annealing acceptor"
```

---

### Task 5: HTML + CSS Layout

**Files:**
- Create: `src/levels/level_10/index.html`
- Create: `src/levels/level_10/styles.css`

- [ ] **Step 1: Create the HTML page**

Create `src/levels/level_10/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Level 10 - Mona Lisa Polygons</title>
    <script src="main.js" type="module"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
<h1>Paintings from Polygons</h1>
<div class="layout">
    <div class="controls">
        <label for="polygons">Polygons: <span id="polygons-value">50</span></label>
        <input type="range" id="polygons" min="10" max="200" value="50" step="10">

        <label for="iterations">Iterations: <span id="iterations-value">5000</span></label>
        <input type="range" id="iterations" min="500" max="50000" value="5000" step="500">

        <label for="temperature">Initial Temp: <span id="temperature-value">1000</span></label>
        <input type="range" id="temperature" min="100" max="5000" value="1000" step="100">

        <label for="speed">Batch size: <span id="speed-value">10</span></label>
        <input type="range" id="speed" min="1" max="100" value="10" step="1">

        <button id="start">Start</button>

        <p>Iteration: <span id="iteration-display">-</span></p>
        <p>Best MSE: <span id="mse-display">-</span></p>
        <p>Temperature: <span id="temp-display">-</span></p>
    </div>
    <div class="canvases">
        <div class="canvas-tile">
            <div>Polygon Approximation</div>
            <canvas id="polygon-canvas" width="320" height="480"></canvas>
        </div>
        <div class="canvas-tile">
            <div>Fitness (MSE)</div>
            <canvas id="score-canvas" width="480" height="480"></canvas>
        </div>
    </div>
</div>
</body>
</html>
```

- [ ] **Step 2: Create the CSS**

Create `src/levels/level_10/styles.css`:

```css
h1 {
    font-family: Calibri, sans-serif;
}

.layout {
    display: flex;
    gap: 2rem;
}

.controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 180px;
    font-family: Calibri, sans-serif;
}

.controls input[type="range"] {
    width: 180px;
}

.controls p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
}

.canvases {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.canvas-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Calibri, sans-serif;
}

#polygon-canvas {
    border: 2px solid #cbd5e1;
    background-color: #000;
    border-radius: 0.75rem;
    width: 320px;
    height: 480px;
}

#score-canvas {
    border: 2px solid #cbd5e1;
    background-color: #f8fafc;
    border-radius: 0.75rem;
    width: 480px;
    height: 480px;
}
```

- [ ] **Step 3: Verify the page loads in the browser**

Run: `npx vite src --port 5174 &`
Run: `curl -s http://localhost:5174/levels/level_10/index.html | grep "<title>"`
Expected: `<title>Level 10 - Mona Lisa Polygons</title>`
Then: `kill %1`

- [ ] **Step 4: Commit**

```bash
git add src/levels/level_10/index.html src/levels/level_10/styles.css
git commit -m "feat(level10): add HTML layout and styles"
```

---

### Task 6: Main Orchestration (Render Loop)

**Files:**
- Create: `src/levels/level_10/main.js`

This is the main file that ties everything together. It loads the target image, sets up the UI, and runs the simulated annealing loop.

- [ ] **Step 1: Implement main.js**

Create `src/levels/level_10/main.js`:

```js
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
  // Draw black background to match display canvas
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

  // Update display
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

  // Axis labels
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
```

- [ ] **Step 2: Manual verification - open in browser**

Run: `npx vite src --port 5174 &`
Navigate to `http://localhost:5174/levels/level_10/index.html`.
Click "Start", verify:
- Left canvas shows colored polygons that evolve over time
- Right canvas shows a decreasing MSE plot
- Stats update in the sidebar
Then: `kill %1`

- [ ] **Step 3: Commit**

```bash
git add src/levels/level_10/main.js
git commit -m "feat(level10): add main orchestration with simulated annealing loop"
```

---

### Task 7: Playwright E2E Tests

**Files:**
- Create: `tests/e2e/level10.spec.js`

- [ ] **Step 1: Write e2e tests**

Create `tests/e2e/level10.spec.js`:

```js
import { test, expect } from '@playwright/test';

test.describe('Level 10 - Mona Lisa Polygons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/levels/level_10/index.html');
  });

  test('page loads with all controls', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Paintings from Polygons');
    await expect(page.locator('#polygons')).toBeVisible();
    await expect(page.locator('#iterations')).toBeVisible();
    await expect(page.locator('#temperature')).toBeVisible();
    await expect(page.locator('#speed')).toBeVisible();
    await expect(page.locator('#start')).toBeVisible();
    await expect(page.locator('#polygon-canvas')).toBeVisible();
    await expect(page.locator('#score-canvas')).toBeVisible();
  });

  test('sliders update their display values', async ({ page }) => {
    const slider = page.locator('#polygons');
    await slider.fill('100');
    await expect(page.locator('#polygons-value')).toHaveText('100');
  });

  test('start button toggles to stop', async ({ page }) => {
    await expect(page.locator('#start')).toHaveText('Start');
    await page.locator('#start').click();
    await expect(page.locator('#start')).toHaveText('Stop');
  });

  test('optimization runs and MSE decreases', async ({ page }) => {
    // Use small settings for fast test
    await page.locator('#polygons').fill('20');
    await page.locator('#iterations').fill('500');
    await page.locator('#speed').fill('50');

    await page.locator('#start').click();

    // Wait for some iterations to complete
    await expect(page.locator('#iteration-display')).not.toHaveText('-', { timeout: 10000 });

    // Wait for completion
    await expect(page.locator('#start')).toHaveText('Start', { timeout: 30000 });

    // MSE should show a numeric value
    const mseText = await page.locator('#mse-display').textContent();
    const mse = parseInt(mseText);
    expect(mse).toBeGreaterThan(0);
    expect(mse).toBeLessThan(195075); // max possible MSE
  });

  test('stop button halts optimization', async ({ page }) => {
    await page.locator('#polygons').fill('20');
    await page.locator('#iterations').fill('50000');
    await page.locator('#speed').fill('10');

    await page.locator('#start').click();
    await expect(page.locator('#start')).toHaveText('Stop');

    // Wait a moment for some iterations
    await page.waitForTimeout(500);

    // Click stop
    await page.locator('#start').click();
    await expect(page.locator('#start')).toHaveText('Start');

    // Record iteration count
    const iterText1 = await page.locator('#iteration-display').textContent();

    // Wait and verify it didn't advance
    await page.waitForTimeout(500);
    const iterText2 = await page.locator('#iteration-display').textContent();
    expect(iterText1).toBe(iterText2);
  });

  test('polygon canvas is not blank after optimization starts', async ({ page }) => {
    await page.locator('#polygons').fill('20');
    await page.locator('#iterations').fill('500');
    await page.locator('#speed').fill('50');

    // Take a screenshot of canvas before
    const canvasBefore = await page.locator('#polygon-canvas').screenshot();

    await page.locator('#start').click();

    // Wait for some progress
    await page.waitForTimeout(2000);

    // Take a screenshot after
    const canvasAfter = await page.locator('#polygon-canvas').screenshot();

    // The buffers should differ (canvas is no longer just black)
    expect(canvasBefore.equals(canvasAfter)).toBe(false);
  });
});
```

- [ ] **Step 2: Run e2e tests**

Run: `npx playwright test --project=chromium`
Expected: All 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/level10.spec.js
git commit -m "test(level10): add playwright e2e tests"
```

---

### Task 8: Run All Tests and Final Verification

- [ ] **Step 1: Run all unit tests**

Run: `npx vitest run`
Expected: All unit tests in `tests/unit/` pass.

- [ ] **Step 2: Run all e2e tests**

Run: `npx playwright test`
Expected: All e2e tests pass.

- [ ] **Step 3: Manual smoke test**

Run: `npx vite src --port 5174`
Open `http://localhost:5174/levels/level_10/index.html` in browser.
Verify:
- Left panel shows evolving polygon approximation of the Mona Lisa
- Right panel shows MSE decreasing over time
- Controls (sliders, start/stop) all work
- After many iterations, the left panel visibly resembles the Mona Lisa

- [ ] **Step 4: Final commit if any tweaks were needed**

```bash
git add -A
git commit -m "chore(level10): final polish"
```
