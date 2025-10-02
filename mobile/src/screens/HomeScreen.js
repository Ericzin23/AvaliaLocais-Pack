import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { API } from '../services/api';
import { theme } from '../theme';

const CATS = [
  'restaurante','bar','cafe','hotel','academia','hospital',
  'escola','mercado','farmacia','parque','shopping','escritorio'
];

export default function HomeScreen({ navigation }){
  const [cat, setCat] = useState('restaurante');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchNearby(category, useRadius) {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão', 'Autorize o acesso à localização para buscar locais próximos.');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      // 🚩 usa a rota correta do backend: /locais/nearby
      const response = await API.get('/locais/nearby', {
        params: { lat: latitude, lng: longitude, categoria: category, radius: useRadius ?? 0 }
      });

      console.log("Resposta do backend:", response.data);

      let results = [];
      if (response.data && Array.isArray(response.data.results)) {
        results = response.data.results;
      }

      // fallback: tenta 5 km se rankby não trouxe nada
      if (results.length === 0 && (useRadius ?? 0) === 0) {
        const fallback = await API.get('/locais/nearby', {
          params: { lat: latitude, lng: longitude, categoria: category, radius: 5000 }
        });
        console.log("Resposta fallback:", fallback.data);
        if (fallback.data && Array.isArray(fallback.data.results)) {
          results = fallback.data.results;
        }
      }

      console.log("Results extraídos:", results.length, results);
      setItems(results);
    } catch (e) {
      console.log('Erro Nearby:', {
        message: e?.message,
        status: e?.response?.status,
        url: e?.config?.url,
        params: e?.config?.params,
        data: e?.response?.data
      });
      if (e?.message?.includes('Network Error')) {
        Alert.alert('Conexão', 'Não foi possível alcançar o servidor. Se estiver em celular físico, use o IP do PC como baseURL.');
      } else if (e?.response?.status === 404) {
        Alert.alert('Endpoint não encontrado', 'Verifique se o backend expõe /locais/nearby.');
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os locais próximos.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNearby(cat, 0);
  }, [cat]);

  return (
    <View style={s.container}>
      <Text style={s.title}>Explorar</Text>
      <View style={s.filters}>
        {CATS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[s.chip, c === cat && s.chipActive]}
            onPress={() => setCat(c)}
          >
            <Text style={[s.chipText, c === cat && s.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {(!loading && items.length === 0) ? (
        <Text style={s.empty}>Nenhum resultado por perto. Tente outra categoria.</Text>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item, i) => item.place_id || String(i)}
        refreshing={loading}
        onRefresh={() => fetchNearby(cat, 0)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            onPress={() => navigation.navigate('Details', { place: item })}
          >
            <Text style={s.cardTitle}>{item.name}</Text>
            <Text style={s.cardSub}>{item.vicinity}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  title: { color: theme.colors.text, fontSize: 22, marginBottom: 10 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#1a1a22' },
  chipActive: { backgroundColor: theme.colors.primary },
  chipText: { color: '#aaa' },
  chipTextActive: { color: '#fff' },
  empty: { color: '#999', marginBottom: 8 },
  card: { backgroundColor: theme.colors.card, padding: 14, borderRadius: 12, marginBottom: 10 },
  cardTitle: { color: theme.colors.text, fontWeight: 'bold' },
  cardSub: { color: '#9aa' }
});