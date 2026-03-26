import { describe, it, expect } from 'vitest';
import { createRandomPolygon, createRandomSolution, cloneSolution, mutateSolution, undoMutation } from '../../src/levels/level_10/polygon.js';

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

describe('cloneSolution', () => {
  it('deep clones so mutations do not affect original', () => {
    const original = createRandomSolution(5, 64, 96);
    const clone = cloneSolution(original);
    clone[0].vertices[0].x = -999;
    expect(original[0].vertices[0].x).not.toBe(-999);
  });
});

describe('mutateSolution', () => {
  it('mutates the solution in-place and returns undo info', () => {
    const solution = createRandomSolution(50, 64, 96);
    const snapshot = JSON.stringify(solution);
    const undo = mutateSolution(solution, 64, 96);
    expect(undo).toHaveProperty('type');
    expect(['color', 'vertex', 'order', 'noop']).toContain(undo.type);
    // Solution should be mutated (unless noop)
    if (undo.type !== 'noop') {
      expect(JSON.stringify(solution)).not.toBe(snapshot);
    }
  });

  it('can be undone to restore original state', () => {
    // Run many times to cover all mutation types
    for (let trial = 0; trial < 50; trial++) {
      const solution = createRandomSolution(10, 64, 96);
      const snapshot = JSON.stringify(solution);
      const undo = mutateSolution(solution, 64, 96);
      undoMutation(solution, undo);
      expect(JSON.stringify(solution)).toBe(snapshot);
    }
  });

  it('preserves solution length', () => {
    const solution = createRandomSolution(50, 64, 96);
    mutateSolution(solution, 64, 96);
    expect(solution).toHaveLength(50);
  });
});
