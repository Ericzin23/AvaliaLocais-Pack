import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const Particle = ({ delay, duration, startX, endX }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -100],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startX, endX, startX],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.2, 0.5],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
          opacity,
        },
      ]}
    />
  );
};

export default function FloatingParticles({ count = 15 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: Math.random() * 3000,
    duration: 8000 + Math.random() * 4000,
    startX: Math.random() * width,
    endX: (Math.random() - 0.5) * 100,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <Particle
          key={p.id}
          delay={p.delay}
          duration={p.duration}
          startX={p.startX}
          endX={p.endX}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(99, 102, 241, 0.4)',
  },
});
