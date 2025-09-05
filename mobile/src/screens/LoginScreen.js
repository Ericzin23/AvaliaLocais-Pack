import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { login } from '../services/api';

export default function LoginScreen({ navigation }){
  const [email,setEmail] = useState('');
  const [senha,setSenha] = useState('');

  const onLogin = async () => {
    try{
      await login(email, senha);
      navigation.replace('Main');
    }catch(e){
      Alert.alert('Erro', 'E-mail ou senha inválidos.');
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>AvaliaLocais</Text>
      <TextInput placeholder='E-mail' placeholderTextColor="#888" style={s.input} autoCapitalize='none' value={email} onChangeText={setEmail}/>
      <TextInput placeholder='Senha' placeholderTextColor="#888" style={s.input} secureTextEntry value={senha} onChangeText={setSenha}/>
      <TouchableOpacity style={s.btn} onPress={onLogin}><Text style={s.btnText}>Entrar</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>navigation.navigate('Register')}><Text style={s.link}>Criar conta</Text></TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container:{flex:1, backgroundColor:theme.colors.bg, alignItems:'center', justifyContent:'center', padding:24},
  title:{color:theme.colors.text, fontSize:28, marginBottom:24},
  input:{width:'100%', backgroundColor:theme.colors.card, color:theme.colors.text, padding:14, borderRadius:12, marginBottom:12},
  btn:{backgroundColor:theme.colors.primary, padding:14, borderRadius:12, width:'100%', alignItems:'center', marginTop:8},
  btnText:{color:'#fff', fontWeight:'bold'},
  link:{color:theme.colors.accent, marginTop:16}
});
