import React, { useRef, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet, Text } from 'react-native';
// Removido BlurView para evitar perda de foco em Android
import * as Haptics from 'expo-haptics';

export default function AnimatedInput({
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  maxLength,
  editable = true,
  ...props
}) {
  const [focused, setFocused] = React.useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  useEffect(() => {
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.2)', '#6366f1'],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.1)', 'rgba(99, 102, 241, 0.15)'],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ translateX: shakeAnim }] },
      ]}
    >
      <View style={styles.blur}>
        <Animated.View
          style={[
            styles.container,
            {
              borderColor: error ? '#EF4444' : borderColor,
              backgroundColor: error ? 'rgba(239, 68, 68, 0.1)' : backgroundColor,
            },
          ]}
        >
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={value}
            onChangeText={onChangeText}
            onFocus={() => {
              // Evitar haptics no foco, pois pode causar flicker em alguns dispositivos
              setFocused(true);
            }}
            onBlur={() => setFocused(false)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            editable={editable}
            blurOnSubmit={false}
            {...props}
          />
          {maxLength && value && (
            <Text style={styles.counter}>
              {value.length}/{maxLength}
            </Text>
          )}
        </Animated.View>
      </View>
      
      {error && (
        <Text style={styles.errorText}>⚠️ {error}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  blur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0,
    height: '100%',
  },
  counter: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 16,
  },
});
