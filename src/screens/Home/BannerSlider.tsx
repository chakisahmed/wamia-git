// src/components/Home/BannerSlider.tsx
import React from 'react';
import { View, TouchableOpacity, Platform, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import { Image } from 'expo-image'; // or use react-native's Image if preferred
import { COLORS } from '@/constants/theme';
import { fetchCategory } from '@/api/categoriesApi';
import { getProduct } from '@/api/productsApi';
import { useNavigation } from '@react-navigation/native';

interface BannerSliderProps {
  data: Array<{
    url: string;
    banner_type: string;
    catalog_id?: string;
    sku?: string;
  }>;
}

const BannerSlider: React.FC<BannerSliderProps> = ({ data }) => {
  const navigation = useNavigation();

  const handlePress = async (item: any) => {
    try {
      if (item.banner_type === 'category') {
        const response = await fetchCategory(item.catalog_id);
        navigation.navigate('Products', { category: response.items[0] });
      } else {
        const product = await getProduct(item.sku);
        if (!product) throw new Error(t('product_not_found'));
        navigation.navigate('ProductsDetails', { product });
      }
    } catch (error) {
      console.error('BannerSlider error:', error);
    }
  };

  return (
    <Swiper
      autoplay
      autoplayTimeout={5}
      height={Dimensions.get('window').width * 0.5} // adjust as needed
      dotStyle={{
        height: 6,
        width: 6,
        backgroundColor: COLORS.card,
        opacity: 0.2,
      }}
      activeDotStyle={{
        height: 6,
        width: 6,
        backgroundColor: COLORS.card,
      }}
      paginationStyle={{ bottom: 10 }}
      showsPagination={Platform.OS === 'android'}
    >
      {data.map((item, index) => (
        <View key={index} style={{ width: '100%' }}>
          <TouchableOpacity onPress={() => handlePress(item)}>
            <Image
              source={{ uri: item.url.replace('localhost', '192.168.1.16') }}
              style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
              cachePolicy="disk"
              contentFit="fill"
            />
          </TouchableOpacity>
        </View>
      ))}
    </Swiper>
  );
};

export default BannerSlider;
