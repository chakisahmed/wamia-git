// e2e/product-layout.test.js

describe('Product Layout 2', () => {

  // This runs before each test. It's good practice to relaunch the app
  // to ensure a clean state and avoid side-effects between tests.
  beforeEach(async () => {
    // If your Layout2 is not on the initial screen, you would add
    // navigation logic here, e.g., await element(by.id('go-to-shop-button')).tap();
    await device.launchApp({ newInstance: true });
  });

  it('should load products, display the layout, and navigate to details on tap', async () => {
    // Note: Replace 'YOUR-FIRST-PRODUCT-SKU' with a real, predictable SKU
    // that you expect to see in the layout.
    const targetProductSku = 'YOUR-FIRST-PRODUCT-SKU'; 
    const productItemTestID = `product-item-${targetProductSku}`;

    // 1. Verify the loading indicator is initially visible
    // We expect the component to be in its loading state right away.
    await expect(element(by.id('loading-indicator'))).toBeVisible();

    // 2. Wait for the products to load and the correct layout to be visible.
    // `waitFor` will poll the UI until the element is found or a timeout is reached.
    // This is the correct way to handle asynchronous operations like data fetching.
    // We'll wait for the main layout container for 5 products.
    await waitFor(element(by.id('layout-5-products')))
      .toBeVisible()
      .withTimeout(20000); // Use a generous timeout for network requests

    // 3. (Optional but good practice) Assert the loading indicator is now gone.
    await expect(element(by.id('loading-indicator'))).not.toBeVisible();

    // 4. Assert a specific product item is visible within the layout.
    // We find the specific TouchableOpacity for our target product.
    await expect(element(by.id(productItemTestID))).toBeVisible();
    
    // 5. Simulate the user tapping on that product.
    await element(by.id(productItemTestID)).tap();

    // 6. Assert that we have navigated to the Product Details screen.
    // We look for an element that ONLY exists on the destination screen.
    // We've assumed it has a testID of 'product-details-title'.
    await expect(element(by.id('product-details-title'))).toBeVisible();
  });
  
  // Example of a test for the empty state (requires API mocking)
  it('should display the "No products found" message if API returns empty', async () => {
      // **IMPORTANT**: This test would require you to set up a mock server
      // (like MSW or MirageJS) to intercept the API call and return an empty array.
      
      // 1. Verify loading indicator
      await expect(element(by.id('loading-indicator'))).toBeVisible();

      // 2. Wait for the "No products found." text to appear.
      // We are finding the element by its text content.
      await waitFor(element(by.text('No products found.')))
        .toBeVisible()
        .withTimeout(20000);

      // 3. Ensure the product layouts are NOT visible
      await expect(element(by.id('layout-5-products'))).not.toExist();
      await expect(element(by.id('layout-4-products'))).not.toExist();
  });

});