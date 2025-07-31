import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { GlobalStyleSheet } from '@/tants/StyleSheet';
import { COLORS, FONTS, SIZES } from '@/tants/theme';
import Cardstyle1 from '../Card/Cardstyle1';
import StopWatch from '../StopWatch';
import StopWatch2 from '../StopWatch2';
import ProductLayout3 from '../ProductLayout3';
import { calculateDiscount } from '@/s/calculateDiscount';
import { t } from 'i18next';

const renderProductLayoutAppearance = (layout: any, colors: any, navigation: any, addItemToWishList: any) => {
    switch (layout.layoutAppearance) {
        case 'layout1':
            return (
                <View style={[GlobalStyleSheet.container, { padding: 0, marginTop: 5, marginBottom: 5 }]}>
                    {(layout.dateRange[0] && layout.dateRange[1]) && (
                        <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20, backgroundColor: colors.card }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title, marginBottom: 5 }]}>Top Deals Of The Day</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Text style={[FONTS.fontMedium, { fontSize: 14, color: '#BF0A30' }]}>Offer Ends in</Text>
                                        <View>
                                            <StopWatch seconds={Math.floor((new Date(layout.dateRange[1]).getTime() - new Date().getTime()) / 1000)} />
                                        </View>
                                    </View>
                                </View>
                                {["daily deals", "top deals of the day"].includes(layout.name.toLowerCase()) && (
                                    <View>
                                        <Image
                                            style={{ resizeMode: 'contain', height: 65, width: 115 }}
                                            source={IMAGES.ads1}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            {layout.data.map((data: any, index: any) => {
                                const discount = calculateDiscount(Number(data.price_float), Number(data.final_price_float));

                                return (
                                    <View style={[{ marginBottom: 0, width: SIZES.width > SIZES.container ? SIZES.container / 3 : SIZES.width / 2.3 }]} key={index}>
                                        <Cardstyle1
                                            id={data.id}
                                            title={data.name}
                                            image={"https://www.wamia.tn//media/catalog/product" + data.image}
                                            price={data.final_price}
                                            sku={data.sku}
                                            offer={discount > 0 ? (discount + " %") : ''}
                                            color={data.color}
                                            brand={data.brand}
                                            hascolor={data.hascolor}
                                            discount={discount > 0 ? data.price : ''}
                                            borderTop={true}
                                            onPress={async () => {
                                                try {
                                                    const product = await getProduct(data.sku);
                                                    if (product === undefined) {
                                                        throw new Error(t('product_not_found'));
                                                    }
                                                    navigation.navigate('ProductsDetails', { product });
                                                } catch (error) {
                                                    console.error('Error fetching product:', error);
                                                    ToastAndroid.show(t('product_not_found'), ToastAndroid.SHORT);
                                                }
                                            }}
                                            onPress3={() => addItemToWishList(data)}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            );
        case 'layout2':
            return (
                <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight }]}>
                    <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title }]}>{layout.name}</Text>
                </View>
            );
        case 'layout3':
            return (
                <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, paddingVertical: 10 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title }]}>Blockbuster deals</Text>
                        <View>
                            <Text style={[FONTS.fontRegular, { fontSize: 12, color: colors.text, textAlign: 'right' }]}>Offer Ends in </Text>
                            <StopWatch2 seconds={Math.floor((new Date(layout.dateRange[1]).getTime() - new Date(layout.dateRange[0]).getTime()) / 1000)} />
                        </View>
                    </View>
                </View>
            );
        default:
            return null;
    }
};

export default React.memo(renderProductLayoutAppearance);