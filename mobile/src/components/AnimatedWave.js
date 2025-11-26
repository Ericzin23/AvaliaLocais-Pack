import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AnimatedWave() {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createWaveAnimation = (animatedValue, duration) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createWaveAnimation(wave1, 8000),
      createWaveAnimation(wave2, 6000),
      createWaveAnimation(wave3, 10000),
    ]).start();
  }, []);

  const translateX1 = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  const translateX2 = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [-width / 2, width / 2],
  });

  const translateX3 = wave3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.wave,
          { transform: [{ translateX: translateX1 }], opacity: 0.15 },
        ]}
      >
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.wave,
          { transform: [{ translateX: translateX2 }], opacity: 0.1 },
        ]}
      >
        <LinearGradient
          colors={['#ec4899', '#f43f5e', '#fb923c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.wave,
          { transform: [{ translateX: translateX3 }], opacity: 0.12 },
        ]}
      >
        <LinearGradient
          colors={['#8b5cf6', '#6366f1', '#3b82f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    width: width * 2,
    height: 400,
    top: -100,
    borderRadius: 200,
  },
  gradient: {
    flex: 1,
    borderRadius: 200,
  },
});
