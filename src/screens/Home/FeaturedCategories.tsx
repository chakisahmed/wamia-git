// src/components/Home/FeaturedCategories.tsx
import React, { Children } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { FONTS, COLORS } from '@/constants/theme';
import { fetchCategories, fetchCategory, getCagetoryBanner } from '@/api/categoriesApi';
import { useNavigation, useTheme } from '@react-navigation/native';

interface FeaturedCategoriesProps {
  data: Array<{
    categoryId: string;
    url: string;
    categoryName: string;
  }>;
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ data }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const handlePress = async (category: any) => {
    try {
      const image = await getCagetoryBanner(category.categoryId);
      navigation.navigate('Products', { category: {
        id: category.categoryId,
        image: "https://www.wamia.tn"+image,
        name: category.categoryName,
        children: []
      } });
    } catch (error) {
      console.error('FeaturedCategories error:', error);
    }
  };

  return (
    <View style={[GlobalStyleSheet.container, { paddingHorizontal: 0, backgroundColor: colors.card, marginTop: 10 }]}>
      <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 20, flexGrow: 1 }} showsHorizontalScrollIndicator={false}>
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.5}
            style={{ alignItems: 'center', marginRight: 20 }}
            onPress={() => handlePress(item)}
          >
            <View
              style={{
                height: 60,
                width: 60,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: COLORS.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                style={{ height: 60, width: 60, resizeMode: 'contain', borderRadius: 50 }}
                source={{ uri: item.url.replace('localhost', '192.168.1.16') }}
              />
            </View>
            <Text style={[FONTS.fontRegular, { fontSize: 13, color: colors.title, marginTop: 10 }]}>
              {item.categoryName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default FeaturedCategories;
