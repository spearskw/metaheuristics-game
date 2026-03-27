import { test, expect } from '@playwright/test';

test.describe('Level 1 - Smooth Valley', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/levels/level_01/index.html');
  });

  test('shows intro modal on load', async ({ page }) => {
    await expect(page.locator('#intro-overlay')).toBeVisible();
    await expect(page.locator('.intro h2')).toHaveText('Welcome, hiker!');
  });

  test('intro modal dismisses on OK', async ({ page }) => {
    await page.locator('#intro-ok').click();
    await expect(page.locator('#intro-overlay')).toHaveClass(/hidden/);
  });

  test('page has all controls after dismissing intro', async ({ page }) => {
    await page.locator('#intro-ok').click();
    await expect(page.locator('#strategy')).toBeVisible();
    await expect(page.locator('#stepSize')).toBeVisible();
    await expect(page.locator('#startButton')).toBeVisible();
    await expect(page.locator('#objective')).toBeVisible();
    await expect(page.locator('#score')).toBeVisible();
  });

  test('strategy help modal opens and closes', async ({ page }) => {
    await page.locator('#intro-ok').click();
    await page.locator('#strategy-help').click();
    await expect(page.locator('#strategy-overlay')).toHaveClass(/visible/);
    await page.locator('#strategy-ok').click();
    await expect(page.locator('#strategy-overlay')).not.toHaveClass(/visible/);
  });

  test('optimization runs and shows result modal', async ({ page }) => {
    await page.locator('#intro-ok').click();
    await page.locator('#stepSize').selectOption('1');
    await page.locator('#startButton').click();

    await expect(page.locator('#startButton')).toBeDisabled();

    // Wait for optimization to finish (20 steps at 200ms = ~4s)
    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 10000 });
    await expect(page.locator('#modal-result')).toBeVisible();
  });

  test('result modal shows success or failure text', async ({ page }) => {
    await page.locator('#intro-ok').click();
    await page.locator('#stepSize').selectOption('1');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 10000 });

    const text = await page.locator('#modal-result').textContent();
    expect(
      text === 'You reached the objective!' || text === "You didn't reach the objective."
    ).toBe(true);
  });

  test('try again resets the form', async ({ page }) => {
    await page.locator('#intro-ok').click();
    await page.locator('#stepSize').selectOption('1');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 10000 });
    await page.locator('#tryAgainButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'none');
    await expect(page.locator('#startButton')).toBeEnabled();
    await expect(page.locator('#stepSize')).toBeEnabled();
  });

  test('next level navigates to level 2', async ({ page }) => {
    await page.locator('#intro-ok').click();
    await page.locator('#stepSize').selectOption('1');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 10000 });
    await page.locator('#nextLevelButton').click();

    await expect(page).toHaveURL(/level_02/);
  });

  test('canvas changes after optimization starts', async ({ page }) => {
    await page.locator('#intro-ok').click();
    const before = await page.locator('#objective').screenshot();
    await page.locator('#stepSize').selectOption('1');
    await page.locator('#startButton').click();
    await page.waitForTimeout(1000);
    const after = await page.locator('#objective').screenshot();
    expect(before.equals(after)).toBe(false);
  });
});

test.describe('Level 2 - Bumpy Valley', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/levels/level_02/index.html');
  });

  test('page loads with controls', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Level 2');
    await expect(page.locator('#strategy')).toBeVisible();
    await expect(page.locator('#stepSize')).toBeVisible();
    await expect(page.locator('#startButton')).toBeVisible();
  });

  test('strategy help modal works', async ({ page }) => {
    await page.locator('#strategy-help').click();
    await expect(page.locator('#strategy-overlay')).toHaveClass(/visible/);
    await page.locator('#strategy-ok').click();
    await expect(page.locator('#strategy-overlay')).not.toHaveClass(/visible/);
  });

  test('optimization completes and shows modal', async ({ page }) => {
    await page.locator('#stepSize').selectOption('2');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 10000 });
    const text = await page.locator('#modal-result').textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('try again resets controls', async ({ page }) => {
    await page.locator('#stepSize').selectOption('1');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 10000 });
    await page.locator('#tryAgainButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'none');
    await expect(page.locator('#startButton')).toBeEnabled();
  });

  test('next level navigates to level 3', async ({ page }) => {
    await page.locator('#stepSize').selectOption('1');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 10000 });
    await page.locator('#nextLevelButton').click();

    await expect(page).toHaveURL(/level_03/);
  });
});

