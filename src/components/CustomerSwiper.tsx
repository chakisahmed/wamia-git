import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { FONTS, COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const CustomSwiper = ({ walkthroughData, handleSkip, handleGetStarted, colors }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentIndex < walkthroughData.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex + 1);
        fadeAnim.setValue(1);
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={{ ...styles.slide, opacity: fadeAnim }}>
        <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' }}>
          {/* Skip Button */}
          {currentIndex !== walkthroughData.length - 1 && (
            <TouchableOpacity
              style={{ position: 'absolute', top: 50, right: 20 }}
              onPress={handleSkip}
            >
              <Text style={[FONTS.body3, { color: COLORS.gray }]}>Skip</Text>
            </TouchableOpacity>
          )}
          {/* Image */}
          <ExpoImage
            style={{ height: height, width: width, resizeMode: 'cover' }}
            source={{ uri: walkthroughData[currentIndex].image.replace('localhost', '192.168.1.16') }}
            cachePolicy="memory-disk"
          />
          {/* Title */}
          <Text style={[FONTS.h1, { color: colors.text, textAlign: 'center', marginTop: 20 }]}>
            {walkthroughData[currentIndex].title}
          </Text>
          {/* Description */}
          <Text style={[FONTS.h4, { color: colors.text, textAlign: 'center', marginTop: 10 }]}>
            {walkthroughData[currentIndex].description}
          </Text>
          {/* Get Started Button */}
          {currentIndex === walkthroughData.length - 1 && (
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primary,
                width: '80%',
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                marginTop: 30,
              }}
              onPress={handleGetStarted}
            >
              <Text style={[FONTS.h3, { color: COLORS.white }]}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      {currentIndex < walkthroughData.length - 1 && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
});

export default CustomSwiper;