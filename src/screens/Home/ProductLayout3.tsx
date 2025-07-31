import React, { useEffect, useState } from "react";
import { ScrollView, ToastAndroid, View, Text, TouchableOpacity, Platform } from "react-native";
import { GlobalStyleSheet } from "@/constants/StyleSheet";
import { getProduct } from "@/api/productsApi";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Image } from 'expo-image';
import { IMAGES } from "@/constants/Images";
import { useNavigation, useTheme } from "@react-navigation/native";
import { t } from "i18next";
// const swiperimageData = [
//     {
//         image: IMAGES.product1,
//         smallImage: IMAGES.product1,
//     },
//     {
//         image: IMAGES.product2,
//         smallImage: IMAGES.product2,
//     },
//     {
//         image: IMAGES.product3,
//         smallImage: IMAGES.product3,
//     },
//     {
//         image: IMAGES.product4,
//         smallImage: IMAGES.product4,
//     },
// ]

const ProductLayout3 = (props: any) => {
    const { data } = props;
    const navigation = useNavigation()
    const [currentSlide, setCurrentSlide] = useState(0);
    const theme = useTheme();
    const { colors }: { colors: any } = theme;
    const swiperimageData = [
        {
            image: IMAGES.product1,
            smallImage: IMAGES.product1,
        },
        {
            image: IMAGES.product2,
            smallImage: IMAGES.product2,
        },
        {
            image: IMAGES.product3,
            smallImage: IMAGES.product3,
        },
        {
            image: IMAGES.product4,
            smallImage: IMAGES.product4,
        },
    ];
    const [swiperimageData2, setSwiperimageData2] = useState([]);
    const [price, setPrice] = useState("");
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const subproducts = await getProduct(data[0].sku);
                const price = subproducts.price_range.maximum_price.final_price.value + " " + subproducts.price_range.maximum_price.final_price.currency;
                setPrice(price);
                const configurable_options = subproducts.configurable_options;

                const colors = configurable_options?.find((option: any) => imageAttribute(option.attribute_code))?.values;
                const images = colors?.map((color: any) => {

                    const variant = subproducts.variants?.find(variant => variant.product.sku.includes(color.label));
                    return {
                        image: variant?.product.media_gallery[0].url.replace('localhost', '192.168.1.16'),
                        smallImage: variant?.product.media_gallery[0].url
                    };

                });
                const filteredImages = images?.filter((image: any) => image.image !== undefined);
                setSwiperimageData2(filteredImages ?? []);
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        }
        fetchImages();
    }, []);
    function imageAttribute(attribute_code: string) {
        return ['couleur', 'motif', 'color'].includes(attribute_code);
    }
    return (
        <View style={[GlobalStyleSheet.container, { padding: 0, backgroundColor: theme.dark ? 'rgba(255,255,255,.1)' : colors.card }]}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ width: '65%', padding: 20, borderRightWidth: 1, borderRightColor: COLORS.primaryLight }}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={async () => { }}
                    >
                        <Text style={[FONTS.fontMedium, { fontSize: 13, color: theme.dark ? COLORS.primaryLight : COLORS.primary }]}>{data[0].name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={async () => { }}
                    >
                        <Text numberOfLines={1} style={[FONTS.fontRegular, { fontSize: 15, color: colors.title, paddingRight: 45 }]}></Text>
                    </TouchableOpacity>
                    <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title }]}>{price}<Text style={[FONTS.fontJostLight, { fontSize: 11, color: colors.title, opacity: .6, textDecorationLine: 'line-through' }]}>{data[0].final_price_float < data[0].price_float ? data[0].price : ''}</Text></Text>
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                            activeOpacity={0.5}
                            onPress={async () => {
                                try {
                                    const product = await getProduct(data[0].sku);
                                    if (product === undefined) {
                                        throw new Error(t('product_not_found'));

                                    }
                                    navigation.navigate('ProductsDetails', { product });
                                } catch (error) {
                                    console.error('Error fetching product:', error);
                                    ToastAndroid.show(t('product_not_found'), ToastAndroid.SHORT);
                                }
                            }}
                        >
                            {swiperimageData2.length > 0 && swiperimageData2[currentSlide] && <Image
                                style={{ height: Platform.OS === "web" ? SIZES.width / 2 : undefined, width: '100%', aspectRatio: 1 / .8, resizeMode: 'contain' }}
                                source={{ uri: swiperimageData2[currentSlide].image }}
                            />}
                        </TouchableOpacity>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 15, marginTop: 10 }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                {swiperimageData2 && swiperimageData2.map((data: any, index) => {
                                    return (
                                        <TouchableOpacity
                                            onPress={() => setCurrentSlide(index)}
                                            key={index}
                                            style={[{
                                                borderWidth: 1,
                                                borderColor: theme.dark ? COLORS.card : '#DDDDDD',
                                                height: 35,
                                                width: 35,
                                                borderRadius: 4,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }]}
                                        >
                                            <Image
                                                style={{
                                                    height: 28,
                                                    width: 28,
                                                    resizeMode: 'contain'
                                                }}
                                                source={{ uri: data.image }}
                                            />
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </ScrollView>
                    </View>
                </View>
                <View style={{ width: '35%', }}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={async () => {
                            try {
                                const product = await getProduct(data[1].sku);
                                if (product === undefined) {
                                    throw new Error(t('product_not_found'));

                                }
                                navigation.navigate('ProductsDetails', { product });
                            } catch (error) {
                                ToastAndroid.show(t('product_not_found'), ToastAndroid.SHORT);

                            }
                        }}
                        style={{ alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight, marginHorizontal: 0, paddingBottom: 10 }}
                    >
                        {data[1] && <Image
                            style={{ resizeMode: 'contain', height: undefined, width: '100%', aspectRatio: 1 / 1 }}
                            source={{ uri: "https://www.wamia.tn//media/catalog/product/" + data[1].image }}
                        />}
                        <Text style={[FONTS.fontMedium, { fontSize: 12, color: colors.title, paddingHorizontal: 15, marginTop: 5, textAlign: 'center' }]}>
                            {data[1].name.length > 20 ? data[1].name.substring(0, 15) + '...' : data[1].name}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={async () => {
                            try {
                                const product = await getProduct(data[2].sku);
                                navigation.navigate('ProductsDetails', { product });
                            } catch (error) {

                            }
                        }}
                        style={{ alignItems: 'center', paddingBottom: 10 }}
                    >
                        {data[2] && <Image
                            style={{ resizeMode: 'contain', height: undefined, width: '100%', aspectRatio: 1 / 1 }}
                            source={{ uri: "https://www.wamia.tn//media/catalog/product/" + data[2].image }}
                        />}
                        <Text style={[FONTS.fontMedium, { fontSize: 12, color: colors.title, paddingHorizontal: 15, marginTop: 5, textAlign: 'center' }]}>
                            {data[2].name.length > 20 ? data[2].name.substring(0, 15) + '...' : data[2].name}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>);
}
export default ProductLayout3;