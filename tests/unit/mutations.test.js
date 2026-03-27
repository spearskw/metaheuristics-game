import { describe, it, expect } from 'vitest';
import { INSTANCE_TEXT } from './cvrptw.test.js';
import {
  parseInstance,
  computeDistanceMatrix,
  isRouteFeasible,
  buildGreedySolution,
} from '../../src/levels/level_11/cvrptw.js';
import {
  mutateSolution,
  undoMutation,
} from '../../src/levels/level_11/mutations.js';

const VALID_TYPES = new Set(['relocate', 'swap', '2opt', 'oropt', 'noop']);

function setup() {
  const instance = parseInstance(INSTANCE_TEXT);
  const dist = computeDistanceMatrix(instance.customers);
  const routes = buildGreedySolution(instance, dist);
  return { instance, dist, routes };
}

function countCustomers(routes) {
  const ids = new Set();
  for (const r of routes) {
    for (const c of r) ids.add(c);
  }
  return ids.size;
}

describe('mutations', () => {
  it('mutateSolution returns undo info with a recognized type', () => {
    const { instance, dist, routes } = setup();
    const undo = mutateSolution(routes, instance, dist);
    expect(VALID_TYPES.has(undo.type)).toBe(true);
  });

  it('total customer count remains 100 after mutation', () => {
    const { instance, dist, routes } = setup();
    const before = countCustomers(routes);
    expect(before).toBe(100);
    mutateSolution(routes, instance, dist);
    const after = countCustomers(routes);
    expect(after).toBe(100);
  });

  it('all routes remain feasible after 100 mutations in sequence', () => {
    const { instance, dist, routes } = setup();
    for (let i = 0; i < 100; i++) {
      mutateSolution(routes, instance, dist);
      for (const route of routes) {
        expect(isRouteFeasible(route, instance, dist)).toBe(true);
      }
    }
  });

  it('can be undone to restore EXACT original state (50 trials)', () => {
    const { instance, dist, routes } = setup();
    for (let trial = 0; trial < 50; trial++) {
      const snapshot = JSON.stringify(routes);
      const undo = mutateSolution(routes, instance, dist);
      undoMutation(routes, undo);
      expect(JSON.stringify(routes)).toBe(snapshot);
    }
  });

  it('no empty routes exist after mutation', () => {
    const { instance, dist, routes } = setup();
    for (let i = 0; i < 100; i++) {
      mutateSolution(routes, instance, dist);
      for (const route of routes) {
        expect(route.length).toBeGreaterThan(0);
      }
    }
  });
});
