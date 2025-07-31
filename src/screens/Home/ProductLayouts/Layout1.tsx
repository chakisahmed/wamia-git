// src/components/ProductLayouts/Layout1.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, ToastAndroid } from 'react-native';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { FONTS, COLORS, SIZES } from '@/constants/theme';
import StopWatch from '@/components/StopWatch';
import Cardstyle1 from '@/components/Card/Cardstyle1';
import { calculateDiscount, consoleLog } from '@/utils/helpers';   
import { Image } from 'expo-image';
import { useTheme } from '@react-navigation/native';
import { IMAGES } from '@/constants/Images';
import { useTranslation } from 'react-i18next';
import { useProductsIncludingSkus } from '@/hooks/productHooks';

interface Layout1Props {
  layout: {
    name: string;
    dateRange: [string, string];
    data: any[];
  };
  navigation: any;
}

const Layout1: React.FC<Layout1Props> = ({ layout, navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {productsData, loading, error } = useProductsIncludingSkus({skus: layout.data.map((p)=>p.sku)}) 

  useEffect(()=>{
    consoleLog("loaded" , productsData!=null)
  },[productsData])

  // Calculate remaining seconds for the countdown
  const secondsRemaining = Math.floor(
    (new Date(layout.dateRange[1]).getTime() - new Date().getTime()) / 1000
  );

  return (
    <View style={[GlobalStyleSheet.container, { padding: 0, marginTop: 5, marginBottom: 5 }]}>
      
      {layout.dateRange[0] && layout.dateRange[1]?  (
        <View style={[GlobalStyleSheet.container, { paddingHorizontal: 20, backgroundColor: colors.card }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title, marginBottom: 5 }]}>
                {t('top_deals_of_the_day')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={[FONTS.fontMedium, { fontSize: 14, color: '#BF0A30' }]}>
                  {t('offer_ends_in')}
                </Text>
                <View>
                  <StopWatch seconds={secondsRemaining} />
                </View>
              </View>
            </View>
            {['daily deals', 'top deals of the day'].includes(layout.name.toLowerCase()) && (
              <View>
                <Image style={{ resizeMode: 'contain', height: 65, width: 115 }} source={IMAGES.ads1} />
              </View>
            )}
          </View>
        </View>
      ): <View
      style={[
        GlobalStyleSheet.container,
        { paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight },
      ]}
    >
      <Text style={[FONTS.fontMedium, { fontSize: 18, color: colors.title }]}>{layout.name}</Text>
    </View>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {!loading && (productsData?.items.map((data, index: number) => {
            const discount = calculateDiscount(data.price_range.maximum_price.regular_price.value ??Number(data.price_float), 
            data.price_range.maximum_price.final_price.value ?? Number(data.final_price_float));
            const currency = data.price_range?.maximum_price.final_price.currency ?? ''
            return (
              <View
                key={index}
                style={{
                  marginBottom: 0,
                  width:
                    Dimensions.get('window').width > SIZES.container
                      ? SIZES.container / 3
                      : Dimensions.get('window').width / 2.3,
                }}
              >
                <Cardstyle1
                data={data}
                  id={data.id}
                  title={data.name}
                  image={  data.media_gallery[0].url ?? `https://www.wamia.tn//media/catalog/product${data.image}`}
                  price={data.price_range ?data.price_range.maximum_price.final_price.value + " "+ currency : data.final_price}
                  sku={data.sku}
                  offer={discount > 0 ? `${discount} %` : ''}
                  color={data.color}
                  brand={data.brand}
                  hascolor={data.hascolor}
                  discount={discount > 0 ? ( data.price_range.maximum_price.regular_price.value ?? data.price) : ''}
                  borderTop={true}
                  onPress={async () => {
                    try {
                      
                      navigation.navigate('ProductsDetails', { product:data });
                    } catch (error) {
                      
                      ToastAndroid.show(t('product_not_found'), ToastAndroid.SHORT);
                    }
                  }}
                />
              </View>
            );
          }))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Layout1;
