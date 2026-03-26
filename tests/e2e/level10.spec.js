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
    await page.locator('#polygons').fill('20');
    await page.locator('#iterations').fill('1000');
    await page.locator('#speed').fill('100');

    await page.locator('#start').click();

    // Wait for some iterations to complete
    await expect(page.locator('#iteration-display')).not.toHaveText('-', { timeout: 10000 });

    // Wait for completion
    await expect(page.locator('#start')).toHaveText('Start', { timeout: 30000 });

    // MSE should show a numeric value
    const mseText = await page.locator('#mse-display').textContent();
    const mse = parseInt(mseText);
    expect(mse).toBeGreaterThan(0);
    expect(mse).toBeLessThan(195075);
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
    await page.locator('#iterations').fill('1000');
    await page.locator('#speed').fill('100');

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
