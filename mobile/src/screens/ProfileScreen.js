import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function ProfileScreen(){
  return (
    <View style={s.container}>
      <Text style={s.title}>Meu Perfil</Text>
      <Text style={s.text}>Estatísticas e avaliações aparecerão aqui.</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container:{flex:1, backgroundColor:theme.colors.bg, padding:16},
  title:{color:theme.colors.text, fontSize:22, marginBottom:8},
  text:{color:'#9aa'}
});
