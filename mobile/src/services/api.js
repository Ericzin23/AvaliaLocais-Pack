import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.109:8080', // confirme o IP que o app usa
  timeout: 15000,
});

export async function login(email, senha) {
  const { data } = await api.post('/auth/login', { email, senha });
  return data;
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export default api;
