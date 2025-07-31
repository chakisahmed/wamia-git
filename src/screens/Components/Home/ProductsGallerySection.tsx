import React from 'react';
import { View, Text, FlatList, ToastAndroid } from 'react-native';
import { useNavigation,useTheme } from '@react-navigation/native';
import { getProduct, Product } from '@/api/productsApi';
import Cardstyle1 from '@/components/Card/Cardstyle1';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { FONTS, COLORS } from '@/constants/theme';
import { t } from 'i18next';

const calculateDiscount = (price: number, finalPrice: number) => {
    if (finalPrice < price) {
        return Math.round(((price - finalPrice) / price) * 100);
    }
    return 0;
};
interface ProductsGalleryProps {
    title: string;
    products: Product[] | undefined;
}

const ProductsGallerySection: React.FC<ProductsGalleryProps> = ({ title, products }) => {
    const navigation = useNavigation();
    const theme = useTheme()

    return (
        products!= undefined && products.length > 0 && (
            <View style={[GlobalStyleSheet.container, { padding: 0, backgroundColor: theme.dark ? COLORS.darkBackground : 'white' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[FONTS.fontMedium, { fontSize: 18, color: theme.dark? COLORS.light : COLORS.title, paddingHorizontal: 20, paddingVertical: 10 }]}>{title}</Text>
                </View>
                <FlatList
                    data={products}
                    numColumns={2}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => {
                        const discount = calculateDiscount(item.price_range.maximum_price.regular_price.value, item.price_range.maximum_price.final_price.value);

                        return (
                            <View style={[GlobalStyleSheet.col50, { marginBottom: 0, paddingHorizontal: 0 }]}>
                                <Cardstyle1
                                data={item}
                                    id={item.id}
                                                                        title={item.name}
                                                                        image={item.media_gallery[0].url}
                                                                        price={item.price_range.maximum_price.final_price.value + " " + item.price_range.maximum_price.final_price.currency}
                                                                        sku={item.sku}
                                                                        offer={discount > 0 ? (discount + " %") : ''}
                                                                        color={theme.dark ? COLORS.light : COLORS.title}
                                                                        brand={""}
                                                                        hascolor={true}
                                                                        discount={discount > 0 ? item.price_range.maximum_price.regular_price.value + " " + item.price_range.maximum_price.final_price.currency : ''}
                                                                        borderTop={true}
                                                                        onPress={async () => {
                                                                            try {
                                                                                const product = await getProduct(item.sku);
                                                                                if (product === undefined) {
                                                                                    throw new Error(t('product_not_found'));
                                                                                }
                                                                                navigation.navigate('ProductsDetails', { product });
                                                                            } catch (error) {
                                                                                console.error('Error fetching product:', error);
                                                                                ToastAndroid.show(t('product_not_found'), ToastAndroid.SHORT);
                                                                            }
                                                                        }}
                                                                        
                                />
                            </View>
                        );
                    }}
                    contentContainerStyle={{ paddingHorizontal: 0 }}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                />
            </View>
        )
    );
};

export default React.memo(ProductsGallerySection);