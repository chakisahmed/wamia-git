import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { CommonActions, useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '@/constants/StyleSheet';
import { FONTS, COLORS, FONTS_CAIRO } from '@/constants/theme';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';
import { Image as ExpoImage, ImageBackground } from 'expo-image';
import { fetchWalkthroughs } from '@/api/walkthoughApi';
import { WalkthroughType } from '@/types/walkthroughTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from 'i18next';
import { IMAGES } from '@/constants/Images';
const { width, height } = Dimensions.get('window');

const Walkthrough = () => {
  const [walkthroughData, setWalkthroughData] = useState<WalkthroughType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();
  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWalkthrough', 'true');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'DrawerNavigation', params: { screen: 'Home' } },
          ],
        })
      );
    } catch (error) {
      console.error('Failed to save walkthrough status:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWalkthrough', 'true');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'DrawerNavigation', params: { screen: 'Home' } },
          ],
        })
      );
    } catch (error) {
      console.error('Failed to save walkthrough status:', error);
    }
  };
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    const getWalkthroughData = async () => {
      try {
        const data = await fetchWalkthroughs();
        if(!signal.aborted){

          setWalkthroughData(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch walkthrough data:', error);
        setIsLoading(false); // Set loading to false even if there's an error
      }
    };

    getWalkthroughData();

    return () => {
            controller.abort();
        };

  }, []);

  if (isLoading) {
    return (
      <View style={[GlobalStyleSheet.container, { backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      <Swiper
        loop={false}
        dotStyle={{ backgroundColor: COLORS.gray, width: 8, height: 8, borderRadius: 4, marginHorizontal: 3, marginBottom: 150 }}
        activeDotStyle={{ backgroundColor: COLORS.deepOrange, width: 8, height: 8, borderRadius: 4, marginHorizontal: 3, marginBottom: 150 }}
      >
        {walkthroughData.map((item, index) => (
          <ImageBackground key={index} source={IMAGES.wamia_bg} style={{ flex: 1, paddingHorizontal: 0, justifyContent: 'center', alignItems: 'center' }}>
            {index !== walkthroughData.length - 1 && (
              <TouchableOpacity
                style={{ position: 'absolute', top: 50, right: 20, zIndex: 1 }}
                onPress={handleSkip}
              >
                <Text style={[FONTS.body3, {
                  color: COLORS.white, backgroundColor: COLORS.secondary, padding: 10, shadowColor: COLORS.deepOrange, borderRadius: 10,
                  shadowOffset: {
                    width: 10,
                    height: 10,
                  },
                  shadowRadius: 5,
                  elevation: 10,
                }]}>{t("skip")}</Text>
              </TouchableOpacity>
            )}

            <View style={{
              height: 65,
              width: 130
            }}>
              <ExpoImage
                style={{ resizeMode: "contain", width: '100%', height: '100%', position: 'absolute' }}
                source={IMAGES.wamia_logo}
                cachePolicy="memory-disk"
              />

            </View>
            {/* Image */}
            <View style={{
              height: 260,
              width: 260,
              padding: 10,
              alignItems: 'center'
            }}>
              <ExpoImage
                style={{ resizeMode: "contain", width: '100%', height: '100%', position: 'absolute' }}
                source={{ uri: item.image.replace('localhost', '192.168.1.16') }}
                cachePolicy="memory-disk"
              />
            </View>

            {/* Title */}
            <Text style={[FONTS.cairoBold, { fontSize: 32, color: COLORS.black, textAlign: 'center', marginTop: 0 }]}>
              {item.title}
            </Text>
            {/* Description */}
            <Text style={[FONTS.cairoSemiBold, { fontSize: 15, color: "#666", textAlign: 'center', marginTop: 10, paddingBottom: 200 }]}>
              {item.description}
            </Text>
            {/* Get Started Button */}
            {index === walkthroughData.length - 1 && (
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.deepOrange,
                  width: '80%',
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  position: 'absolute',
                  bottom: 60,
                  marginBottom: 0,
                  shadowColor: COLORS.deepOrange,
                  shadowOffset: {
                    width: 10,
                    height: 10,
                  },
                  shadowRadius: 5,
                  elevation: 10,


                }}
                onPress={handleGetStarted}
              >
                <Text style={[FONTS.h4, { color: COLORS.white }]}>{t("get_started")}</Text>
              </TouchableOpacity>
            )}
          </ImageBackground>
        ))}
      </Swiper>
    </View>
  );
};

export default Walkthrough;
/**
 * import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import CustomSwiper from '@/components/CustomerSwiper';
import { fetchWalkthroughs } from '@/api/walkthoughApi';
import { WalkthroughType } from '@/types/walkthroughTypes';
import { COLORS } from '@/constants/theme';

const Walkthrough = ({ handleSkip, handleGetStarted }) => {
  const [walkthroughData, setWalkthroughData] = useState<WalkthroughType[]>([]);
  const [loading, setLoading] = useState(true);

  const handleFetchWalkthroughs = async () => {
    try {
      // Replace with your actual data fetching logic
      const response = await fetchWalkthroughs();

      setWalkthroughData(response);
    } catch (error) {
      console.error('Failed to fetch walkthroughs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchWalkthroughs();
  }, []);   

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomSwiper
        walkthroughData={walkthroughData}
        handleSkip={handleSkip}
        handleGetStarted={handleGetStarted}
        colors={COLORS}
      />
    </View>
  );
};

export default Walkthrough;
 */
