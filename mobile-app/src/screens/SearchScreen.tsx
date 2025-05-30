import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
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
}

interface SavedSearch {
  id: string;
  name: string;
  query: any;
  created_at: string;
}

interface SearchFilters {
  series?: string;
  minValue?: number;
  maxValue?: number;
  isExclusive?: boolean;
  isVaulted?: boolean;
  isChase?: boolean;
  rarity?: string;
}

export const SearchScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FunkoPop[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadRecentSearches();
    if (user) {
      loadSavedSearches();
    }
  }, [user]);

  const loadRecentSearches = () => {
    // In a real app, you'd load this from AsyncStorage
    const recent = ['Marvel', 'Disney', 'Star Wars', 'Anime'];
    setRecentSearches(recent);
  };

  const loadSavedSearches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const performSearch = async (query: string, searchFilters: SearchFilters = {}) => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      let supabaseQuery = supabase
        .from('funko_pops')
        .select('*');

      // Text search
      if (query) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query}%,series.ilike.%${query}%,number.ilike.%${query}%,variant.ilike.%${query}%`
        );
      }

      // Apply filters
      if (searchFilters.series) {
        supabaseQuery = supabaseQuery.eq('series', searchFilters.series);
      }
      if (searchFilters.minValue !== undefined) {
        supabaseQuery = supabaseQuery.gte('estimated_value', searchFilters.minValue);
      }
      if (searchFilters.maxValue !== undefined) {
        supabaseQuery = supabaseQuery.lte('estimated_value', searchFilters.maxValue);
      }
      if (searchFilters.isExclusive !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_exclusive', searchFilters.isExclusive);
      }
      if (searchFilters.isVaulted !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_vaulted', searchFilters.isVaulted);
      }
      if (searchFilters.isChase !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_chase', searchFilters.isChase);
      }
      if (searchFilters.rarity) {
        supabaseQuery = supabaseQuery.eq('rarity', searchFilters.rarity);
      }

      const { data, error } = await supabaseQuery
        .order('name')
        .limit(50);

      if (error) throw error;

      setSearchResults(data || []);
      
      // Add to recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      Alert.alert('Error', 'Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async () => {
    if (!user || !searchQuery.trim()) return;

    const searchName = `Search: ${searchQuery}`;
    
    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name: searchName,
          query: {
            text: searchQuery,
            filters: filters
          }
        });

      if (error) throw error;

      Alert.alert('Success', 'Search saved successfully');
      loadSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
      Alert.alert('Error', 'Failed to save search');
    }
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    const query = savedSearch.query;
    setSearchQuery(query.text || '');
    setFilters(query.filters || {});
    performSearch(query.text || '', query.filters || {});
  };

  const deleteSavedSearch = async (searchId: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(s => s.id !== searchId));
      Alert.alert('Success', 'Saved search deleted');
    } catch (error) {
      console.error('Error deleting saved search:', error);
      Alert.alert('Error', 'Failed to delete saved search');
    }
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

  const renderSearchResult = ({ item }: { item: FunkoPop }) => (
    <FunkoCard
      funko={item}
      onPress={() => handleFunkoPress(item)}
      onWishlistPress={() => addToWishlist(item.id)}
      layout={viewMode}
      showActions
    />
  );

  const renderRecentSearch = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => {
        setSearchQuery(item);
        performSearch(item, filters);
      }}
    >
      <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
      <Text style={styles.recentSearchText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSavedSearch = ({ item }: { item: SavedSearch }) => (
    <TouchableOpacity
      style={styles.savedSearchItem}
      onPress={() => loadSavedSearch(item)}
    >
      <View style={styles.savedSearchInfo}>
        <Ionicons name="bookmark-outline" size={16} color={theme.colors.primary} />
        <Text style={styles.savedSearchName}>{item.name}</Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteSavedSearch(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Search for Funkos</Text>
          <Text style={styles.emptySubtitle}>
            Enter a name, series, or number to find Funko Pops
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="sad-outline" size={64} color={theme.colors.textMuted} />
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptySubtitle}>
          Try adjusting your search terms or filters
        </Text>
      </View>
    );
  };

  const renderContent = () => {
    if (!hasSearched) {
      return (
        <View style={styles.suggestionsContainer}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Card style={styles.suggestionsCard}>
              <Text style={styles.suggestionsTitle}>Recent Searches</Text>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearch}
                keyExtractor={(item, index) => `recent-${index}`}
                showsVerticalScrollIndicator={false}
              />
            </Card>
          )}

          {/* Saved Searches */}
          {user && savedSearches.length > 0 && (
            <Card style={styles.suggestionsCard}>
              <Text style={styles.suggestionsTitle}>Saved Searches</Text>
              <FlatList
                data={savedSearches}
                renderItem={renderSavedSearch}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            </Card>
          )}

          {/* Popular Searches */}
          <Card style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>Popular Searches</Text>
            <View style={styles.popularSearches}>
              {['Marvel', 'Disney', 'Star Wars', 'Anime', 'DC Comics', 'Pokemon'].map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.popularSearchChip}
                  onPress={() => {
                    setSearchQuery(term);
                    performSearch(term, filters);
                  }}
                >
                  <Text style={styles.popularSearchText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Search" />
      
      <View style={styles.searchContainer}>
        {/* Search Input */}
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search Funkos..."
          onSubmitEditing={() => performSearch(searchQuery, filters)}
          onFilterPress={() => setShowFilters(!showFilters)}
          autoFocus
        />

        {/* Search Actions */}
        {searchQuery.length > 0 && (
          <View style={styles.searchActions}>
            <Button
              title="Search"
              onPress={() => performSearch(searchQuery, filters)}
              style={styles.searchButton}
              loading={loading}
            />
            {user && hasSearched && (
              <Button
                title="Save"
                variant="outline"
                onPress={saveSearch}
                style={styles.saveButton}
                icon="bookmark-outline"
              />
            )}
          </View>
        )}

        {/* Filters */}
        {showFilters && (
          <Card style={styles.filtersCard}>
            <Text style={styles.filtersTitle}>Filters</Text>
            
            <View style={styles.quickFilters}>
              <FilterChip
                label="Exclusives"
                active={filters.isExclusive === true}
                onPress={() => setFilters(prev => ({
                  ...prev,
                  isExclusive: prev.isExclusive === true ? undefined : true
                }))}
              />
              <FilterChip
                label="Vaulted"
                active={filters.isVaulted === true}
                onPress={() => setFilters(prev => ({
                  ...prev,
                  isVaulted: prev.isVaulted === true ? undefined : true
                }))}
              />
              <FilterChip
                label="Chase"
                active={filters.isChase === true}
                onPress={() => setFilters(prev => ({
                  ...prev,
                  isChase: prev.isChase === true ? undefined : true
                }))}
              />
            </View>

            <Button
              title="Clear Filters"
              variant="outline"
              size="small"
              onPress={() => setFilters({})}
            />
          </Card>
        )}

        {/* Results Header */}
        {hasSearched && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {searchResults.length} results
            </Text>
            
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
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  searchButton: {
    flex: 1,
  },
  saveButton: {
    minWidth: 80,
  },
  filtersCard: {
    marginTop: theme.spacing.md,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
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
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
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
  content: {
    flex: 1,
  },
  resultsContainer: {
    padding: theme.spacing.md,
  },
  suggestionsContainer: {
    padding: theme.spacing.md,
  },
  suggestionsCard: {
    marginBottom: theme.spacing.md,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  recentSearchText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  savedSearchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  savedSearchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savedSearchName: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  popularSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  popularSearchChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '22',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  popularSearchText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 