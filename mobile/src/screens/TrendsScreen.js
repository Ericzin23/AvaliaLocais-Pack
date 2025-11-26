import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Substituindo Victory por react-native-gifted-charts (evita dependência Skia)
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

export default function TrendsScreen() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, top, categorias, grafico
  const [categoria, setCategoria] = useState('all');
  const [periodo, setPeriodo] = useState('semana'); // semana, mes, total
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Dados
  const [overview, setOverview] = useState({});
  const [topSemana, setTopSemana] = useState([]);
  const [melhoresAvaliados, setMelhoresAvaliados] = useState([]);
  const [estatisticasCategorias, setEstatisticasCategorias] = useState([]);
  const [grafico30Dias, setGrafico30Dias] = useState([]);
  const [distribuicaoNotas, setDistribuicaoNotas] = useState([]);
  const [categoriaEmAlta, setCategoriaEmAlta] = useState({});
  const [categoriasLista, setCategoriasLista] = useState(['all']);

  // Animações
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Carregar dados iniciais
  useEffect(() => {
    loadAllData();
  }, []);

  // Recarregar quando mudar filtros
  useEffect(() => {
    if (activeTab !== 'overview') {
      loadFilteredData();
    }
  }, [categoria, periodo, activeTab]);

  // Animação de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        topRes,
        melhoresRes,
        categoriasRes,
        graficoRes,
        distRes,
        emAltaRes,
        listaCatRes,
      ] = await Promise.all([
        api.get('/tendencias/overview'),
        api.get('/tendencias/top-semana'),
        api.get('/tendencias/melhores-avaliados'),
        api.get('/tendencias/categorias'),
        api.get('/tendencias/grafico-30dias'),
        api.get('/tendencias/distribuicao-notas'),
        api.get('/tendencias/categoria-em-alta'),
        api.get('/tendencias/categorias-lista'),
      ]);

      setOverview(overviewRes.data);
      setTopSemana(topRes.data);
      setMelhoresAvaliados(melhoresRes.data);
      setEstatisticasCategorias(categoriasRes.data);
      setGrafico30Dias(graficoRes.data);
      setDistribuicaoNotas(distRes.data);
      setCategoriaEmAlta(emAltaRes.data);
      setCategoriasLista(['all', ...listaCatRes.data]);
    } catch (error) {
      console.error('Erro ao carregar tendências:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredData = async () => {
    try {
      const params = { categoria };

      if (activeTab === 'top') {
        const [topRes, melhoresRes] = await Promise.all([
          api.get('/tendencias/top-semana', { params }),
          api.get('/tendencias/melhores-avaliados', { params }),
        ]);
        setTopSemana(topRes.data);
        setMelhoresAvaliados(melhoresRes.data);
      }

      if (activeTab === 'grafico') {
        const [graficoRes, distRes] = await Promise.all([
          api.get('/tendencias/grafico-30dias', { params }),
          api.get('/tendencias/distribuicao-notas', { params }),
        ]);
        setGrafico30Dias(graficoRes.data);
        setDistribuicaoNotas(distRes.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados filtrados:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, []);

  // ==========================
  // COMPONENTES DE UI
  // ==========================

  const StatCard = ({ icon, label, value, color, gradient }) => (
    <LinearGradient
      colors={gradient || ['#1E293B', '#334155']}
      style={styles.statCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );

  const TabButton = ({ id, label, icon }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === id && styles.tabButtonActive]}
      onPress={() => {
        setActiveTab(id);
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      }}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === id ? '#22C55E' : '#64748B'}
      />
      <Text style={[styles.tabButtonText, activeTab === id && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const FilterChip = ({ value, label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.filterChip, selected && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const RankingItem = ({ item, index, isPremium }) => {
    const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    const showMedal = index < 3 && isPremium;

    return (
      <LinearGradient
        colors={showMedal ? ['#1E293B', '#334155'] : ['#0F172A', '#1E293B']}
        style={[styles.rankingItem, showMedal && styles.rankingItemPremium]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.rankingLeft}>
          <View
            style={[
              styles.rankingNumber,
              showMedal && { backgroundColor: medalColors[index] },
            ]}
          >
            {showMedal ? (
              <Ionicons name="trophy" size={18} color="#000" />
            ) : (
              <Text style={styles.rankingNumberText}>{index + 1}</Text>
            )}
          </View>
          <View style={styles.rankingInfo}>
            <Text style={styles.rankingName} numberOfLines={1}>
              {item.nome}
            </Text>
            <View style={styles.rankingMeta}>
              <Ionicons name="location" size={12} color="#64748B" />
              <Text style={styles.rankingCategory} numberOfLines={1}>
                {item.categoria}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rankingRight}>
          <View style={styles.rankingRating}>
            <Ionicons name="star" size={16} color="#FBBF24" />
            <Text style={styles.rankingRatingText}>
              {parseFloat(item.nota_media).toFixed(1)}
            </Text>
          </View>
          <Text style={styles.rankingCount}>
            {item.total_avaliacoes} {parseInt(item.total_avaliacoes) === 1 ? 'avaliação' : 'avaliações'}
          </Text>
        </View>
      </LinearGradient>
    );
  };

  // ==========================
  // RENDERIZADORES DE ABAS
  // ==========================

  const renderOverview = () => (
    <Animated.View
      style={[
        styles.tabContent,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Cards de Estatísticas */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="flash"
          label="Hoje"
          value={overview.avaliacoesHoje || 0}
          color="#F59E0B"
          gradient={['#92400E', '#B45309']}
        />
        <StatCard
          icon="trending-up"
          label="Esta Semana"
          value={overview.avaliacoesSemana || 0}
          color="#22C55E"
          gradient={['#14532D', '#166534']}
        />
        <StatCard
          icon="calendar"
          label="Este Mês"
          value={overview.avaliacoesMes || 0}
          color="#3B82F6"
          gradient={['#1E3A8A', '#1E40AF']}
        />
        <StatCard
          icon="stats-chart"
          label="Total"
          value={overview.totalAvaliacoes || 0}
          color="#8B5CF6"
          gradient={['#4C1D95', '#5B21B6']}
        />
      </View>

      {/* Categoria em Alta */}
      <LinearGradient
        colors={['#DC2626', '#EF4444']}
        style={styles.highlightCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.highlightHeader}>
          <Ionicons name="flame" size={32} color="#FFF" />
          <Text style={styles.highlightTitle}>🔥 Categoria em Alta</Text>
        </View>
        <Text style={styles.highlightCategory}>
          {categoriaEmAlta.categoria || 'Nenhuma'}
        </Text>
        <Text style={styles.highlightSubtitle}>
          {categoriaEmAlta.avaliacoes_ultimos_7_dias || 0} avaliações nos últimos 7 dias
        </Text>
      </LinearGradient>

      {/* Total de Locais */}
      <LinearGradient
        colors={['#0891B2', '#06B6D4']}
        style={styles.totalCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="business" size={40} color="#FFF" />
        <View style={styles.totalInfo}>
          <Text style={styles.totalValue}>{overview.totalLocais || 0}</Text>
          <Text style={styles.totalLabel}>Locais Cadastrados</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderTop = () => (
    <Animated.View
      style={[
        styles.tabContent,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Filtros */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Categoria</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categoriasLista.map((cat) => (
            <FilterChip
              key={cat}
              value={cat}
              label={cat === 'all' ? 'Todas' : cat}
              selected={categoria === cat}
              onPress={() => setCategoria(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Top da Semana */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy" size={24} color="#FBBF24" />
          <Text style={styles.sectionTitle}>Top da Semana</Text>
        </View>
        {topSemana.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum dado disponível</Text>
        ) : (
          topSemana.map((item, index) => (
            <RankingItem key={item.id} item={item} index={index} isPremium={true} />
          ))
        )}
      </View>

      {/* Melhores Avaliados */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="star" size={24} color="#22C55E" />
          <Text style={styles.sectionTitle}>Melhores Avaliados</Text>
        </View>
        {melhoresAvaliados.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum dado disponível</Text>
        ) : (
          melhoresAvaliados.slice(0, 10).map((item, index) => (
            <RankingItem key={item.id} item={item} index={index} isPremium={false} />
          ))
        )}
      </View>
    </Animated.View>
  );

  const renderCategorias = () => {
    const pieData = estatisticasCategorias.map((cat, index) => ({
      value: parseInt(cat.total_avaliacoes),
      text: cat.categoria,
      color: [
        '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
      ][index % 10]
    }));

    return (
      <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Distribuição por Categoria</Text>
          <PieChart
            data={pieData}
            donut
            innerRadius={60}
            radius={120}
            focusOnPress
            showText
            textColor="#fff"
            textSize={10}
            centerLabelComponent={() => (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Categorias</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>Total: {pieData.reduce((a,b)=>a+b.value,0)}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas Detalhadas</Text>
          {estatisticasCategorias.map((cat) => (
            <LinearGradient key={cat.categoria} colors={['#1E293B', '#334155']} style={styles.categoryCard} start={{x:0,y:0}} end={{x:1,y:1}}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{cat.categoria}</Text>
                <View style={styles.categoryBadge}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.categoryRating}>{parseFloat(cat.nota_media || 0).toFixed(1)}</Text>
                </View>
              </View>
              <View style={styles.categoryStats}>
                <View style={styles.categoryStat}>
                  <Ionicons name="location" size={16} color="#64748B" />
                  <Text style={styles.categoryStatText}>{cat.total_locais} locais</Text>
                </View>
                <View style={styles.categoryStat}>
                  <Ionicons name="chatbox" size={16} color="#64748B" />
                  <Text style={styles.categoryStatText}>{cat.total_avaliacoes} avaliações</Text>
                </View>
                <View style={styles.categoryStat}>
                  <Ionicons name="people" size={16} color="#64748B" />
                  <Text style={styles.categoryStatText}>{cat.usuarios_unicos} usuários</Text>
                </View>
              </View>
            </LinearGradient>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderGrafico = () => {
    const lineData = grafico30Dias.map((dia) => ({ value: parseInt(dia.total_avaliacoes), label: dia.data.slice(5) }));
    const barData = distribuicaoNotas.map((faixa) => ({ value: parseInt(faixa.quantidade), label: faixa.faixa_nota }));

    return (
      <Animated.View style={[styles.tabContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>        
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filtrar por Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {categoriasLista.map((cat) => (
              <FilterChip key={cat} value={cat} label={cat === 'all' ? 'Todas' : cat} selected={categoria === cat} onPress={() => setCategoria(cat)} />
            ))}
          </ScrollView>
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Avaliações - Últimos 30 Dias</Text>
          <LineChart
            data={lineData}
            curved
            spacing={8}
            thickness={3}
            color="#22C55E"
            hideDataPoints={false}
            dataPointsColor="#22C55E"
            startFillColor="#22C55E"
            endFillColor="#22C55E"
            startOpacity={0.25}
            endOpacity={0.01}
            xAxisLabelTexts={lineData.map(d=>d.label)}
            yAxisTextStyle={{ color:'#94A3B8', fontSize:10 }}
            noOfSections={4}
            yAxisColor="#475569"
            xAxisColor="#475569"
          />
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Distribuição de Notas</Text>
          <BarChart
            data={barData.map(b=>({ value:b.value, label:b.label, frontColor:
              b.label==='9-10'? '#22C55E': b.label==='7-8'? '#3B82F6': b.label==='5-6'? '#F59E0B': b.label==='3-4'? '#F97316':'#EF4444'}))}
            barWidth={32}
            spacing={20}
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
            xAxisLabelTextStyle={{ color:'#94A3B8', fontSize:11 }}
            yAxisTextStyle={{ color:'#94A3B8', fontSize:10 }}
          />
        </View>
      </Animated.View>
    );
  };

  // ==========================
  // RENDER PRINCIPAL
  // ==========================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Carregando tendências...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Ionicons name="trending-up" size={32} color="#22C55E" />
          <Text style={styles.headerTitle}>Tendências</Text>
        </View>
        <Text style={styles.headerSubtitle}>Descubra os locais mais populares</Text>
      </LinearGradient>

      {/* Tabs de Navegação */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          <TabButton id="overview" label="Visão Geral" icon="apps" />
          <TabButton id="top" label="Rankings" icon="trophy" />
          <TabButton id="categorias" label="Categorias" icon="grid" />
          <TabButton id="grafico" label="Gráficos" icon="bar-chart" />
        </ScrollView>
      </View>

      {/* Conteúdo */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22C55E"
            colors={['#22C55E']}
          />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'top' && renderTop()}
        {activeTab === 'categorias' && renderCategorias()}
        {activeTab === 'grafico' && renderGrafico()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 44,
  },
  tabsContainer: {
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tabsScroll: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#0F172A',
  },
  tabButtonActive: {
    backgroundColor: '#166534',
  },
  tabButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  tabButtonTextActive: {
    color: '#22C55E',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  highlightCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  highlightCategory: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  highlightSubtitle: {
    fontSize: 14,
    color: '#FEE2E2',
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  totalInfo: {
    marginLeft: 16,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  totalLabel: {
    fontSize: 14,
    color: '#E0F2FE',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  filterScroll: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#166534',
    borderColor: '#22C55E',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#22C55E',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  rankingItemPremium: {
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankingNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankingNumberText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  rankingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankingCategory: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  rankingRight: {
    alignItems: 'flex-end',
  },
  rankingRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rankingRatingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 4,
  },
  rankingCount: {
    fontSize: 11,
    color: '#64748B',
  },
  chartContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryRating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 4,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryStatText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
  },
});
