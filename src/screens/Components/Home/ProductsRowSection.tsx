import React from 'react';
import { View, Text, FlatList, ToastAndroid } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Product, getProduct } from '@/api/productsApi';
import Cardstyle1 from '@/components/Card/Cardstyle1';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { FONTS, COLORS, SIZES } from '@/constants/theme';
import { t } from 'i18next';


interface ProductsRowProps {
    title: string;
    products: Product[] | undefined;
}
const calculateDiscount = (price: number, finalPrice: number) => {
    if (finalPrice < price) {
        return Math.round(((price - finalPrice) / price) * 100);
    }
    return 0;
};
const ProductsRowSection: React.FC<ProductsRowProps> = ({ title, products }) => {
    const navigation = useNavigation();
    const theme = useTheme()

    return (
        products!=undefined && products.length > 0 && (
            <>
                <View style={[GlobalStyleSheet.container, { padding: 0, backgroundColor: theme.dark ? COLORS.darkBackground : 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <Text style={[FONTS.fontMedium, { fontSize: 18, color: theme.dark ? COLORS.light : COLORS.title, paddingHorizontal: 20, paddingVertical: 10, }]}>{title}</Text>
                </View>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={products}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => {
                        const discount = calculateDiscount(Number(item.price_range.maximum_price.regular_price.value), Number(item.price_range.maximum_price.final_price.value));

                        return (
                            <View style={[{ marginBottom: 0, width: SIZES.width > SIZES.container ? SIZES.container / 3 +50: SIZES.width / 2.3 + 50}]} key={index}>
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
                />
            </>
        )
    );
};

export default React.memo(ProductsRowSection);