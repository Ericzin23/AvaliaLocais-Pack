import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { theme } from '../theme';
import { API } from '../services/api';

export default function ReviewScreen({ route, navigation }){
  const { place } = route.params;
  const [nota, setNota] = useState('8');
  const [comentario, setComentario] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  const enviar = async () => {
    try {
      // No mundo real, localId viria do backend após persistir o place; aqui vamos simular com 1
      const payload = { localId: 1, nota: Number(nota), comentario, fotoUrl };
      await API.post('/avaliacoes', payload, { headers: { 'X-User-Email': 'demo@user.com' } });
      navigation.replace('Share', { review: { nota, comentario, place } });
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível enviar sua avaliação.');
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Avaliar {place.name}</Text>
      <TextInput placeholder='Nota (0-10)' placeholderTextColor="#888" style={s.input} value={nota} onChangeText={setNota} keyboardType='numeric'/>
      <TextInput placeholder='Comentário (até 500)' placeholderTextColor="#888" style={[s.input,{height:120}]} multiline value={comentario} onChangeText={setComentario} maxLength={500}/>
      <TouchableOpacity style={s.btn} onPress={enviar}><Text style={s.btnText}>Enviar</Text></TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container:{flex:1, backgroundColor:theme.colors.bg, padding:16},
  title:{color:theme.colors.text, fontSize:18, marginBottom:8},
  input:{backgroundColor:theme.colors.card, color:theme.colors.text, padding:12, borderRadius:12, marginBottom:10},
  btn:{backgroundColor:theme.colors.primary, padding:14, borderRadius:12, alignItems:'center'},
  btnText:{color:'#fff', fontWeight:'bold'}
});
