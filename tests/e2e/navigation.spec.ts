import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Small Mobile', width: 360, height: 800, tier: 'mobile' },
  { name: 'Standard Mobile', width: 390, height: 844, tier: 'mobile' },
  { name: 'Large Mobile', width: 430, height: 932, tier: 'mobile' },
  { name: 'Tablet', width: 768, height: 1024, tier: 'tablet' },
  { name: 'Small Laptop', width: 1024, height: 768, tier: 'small-laptop' },
  { name: 'Laptop', width: 1280, height: 800, tier: 'desktop' },
  { name: 'Desktop', width: 1440, height: 900, tier: 'desktop' },
  { name: 'Large Desktop', width: 1920, height: 1080, tier: 'desktop' },
];

test.describe('Enterprise Responsive Smart Navigation & Auto-Hide Header', () => {
  for (const vp of VIEWPORTS) {
    test(`renders cleanly with zero horizontal overflow at ${vp.width}px (${vp.name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const header = page.locator('#main-app-header');
      await expect(header).toBeVisible();
      await expect(header).toHaveAttribute('data-nav-tier', vp.tier);

      // Fixed 64px header height with zero layout jump
      const box = await header.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(63);
      expect(box?.height).toBeLessThanOrEqual(66);

      // Verify zero horizontal overflow across entire document
      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(hasHorizontalOverflow).toBe(false);

      // Verify auto-hide on scroll down and instant reappear on scroll up
      await expect(header).toHaveAttribute('data-nav-hidden', 'false');
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(250);
      await expect(header).toHaveAttribute('data-nav-hidden', 'true');

      await page.evaluate(() => window.scrollTo(0, 480));
      await page.waitForTimeout(250);
      await expect(header).toHaveAttribute('data-nav-hidden', 'false');
    });
  }

  test('supports Small Laptop (1024px) More dropdown + Escape keyboard close', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const moreTrigger = page.locator('#nav-item-more');
    await expect(moreTrigger).toBeVisible();
    await moreTrigger.click();

    const moreMenu = page.locator('#nav-dropdown-more');
    await expect(moreMenu).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(moreMenu).toBeHidden();
  });

  test('supports Mobile (390px) slide-out drawer, accordion groups, scroll lock & Escape close', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const toggle = page.locator('#mobile-nav-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();

    const drawer = page.getByTestId('mobile-nav-drawer');
    await expect(drawer).toBeVisible();

    // Background body scroll lock active
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');

    // Expand an accordion group
    const aboutAccordion = page.locator('#nav-group-trigger-mobile-about');
    await aboutAccordion.click();
    await expect(aboutAccordion).toHaveAttribute('aria-expanded', 'true');

    // Escape closes drawer and unlocks body scroll
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    const restoredOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(restoredOverflow).not.toBe('hidden');
  });

  test('denies GUEST access to admin dashboard navigation routes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Administrative Access Required')).toBeVisible();
  });
});
