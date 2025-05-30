import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { SearchInput } from '../components/UI/SearchInput';
import { FunkoCard } from '../components/FunkoCard';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { theme } from '../styles/theme';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Funko {
  id: string;
  name: string;
  series: string;
  number: string;
  image_url?: string;
  estimated_value?: number;
  rarity?: string;
  category?: string;
  in_collection?: boolean;
}

interface CollectionStats {
  total: number;
  totalValue: number;
  recentlyAdded: number;
  topSeries: string;
}

export const CollectionScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [funkos, setFunkos] = useState<Funko[]>([]);
  const [filteredFunkos, setFilteredFunkos] = useState<Funko[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [stats, setStats] = useState<CollectionStats>({
    total: 0,
    totalValue: 0,
    recentlyAdded: 0,
    topSeries: '',
  });

  const loadCollection = async () => {
    try {
      if (!user) return;

      const { data: collectionData, error } = await supabase
        .from('user_collections')
        .select(`
          funkos (
            id, name, series, number, image_url, estimated_value, rarity, category
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading collection:', error);
        return;
      }

      const funkoList: Funko[] = collectionData?.map((item: any) => ({
        ...item.funkos,
        in_collection: true,
      })) || [];

      setFunkos(funkoList);
      setFilteredFunkos(funkoList);

      // Calculate stats
      const totalValue = funkoList.reduce((sum, funko) => sum + (funko.estimated_value || 0), 0);
      const seriesCounts = funkoList.reduce((acc: Record<string, number>, funko) => {
        acc[funko.series] = (acc[funko.series] || 0) + 1;
        return acc;
      }, {});
      const topSeries = Object.entries(seriesCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

      setStats({
        total: funkoList.length,
        totalValue,
        recentlyAdded: 5, // Placeholder - would calculate based on date
        topSeries,
      });

    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCollection();
  }, [user]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredFunkos(funkos);
      return;
    }

    const filtered = funkos.filter(funko =>
      funko.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      funko.series.toLowerCase().includes(searchQuery.toLowerCase()) ||
      funko.number.toString().includes(searchQuery)
    );
    setFilteredFunkos(filtered);
  }, [searchQuery, funkos]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCollection();
  };

  const handleFunkoPress = (funko: Funko) => {
    (navigation as any).navigate('FunkoDetail', { funko });
  };

  const handleRemoveFromCollection = async (funko: Funko) => {
    Alert.alert(
      'Remove from Collection',
      `Are you sure you want to remove "${funko.name}" from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_collections')
                .delete()
                .eq('user_id', user?.id)
                .eq('funko_id', funko.id);

              if (!error) {
                setFunkos(prev => prev.filter(f => f.id !== funko.id));
                Alert.alert('Success', 'Funko removed from collection');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove funko from collection');
            }
          }
        }
      ]
    );
  };

  const StatCard = ({ title, value, icon, onPress }: {
    title: string;
    value: string | number;
    icon: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.statCard}>
      <Card style={styles.statCardInner}>
        <View style={styles.statContent}>
          <Ionicons name={icon as any} size={24} color={theme.colors.primary} />
          <View style={styles.statText}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="library-outline" size={64} color={theme.colors.textMuted} />
      <Text style={styles.emptyStateTitle}>No Funkos in Collection</Text>
      <Text style={styles.emptyStateText}>
        Start building your collection by scanning Funko Pops or browsing the directory
      </Text>
      <View style={styles.emptyStateButtons}>
        <Button
          title="Scan Funko"
          onPress={() => (navigation as any).navigate('Scanner')}
          icon={<Ionicons name="scan" size={20} color={theme.colors.textOnPrimary} />}
        />
        <Button
          title="Browse Directory"
          onPress={() => (navigation as any).navigate('Discover')}
          variant="outline"
          style={{ marginTop: theme.spacing.sm }}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="My Collection" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your collection...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="My Collection" 
        rightAction={{
          icon: 'analytics',
          onPress: () => (navigation as any).navigate('Analytics')
        }}
      />

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Section */}
        {stats.total > 0 && (
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Items"
                value={stats.total}
                icon="library"
                onPress={() => {}}
              />
              <StatCard
                title="Collection Value"
                value={`$${stats.totalValue.toFixed(0)}`}
                icon="trending-up"
                onPress={() => (navigation as any).navigate('Analytics')}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Recently Added"
                value={stats.recentlyAdded}
                icon="add-circle"
                onPress={() => {}}
              />
              <StatCard
                title="Top Series"
                value={stats.topSeries || 'N/A'}
                icon="star"
                onPress={() => {}}
              />
            </View>
          </View>
        )}

        {/* Search and Controls */}
        <View style={styles.controlsSection}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search your collection..."
          />
          
          <View style={styles.viewControls}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons 
                name="grid" 
                size={20} 
                color={viewMode === 'grid' ? theme.colors.textOnPrimary : theme.colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={viewMode === 'list' ? theme.colors.textOnPrimary : theme.colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Collection Grid/List */}
        {filteredFunkos.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={styles.collectionContainer}>
            <FlatList
              data={filteredFunkos}
              keyExtractor={(item) => item.id}
              numColumns={viewMode === 'grid' ? 2 : 1}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
                  <FunkoCard
                    funko={item}
                    onPress={() => handleFunkoPress(item)}
                    onToggleCollection={() => handleRemoveFromCollection(item)}
                    layout={viewMode}
                  />
                </View>
              )}
            />
          </View>
        )}

        {/* Action Buttons */}
        {funkos.length > 0 && (
          <View style={styles.actionButtons}>
            <Button
              title="Create Custom List"
              onPress={() => (navigation as any).navigate('CreateList')}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="View Analytics"
              onPress={() => (navigation as any).navigate('Analytics')}
              style={styles.actionButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  statsSection: {
    padding: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
  },
  statCardInner: {
    padding: theme.spacing.sm,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: theme.spacing.sm,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  viewControls: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: 4,
  },
  viewButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  viewButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  collectionContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  gridItem: {
    flex: 1,
    margin: theme.spacing.xs,
  },
  listItem: {
    marginBottom: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyStateTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  emptyStateButtons: {
    width: '100%',
  },
  actionButtons: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButton: {
    marginBottom: theme.spacing.sm,
  },
}); 