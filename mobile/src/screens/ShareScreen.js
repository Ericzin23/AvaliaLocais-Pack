import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'http://192.168.0.112:8080';

export default function ShareScreen({ route }){
  const { review } = route.params;
  const cardRef = useRef();

  // Usar a foto tirada pelo usuário com URL completa
  const photoUrl = review.fotoUrl ? `${BASE_URL}${review.fotoUrl}` : null;

  // Categorias de exemplo (você pode pegar dos ratings da avaliação)
  const categories = [
    { label: '🍽 Comida', value: 4.9 },
    { label: '😋 Sabor', value: 5.0 },
    { label: '🧑‍🍳 Atendimento', value: 4.7 },
    { label: '💸 Preço', value: 4.0 },
  ];

  const share = async () => {
    try{
      const uri = await cardRef.current.capture();
      await Sharing.shareAsync(uri);
    }catch(e){ 
      Alert.alert('Erro', 'Não foi possível compartilhar.'); 
    }
  }

  return (
    <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
      <View style={s.container}>
        <ViewShot ref={cardRef} options={{format:'png', quality:1}} style={s.cardWrapper}>
          {photoUrl ? (
            <ImageBackground
              source={{ uri: photoUrl }}
              style={s.cardImage}
              imageStyle={s.cardImageInner}
            >
              <View style={s.overlay} />
              <View style={s.cardContent}>
                {/* Header */}
                <View style={s.headerRow}>
                  <View style={s.appBadge}>
                    <Ionicons name="location" size={16} color="#22C55E" />
                    <Text style={s.appBadgeText}>AvaliaLocais</Text>
                  </View>
                  <Text style={s.placeName} numberOfLines={2}>
                    {review.place.name}
                  </Text>
                </View>

                {/* Nota central */}
                <View style={s.centerBlock}>
                  <Text style={s.overallLabel}>Nota geral</Text>
                  <Text style={s.overallValue}>{review.nota.toFixed(1)}</Text>
                  <View style={s.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(review.nota) ? 'star' : 'star-outline'}
                        size={22}
                        color="#22C55E"
                        style={{ marginHorizontal: 2 }}
                      />
                    ))}
                  </View>
                </View>

                {/* Categorias */}
                <View style={s.categoriesContainer}>
                  {categories.map((cat) => (
                    <View key={cat.label} style={s.categoryRow}>
                      <Text style={s.categoryLabel}>{cat.label}</Text>
                      <Text style={s.categoryValue}>{cat.value.toFixed(1)}</Text>
                    </View>
                  ))}
                </View>

                {/* Footer */}
                <View style={s.footer}>
                  <Text style={s.footerText}>
                    Avaliado com <Text style={s.footerHighlight}>AvaliaLocais</Text>
                  </Text>
                </View>
              </View>
            </ImageBackground>
          ) : (
            <View style={s.cardImageFallback}>
              <View style={s.cardContent}>
                {/* Header */}
                <View style={s.headerRow}>
                  <View style={s.appBadge}>
                    <Ionicons name="location" size={16} color="#22C55E" />
                    <Text style={s.appBadgeText}>AvaliaLocais</Text>
                  </View>
                  <Text style={s.placeName} numberOfLines={2}>
                    {review.place.name}
                  </Text>
                </View>

                {/* Nota central */}
                <View style={s.centerBlock}>
                  <Text style={s.overallLabel}>Nota geral</Text>
                  <Text style={s.overallValue}>{review.nota.toFixed(1)}</Text>
                  <View style={s.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(review.nota) ? 'star' : 'star-outline'}
                        size={22}
                        color="#22C55E"
                        style={{ marginHorizontal: 2 }}
                      />
                    ))}
                  </View>
                </View>

                {/* Categorias */}
                <View style={s.categoriesContainer}>
                  {categories.map((cat) => (
                    <View key={cat.label} style={s.categoryRow}>
                      <Text style={s.categoryLabel}>{cat.label}</Text>
                      <Text style={s.categoryValue}>{cat.value.toFixed(1)}</Text>
                    </View>
                  ))}
                </View>

                {/* Footer */}
                <View style={s.footer}>
                  <Text style={s.footerText}>
                    Avaliado com <Text style={s.footerHighlight}>AvaliaLocais</Text>
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ViewShot>

        {/* Botão de compartilhar */}
        <TouchableOpacity style={s.shareButton} onPress={share}>
          <Ionicons name="share-outline" size={18} color="#020617" />
          <Text style={s.shareButtonText}>Compartilhar no Instagram</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0a0a12',
  },
  cardImage: {
    flex: 1,
  },
  cardImageInner: {
    resizeMode: 'cover',
  },
  cardImageFallback: {
    flex: 1,
    backgroundColor: '#1e1e2e',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'column',
    gap: 8,
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  appBadgeText: {
    color: '#E5E7EB',
    fontSize: 11,
    marginLeft: 6,
    fontWeight: '500',
  },
  placeName: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  centerBlock: {
    alignItems: 'center',
  },
  overallLabel: {
    color: '#E5E7EB',
    fontSize: 14,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  overallValue: {
    color: '#22C55E',
    fontSize: 72,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoriesContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryLabel: {
    color: '#D1D5DB',
    fontSize: 13,
  },
  categoryValue: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  footerHighlight: {
    color: '#22C55E',
    fontWeight: '600',
  },
  shareButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: '#22C55E',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  shareButtonText: {
    marginLeft: 8,
    color: '#020617',
    fontSize: 15,
    fontWeight: '700',
  },
});
