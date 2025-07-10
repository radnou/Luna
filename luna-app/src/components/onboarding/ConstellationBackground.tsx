import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/src/styles/colors';

const { width, height } = Dimensions.get('window');

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  id: string;
}

const generateStars = (): Star[] => {
  const stars: Star[] = [];
  for (let i = 0; i < 30; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.6,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 2000,
      id: `star-${i}`,
    });
  }
  return stars;
};

export function ConstellationBackground() {
  const stars = generateStars();

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {stars.map((star) => (
        <AnimatedStar key={star.id} star={star} />
      ))}
    </View>
  );
}

function AnimatedStar({ star }: { star: Star }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      star.delay,
      withRepeat(
        withTiming(1, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacityValue = interpolate(
      opacity.value,
      [0, 0.5, 1],
      [0.3, 1, 0.3]
    );

    return {
      position: 'absolute',
      left: star.x - star.size / 2,
      top: star.y - star.size / 2,
      width: star.size,
      height: star.size,
      backgroundColor: colors.accent.yellow,
      borderRadius: star.size / 2,
      opacity: opacityValue,
    };
  });

  return <Animated.View style={animatedStyle} />;
}