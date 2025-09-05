import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import api from "../services/api";
import { CATEGORIES } from "../constants/categories";
import { distanceMeters } from "../utils/geo";

const { width, height } = Dimensions.get("window");
const INITIAL_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export default function HomeScreen() {
  const mapRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [watchSub, setWatchSub] = useState(null);
  const [selected, setSelected] = useState(CATEGORIES[0].key);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // pedir permissão + seguir posição do usuário
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão de localização negada");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const me = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setCoords(me);
      mapRef.current?.animateToRegion({ ...me, ...INITIAL_DELTA }, 500);

      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 5 },
        (update) => {
          const p = { latitude: update.coords.latitude, longitude: update.coords.longitude };
          setCoords(p);
        }
      );
      setWatchSub(sub);
    })();

    return () => { watchSub?.remove?.(); };
  }, []);

  // buscar lugares quando categoria ou posição mudarem
  useEffect(() => {
    if (!coords) return;
    let didCancel = false;

    const fetch = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const params = new URLSearchParams({
          lat: String(coords.latitude),
          lng: String(coords.longitude),
          categoria: selected,
          // mande 0 para rankby=distance (retorna próximos e ordenados)
          radius: "0"
        });
        const { data } = await api.get(`/locais/nearby?${params.toString()}`);
        const raw = data?.results ?? [];

        const mapped = raw.map((p) => {
          const loc = p.geometry?.location || {};
          const dist = distanceMeters(coords, { latitude: loc.lat, longitude: loc.lng });
          return {
            id: p.place_id,
            name: p.name,
            address: p.vicinity,
            location: loc,
            distance: dist
          };
        }).sort((a, b) => a.distance - b.distance);

        if (!didCancel) setPlaces(mapped);
      } catch (e) {
        if (!didCancel) setErrorMsg("Falha ao buscar locais.");
      } finally {
        if (!didCancel) setLoading(false);
      }
    };

    fetch();
    return () => { didCancel = true; };
  }, [coords?.latitude, coords?.longitude, selected]);

  const region = useMemo(() =>
    coords ? { ...coords, ...INITIAL_DELTA } : {
      latitude: -11.8606, longitude: -55.5100, ...INITIAL_DELTA
    }, [coords]);

  const renderChip = (item) => (
    <TouchableOpacity
      key={item.key}
      style={[styles.chip, selected === item.key && styles.chipActive]}
      onPress={() => setSelected(item.key)}
    >
      <Text style={[styles.chipText, selected === item.key && styles.chipTextActive]}>{item.label}</Text>
    </TouchableOpacity>
  );

  const km = (m) => (m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${m} m`);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation   // exibe o seu “pontinho”
        followsUserLocation // segue sua movimentação
        initialRegion={region}
        onRegionChangeComplete={(r) => {}}
      >
        {places.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.location.lat, longitude: p.location.lng }} title={p.name} description={p.address} />
        ))}
      </MapView>

      {/* chips */}
      <View style={styles.chipsRow}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(i) => i.key}
          renderItem={({ item }) => renderChip(item)}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* lista */}
      <View style={styles.listCard}>
        {loading ? <ActivityIndicator /> : null}
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
        <FlatList
          data={places}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSub}>{item.address || "Sem endereço"}</Text>
              <Text style={styles.itemDist}>{km(item.distance)} daqui</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  map: { width, height },
  chipsRow: { position: "absolute", top: 48, left: 12, right: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, backgroundColor: "#1e1e1e", marginRight: 8 },
  chipActive: { backgroundColor: "#6d4aff" },
  chipText: { color: "#bbb", fontWeight: "600" },
  chipTextActive: { color: "white" },
  listCard: {
    position: "absolute", left: 12, right: 12, bottom: 24,
    maxHeight: height * 0.38, backgroundColor: "#121212",
    borderRadius: 16, padding: 12
  },
  item: { padding: 10, backgroundColor: "#1a1a1a", borderRadius: 12 },
  itemTitle: { color: "white", fontWeight: "700", fontSize: 16 },
  itemSub: { color: "#9aa", marginTop: 2 },
  itemDist: { color: "#92d", marginTop: 6, fontWeight: "600" },
  error: { color: "#ff7878", marginBottom: 8 }
});
