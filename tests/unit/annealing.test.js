import { describe, it, expect } from 'vitest';
import {
  geometricCooling,
  linearCooling,
  linearReheatCooling,
  cosineCooling,
  annealingAcceptor,
} from '../../src/levels/level_10/annealing.js';

describe('geometricCooling', () => {
  it('returns initialTemp on iteration 0', () => {
    expect(geometricCooling(1000, 0, 200000)).toBe(1000);
  });

  it('temperature decreases monotonically', () => {
    const t0 = geometricCooling(1000, 0, 200000);
    const tMid = geometricCooling(1000, 100000, 200000);
    const tEnd = geometricCooling(1000, 200000, 200000);
    expect(tMid).toBeLessThan(t0);
    expect(tEnd).toBeLessThan(tMid);
  });

  it('reaches near-zero by numIterations', () => {
    const t = geometricCooling(1000, 200000, 200000);
    expect(t).toBeLessThan(0.1);
    expect(t).toBeGreaterThan(0);
  });
});

describe('linearCooling', () => {
  it('returns initialTemp on iteration 0', () => {
    expect(linearCooling(1000, 0, 200000)).toBe(1000);
  });

  it('returns 0 at numIterations', () => {
    expect(linearCooling(1000, 200000, 200000)).toBe(0);
  });

  it('decreases monotonically', () => {
    const t1 = linearCooling(1000, 50000, 200000);
    const t2 = linearCooling(1000, 100000, 200000);
    const t3 = linearCooling(1000, 150000, 200000);
    expect(t2).toBeLessThan(t1);
    expect(t3).toBeLessThan(t2);
  });

  it('drops fast (power-law decay)', () => {
    // At 50% progress, should be well below 50% of initial (unlike pure linear)
    const tMid = linearCooling(1000, 100000, 200000);
    expect(tMid).toBeLessThan(100); // (0.5)^6 * 1000 = 15.6
  });
});

describe('linearReheatCooling', () => {
  it('returns initialTemp on iteration 0', () => {
    expect(linearReheatCooling(1000, 0, 200000)).toBe(1000);
  });

  it('reheats after each epoch', () => {
    const epochLen = 200000 / 8;
    // End of first epoch: near 0
    const endEpoch1 = linearReheatCooling(1000, epochLen - 1, 200000);
    expect(endEpoch1).toBeLessThan(1);
    // Start of second epoch: peak at 1/3
    const startEpoch2 = linearReheatCooling(1000, epochLen, 200000);
    expect(startEpoch2).toBeCloseTo(1000 / 3, 0);
    expect(startEpoch2).toBeGreaterThan(endEpoch1);
  });

  it('later epochs have lower peak temperature', () => {
    const epochLen = 200000 / 8;
    const peak1 = linearReheatCooling(1000, 0, 200000);
    const peak2 = linearReheatCooling(1000, epochLen, 200000);
    const peak3 = linearReheatCooling(1000, epochLen * 2, 200000);
    expect(peak2).toBeLessThan(peak1);
    expect(peak3).toBeLessThan(peak2);
  });
});

describe('cosineCooling', () => {
  it('returns initialTemp on iteration 0', () => {
    expect(cosineCooling(1000, 0, 200000)).toBe(1000);
  });

  it('returns 0 at numIterations', () => {
    expect(cosineCooling(1000, 200000, 200000)).toBeCloseTo(0);
  });

  it('decreases monotonically (non-oscillating)', () => {
    let prev = cosineCooling(1000, 0, 200000);
    for (let i = 1000; i <= 200000; i += 1000) {
      const t = cosineCooling(1000, i, 200000);
      expect(t).toBeLessThanOrEqual(prev + 0.001); // tiny float tolerance
      prev = t;
    }
  });

  it('drops faster than naive cosine (squared decay)', () => {
    // At 25% progress, cos(pi/4)=0.707, cosValue=(1+0.707)/2=0.854, squared=0.729
    // vs naive: 0.854. So squared is below 75% at 25% progress.
    const t = cosineCooling(1000, 50000, 200000);
    expect(t).toBeLessThan(750);
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

  it('rejects worse solutions when temperature is 0', () => {
    expect(annealingAcceptor(5000, 5001, 0)).toBe(false);
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
