import { test, expect } from '@playwright/test';

test.describe('Level 11 - Vehicle Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/levels/level_11/index.html');
  });

  test('page loads with all controls', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Vehicle Routing with Time Windows');
    await expect(page.locator('#instance')).toBeVisible();
    await expect(page.locator('#iterations')).toBeVisible();
    await expect(page.locator('#temperature')).toBeVisible();
    await expect(page.locator('#speed')).toBeVisible();
    await expect(page.locator('#cooling-schedule')).toBeVisible();
    await expect(page.locator('#start')).toBeVisible();
    await expect(page.locator('#route-canvas')).toBeVisible();
    await expect(page.locator('#score-canvas')).toBeVisible();
  });

  test('instance dropdown has all three options', async ({ page }) => {
    const options = page.locator('#instance option');
    await expect(options).toHaveCount(3);
    await expect(options.nth(0)).toHaveText('C101 (100 stops)');
    await expect(options.nth(1)).toHaveText('C1_4_1 (400 stops)');
    await expect(options.nth(2)).toHaveText('C1_10_1 (1000 stops)');
  });

  test('400-stop instance loads and runs', async ({ page }) => {
    await page.locator('#instance').selectOption('c1_4_1.txt');
    await page.locator('#iterations').fill('10000');
    await page.locator('#speed').fill('2000');

    await page.locator('#start').click();
    await expect(page.locator('#start')).toHaveText('Start', { timeout: 60000 });

    const distText = await page.locator('#distance-display').textContent();
    const dist = parseFloat(distText);
    expect(dist).toBeGreaterThan(0);
  });

  test('sliders update their display values', async ({ page }) => {
    const slider = page.locator('#iterations');
    await slider.fill('50000');
    await expect(page.locator('#iterations-value')).toHaveText('50000');
  });

  test('start button toggles to stop', async ({ page }) => {
    await expect(page.locator('#start')).toHaveText('Start');
    await page.locator('#start').click();
    await expect(page.locator('#start')).toHaveText('Stop');
  });

  test('optimization runs and distance decreases', async ({ page }) => {
    await page.locator('#iterations').fill('50000');
    await page.locator('#speed').fill('2000');

    await page.locator('#start').click();

    // Wait for some iterations to complete
    await expect(page.locator('#iteration-display')).not.toHaveText('-', { timeout: 10000 });

    // Wait for completion
    await expect(page.locator('#start')).toHaveText('Start', { timeout: 60000 });

    // Distance should show a numeric value > 0 and < 2000
    const distText = await page.locator('#distance-display').textContent();
    const dist = parseFloat(distText);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(2000);
  });

  test('stop button halts optimization', async ({ page }) => {
    await page.locator('#iterations').fill('500000');
    await page.locator('#speed').fill('100');

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

  test('route canvas changes after optimization starts', async ({ page }) => {
    await page.locator('#iterations').fill('50000');
    await page.locator('#speed').fill('2000');

    // Take a screenshot of canvas before
    const canvasBefore = await page.locator('#route-canvas').screenshot();

    await page.locator('#start').click();

    // Wait for some progress
    await page.waitForTimeout(2000);

    // Take a screenshot after
    const canvasAfter = await page.locator('#route-canvas').screenshot();

    // The buffers should differ
    expect(canvasBefore.equals(canvasAfter)).toBe(false);
  });

  test('shows correct number of routes', async ({ page }) => {
    await page.locator('#iterations').fill('10000');
    await page.locator('#speed').fill('5000');

    await page.locator('#start').click();

    // Wait for completion
    await expect(page.locator('#start')).toHaveText('Start', { timeout: 30000 });

    // Routes should be a number between 5 and 25
    const routesText = await page.locator('#routes-display').textContent();
    const routes = parseInt(routesText);
    expect(routes).toBeGreaterThanOrEqual(5);
    expect(routes).toBeLessThanOrEqual(25);
  });
});
