import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import SafeBlurView from './SafeBlurView';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';

export default function GenderSelector({ value, onChange, error }) {
  const options = [
    { label: 'Masculino', icon: '👨', value: 'Masculino', gradient: ['#3b82f6', '#2563eb'] },
    { label: 'Feminino', icon: '👩', value: 'Feminino', gradient: ['#ec4899', '#db2777'] },
    { label: 'Outro', icon: '🌈', value: 'Outro', gradient: ['#8b5cf6', '#7c3aed'] },
  ];

  const handleSelect = (option) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChange(option.value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Gênero</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, idx) => {
          const isSelected = value === option.value;
          
          return (
            <Animatable.View
              key={option.value}
              animation={isSelected ? 'pulse' : undefined}
              duration={300}
              style={styles.optionWrapper}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSelect(option)}
                style={styles.touchable}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={option.gradient}
                    style={styles.option}
                  >
                    <Text style={styles.icon}>{option.icon}</Text>
                    <Text style={styles.selectedText}>{option.label}</Text>
                  </LinearGradient>
                ) : (
                  <SafeBlurView intensity={15} style={styles.option}>
                    <View style={styles.unselectedContent}>
                      <Text style={styles.iconGray}>{option.icon}</Text>
                      <Text style={styles.unselectedText}>{option.label}</Text>
                    </View>
                  </SafeBlurView>
                )}
              </TouchableOpacity>
            </Animatable.View>
          );
        })}
      </View>
      {error && (
        <Text style={styles.errorText}>⚠️ {error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  optionWrapper: {
    flex: 1,
    maxWidth: '32%',
  },
  touchable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 80,
  },
  unselectedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  iconGray: {
    fontSize: 28,
    marginBottom: 6,
    opacity: 0.5,
  },
  selectedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unselectedText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
});