test.describe('Level 3 - Needle in Haystack', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/levels/level_03/index.html');
  });

  test('page loads with controls', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Level 3');
    await expect(page.locator('#strategy')).toBeVisible();
    await expect(page.locator('#stepSize')).toBeVisible();
    await expect(page.locator('#startButton')).toBeVisible();
  });

  test('optimization completes and shows modal', async ({ page }) => {
    await page.locator('#stepSize').selectOption('0.5');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 10000 });
    const text = await page.locator('#modal-result').textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('next level navigates to level 7', async ({ page }) => {
    await page.locator('#stepSize').selectOption('1');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 10000 });
    await page.locator('#nextLevelButton').click();

    await expect(page).toHaveURL(/level_07/);
  });
});

test.describe('Level 4 - Hill Climb vs Adaptive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/levels/level_04/index.html');
  });

  test('page loads with all controls', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Level 4');
    await expect(page.locator('#strategy')).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.locator('#stepSize')).toBeVisible();
    await expect(page.locator('#startButton')).toBeVisible();
  });

  test('switching to adaptive shows correct params', async ({ page }) => {
    await expect(page.locator('#hill-climb-params')).toBeVisible();
    await expect(page.locator('#adaptive-params')).toBeHidden();

    await page.locator('#strategy').selectOption('adaptive');

    await expect(page.locator('#hill-climb-params')).toBeHidden();
    await expect(page.locator('#adaptive-params')).toBeVisible();
  });

  test('switching back to hill climb restores params', async ({ page }) => {
    await page.locator('#strategy').selectOption('adaptive');
    await page.locator('#strategy').selectOption('hill-climb');

    await expect(page.locator('#hill-climb-params')).toBeVisible();
    await expect(page.locator('#adaptive-params')).toBeHidden();
  });

  test('strategy help modal shows both strategies', async ({ page }) => {
    await page.locator('#strategy-help').click();
    await expect(page.locator('#strategy-overlay')).toHaveClass(/visible/);
    await expect(page.locator('#strategy-overlay dt').first()).toHaveText('Hill Climb');
    await expect(page.locator('#strategy-overlay dt').last()).toHaveText('Adaptive');
    await page.locator('#strategy-ok').click();
    await expect(page.locator('#strategy-overlay')).not.toHaveClass(/visible/);
  });

  test('hill climb optimization completes', async ({ page }) => {
    await page.locator('#strategy').selectOption('hill-climb');
    await page.locator('#map').selectOption('smooth_valley');
    await page.locator('#stepSize').selectOption('2');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 15000 });
    const text = await page.locator('#modal-result').textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('adaptive optimization completes', async ({ page }) => {
    await page.locator('#strategy').selectOption('adaptive');
    await page.locator('#map').selectOption('smooth_valley');
    await page.locator('#initialStepSize').selectOption('10');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 15000 });
    const text = await page.locator('#modal-result').textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('can switch maps', async ({ page }) => {
    await page.locator('#map').selectOption('bumpy_valley');
    await expect(page.locator('#map')).toHaveValue('bumpy_valley');

    await page.locator('#map').selectOption('needle_in_haystack');
    await expect(page.locator('#map')).toHaveValue('needle_in_haystack');
  });

  test('try again resets all controls', async ({ page }) => {
    await page.locator('#strategy').selectOption('adaptive');
    await page.locator('#map').selectOption('bumpy_valley');
    await page.locator('#initialStepSize').selectOption('5');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 15000 });
    await page.locator('#tryAgainButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'none');
    await expect(page.locator('#startButton')).toBeEnabled();
    await expect(page.locator('#strategy')).toBeEnabled();
    await expect(page.locator('#map')).toBeEnabled();
  });

  test('next level navigates to level 7', async ({ page }) => {
    await page.locator('#stepSize').selectOption('2');
    await page.locator('#startButton').click();

    await expect(page.locator('#modal')).toHaveCSS('display', 'flex', { timeout: 15000 });
    await page.locator('#nextLevelButton').click();

    await expect(page).toHaveURL(/level_07/);
  });
});
