import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
// Removido BlurView no formulário para evitar perda de foco em Android
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';
import { login } from '../services/api';
import FloatingParticles from '../components/FloatingParticles';
import AnimatedWave from '../components/AnimatedWave';
import GlowingButton from '../components/GlowingButton';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animação inicial do logo
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação do formulário
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Pulso contínuo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onLogin = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await login(email, senha);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('Main');
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'E-mail ou senha inválidos.');
    }
  };

  const handleFieldFocus = (field) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFocusedField(field);
  };

  const rotate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={s.container}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={StyleSheet.absoluteFill}
      />

      <FloatingParticles count={20} />
      <AnimatedWave />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.keyboardView}
      >
        {/* Logo animado */}
        <Animated.View
          style={[
            s.logoContainer,
            {
              transform: [
                { scale: Animated.multiply(logoScale, pulseAnim) },
                { rotate },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#6366f1', '#8b5cf6', '#ec4899']}
            style={s.logoGradient}
          >
            <Text style={s.logoText}>AL</Text>
          </LinearGradient>
        </Animated.View>

        <Animatable.Text
          animation="fadeInUp"
          delay={400}
          style={s.title}
        >
          AvaliaLocais
        </Animatable.Text>

        <Animatable.Text
          animation="fadeInUp"
          delay={600}
          style={s.subtitle}
        >
          Descubra e avalie os melhores lugares
        </Animatable.Text>

        {/* Formulário */}
        <Animated.View style={[s.formContainer, { opacity: formOpacity }]}>
          <Animatable.View
            animation="fadeInUp"
            delay={800}
            style={s.inputWrapper}
          >
            <View style={s.inputBlur}>
              <View
                style={[
                  s.inputContainer,
                  focusedField === 'email' && s.inputFocused,
                ]}
              >
                <Text style={s.inputIcon}>📧</Text>
                <TextInput
                  placeholder="E-mail"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={s.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => handleFieldFocus('email')}
                  onBlur={() => setFocusedField(null)}
                  blurOnSubmit={false}
                />
              </View>
            </View>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            delay={1000}
            style={s.inputWrapper}
          >
            <View style={s.inputBlur}>
              <View
                style={[
                  s.inputContainer,
                  focusedField === 'senha' && s.inputFocused,
                ]}
              >
                <Text style={s.inputIcon}>🔒</Text>
                <TextInput
                  placeholder="Senha"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={s.input}
                  secureTextEntry
                  value={senha}
                  onChangeText={setSenha}
                  onFocus={() => handleFieldFocus('senha')}
                  onBlur={() => setFocusedField(null)}
                  blurOnSubmit={false}
                />
              </View>
            </View>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={1200}>
            <GlowingButton
              title="Entrar"
              onPress={onLogin}
              style={s.loginBtn}
            />
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={1400}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Register');
              }}
              style={s.registerContainer}
            >
              <View style={s.registerBlur}>
                <Text style={s.registerText}>
                  Não tem uma conta?{' '}
                  <Text style={s.registerLink}>Criar conta</Text>
                </Text>
              </View>
            </TouchableOpacity>
          </Animatable.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(99, 102, 241, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  loginBtn: {
    marginTop: 8,
    marginBottom: 24,
    width: '100%',
  },
  registerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerBlur: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  registerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  registerLink: {
    color: '#ec4899',
    fontWeight: 'bold',
  },
});
