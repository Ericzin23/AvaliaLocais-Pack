import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ShareCard from '../components/ShareCard';
import { theme } from '../theme';

export default function ShareScreen({ route }){
  const { review } = route.params;
  const ref = useRef();

  const share = async () => {
    try{
      const uri = await ref.current.capture();
      await Sharing.shareAsync(uri);
    }catch(e){ Alert.alert('Erro', 'Não foi possível compartilhar.'); }
  }

  const save = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if(status!=='granted'){ Alert.alert('Permissão','Autorize salvar mídia.'); return; }
    const uri = await ref.current.capture();
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert('Salvo','Imagem salva na galeria.');
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Compartilhar</Text>
      <ViewShot ref={ref} options={{format:'png', quality:1, width:1080}} style={{alignItems:'center'}}>
        <ShareCard review={review} />
      </ViewShot>
      <View style={s.row}>
        <TouchableOpacity style={s.btn} onPress={save}><Text style={s.btnText}>Salvar</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btn,{backgroundColor:theme.colors.accent}]} onPress={share}><Text style={s.btnText}>Compartilhar</Text></TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container:{flex:1, backgroundColor:theme.colors.bg, padding:16},
  title:{color:theme.colors.text, fontSize:20, marginBottom:8},
  row:{flexDirection:'row', gap:10, marginTop:12},
  btn:{flex:1, backgroundColor:theme.colors.primary, padding:14, borderRadius:12, alignItems:'center'},
  btnText:{color:'#fff', fontWeight:'bold'}
});
