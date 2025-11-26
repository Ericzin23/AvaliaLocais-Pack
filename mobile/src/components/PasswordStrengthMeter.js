import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';

export default function PasswordStrengthMeter({ password }) {
  const getStrength = () => {
    if (!password) return { score: 0, label: '', color: '#333' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    score += checks.length ? 1 : 0;
    score += checks.uppercase ? 1 : 0;
    score += checks.lowercase ? 0.5 : 0;
    score += checks.number ? 1 : 0;
    score += checks.special ? 1.5 : 0;

    const progress = Math.min(score / 5, 1);

    if (progress < 0.4) return { score: progress, label: 'Fraca', color: '#EF4444' };
    if (progress < 0.7) return { score: progress, label: 'Média', color: '#F59E0B' };
    return { score: progress, label: 'Forte', color: '#22C55E' };
  };

  const strength = getStrength();

  const requirements = [
    { met: password.length >= 8, text: 'Mínimo 8 caracteres' },
    { met: /[A-Z]/.test(password), text: 'Letra maiúscula' },
    { met: /[a-z]/.test(password), text: 'Letra minúscula' },
    { met: /\d/.test(password), text: 'Número' },
    { met: /[^A-Za-z0-9]/.test(password), text: 'Símbolo especial' },
  ];

  return (
    <View style={styles.container}>
      <Progress.Bar
        progress={strength.score}
        width={null}
        height={8}
        color={strength.color}
        unfilledColor="rgba(255,255,255,0.1)"
        borderWidth={0}
        borderRadius={4}
      />
      
      {password.length > 0 && (
        <>
          <Text style={[styles.label, { color: strength.color }]}>
            Força: {strength.label}
          </Text>
          
          <View style={styles.requirements}>
            {requirements.map((req, idx) => (
              <View key={idx} style={styles.requirement}>
                <Text style={[styles.bullet, { color: req.met ? '#22C55E' : '#666' }]}>
                  {req.met ? '✓' : '○'}
                </Text>
                <Text style={[styles.reqText, { color: req.met ? '#22C55E' : '#999' }]}>
                  {req.text}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 6,
  },
  requirements: {
    gap: 3,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bullet: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reqText: {
    fontSize: 12,
  },
});
