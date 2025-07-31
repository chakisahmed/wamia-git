// src/utils/navigationHelpers.ts
import { ToastAndroid } from 'react-native';
import { getProduct } from '../api/productsApi';
import { t } from 'i18next';

export const handleProductNavigation = async (sku: string, navigation: any) => {
  try {
    const product = await getProduct(sku);
    if (!product) throw new Error(t('product_not_found'));
    navigation.navigate('ProductsDetails', { product });
  } catch (error) {
    console.error('Error fetching product:', error);
    ToastAndroid.show(t('product_not_found'), ToastAndroid.SHORT);
  }
};
