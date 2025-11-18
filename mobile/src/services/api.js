import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API = axios.create({
  baseURL: 'http://192.168.0.112:8080', // IP do seu PC
  timeout: 15000,
});

// Interceptor para adicionar X-User-Email automaticamente em todas as requisições
API.interceptors.request.use(async (config) => {
  const userEmail = await AsyncStorage.getItem('userEmail');
  if (userEmail) {
    config.headers['X-User-Email'] = userEmail;
  }
  return config;
});

export async function login(email, senha) {
  const { data } = await API.post('/auth/login', { email, senha });
  // Armazenar email do usuário logado
  await AsyncStorage.setItem('userEmail', email);
  return data;
}

export async function register(payload) {
  const { data } = await API.post('/auth/register', payload);
  // Armazenar email do usuário registrado
  await AsyncStorage.setItem('userEmail', payload.email);
  return data;
}

export async function logout() {
  await AsyncStorage.removeItem('userEmail');
}

export async function getCurrentUserEmail() {
  return await AsyncStorage.getItem('userEmail');
}

export default API;