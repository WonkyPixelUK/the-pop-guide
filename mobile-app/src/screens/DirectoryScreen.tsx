import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { SearchInput } from '../components/UI/SearchInput';
import { FunkoCard } from '../components/FunkoCard';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { theme } from '../styles/theme';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface FunkoPop {
  id: string;
  name: string;
  series: string;
  number: string;
  variant?: string;
  image_url?: string;
  estimated_value?: number;
  is_exclusive: boolean;
  is_vaulted: boolean;
  is_chase: boolean;
  rarity?: string;
  release_date?: string;
  upc?: string;
  upc_a?: string;
  ean_13?: string;
  amazon_asin?: string;
  country_of_registration?: string;
  brand?: string;
  model_number?: string;
  size?: string;
  color?: string;
  weight?: string;
  product_dimensions?: string;
  description?: string;
  image_urls?: string[];
}

interface FilterState {
  series: string[];
  rarity: string[];
  priceRange: { min: number; max: number };
  isExclusive: boolean | null;
  isVaulted: boolean | null;
  isChase: boolean | null;
}

export const DirectoryScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [funkos, setFunkos] = useState<FunkoPop[]>([]);
  const [filteredFunkos, setFilteredFunkos] = useState<FunkoPop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'release_date' | 'series'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [filters, setFilters] = useState<FilterState>({
    series: [],
    rarity: [],
    priceRange: { min: 0, max: 1000 },
    isExclusive: null,
    isVaulted: null,
    isChase: null,
  });

  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [availableRarities, setAvailableRarities] = useState<string[]>([]);

  // Helper function to get the primary image URL (handles both old and new storage methods)
  const getPrimaryImageUrl = (pop: FunkoPop) => {
    // If there are user-uploaded images in image_urls array, use the first one
    if (pop.image_urls && Array.isArray(pop.image_urls) && pop.image_urls.length > 0) {
      return pop.image_urls[0];
    }
    // Fall back to the original scraped/imported image_url
    return pop.image_url;
  };

  const loadFunkos = async () => {
    try {
      const { data, error } = await supabase
        .from('funko_pops')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .limit(100);

      if (error) throw error;

      setFunkos(data || []);
      setFilteredFunkos(data || []);

      // Extract unique series and rarities for filters
      const series = [...new Set(data?.map(f => f.series).filter(Boolean) || [])];
      const rarities = [...new Set(data?.map(f => f.rarity).filter(Boolean) || [])];
      
      setAvailableSeries(series);
      setAvailableRarities(rarities);
    } catch (error) {
      console.error('Error loading funkos:', error);
      Alert.alert('Error', 'Failed to load Funko directory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFunkos();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, funkos]);

  const applyFilters = () => {
    let filtered = [...funkos];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(funko => 
        funko.name.toLowerCase().includes(query) ||
        funko.series.toLowerCase().includes(query) ||
        funko.number?.toLowerCase().includes(query) ||
        funko.variant?.toLowerCase().includes(query) ||
        funko.upc?.toLowerCase().includes(query) ||
        funko.upc_a?.toLowerCase().includes(query) ||
        funko.ean_13?.toLowerCase().includes(query) ||
        funko.amazon_asin?.toLowerCase().includes(query) ||
        funko.country_of_registration?.toLowerCase().includes(query) ||
        funko.brand?.toLowerCase().includes(query) ||
        funko.model_number?.toLowerCase().includes(query) ||
        funko.size?.toLowerCase().includes(query) ||
        funko.color?.toLowerCase().includes(query) ||
        funko.weight?.toLowerCase().includes(query) ||
        funko.product_dimensions?.toLowerCase().includes(query) ||
        funko.description?.toLowerCase().includes(query)
      );
    }

    // Series filter
    if (filters.series.length > 0) {
      filtered = filtered.filter(funko => filters.series.includes(funko.series));
    }

    // Rarity filter
    if (filters.rarity.length > 0) {
      filtered = filtered.filter(funko => 
        funko.rarity && filters.rarity.includes(funko.rarity)
      );
    }

    // Price range filter
    filtered = filtered.filter(funko => {
      const value = funko.estimated_value || 0;
      return value >= filters.priceRange.min && value <= filters.priceRange.max;
    });

    // Boolean filters
    if (filters.isExclusive !== null) {
      filtered = filtered.filter(funko => funko.is_exclusive === filters.isExclusive);
    }
    if (filters.isVaulted !== null) {
      filtered = filtered.filter(funko => funko.is_vaulted === filters.isVaulted);
    }
    if (filters.isChase !== null) {
      filtered = filtered.filter(funko => funko.is_chase === filters.isChase);
    }

    setFilteredFunkos(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFunkos();
  };

  const handleFunkoPress = (funko: FunkoPop) => {
    (navigation as any).navigate('FunkoDetail', { funko });
  };

  const addToWishlist = async (funkoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          funko_pop_id: funkoId,
        });

      if (error) throw error;
      Alert.alert('Success', 'Added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert('Error', 'Failed to add to wishlist');
    }
  };

  const FilterChip = ({ label, active, onPress }: any) => (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SortButton = ({ label, value }: any) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === value && styles.sortButtonActive]}
      onPress={() => {
        if (sortBy === value) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
          setSortBy(value);
          setSortOrder('asc');
        }
      }}
    >
      <Text style={[styles.sortButtonText, sortBy === value && styles.sortButtonTextActive]}>
        {label}
      </Text>
      {sortBy === value && (
        <Ionicons 
          name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color={theme.colors.primary} 
        />
      )}
    </TouchableOpacity>
  );

  const renderFunko = ({ item }: { item: FunkoPop }) => (
    <FunkoCard
      funko={item}
      onPress={() => handleFunkoPress(item)}
      onWishlistPress={() => addToWishlist(item.id)}
      layout={viewMode}
      showActions
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search Funkos..."
        onFilterPress={() => setShowFilters(!showFilters)}
      />

      {/* View Controls */}
      <View style={styles.viewControls}>
        <View style={styles.viewModeButtons}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={20} color={viewMode === 'grid' ? theme.colors.primary : theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={20} color={viewMode === 'list' ? theme.colors.primary : theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.resultCount}>
          {filteredFunkos.length} Funkos
        </Text>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <SortButton label="Name" value="name" />
          <SortButton label="Value" value="estimated_value" />
          <SortButton label="Series" value="series" />
          <SortButton label="Release" value="release_date" />
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <Card style={styles.filtersCard}>
          <Text style={styles.filtersTitle}>Filters</Text>
          
          {/* Quick Filters */}
          <View style={styles.quickFilters}>
            <FilterChip
              label="Exclusives"
              active={filters.isExclusive === true}
              onPress={() => setFilters(prev => ({
                ...prev,
                isExclusive: prev.isExclusive === true ? null : true
              }))}
            />
            <FilterChip
              label="Vaulted"
              active={filters.isVaulted === true}
              onPress={() => setFilters(prev => ({
                ...prev,
                isVaulted: prev.isVaulted === true ? null : true
              }))}
            />
            <FilterChip
              label="Chase"
              active={filters.isChase === true}
              onPress={() => setFilters(prev => ({
                ...prev,
                isChase: prev.isChase === true ? null : true
              }))}
            />
          </View>

          {/* Clear Filters */}
          <Button
            title="Clear All Filters"
            variant="outline"
            size="small"
            onPress={() => {
              setFilters({
                series: [],
                rarity: [],
                priceRange: { min: 0, max: 1000 },
                isExclusive: null,
                isVaulted: null,
                isChase: null,
              });
              setSearchQuery('');
            }}
          />
        </Card>
      )}

      {/* Featured Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesTitle}>Popular Series</Text>
        <View style={styles.categories}>
          {availableSeries.slice(0, 6).map((series) => (
            <TouchableOpacity
              key={series}
              style={styles.categoryCard}
              onPress={() => {
                setFilters(prev => ({
                  ...prev,
                  series: [series]
                }));
                setShowFilters(true);
              }}
            >
              <Text style={styles.categoryName}>{series}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Funko Directory" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Funko directory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Funko Directory" />
      
      <FlatList
        data={filteredFunkos}
        renderItem={renderFunko}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  headerContent: {
    marginBottom: theme.spacing.lg,
  },
  viewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 2,
  },
  viewModeButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  viewModeButtonActive: {
    backgroundColor: theme.colors.primary + '22',
  },
  resultCount: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  sortContainer: {
    marginBottom: theme.spacing.md,
  },
  sortLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  sortButtonActive: {
    backgroundColor: theme.colors.primary + '22',
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  sortButtonText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: theme.colors.primary,
  },
  filtersCard: {
    marginBottom: theme.spacing.md,
  },
  filtersTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary + '22',
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: theme.colors.primary,
  },
  categoriesContainer: {
    marginTop: theme.spacing.lg,
  },
  categoriesTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryCard: {
    flex: 1,
    minWidth: (width - theme.spacing.md * 3) / 2,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 