import { test, expect } from '@playwright/test';

test.describe('Basic User Flow', () => {
  test('first visit plays intro unskippable', async ({ page }) => {
    await page.goto('/');
    
    // Should show intro video
    await expect(page.locator('video')).toBeVisible();
    
    // Skip button should not be visible initially
    await expect(page.locator('text=Skip Intro')).not.toBeVisible();
    
    // Wait for skip button to appear after 3 seconds
    await expect(page.locator('text=Skip Intro')).toBeVisible({ timeout: 5000 });
  });

  test('returning visit allows skip immediately', async ({ page }) => {
    // Set intro as seen in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('stotteyman_intro_seen', 'true');
    });
    
    await page.reload();
    
    // Skip button should be visible immediately
    await expect(page.locator('text=Skip Intro')).toBeVisible();
  });

  test('start screen navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Skip intro
    await page.locator('text=Skip Intro').click();
    
    // Should show start screen
    await expect(page.locator('text=STOTTEYMAN')).toBeVisible();
    await expect(page.locator('text=Enter the Matrix')).toBeVisible();
    
    // Click start button
    await page.locator('text=Enter the Matrix').click();
    
    // Should show main menu
    await expect(page.locator('text=MAIN MENU')).toBeVisible();
    await expect(page.locator('text=Play')).toBeVisible();
  });

  test('keyboard navigation works in menu', async ({ page }) => {
    await page.goto('/');
    
    // Skip intro and go to menu
    await page.locator('text=Skip Intro').click();
    await page.locator('text=Enter the Matrix').click();
    
    // Test keyboard navigation
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    
    // Should navigate to play mode
    await expect(page.locator('text=Stotteyman')).toBeVisible();
  });

  test('mobile layout is used on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Skip intro
    await page.locator('text=Skip Intro').click();
    await page.locator('text=Enter the Matrix').click();
    await page.locator('text=Play').click();
    
    // Should show mobile layout
    await expect(page.locator('text=Stotteyman')).toBeVisible();
    
    // Should have mobile-specific elements
    await expect(page.locator('button:has-text("−")')).toBeVisible(); // Toggle button
  });

  test('gamepad navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Mock gamepad
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'getGamepads', {
        value: () => [
          {
            buttons: [
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
              { pressed: false, value: 0 },
            ],
            axes: [0, 0, 0, 0],
            connected: true,
            id: 'Mock Gamepad',
          },
        ],
      });
    });
    
    // Skip intro and go to menu
    await page.locator('text=Skip Intro').click();
    await page.locator('text=Enter the Matrix').click();
    
    // Should show gamepad instructions
    await expect(page.locator('text=Press A button to select')).toBeVisible();
  });
});
