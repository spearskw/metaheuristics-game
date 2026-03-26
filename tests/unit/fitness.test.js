import { describe, it, expect } from 'vitest';
import { computeMSE } from '../../src/levels/level_10/fitness.js';

describe('computeMSE', () => {
  it('returns 0 for identical pixel arrays', () => {
    const pixels = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
    expect(computeMSE(pixels, pixels)).toBe(0);
  });

  it('computes correct MSE for known difference', () => {
    const rendered = new Uint8ClampedArray([100, 100, 100, 255]);
    const target = new Uint8ClampedArray([200, 200, 200, 255]);
    // MSE = ((200-100)^2 * 3) / 1 pixel = 30000
    expect(computeMSE(rendered, target)).toBe(30000);
  });

  it('computes MSE across multiple pixels', () => {
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
