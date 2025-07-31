import React from 'react';
import { View, Text, TouchableOpacity, ToastAndroid, ActivityIndicator, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { FONTS, COLORS } from '@/constants/theme';
import { Product } from '@/api/productsApi';
import { Image } from 'expo-image';
import { useTheme } from '@react-navigation/native';
import { t } from 'i18next';
import { useProductsIncludingSkus } from '@/hooks/productHooks';

interface Layout2Props {
  layout: {
    name: string;
    data: any[];
  };
  navigation: any;
}

// 1. Create a reusable ProductItem component to avoid code duplication
const ProductItem: React.FC<{
  product: Product;
  onPress: (product: Product) => void;
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}> = ({ product, onPress, containerStyle, imageStyle }) => {
  if (!product || !product.media_gallery || product.media_gallery.length === 0) {
    return null; // Don't render if product or image is missing
  }

  return (
    <TouchableOpacity
      testID={`product-item-${product.sku}`}
      activeOpacity={0.5}
      onPress={() => onPress(product)}
      style={containerStyle}
    >
      <Image
      testID={`image-test-sku-${product.sku}`}
        style={imageStyle}
        source={{ uri: product.media_gallery[0].url }}
        contentFit="contain" // Recommended for expo-image over resizeMode
      />
    </TouchableOpacity>
  );
};

const Layout2: React.FC<Layout2Props> = ({ layout, navigation }) => {
  const { colors } = useTheme();
  const { productsData, loading } = useProductsIncludingSkus({ skus: layout.data.map((p) => p.sku) });

  const handlePress = (product: Product) => {
    navigation.navigate('ProductsDetails', { product });
  };

  // Centralize the list of available products
  const products = productsData?.items || [];

  // 2. Define specific layout functions for different numbers of products

  // Your original layout for 5 products
  const renderFiveProducts = (items: Product[]) => (
    <View style={{ flexDirection: 'row' }} testID="layout-5-products">
      <View style={{ width: '35%', borderRightWidth: 1, borderRightColor: COLORS.primaryLight }}>
        <ProductItem
          product={items[0]}
          onPress={handlePress}
          containerStyle={{ alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, padding: 10 }}
          imageStyle={{ width: '100%', aspectRatio: 1 / 1.1 }}
        />
        <ProductItem
          product={items[1]}
          onPress={handlePress}
          containerStyle={{ alignItems: 'center', padding: 10 }}
          imageStyle={{ width: '100%', aspectRatio: 1 / 1.1 }}
        />
      </View>
      <View style={{ width: '65%' }}>
        <ProductItem
          product={items[2]}
          onPress={handlePress}
          containerStyle={{ alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight }}
          imageStyle={{ width: '100%', aspectRatio: 1 / 0.6 }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ProductItem
            product={items[3]}
            onPress={handlePress}
            containerStyle={{ alignItems: 'center', padding: 10, width: '50%', borderRightWidth: 1, borderRightColor: COLORS.primaryLight }}
            imageStyle={{ width: '100%', aspectRatio: 1 / 1.2 }}
          />
          <ProductItem
            product={items[4]}
            onPress={handlePress}
            containerStyle={{ alignItems: 'center', padding: 10, width: '50%' }}
            imageStyle={{ width: '100%', aspectRatio: 1 / 1.2 }}
          />
        </View>
      </View>
    </View>
  );

  // Example: A 2x2 grid for 4 products
  const renderFourProducts = (items: Product[]) => (
    <View style={{ flexDirection: 'column' }} testID="layout-4-products">
      <View style={{ flexDirection: 'row' }}>
        <ProductItem
          product={items[0]}
          onPress={handlePress}
          containerStyle={{ width: '50%', padding: 5, borderRightWidth: 1, borderBottomWidth: 1, borderColor: COLORS.primaryLight }}
          imageStyle={{ width: '100%', aspectRatio: 1 }}
        />
        <ProductItem
          product={items[1]}
          onPress={handlePress}
          containerStyle={{ width: '50%', padding: 5, borderBottomWidth: 1, borderColor: COLORS.primaryLight }}
          imageStyle={{ width: '100%', aspectRatio: 1 }}
        />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <ProductItem
          product={items[2]}
          onPress={handlePress}
          containerStyle={{ width: '50%', padding: 5, borderRightWidth: 1, borderColor: COLORS.primaryLight }}
          imageStyle={{ width: '100%', aspectRatio: 1 }}
        />
        <ProductItem
          product={items[3]}
          onPress={handlePress}
          containerStyle={{ width: '50%', padding: 5 }}
          imageStyle={{ width: '100%', aspectRatio: 1 }}
        />
      </View>
    </View>
  );

  // Example: Two products side-by-side
  const renderTwoProducts = (items: Product[]) => (
    <View style={{ flexDirection: 'row' }} testID="layout-2-products">
      <ProductItem
        product={items[0]}
        onPress={handlePress}
        containerStyle={{ width: '50%', padding: 5, borderRightWidth: 1, borderColor: COLORS.primaryLight }}
        imageStyle={{ width: '100%', aspectRatio: 1 }}
      />
         <ProductItem
      product={items[1]}
      onPress={handlePress}
      containerStyle={{ width: '50%', padding: 5 }}
      imageStyle={{ width: '100%', aspectRatio: 1 }}
    />
    </View>
  );


  // 3. This is the main logic. It decides which layout to render.
  const renderLayout = () => {
    // A single loading indicator is cleaner
     if (loading) {
    return <ActivityIndicator testID="loading-indicator" size="large" color={COLORS.primary} style={{ marginVertical: 40 }} />; // <--- EDIT THIS LINE
  }

    // Check for 0 products after loading is complete
    if (products.length === 0) {
      return <Text style={{ textAlign: 'center', margin: 20, ...FONTS.font }}>No products found.</Text>
    }

    switch (products.length) {
      case 4:
        return renderFourProducts(products);
      case 2:
        return renderTwoProducts(products);
      // You can add more cases for 3, 1, etc.
      // case 3:
      //   return renderThreeProducts(products);
      // case 1:
      //   return renderOneProduct(products);
      case 5:
      default:
        // Default to the 5-product layout if there are 5 or more, or an unhandled number.
        return renderFiveProducts(products.slice(0, 5)); // Use slice to prevent errors if more than 5 are returned
    }
  };

  return (
    <>
      <View
        style={[
          GlobalStyleSheet.container,
          { paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight },
        ]}
      >
        <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title }]}>{layout.name}</Text>
      </View>
      <View style={[GlobalStyleSheet.container, { padding: 0, backgroundColor: colors.card, marginBottom: 10 }]}>
        {renderLayout()}
      </View>
    </>
  );
};

export default Layout2;