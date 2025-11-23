import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { API } from '../services/api';

type RatingCategory = {
  key: string;
  label: string;
};

const CATEGORY_CONFIG = {
  restaurante: [
    { key: 'food', label: 'Comida' },
    { key: 'taste', label: 'Sabor' },
    { key: 'service', label: 'Atendimento' },
    { key: 'environment', label: 'Ambiente' },
    { key: 'price', label: 'Preço' },
  ],
  restaurant: [
    { key: 'food', label: 'Comida' },
    { key: 'taste', label: 'Sabor' },
    { key: 'service', label: 'Atendimento' },
    { key: 'environment', label: 'Ambiente' },
    { key: 'price', label: 'Preço' },
  ],
  bar: [
    { key: 'food', label: 'Comida' },
    { key: 'drinks', label: 'Drinks' },
    { key: 'music', label: 'Música' },
    { key: 'service', label: 'Atendimento' },
    { key: 'environment', label: 'Ambiente' },
    { key: 'price', label: 'Preço' },
  ],
  cafe: [
    { key: 'food', label: 'Comida' },
    { key: 'coffee', label: 'Café' },
    { key: 'service', label: 'Atendimento' },
    { key: 'environment', label: 'Ambiente' },
  ],
  bakery: [
    { key: 'food', label: 'Comida' },
    { key: 'freshness', label: 'Frescor' },
    { key: 'variety', label: 'Variedade' },
    { key: 'service', label: 'Atendimento' },
    { key: 'price', label: 'Preço' },
  ],
  food: [
    { key: 'food', label: 'Comida' },
    { key: 'taste', label: 'Sabor' },
    { key: 'service', label: 'Atendimento' },
    { key: 'price', label: 'Preço' },
  ],
  meal_delivery: [
    { key: 'food', label: 'Comida' },
    { key: 'delivery_time', label: 'Tempo de entrega' },
    { key: 'temperature', label: 'Temperatura' },
    { key: 'packaging', label: 'Embalagem' },
    { key: 'price', label: 'Preço' },
  ],
  meal_takeaway: [
    { key: 'food', label: 'Comida' },
    { key: 'waiting_time', label: 'Tempo de espera' },
    { key: 'service', label: 'Atendimento' },
    { key: 'price', label: 'Preço' },
  ],
  hotel: [
    { key: 'comfort', label: 'Conforto' },
    { key: 'cleanliness', label: 'Limpeza' },
    { key: 'service', label: 'Atendimento' },
    { key: 'location', label: 'Localização' },
    { key: 'price', label: 'Preço' },
  ],
  academia: [
    { key: 'equipment', label: 'Equipamentos' },
    { key: 'cleanliness', label: 'Limpeza' },
    { key: 'service', label: 'Atendimento' },
    { key: 'crowded', label: 'Lotação' },
  ],
  hospital: [
    { key: 'service', label: 'Atendimento' },
    { key: 'waiting_time', label: 'Tempo de espera' },
    { key: 'care_quality', label: 'Qualidade' },
    { key: 'cleanliness', label: 'Limpeza' },
  ],
  escola: [
    { key: 'teaching', label: 'Ensino' },
    { key: 'structure', label: 'Estrutura' },
    { key: 'security', label: 'Segurança' },
    { key: 'environment', label: 'Ambiente' },
  ],
  mercado: [
    { key: 'variety', label: 'Variedade' },
    { key: 'price', label: 'Preço' },
    { key: 'service', label: 'Atendimento' },
    { key: 'cleanliness', label: 'Limpeza' },
  ],
  farmacia: [
    { key: 'service', label: 'Atendimento' },
    { key: 'availability', label: 'Disponibilidade' },
    { key: 'price', label: 'Preço' },
  ],
  parque: [
    { key: 'cleanliness', label: 'Limpeza' },
    { key: 'security', label: 'Segurança' },
    { key: 'infrastructure', label: 'Infraestrutura' },
  ],
  other: [
    { key: 'service', label: 'Atendimento' },
    { key: 'environment', label: 'Ambiente' },
    { key: 'experience', label: 'Experiência' },
  ],
};

