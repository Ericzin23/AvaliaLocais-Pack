import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://20.20.20.29:8080', // IP do seu PC
  timeout: 15000,
});

export async function login(email, senha) {
  const { data } = await API.post('/auth/login', { email, senha });
  return data;
}

export async function register(payload) {
  const { data } = await API.post('/auth/register', payload);
  return data;
}

export default API;