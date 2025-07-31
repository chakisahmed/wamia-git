// src/components/Home/MainCategories.tsx
import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { FONTS } from '@/constants/theme';
import { CategoryType, fetchCategory, getCagetoryImage } from '@/api/categoriesApi';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { consoleLog } from '@/utils/helpers';
import { fetchCategories } from '@/redux/slices/categorySlice';
const MainCategories: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const categories2 = useSelector((state: RootState) => state.categories);
  const [categories, setCategories] = React.useState<CategoryType[]>([]);

  // ********* old without clean up
  // useEffect(() => {
  //   const loadRootCategories = async () => {
  //     try {
  //       if (categories2 && categories2.categories && categories2.categories.items) {
  //         setCategories(categories2.categories.items);

  //       }
  //     } catch (error) {
  //       console.error('Error fetching categories:', error);
  //     } 
  //   };
  //   loadRootCategories();
  // }, [categories2]);

  // new with clean up
  const dispatch = useDispatch()
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    if (!signal.aborted) dispatch(fetchCategories())

    return () => {
      controller.abort();
    };


  }, [])
  useEffect(() => {
    const loadRootCategories = () => {
      try {
        if (categories2 && categories2.categories && categories2.categories.items) {
          setCategories(categories2.categories.items);

        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    loadRootCategories();


  }, [categories2]);


  return (
    <View style={[GlobalStyleSheet.container, { paddingHorizontal: 0, paddingTop: 10 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 10 }}>
          {categories.map((data: CategoryType, index) => {


            return (
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const response = await fetchCategory(data.id);
                    navigation.navigate('Products', { category: response.items[0] });
                  } catch (error) {
                    console.error('Error fetching categories:', error);
                  }
                }}
                key={index}
                style={{
                  backgroundColor: colors.card,
                  height: 35,
                  alignItems: 'center',
                  gap: 5,
                  //justifyContent: 'center',
                  flexDirection: 'row',
                  borderRadius: 34,
                  borderWidth: 1,
                  borderColor: colors.text,
                  //marginTop: 10,
                  paddingRight: 5,
                  paddingVertical: 5,
                  overflow: 'hidden'
                }}>
                <Image
                  style={{ width: 44, height: 45, resizeMode: 'contain', borderRadius: 34, }}
                  source={"https://www.wamia.tn/media/catalog/category" + data.magefan_og_image}
                />
                <Text style={{ ...FONTS.fontMedium, fontSize: 13, color: colors.title }}>{data.name}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default MainCategories;

