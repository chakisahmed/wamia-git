import React, { useEffect, useRef, ReactNode } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Create an animatable version of the LinearGradient component
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

// --- Define the props for our component ---
interface AnimatedGradientBackgroundProps {
  /** The content to render inside the gradient view */
  children: ReactNode;
  /** An array of two color arrays to animate between. e.g., [['#color1', '#color2'], ['#color3', '#color4']] */
  colorSets: [string[], string[]];
  /** Custom styles to apply to the gradient container */
  style?: StyleProp<ViewStyle>;
  /** The duration for one phase of the animation (e.g., from state A to B) in milliseconds */
  duration?: number;
}

const AnimatedGradientBackground = ({
  children,
  colorSets,
  style,
  duration = 4000, // Default duration of 4 seconds
}: AnimatedGradientBackgroundProps) => {

  // 1. Create an animated value to drive the animation
  const animatedValue = useRef(new Animated.Value(0)).current;

  // 2. Set up the animation loop
  useEffect(() => {
    // Ensure we have valid color sets to prevent errors
    if (!colorSets || colorSets.length < 2) {
      console.warn("AnimatedGradientBackground requires at least two color sets in the 'colorSets' prop.");
      return;
    }

    Animated.loop(
      Animated.sequence([
        // Animate from 0 to 1
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false, // Essential for color animation
        }),
        // Animate from 1 back to 0
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [animatedValue, duration, colorSets]);

  // 3. Interpolate the animated value to create transitioning colors
  const firstColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colorSets[0][0], colorSets[1][0]],
  });

  const secondColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colorSets[0][1], colorSets[1][1]],
  });

  return (
    <AnimatedGradient
      // The `colors` prop receives the animated color values
      colors={[firstColor, secondColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style} // Apply any passed-in styles
    >
      {children}
    </AnimatedGradient>
  );
};

export default AnimatedGradientBackground;