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
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/colors';
import { Canvas, Path, Skia, BlurMask } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  variant?: 'default' | 'stars' | 'waves' | 'bubbles';
  children: React.ReactNode;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'default',
  children,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1
    );

    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const renderBackground = () => {
    switch (variant) {
      case 'stars':
        return <StarsBackground />;
      case 'waves':
        return <WavesBackground />;
      case 'bubbles':
        return <BubblesBackground />;
      default:
        return (
          <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]}>
            <LinearGradient
              colors={[
                colors.primary.lightPink + '20',
                colors.secondary.lightPurple + '20',
                colors.accent.peach + '20',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.neutral.offWhite, colors.secondary.lightPurple + '30']}
        style={StyleSheet.absoluteFillObject}
      />
      {renderBackground()}
      {children}
    </View>
  );
};

const StarsBackground = () => {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height * 0.7,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2000,
  }));

  return (
    <>
      {stars.map((star) => (
        <AnimatedStar key={star.id} {...star} />
      ))}
    </>
  );
};

const AnimatedStar = ({ x, y, size, delay }: any) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size * 2,
          height: size * 2,
          borderRadius: size,
        },
        animatedStyle,
      ]}
    />
  );
};

const WavesBackground = () => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-50, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const path = Skia.Path.Make();
  path.moveTo(0, height * 0.8);
  path.cubicTo(
    width * 0.25, height * 0.75,
    width * 0.75, height * 0.85,
    width, height * 0.8
  );
  path.lineTo(width, height);
  path.lineTo(0, height);
  path.close();

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]}>
      <Canvas style={StyleSheet.absoluteFillObject}>
        <Path
          path={path}
          color={colors.primary.lightPink + '40'}
        >
          <BlurMask blur={10} style="normal" />
        </Path>
      </Canvas>
    </Animated.View>
  );
};

const BubblesBackground = () => {
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    size: Math.random() * 40 + 20,
    duration: Math.random() * 3000 + 5000,
    delay: Math.random() * 3000,
  }));

  return (
    <>
      {bubbles.map((bubble) => (
        <AnimatedBubble key={bubble.id} {...bubble} />
      ))}
    </>
  );
};

const AnimatedBubble = ({ x, size, duration, delay }: any) => {
  const translateY = useSharedValue(height + size);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-size * 2, {
          duration,
          easing: Easing.linear,
        }),
        -1
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.3, {
          duration: duration / 2,
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: x - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    backgroundColor: colors.accent.yellow,
    shadowColor: colors.accent.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: colors.primary.pink + '20',
    borderWidth: 1,
    borderColor: colors.primary.pink + '30',
  },
});