import { describe, it, expect } from 'vitest';
import { geometricCooling, computeBeta, annealingAcceptor } from '../../src/levels/level_10/annealing.js';

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

describe('computeBeta', () => {
  it('produces a beta that cools to near-zero by numIterations', () => {
    const beta = computeBeta(1000, 200000);
    const finalTemp = geometricCooling(1000, 200000, beta);
    expect(finalTemp).toBeCloseTo(0.01, 1);
  });

  it('produces a beta between 0 and 1', () => {
    const beta = computeBeta(500, 100000);
    expect(beta).toBeGreaterThan(0);
    expect(beta).toBeLessThan(1);
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
    let accepted = 0;
    for (let i = 0; i < 1000; i++) {
      if (annealingAcceptor(5000, 5001, 1000000)) accepted++;
    }
    expect(accepted).toBeGreaterThan(900);
  });

  it('rarely accepts much worse solutions at low temperature', () => {
    let accepted = 0;
    for (let i = 0; i < 1000; i++) {
      if (annealingAcceptor(5000, 50000, 0.001)) accepted++;
    }
    expect(accepted).toBeLessThan(10);
  });
});
