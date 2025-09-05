import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { theme } from '../theme';

export default function DetailsScreen({ route, navigation }){
  const { place } = route.params;
  const lat = place?.geometry?.location?.lat || 0;
  const lng = place?.geometry?.location?.lng || 0;

  const goMaps = () => {
    const label = encodeURIComponent(place.name);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${place.place_id}`;
    Linking.openURL(url);
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>{place.name}</Text>
      <Text style={s.addr}>{place.vicinity}</Text>
      <MapView style={s.map} initialRegion={{latitude:lat, longitude:lng, latitudeDelta:0.01, longitudeDelta:0.01}}>
        <Marker coordinate={{latitude:lat, longitude:lng}} title={place.name} />
      </MapView>
      <View style={s.row}>
        <TouchableOpacity style={s.btn} onPress={()=>navigation.navigate('Review', { place })}>
          <Text style={s.btnText}>Avaliar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, {backgroundColor:theme.colors.accent}]} onPress={goMaps}>
          <Text style={s.btnText}>Como chegar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container:{flex:1, backgroundColor:theme.colors.bg, padding:16},
  title:{color:theme.colors.text, fontSize:22, fontWeight:'bold'},
  addr:{color:'#9aa', marginBottom:10},
  map:{flex:1, borderRadius:12, marginVertical:12},
  row:{flexDirection:'row', gap:10},
  btn:{flex:1, backgroundColor:theme.colors.primary, padding:14, borderRadius:12, alignItems:'center'},
  btnText:{color:'#fff', fontWeight:'bold'}
});
