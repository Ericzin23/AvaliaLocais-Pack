import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function AnimatedCheckmark({ visible, size = 60, color = '#22C55E' }) {
  const scale = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(checkAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0);
      checkAnim.setValue(0);
    }
  }, [visible]);

  const checkOpacity = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={[styles.circle, { borderColor: color }]}>
        <Animated.Text
          style={[
            styles.checkmark,
            { fontSize: size * 0.6, color, opacity: checkOpacity },
          ]}
        >
          ✓
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  checkmark: {
    fontWeight: 'bold',
  },
});
