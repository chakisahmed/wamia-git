// --- START OF FILE Layout2.test.tsx ---

// src/components/ProductLayouts/Layout2.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import Layout2 from '../screens/Home/ProductLayouts/Layout2';
import { useProductsIncludingSkus } from '../hooks/productHooks';

// --- Mocking Dependencies ---

// 0. FIX: Mock AsyncStorage to prevent native module errors in Jest.
// This must come before the other imports that might use it.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 1. Mock the custom hook that fetches data. This is the most important mock.
// We will change its return value in each test to simulate different scenarios.
jest.mock('../hooks/productHooks');
const mockedUseProductsIncludingSkus = useProductsIncludingSkus as jest.Mock;

// 2. Mock the 'expo-image' component. In tests, we don't need to render actual images.
// Mocking it as a simple View with props prevents errors.
jest.mock('expo-image', () => ({
  Image: (props: any) => {
    // The 'Image' component in React Native has an accessibility role of 'image'
    // We can also pass through the testID for easier selection.
    const { Image } = jest.requireActual('react-native');
    return <Image {...props} accessibilityRole="image" />;
  }
}));

// 3. Mock React Navigation's useTheme hook
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'), // Keep other exports
  useTheme: () => ({
    colors: {
      card: '#FFFFFF',
      title: '#000000',
    },
  }),
}));

// 4. Mock the i18next translation function
jest.mock('i18next', () => ({
  t: (key: string) => key, // Return the key itself for simplicity
}));


// --- Helper to create mock product data ---
const createMockProducts = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    sku: `test-sku-${i + 1}`,
    name: `Product ${i + 1}`,
    media_gallery: [{ url: `https://example.com/image${i + 1}.jpg` }],
    // Add any other properties your 'Product' type requires
  }));
};


// --- The Test Suite ---

describe('Layout2 Component', () => {

  // Create a mock navigation object
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const layoutProps = {
    name: 'Featured Products',
    data: [{ sku: 'any-sku' }], // The content of data doesn't matter since we mock the hook
  };

  // Reset mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });
it('should render a loading indicator while fetching products', () => {
  // Arrange: Simulate the hook is in a loading state
  mockedUseProductsIncludingSkus.mockReturnValue({ loading: true, productsData: null });

  // Act
  render(<Layout2 layout={layoutProps} navigation={mockNavigation} />);

  // Assert: Check for the ActivityIndicator by its testID
  expect(screen.getByTestId('loading-indicator')).toBeOnTheScreen(); // <--- CHANGE THIS LINE
  expect(screen.queryByTestId('layout-5-products')).toBeNull();
  expect(screen.queryByTestId('layout-4-products')).toBeNull();
});

// in Layout2.test.tsx
it('should render the 5-product layout when 5 products are available', async () => {
  // ARRANGE: Set up the mock BEFORE rendering. This is the fix.
  const mockProducts = createMockProducts(5);
  mockedUseProductsIncludingSkus.mockReturnValue({
    loading: false,
    productsData: { items: mockProducts }
  });

  // ACT
  render(<Layout2 layout={layoutProps} navigation={mockNavigation} />);

  // ASSERT
  await waitFor(() => {
    expect(screen.getByTestId('layout-5-products')).toBeOnTheScreen();
  });
  
  const images = await screen.findAllByTestId(/image-test-sku-/);
  expect(images.length).toBe(5);

  expect(screen.getByText('Featured Products')).toBeOnTheScreen();
});
// in Layout2.test.tsx
it('should render the 4-product (2x2) layout when 4 products are available', async () => {
  // ARRANGE: Set up the mock BEFORE rendering.
  const mockProducts = createMockProducts(4);
  mockedUseProductsIncludingSkus.mockReturnValue({
    loading: false,
    productsData: { items: mockProducts }
  });

  // ACT
  render(<Layout2 layout={layoutProps} navigation={mockNavigation} />);
  
  // ASSERT
  await waitFor(() => {
    expect(screen.getByTestId('layout-4-products')).toBeOnTheScreen();
  });

  expect(screen.queryByTestId('layout-5-products')).toBeNull();

  const images = await screen.findAllByTestId(/image-test-sku-/);
  expect(images.length).toBe(4);
});
// in Layout2.test.tsx
it('should render the 2-product layout when 2 products are available', async () => {
  // ARRANGE: Set up the mock BEFORE rendering.
  const mockProducts = createMockProducts(2);
  mockedUseProductsIncludingSkus.mockReturnValue({
    loading: false,
    productsData: { items: mockProducts }
  });
  
  // ACT
  render(<Layout2 layout={layoutProps} navigation={mockNavigation} />);

  // ASSERT
  await waitFor(() => {
    expect(screen.getByTestId('layout-2-products')).toBeOnTheScreen();
  });

  expect(screen.queryByTestId('layout-5-products')).toBeNull();
  expect(screen.queryByTestId('layout-4-products')).toBeNull();

  const images = await screen.findAllByTestId(/image-test-sku-/);
  console.log(images.length)
  expect(images.length).toBe(2);
});

  it('should render a "No products found" message when no products are available', async () => {
    // Arrange: Simulate the hook returning an empty array
    mockedUseProductsIncludingSkus.mockReturnValue({
      loading: false,
      productsData: { items: [] }
    });

    // Act
    render(<Layout2 layout={layoutProps} navigation={mockNavigation} />);

    // Assert: Wait for the "no products" text to be visible
    expect(await screen.findByText('No products found.')).toBeOnTheScreen();

    // Ensure no product layouts are rendered
    expect(screen.queryByTestId('layout-5-products')).toBeNull();
    expect(screen.queryByTestId('layout-4-products')).toBeNull();
  });

  it('should navigate to ProductDetails when a product is pressed', async () => {
    // Arrange: Provide product data
    const mockProducts = createMockProducts(5);
    mockedUseProductsIncludingSkus.mockReturnValue({
      loading: false,
      productsData: { items: mockProducts }
    });

    // Act
    render(<Layout2 layout={layoutProps} navigation={mockNavigation} />);

    // IMPROVEMENT: Find the specific TouchableOpacity by its testID for a more robust test.
    const firstProductTouchable = await screen.findByTestId(`product-item-${mockProducts[0].sku}`);
    fireEvent.press(firstProductTouchable);

    // Assert: Check if navigation.navigate was called with the correct parameters
    expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ProductsDetails', {
      product: mockProducts[0],
    });
  });
});