import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { register } from '../services/api';
import FloatingParticles from '../components/FloatingParticles';
import AnimatedWave from '../components/AnimatedWave';
import AnimatedInput from '../components/AnimatedInput';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import GenderSelector from '../components/GenderSelector';
import DatePickerInput from '../components/DatePickerInput';
import GlowingButton from '../components/GlowingButton';
import AnimatedCheckmark from '../components/AnimatedCheckmark';

const ALLOWED_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'];

function isEmailValid(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return false;
  if (ALLOWED_DOMAINS && ALLOWED_DOMAINS.length) {
    const part = email.split('@')[1]?.toLowerCase();
    if (!part || !ALLOWED_DOMAINS.includes(part)) return false;
  }
  return true;
}

function isPasswordStrong(password) {
  if (!password || password.length < 8) return false;
  return (
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('2000-01-01');
  const [genero, setGenero] = useState('Outro');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const progressAnim = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let completedFields = 0;
    if (nome.trim()) completedFields++;
    if (isEmailValid(email)) completedFields++;
    if (dataNascimento) completedFields++;
    if (genero) completedFields++;
    if (isPasswordStrong(senha)) completedFields++;
    if (senha && senha === confirmarSenha) completedFields++;

    const progress = completedFields / 6;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [nome, email, dataNascimento, genero, senha, confirmarSenha]);

  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    
    if (!nome?.trim()) {
      e.nome = 'Nome completo é obrigatório';
    } else if (nome.trim().length < 3) {
      e.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!isEmailValid(email)) {
      e.email = ALLOWED_DOMAINS
        ? `Use um e-mail válido (${ALLOWED_DOMAINS.join(', ')})`
        : 'E-mail inválido';
    }

    if (!dataNascimento?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      e.dataNascimento = 'Selecione uma data válida';
    } else {
      const age = new Date().getFullYear() - parseInt(dataNascimento.split('-')[0]);
      if (age < 13) {
        e.dataNascimento = 'Você deve ter pelo menos 13 anos';
      }
    }

    if (!['Masculino', 'Feminino', 'Outro'].includes(genero)) {
      e.genero = 'Selecione uma opção';
    }

    if (!isPasswordStrong(senha)) {
      e.senha = 'Senha não atende aos requisitos de segurança';
    }

    if (senha !== confirmarSenha) {
      e.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onRegister = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const payload = { nome, email, senha, dataNascimento, genero };
      await register(payload);

      setShowSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        typeof e?.response?.data === 'string'
          ? e.response.data
          : e?.response?.data?.message || e?.message || 'Não foi possível cadastrar.';
      
      const field = e?.response?.data?.field;
      if (field) {
        setErrors((prev) => ({ ...prev, [field]: msg }));
      } else {
        Alert.alert('Erro ao cadastrar', msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const progressColor = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#EF4444', '#F59E0B', '#22C55E'],
  });

  if (showSuccess) {
    return (
      <View style={s.successContainer}>
        <LinearGradient
          colors={['#0f0c29', '#302b63', '#24243e']}
          style={StyleSheet.absoluteFill}
        />
        <FloatingParticles count={30} />
        
        <Animatable.View animation="bounceIn" duration={800} style={s.successContent}>
          <AnimatedCheckmark visible={true} size={120} />
          <Text style={s.successTitle}>Conta criada com sucesso!</Text>
          <Text style={s.successSubtitle}>Redirecionando para o login...</Text>
        </Animatable.View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={StyleSheet.absoluteFill}
      />

      <FloatingParticles count={15} />
      <AnimatedWave />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.keyboardView}
      >
        <ScrollView
          style={s.scrollView}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: formOpacity }}>
            <Animatable.View animation="fadeInDown" delay={200} style={s.header}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.goBack();
                }}
                style={s.backButton}
              >
                <Text style={s.backIcon}>←</Text>
              </TouchableOpacity>
              
              <Text style={s.title}>Criar Conta</Text>
              <Text style={s.subtitle}>Preencha os dados abaixo</Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={400} style={s.progressContainer}>
              <View style={s.progressBar}>
                <Animated.View
                  style={[
                    s.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>
              <Text style={s.progressText}>
                {Math.round(progressAnim._value * 100)}% completo
              </Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={600}>
              <AnimatedInput
                icon="👤"
                placeholder="Nome completo"
                value={nome}
                onChangeText={(t) => {
                  setNome(t);
                  clearError('nome');
                }}
                error={errors.nome}
                autoCapitalize="words"
                maxLength={50}
              />

              <AnimatedInput
                icon="📧"
                placeholder="E-mail"
                value={email}
                onChangeText={(t) => {
                  setEmail(t.toLowerCase());
                  clearError('email');
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <DatePickerInput
                value={dataNascimento}
                onChange={(date) => {
                  setDataNascimento(date);
                  clearError('dataNascimento');
                }}
                error={errors.dataNascimento}
              />

              <GenderSelector
                value={genero}
                onChange={(g) => {
                  setGenero(g);
                  clearError('genero');
                }}
                error={errors.genero}
              />

              <AnimatedInput
                icon="🔒"
                placeholder="Senha"
                value={senha}
                onChangeText={(t) => {
                  setSenha(t);
                  clearError('senha');
                }}
                error={errors.senha}
                secureTextEntry
              />

              <PasswordStrengthMeter password={senha} />

              <AnimatedInput
                icon="🔐"
                placeholder="Confirmar senha"
                value={confirmarSenha}
                onChangeText={(t) => {
                  setConfirmarSenha(t);
                  clearError('confirmarSenha');
                }}
                error={errors.confirmarSenha}
                secureTextEntry
              />

              <Animatable.View animation="fadeIn" delay={800}>
                <Text style={s.terms}>
                  Ao criar uma conta, você concorda com nossos{' '}
                  <Text style={s.termsLink}>Termos de Uso</Text> e{' '}
                  <Text style={s.termsLink}>Política de Privacidade</Text>
                </Text>
              </Animatable.View>

              <Animatable.View animation="fadeInUp" delay={1000}>
                <GlowingButton
                  title={submitting ? 'Criando conta...' : 'Criar Conta'}
                  onPress={onRegister}
                  style={s.submitButton}
                />
              </Animatable.View>

              <Animatable.View animation="fadeIn" delay={1200}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.goBack();
                  }}
                  style={s.loginLink}
                >
                  <Text style={s.loginText}>
                    Já tem uma conta?{' '}
                    <Text style={s.loginTextBold}>Fazer login</Text>
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            </Animatable.View>
          </Animated.View>
        </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'right',
  },
  terms: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: '#6366f1',
    fontWeight: '600',
  },
  submitButton: {
    marginBottom: 16,
    width: '100%',
  },
  loginLink: {
    padding: 16,
    alignItems: 'center',
  },
  loginText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  loginTextBold: {
    color: '#ec4899',
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
    padding: 40,
  },
  successTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 24,
    textAlign: 'center',
  },
  successSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
