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

interface WishlistItem {
  id: string;
  max_price?: number;
  created_at: string;
  funko_pop: {
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
  };
}

interface WishlistStats {
  totalItems: number;
  totalValue: number;
  averageValue: number;
  mostExpensive: WishlistItem | null;
}

export const WishlistScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'date_added' | 'series'>('date_added');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState<WishlistStats>({
    totalItems: 0,
    totalValue: 0,
    averageValue: 0,
    mostExpensive: null,
  });

  const loadWishlist = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          max_price,
          created_at,
          funko_pop:funko_pop_id (
            id,
            name,
            series,
            number,
            variant,
            image_url,
            estimated_value,
            is_exclusive,
            is_vaulted,
            is_chase,
            rarity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = data?.filter(item => item.funko_pop) || [];
      setWishlistItems(items);
      setFilteredItems(items);
      calculateStats(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      Alert.alert('Error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (items: WishlistItem[]) => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.funko_pop.estimated_value || 0), 0);
    const averageValue = totalItems > 0 ? totalValue / totalItems : 0;
    const mostExpensive = items.reduce((max, item) => {
      const currentValue = item.funko_pop.estimated_value || 0;
      const maxValue = max?.funko_pop.estimated_value || 0;
      return currentValue > maxValue ? item : max;
    }, null as WishlistItem | null);

    setStats({
      totalItems,
      totalValue,
      averageValue,
      mostExpensive,
    });
  };

  useEffect(() => {
    loadWishlist();
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, sortBy, sortOrder, wishlistItems]);

  const applyFiltersAndSort = () => {
    let filtered = [...wishlistItems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.funko_pop.name.toLowerCase().includes(query) ||
        item.funko_pop.series.toLowerCase().includes(query) ||
        item.funko_pop.number?.toLowerCase().includes(query) ||
        item.funko_pop.variant?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.funko_pop.name.toLowerCase();
          bValue = b.funko_pop.name.toLowerCase();
          break;
        case 'value':
          aValue = a.funko_pop.estimated_value || 0;
          bValue = b.funko_pop.estimated_value || 0;
          break;
        case 'series':
          aValue = a.funko_pop.series.toLowerCase();
          bValue = b.funko_pop.series.toLowerCase();
          break;
        case 'date_added':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWishlist();
  };

  const handleFunkoPress = (item: WishlistItem) => {
    (navigation as any).navigate('FunkoDetail', { funko: item.funko_pop });
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      Alert.alert('Success', 'Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Alert.alert('Error', 'Failed to remove from wishlist');
    }
  };

  const updateMaxPrice = async (itemId: string, maxPrice: number) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .update({ max_price: maxPrice })
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, max_price: maxPrice } : item
      ));
      Alert.alert('Success', 'Max price updated');
    } catch (error) {
      console.error('Error updating max price:', error);
      Alert.alert('Error', 'Failed to update max price');
    }
  };

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

  const StatCard = ({ title, value, icon, color = theme.colors.primary }: any) => (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </Card>
  );

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <FunkoCard
      funko={item.funko_pop}
      onPress={() => handleFunkoPress(item)}
      onWishlistPress={() => removeFromWishlist(item.id)}
      layout={viewMode}
      showActions
      wishlistItem={item}
      onUpdateMaxPrice={(price) => updateMaxPrice(item.id, price)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon="heart"
            color={theme.colors.primary}
          />
          <StatCard
            title="Total Value"
            value={`$${stats.totalValue.toFixed(2)}`}
            icon="trending-up"
            color={theme.colors.success}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="Average Value"
            value={`$${stats.averageValue.toFixed(2)}`}
            icon="analytics"
            color={theme.colors.warning}
          />
          <StatCard
            title="Most Expensive"
            value={stats.mostExpensive ? `$${stats.mostExpensive.funko_pop.estimated_value?.toFixed(2) || '0.00'}` : '$0.00'}
            icon="diamond"
            color={theme.colors.error}
          />
        </View>
      </View>

      {/* Search */}
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search your wishlist..."
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
          {filteredItems.length} items
        </Text>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <SortButton label="Date Added" value="date_added" />
          <SortButton label="Name" value="name" />
          <SortButton label="Value" value="value" />
          <SortButton label="Series" value="series" />
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={64} color={theme.colors.textMuted} />
      <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
      <Text style={styles.emptySubtitle}>
        Start adding Funkos you want to your wishlist by browsing the directory
      </Text>
      <Button
        title="Browse Funkos"
        onPress={() => (navigation as any).navigate('Discover', { screen: 'DirectoryMain' })}
        style={styles.browseButton}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Wishlist" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your wishlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Wishlist" />
      
      {wishlistItems.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  statsContainer: {
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.md,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  statTitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  browseButton: {
    marginTop: theme.spacing.md,
  },
}); 