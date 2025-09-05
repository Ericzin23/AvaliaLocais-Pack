import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function ShareCard({review}){
  const { nota, comentario, place } = review;
  return (
    <View style={s.card}>
      <Text style={s.title}>{place.name}</Text>
      <Text style={s.score}>{nota}/10</Text>
      <Text style={s.comment}>{(comentario||'').slice(0,120)}</Text>
      <Text style={s.brand}>AvaliaLocais</Text>
    </View>
  )
}

const s = StyleSheet.create({
  card:{width:360, height:640, backgroundColor:theme.colors.card, borderRadius:20, padding:16, justifyContent:'space-between'},
  title:{color:theme.colors.text, fontSize:22, fontWeight:'bold'},
  score:{color:theme.colors.accent, fontSize:48, fontWeight:'900'},
  comment:{color:'#9aa', fontSize:16},
  brand:{color:'#666', alignSelf:'center', marginBottom:8}
});