export default function ReviewScreen({ route, navigation }) {
  const { place, photoUri } = route.params;

  const placeType = (place.types && place.types[0]) || 'other';
  const categories = useMemo(() => {
    return CATEGORY_CONFIG[placeType] || CATEGORY_CONFIG.other;
  }, [placeType]);

  const [selectedCategoryKey, setSelectedCategoryKey] = useState(
    categories[0]?.key ?? 'service'
  );

  const [ratings, setRatings] = useState(() => {
    const initial = {};
    categories.forEach((cat) => {
      initial[cat.key] = 0;
    });
    return initial;
  });

  const [comment, setComment] = useState('');
  const maxCommentLength = 500;

  const selectedCategory = categories.find(
    (c) => c.key === selectedCategoryKey
  ) ?? categories[0];

  const currentRating = ratings[selectedCategory.key] ?? 0;

  const overallRating =
    categories.length > 0
      ? Number(
          (
            categories.reduce((sum, cat) => sum + (ratings[cat.key] ?? 0), 0) /
            categories.length
          ).toFixed(1)
        )
      : 0;

  const handleSetRating = (value) => {
    setRatings((prev) => ({
      ...prev,
      [selectedCategory.key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Upload da foto primeiro
      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: `${place.place_id || place.id}_${Date.now()}.jpg`,
      });

      console.log('Fazendo upload da foto...');
      const uploadResponse = await API.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const fotoUrl = uploadResponse.data.url;
      console.log('Foto enviada:', fotoUrl);

      // Criar ou buscar o local no backend
      const localPayload = {
        googlePlaceId: place.place_id || place.id,
        nome: place.name,
        endereco: place.vicinity || place.formatted_address,
        lat: place.geometry?.location?.lat || place.lat,
        lng: place.geometry?.location?.lng || place.lng,
        categoria: placeType,
      };

      console.log('Criando/buscando local:', localPayload);
      const localResponse = await API.post('/locais', localPayload);
      const localId = localResponse.data.id;
      console.log('Local criado/encontrado com ID:', localId);

      // Enviar a avaliação com a foto
      const payload = {
        localId: localId,
        nota: Math.round(overallRating * 2), // Converter 0-5 para 0-10
        comentario: comment.trim() || 'Sem comentário',
        fotoUrl: fotoUrl,
      };

      console.log('Enviando avaliação:', payload);
      const response = await API.post('/avaliacoes', payload);
      console.log('✅ Avaliação salva com sucesso! ID:', response.data.id);

      // Mostrar mensagem de sucesso
      Alert.alert(
        '✅ Avaliação registrada!',
        'Sua avaliação foi salva com sucesso.',
        [
          {
            text: 'Compartilhar',
            onPress: () => {
              navigation.navigate('Share', {
                review: { 
                  nota: overallRating, 
                  comentario: comment, 
                  place,
                  fotoUrl: fotoUrl,
                  avaliacaoId: response.data.id,
                },
              });
            },
          },
          {
            text: 'Voltar ao início',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            },
            style: 'cancel',
          },
        ]
      );
    } catch (e) {
      console.error('❌ Erro ao enviar avaliação:', e);
      console.error('Detalhes:', e.response?.data);
      Alert.alert(
        'Erro',
        `Não foi possível enviar sua avaliação.\n${e.response?.data?.message || e.message}`
      );
    }
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {/* Place Card */}
        <View style={s.placeCard}>
          <View style={s.placeAvatar}>
            <Text style={s.placeAvatarText}>📍</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.placeName} numberOfLines={2}>
              {place.name}
            </Text>
            <Text style={s.placeTypeText}>{placeType}</Text>
          </View>
        </View>

        <Text style={s.title}>Avaliar local</Text>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {categories.map((cat) => {
            const isSelected = cat.key === selectedCategoryKey;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[s.categoryChip, isSelected && s.categoryChipSelected]}
                onPress={() => setSelectedCategoryKey(cat.key)}
              >
                <Text
                  style={[
                    s.categoryText,
                    isSelected && s.categoryTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Stars */}
        <View style={s.starsContainer}>
          <Text style={s.selectedCategoryLabel}>
            {selectedCategory?.label}
          </Text>
          <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => handleSetRating(value)}
                style={s.starButton}
              >
                <Text style={s.starText}>
                  {value <= currentRating ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.currentRatingText}>{currentRating} / 5</Text>
        </View>

        {/* Overall */}
        <View style={s.overallCard}>
          <Text style={s.overallLabel}>Nota geral (média)</Text>
          <Text style={s.overallValue}>{overallRating.toFixed(1)}</Text>
        </View>

        {/* Comment */}
        <View style={s.commentContainer}>
          <Text style={s.commentLabel}>Deixe um comentário</Text>
          <View style={s.commentBox}>
            <TextInput
              style={s.commentInput}
              placeholder="Conte como foi sua experiência..."
              placeholderTextColor="#6B7280"
              multiline
              value={comment}
              onChangeText={(text) => {
                if (text.length <= maxCommentLength) {
                  setComment(text);
                }
              }}
            />
            <Text style={s.commentCounter}>
              {comment.length}/{maxCommentLength}
            </Text>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity style={s.submitButton} onPress={handleSubmit}>
          <Text style={s.submitButtonText}>Enviar avaliação</Text>
        </TouchableOpacity>

        <Text style={s.helperText}>
          Sua opinião ajuda outras pessoas a encontrar os melhores lugares.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161f',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#252530',
    marginBottom: 16,
  },
  placeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1e1e2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeAvatarText: {
    fontSize: 24,
  },
  placeName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeTypeText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e1e2e',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  categoryChipSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#9333EA',
  },
  categoryText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#ffffff',
  },
  starsContainer: {
    marginTop: 20,
  },
  selectedCategoryLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    marginRight: 6,
  },
  starText: {
    fontSize: 36,
    color: '#22C55E',
  },
  currentRatingText: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 6,
  },
  overallCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#16161f',
    borderWidth: 1,
    borderColor: '#252530',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overallLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  overallValue: {
    color: '#22C55E',
    fontSize: 24,
    fontWeight: 'bold',
  },
  commentContainer: {
    marginTop: 20,
  },
  commentLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  commentBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#252530',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#16161f',
  },
  commentInput: {
    minHeight: 100,
    color: '#ffffff',
    fontSize: 14,
  },
  commentCounter: {
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helperText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
});

