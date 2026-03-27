import { describe, it, expect } from 'vitest';
import { hillClimb } from '../../src/strategies/forager/hill-climb.js';
import { adaptiveForager } from '../../src/strategies/forager/adaptive.js';

describe('hillClimb', () => {
  it('returns a value within bounds', () => {
    for (let i = 0; i < 100; i++) {
      const result = hillClimb(9, 5);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(10);
    }
  });

  it('steps by exactly stepSize when within bounds', () => {
    for (let i = 0; i < 100; i++) {
      const result = hillClimb(0, 2);
      expect(Math.abs(result)).toBe(2);
    }
  });

  it('clamps at upper bound', () => {
    for (let i = 0; i < 100; i++) {
      const result = hillClimb(9, 5);
      expect(result === 4 || result === 10).toBe(true);
    }
  });

  it('clamps at lower bound', () => {
    for (let i = 0; i < 100; i++) {
      const result = hillClimb(-9, 5);
      expect(result === -10 || result === -4).toBe(true);
    }
  });

  it('respects custom bounds', () => {
    for (let i = 0; i < 100; i++) {
      const result = hillClimb(4, 3, 0, 5);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(5);
    }
  });
});

describe('adaptiveForager', () => {
  it('returns a value within bounds', () => {
    for (let i = 0; i < 100; i++) {
      const result = adaptiveForager(9, 10, 0);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(10);
    }
  });

  it('shrinks step size with progress', () => {
    const resultsEarly = [];
    const resultsLate = [];
    for (let i = 0; i < 200; i++) {
      resultsEarly.push(Math.abs(adaptiveForager(0, 10, 0.1) - 0));
      resultsLate.push(Math.abs(adaptiveForager(0, 10, 0.9) - 0));
    }
    const avgEarly = resultsEarly.reduce((a, b) => a + b) / resultsEarly.length;
    const avgLate = resultsLate.reduce((a, b) => a + b) / resultsLate.length;
    expect(avgEarly).toBeGreaterThan(avgLate);
  });

  it('returns current position at progress=1', () => {
    for (let i = 0; i < 10; i++) {
      const result = adaptiveForager(5, 10, 1);
      expect(result).toBe(5);
    }
  });

  it('respects custom bounds', () => {
    for (let i = 0; i < 100; i++) {
      const result = adaptiveForager(4, 10, 0, 0, 5);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(5);
    }
  });
});
