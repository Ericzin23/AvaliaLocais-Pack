import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
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
  const [places, setPlaces] = useState([]);
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

      const normalized = (results || []).map((p) => ({
        id: p.place_id,
        name: p.name,
        lat: p.geometry?.location?.lat,
        lng: p.geometry?.location?.lng,
        rating: p.rating,
        total: p.user_ratings_total,
        vicinity: p.vicinity,
        types: p.types || [],
      }));
      setPlaces(normalized);
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
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView style={s.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Explorar</Text>
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filtersContainer}
            style={s.filtersScroll}
          >
            {CATS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[s.chip, c === cat && s.chipActive]}
                onPress={() => setCat(c)}
              >
                <Text style={[s.chipText, c === cat && s.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {(!loading && items.length === 0) ? (
            <Text style={s.empty}>Nenhum resultado por perto. Tente outra categoria.</Text>
          ) : null}

          {/* Map Card */}
          <View style={s.mapCard}>
            <MapView style={s.map} initialRegion={{
              latitude: items[0]?.geometry?.location?.lat || -11.860,
              longitude: items[0]?.geometry?.location?.lng || -55.510,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}>
              {places.map((it) =>
                typeof it.lat === 'number' && typeof it.lng === 'number' ? (
                  <Marker
                    key={it.id}
                    coordinate={{ latitude: it.lat, longitude: it.lng }}
                    title={it.name}
                    description={it.vicinity || ''}
                  />
                ) : null
              )}
            </MapView>
          </View>

          {/* Section Title */}
          <Text style={s.sectionTitle}>Locais próximos</Text>

          {/* List */}
          {places.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={s.card}
              onPress={() => navigation.navigate('Details', { place: item })}
            >
              <View style={s.cardHeader}>
                <Text style={s.cardTitle} numberOfLines={1}>{item.name}</Text>
                {item.rating && (
                  <View style={s.openBadge}>
                    <Text style={s.openText}>Aberto</Text>
                  </View>
                )}
              </View>
              <Text style={s.cardSub} numberOfLines={1}>{item.vicinity}</Text>
              {item.rating ? (
                <View style={s.cardFooter}>
                  <Text style={s.rating}>★ {item.rating}</Text>
                  <Text style={s.distance}>• {item.total || 0} avaliações</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: '#0a0a12',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  filtersScroll: {
    marginBottom: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: '#1e1e2e',
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  chipActive: {
    backgroundColor: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
    backgroundColor: '#7C3AED',
    borderColor: '#9333EA',
  },
  chipText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  empty: {
    color: '#6b7280',
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  mapCard: {
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#1a1a2e',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  map: {
    flex: 1,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#16161f',
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#252530',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 17,
    flex: 1,
    marginRight: 8,
  },
  openBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#22C55E',
    fontSize: 15,
    fontWeight: 'bold',
  },
  distance: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 6,
  },
});