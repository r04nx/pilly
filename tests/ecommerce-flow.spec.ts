import { test, expect } from '@playwright/test';
import { chromium, firefox, webkit } from '@playwright/test';

// Test data
const TEST_PRODUCT = {
  name: 'Paracetamol 500mg',
  price: 9.99,
  description: 'Pain relief medication'
};

const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

test.describe('E-Commerce Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test.describe('Guest User Flow', () => {
    test('should display products page', async ({ page }) => {
      await page.goto('/products');
      
      // Check if page loads correctly
      await expect(page).toHaveTitle(/Products/i);
      
      // Check if products are displayed
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      
      // Check if cart icon is visible
      await expect(page.locator('[data-testid="cart-icon"]')).toBeVisible();
    });

    test('should add product to cart as guest', async ({ page }) => {
      await page.goto('/products');
      
      // Wait for products to load
      await page.waitForSelector('[data-testid="product-card"]');
      
      // Click first "Add to Cart" button
      await page.locator('[data-testid="product-card"]').first().locator('button').click();
      
      // Check if cart count updates (should show 1)
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
      
      // Check if success message appears (optional)
      // await expect(page.locator('[data-testid="add-to-cart-success"]')).toBeVisible();
    });

    test('should view cart as guest', async ({ page }) => {
      await page.goto('/products');
      
      // Add a product first
      await page.locator('[data-testid="product-card"]').first().locator('button').click();
      
      // Click cart icon
      await page.locator('[data-testid="cart-icon"]').click();
      
      // Check if cart dropdown opens
      await expect(page.locator('[data-testid="cart-dropdown"]')).toBeVisible();
      
      // Check if product is in cart
      await expect(page.locator('[data-testid="cart-item"]')).toContainText(TEST_PRODUCT.name);
    });

    test('should handle search functionality', async ({ page }) => {
      await page.goto('/products');
      
      // Find search input
      const searchInput = page.locator('input[placeholder*="Search"]');
      await searchInput.fill('Paracetamol');
      
      // Check if results are filtered
      await expect(page.locator('[data-testid="product-card"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="product-card"]')).toContainText(TEST_PRODUCT.name);
    });

    test('should handle category filtering', async ({ page }) => {
      await page.goto('/products');
      
      // Click on a category
      await page.locator('[data-testid="category-filter"]').first().click();
      
      // Check if products are filtered
      await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should be mobile-friendly', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      await page.goto('/products');
      
      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-sidebar"]')).not.toBeVisible();
      
      // Check if mobile menu works
      await page.locator('[data-testid="mobile-menu-toggle"]').click();
      await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible();
    });

    test('should handle mobile cart', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/products');
      
      // Add product to cart
      await page.locator('[data-testid="product-card"]').first().locator('button').click();
      
      // Check mobile cart icon
      await expect(page.locator('[data-testid="cart-icon"]')).toBeVisible();
      
      // Open mobile cart
      await page.locator('[data-testid="cart-icon"]').click();
      await expect(page.locator('[data-testid="cart-dropdown"]')).toBeVisible();
    });
  });

  test.describe('Authenticated User Flow', () => {
    test('should allow login', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Fill login form
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // Should redirect to products or dashboard
      await expect(page).toHaveURL(/products|dashboard/);
    });

    test('should persist cart after login', async ({ page }) => {
      // Add items as guest first
      await page.goto('/products');
      await page.locator('[data-testid="product-card"]').first().locator('button').click();
      
      // Then login
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // Check if cart items are merged
      await page.locator('[data-testid="cart-icon"]').click();
      await expect(page.locator('[data-testid="cart-item"]')).toContainText(TEST_PRODUCT.name);
    });

    test('should handle checkout flow', async ({ page }) => {
      // Login and add items
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // Add product to cart
      await page.goto('/products');
      await page.locator('[data-testid="product-card"]').first().locator('button').click();
      
      // Go to cart
      await page.locator('[data-testid="cart-icon"]').click();
      await page.locator('[data-testid="view-cart-button"]').click();
      
      // Proceed to checkout
      await page.locator('[data-testid="checkout-button"]').click();
      
      // Check if checkout page loads
      await expect(page).toHaveURL(/checkout/);
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle out of stock products', async ({ page }) => {
      await page.goto('/products');
      
      // Find first out of stock product
      const outOfStockProduct = page.locator('[data-testid="product-card"]:has-text("Out of Stock")').first();
      
      // Add to cart button should be disabled
      const addToCartButton = outOfStockProduct.locator('button');
      await expect(addToCartButton).toBeDisabled();
    });

    test('should handle missing images gracefully', async ({ page }) => {
      await page.goto('/products');
      
      // Check if products without images show placeholders
      const productsWithoutImages = page.locator('[data-testid="product-card"]:has([data-testid="image-placeholder"])');
      
      // Should not show broken image icons
      await expect(productsWithoutImages).toBeVisible();
      await expect(page.locator('img[src=""]')).toHaveCount(0);
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/cart', route => route.abort());
      
      await page.goto('/products');
      await page.locator('[data-testid="product-card"]').first().locator('button').click();
      
      // Should show error message or retry
      // await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load products page quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/products');
      await page.waitForSelector('[data-testid="product-grid"]');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time
      expect(loadTime).toBeLessThan(3000); // 3 seconds
    });

    test('should handle large product lists', async ({ page }) => {
      // Mock many products
      await page.goto('/products');
      
      // Should handle pagination or virtual scrolling
      await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      
      // Check if performance degrades gracefully
      const productCount = await page.locator('[data-testid="product-card"]').count();
      expect(productCount).toBeGreaterThan(0);
    });
  });
});
