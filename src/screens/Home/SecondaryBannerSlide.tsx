// src/components/Home/BannerSlider.tsx
import React from 'react';
import { View, TouchableOpacity, Platform, Dimensions, ScrollView } from 'react-native';
import Swiper from 'react-native-swiper';
import { Image } from 'expo-image'; // or use react-native's Image if preferred
import { COLORS } from '@/constants/theme';
import { fetchCategory, getCagetoryBanner } from '@/api/categoriesApi';
import { getProduct, getProductById } from '@/api/productsApi';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { t } from 'i18next';

interface SecondaryBannerSliderProps {
  layout: any;
}

const SecondaryBannerSlider: React.FC<SecondaryBannerSliderProps> = ({ layout }) => {
  const navigation = useNavigation();

  if (layout.data.length == 1)
    return (<TouchableOpacity style={[GlobalStyleSheet.container, { padding: 0 }]} onPress={async () => {
        try {
            if (layout.data[0].bannerType === 'category') {

                const image = await getCagetoryBanner(layout.data[0].catalog_id);
                      navigation.navigate('Products', { category: {
                        id: layout.data[0].catalog_id,
                        image: "https://www.wamia.tn"+image,
                        name: layout.data[0].name,
                        children: []
                      } });
            } else if (layout.data[0].bannerType === 'product') {
                const product = await getProduct(layout.data[0].sku);
                if (product === undefined) {
                    throw new Error(t('product_not_found'));
                }
                navigation.navigate('ProductsDetails', { product });
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }}>
        <Image
            style={{ width: '100%', height: undefined, aspectRatio: 1 / .3, resizeMode: 'contain' }}
            source={{ uri: layout.data[0].url.replace('localhost', '192.168.1.16') }}
        />
    </TouchableOpacity>);
return (

    (<View style={[GlobalStyleSheet.container, { paddingVertical: 0 }]}>
        <View style={{ marginHorizontal: -15, marginVertical: 10 }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{}}
            >
                {layout.data.map((data, index) => {
                    return (
                        <TouchableOpacity key={index} style={{ marginRight: 10 }} onPress={async () => {

                            try {
                                if (data.bannerType === 'category') {

                                    const image = await getCagetoryBanner(data.catalog_id);
                      navigation.navigate('Products', { category: {
                        id: data.catalog_id,
                        image: "https://www.wamia.tn"+image,
                        name: data.name,
                        children: []
                      } });
                                } else if (data.bannerType === 'product') {
                                    const sku = (await getProductById(data.catalog_id))?.items[0].sku;
                                    const product = await getProduct(sku);
                                    if (product === undefined) {
                                        throw new Error(t('product_not_found'));
                                    }
                                    navigation.navigate('ProductsDetails', { product });
                                }
                            } catch (error) {
                                console.error('Error fetching categories:', error);
                            }
                        }}>
                            <Image
                                style={{ width: 201, height: 110 }}
                                source={{ uri: data.url.replace('localhost', '192.168.1.16') }}
                            />
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        </View>
    </View>));
}
export default SecondaryBannerSlider;
