import { describe, it, expect } from 'vitest';
import { createRandomPolygon, createRandomSolution, cloneSolution, mutateSolution } from '../../src/levels/level_10/polygon.js';

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
  it('returns a new solution that differs from the original', () => {
    const original = createRandomSolution(50, 64, 96);
    const mutated = mutateSolution(original, 100, 64, 96);
    expect(mutated).toHaveLength(50);
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
