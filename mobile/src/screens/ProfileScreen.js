import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API, BASE_URL } from '../services/api';
import { theme } from '../theme';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadUserData();

    // Recarregar dados quando a tela receber foco
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('userEmail');
      
      if (!email) {
        Alert.alert('Erro', 'Usuário não autenticado');
        navigation.replace('Login');
        return;
      }

      // Buscar dados do perfil
      const response = await API.get('/perfil/me', {
        headers: { 'X-User-Email': email }
      });

      setUserData(response.data);

      // Buscar estatísticas do usuário
      await loadStats(email);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (email) => {
    try {
      // Buscar avaliações do usuário usando endpoint com email
      const avaliacoesResponse = await API.get(`/avaliacoes/usuario/email/${encodeURIComponent(email)}`);
      const avaliacoes = avaliacoesResponse.data || [];

      // Calcular estatísticas
      const totalAvaliacoes = avaliacoes.length;
      const notaMedia = totalAvaliacoes > 0
        ? (avaliacoes.reduce((sum, av) => sum + av.nota, 0) / totalAvaliacoes).toFixed(1)
        : 0;

      // Locais únicos avaliados
      const locaisUnicos = new Set(avaliacoes.map(av => av.local?.id)).size;

      // Categorias avaliadas
      const categorias = {};
      avaliacoes.forEach(av => {
        const cat = av.local?.categoria || 'Outros';
        categorias[cat] = (categorias[cat] || 0) + 1;
      });

      const categoriaFavorita = Object.entries(categorias)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Nenhuma';

      setStats({
        totalAvaliacoes,
        notaMedia,
        locaisUnicos,
        categoriaFavorita,
        avaliacoesPorCategoria: categorias,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Define stats vazias em caso de erro
      setStats({
        totalAvaliacoes: 0,
        notaMedia: 0,
        locaisUnicos: 0,
        categoriaFavorita: 'Nenhuma',
        avaliacoesPorCategoria: {},
      });
    }
  };

  const pickImage = async () => {
    try {
      // Solicitar permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos'
        );
        return;
      }

      // Abrir galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setUploading(true);
      const email = await AsyncStorage.getItem('userEmail');

      // Criar FormData
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      });

      // Upload da foto
      const uploadResponse = await fetch(`${BASE_URL}/upload/foto-perfil`, {
        method: 'POST',
        headers: {
          'X-User-Email': email,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Erro ao fazer upload da foto');
      }

      const data = await uploadResponse.json();
      
      // Atualizar foto do perfil no backend
      await API.put('/perfil/foto', 
        { fotoUrl: data.url },
        { headers: { 'X-User-Email': email } }
      );

      // Recarregar dados
      await loadUserData();
      Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userEmail');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Foto de Perfil */}
        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={pickImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="large" color="#22C55E" />
            ) : userData?.fotoUrl ? (
              <Image
                source={{ uri: `${BASE_URL}${userData.fotoUrl}` }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={60} color="#6B7280" />
              </View>
            )}
            <View style={styles.photoEditBadge}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Toque para alterar foto</Text>
        </View>

        {/* Informações do Usuário */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#22C55E" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nome</Text>
                <Text style={styles.infoValue}>{userData?.nome || 'Não informado'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#22C55E" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData?.email || 'Não informado'}</Text>
              </View>
            </View>

            {userData?.dataNascimento && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={20} color="#22C55E" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Data de Nascimento</Text>
                    <Text style={styles.infoValue}>
                      {new Date(userData.dataNascimento).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {userData?.genero && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="people-outline" size={20} color="#22C55E" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Gênero</Text>
                    <Text style={styles.infoValue}>{userData.genero}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowStats(!showStats)}
          >
            <Text style={styles.sectionTitle}>Estatísticas</Text>
            <Ionicons
              name={showStats ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#22C55E"
            />
          </TouchableOpacity>

          {showStats && stats && (
            <View style={styles.statsCard}>
              {/* Cards de resumo */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="star" size={24} color="#22C55E" />
                  <Text style={styles.statValue}>{stats.totalAvaliacoes}</Text>
                  <Text style={styles.statLabel}>Avaliações</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="trophy" size={24} color="#F59E0B" />
                  <Text style={styles.statValue}>{stats.notaMedia}</Text>
                  <Text style={styles.statLabel}>Nota Média</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="location" size={24} color="#3B82F6" />
                  <Text style={styles.statValue}>{stats.locaisUnicos}</Text>
                  <Text style={styles.statLabel}>Locais Visitados</Text>
                </View>
              </View>

              {/* Categoria favorita */}
              <View style={styles.favoriteCategory}>
                <Ionicons name="heart" size={20} color="#EF4444" />
                <View style={styles.favoriteCategoryContent}>
                  <Text style={styles.favoriteCategoryLabel}>Categoria Favorita</Text>
                  <Text style={styles.favoriteCategoryValue}>{stats.categoriaFavorita}</Text>
                </View>
              </View>

              {/* Avaliações por categoria */}
              {Object.keys(stats.avaliacoesPorCategoria).length > 0 && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.statsSubtitle}>Avaliações por Categoria</Text>
                  {Object.entries(stats.avaliacoesPorCategoria)
                    .sort(([, a], [, b]) => b - a)
                    .map(([categoria, count]) => (
                      <View key={categoria} style={styles.categoryRow}>
                        <Text style={styles.categoryName}>{categoria}</Text>
                        <View style={styles.categoryCount}>
                          <Text style={styles.categoryCountText}>{count}</Text>
                        </View>
                      </View>
                    ))}
                </>
              )}
            </View>
          )}
        </View>

        {/* Botão de Sair */}
        <TouchableOpacity style={styles.logoutFullButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutFullButtonText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  logoutButton: {
    padding: 8,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#22C55E',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    borderWidth: 4,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEditBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#22C55E',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  photoHint: {
    color: '#94A3B8',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 4,
  },
  statsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  favoriteCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  favoriteCategoryContent: {
    marginLeft: 12,
    flex: 1,
  },
  favoriteCategoryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  favoriteCategoryValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  statsSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 8,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  categoryName: {
    fontSize: 14,
    color: '#FFF',
  },
  categoryCount: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  logoutFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutFullButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
