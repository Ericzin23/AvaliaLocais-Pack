import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView, Platform, Alert, ActionSheetIOS, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme';

export default function DetailsScreen({ route, navigation }){
  const { place } = route.params;
  const lat = place?.lat || place?.geometry?.location?.lat || 0;
  const lng = place?.lng || place?.geometry?.location?.lng || 0;
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita o acesso à câmera para tirar fotos do local.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCapturedPhoto(result.assets[0].uri);
      Alert.alert('Foto capturada!', 'Agora você pode avaliar o local com sua foto.');
    }
  };

  const goToReview = () => {
    if (!capturedPhoto) {
      Alert.alert(
        'Foto necessária',
        'Tire uma foto do local antes de avaliar.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Tirar Foto', onPress: takePhoto },
        ]
      );
      return;
    }
    navigation.navigate('Review', { place, photoUri: capturedPhoto });
  };

  const goMaps = () => {
    const label = encodeURIComponent(place.name);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${place.id || place.place_id}`;
    const appleMapsUrl = `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`;
    const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Apple Maps', 'Google Maps', 'Waze'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            Linking.openURL(appleMapsUrl);
          } else if (buttonIndex === 2) {
            Linking.openURL(googleMapsUrl);
          } else if (buttonIndex === 3) {
            Linking.openURL(wazeUrl);
          }
        }
      );
    } else {
      // Android: usar Alert com botões
      Alert.alert(
        'Como chegar',
        'Escolha o aplicativo de mapas:',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Google Maps',
            onPress: () => Linking.openURL(googleMapsUrl),
          },
          {
            text: 'Waze',
            onPress: () => Linking.openURL(wazeUrl),
          },
        ],
        { cancelable: true }
      );
    }
  }

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
      <ScrollView 
        style={s.scrollContainer} 
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Title Section */}
        <View style={s.titleSection}>
          <Text style={s.title}>{place.name}</Text>
          {place.rating && (
            <View style={s.ratingContainer}>
              <Text style={s.ratingText}>★ {place.rating}</Text>
              <Text style={s.ratingCount}>({place.total || place.user_ratings_total || 0} avaliações)</Text>
            </View>
          )}
        </View>

        {/* Address Card */}
        <View style={s.infoCard}>
          <Text style={s.infoLabel}>Endereço</Text>
          <Text style={s.infoText}>{place.vicinity}</Text>
        </View>

        {/* Map Card */}
        <View style={s.mapCard}>
          <MapView 
            style={s.map} 
            initialRegion={{
              latitude: lat, 
              longitude: lng, 
              latitudeDelta: 0.01, 
              longitudeDelta: 0.01
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker coordinate={{latitude: lat, longitude: lng}} title={place.name} />
          </MapView>
        </View>

        {/* Additional Info */}
        {place.types && place.types.length > 0 && (
          <View style={s.tagsContainer}>
            <Text style={s.tagsLabel}>Categorias</Text>
            <View style={s.tagsRow}>
              {place.types.slice(0, 5).map((type, idx) => (
                <View key={idx} style={s.tag}>
                  <Text style={s.tagText}>{type.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View style={s.actionsContainer}>
        {capturedPhoto && (
          <View style={s.photoPreview}>
            <Image source={{ uri: capturedPhoto }} style={s.photoPreviewImage} />
            <TouchableOpacity style={s.photoRetake} onPress={takePhoto}>
              <Text style={s.photoRetakeText}>📷 Tirar outra</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity 
          style={[s.btnPhoto, capturedPhoto && s.btnPhotoTaken]} 
          onPress={takePhoto}
        >
          <Text style={s.btnPhotoText}>
            {capturedPhoto ? '✓ Foto capturada' : '📷 Tirar foto do local'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnPrimary} onPress={goToReview}>
          <Text style={s.btnPrimaryText}>⭐ Avaliar Local</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={goMaps}>
          <Text style={s.btnSecondaryText}>📍 Como Chegar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    color: '#22C55E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingCount: {
    color: '#9ca3af',
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: '#16161f',
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252530',
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
  },
  mapCard: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  map: {
    flex: 1,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#1e1e2e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  tagText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#0a0a12',
    borderTopWidth: 1,
    borderTopColor: '#1e1e2e',
  },
  photoPreview: {
    alignItems: 'center',
    marginBottom: 8,
  },
  photoPreviewImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  photoRetake: {
    marginTop: 8,
  },
  photoRetakeText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  btnPhoto: {
    backgroundColor: '#1e1e2e',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2a2a3a',
  },
  btnPhotoTaken: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22C55E',
  },
  btnPhotoText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  btnSecondary: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnSecondaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
