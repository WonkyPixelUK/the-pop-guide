import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Card } from '../components/UI/Card';
import { FunkoCard } from '../components/FunkoCard';
import { theme } from '../styles/theme';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalCollection: number;
  totalWishlist: number;
  totalValue: number;
  recentlyAdded: number;
}

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalCollection: 0,
    totalWishlist: 0,
    totalValue: 0,
    recentlyAdded: 0,
  });
  const [recentFunkos, setRecentFunkos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      if (!user) return;

      // Load collection stats
      const { data: collectionData } = await supabase
        .from('user_collections')
        .select('funko_id, funkos(estimated_value)')
        .eq('user_id', user.id);

      const { data: wishlistData } = await supabase
        .from('user_wishlists')
        .select('funko_id')
        .eq('user_id', user.id);

      // Load recent funkos
      const { data: recentData } = await supabase
        .from('user_collections')
        .select(`
          funkos(
            id, name, series, number, image_url, estimated_value
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      const totalValue = collectionData?.reduce((sum, item) => {
        return sum + (item.funkos?.estimated_value || 0);
      }, 0) || 0;

      const recentlyAddedCount = collectionData?.filter(item => {
        const addedDate = new Date(item.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return addedDate > weekAgo;
      }).length || 0;

      setStats({
        totalCollection: collectionData?.length || 0,
        totalWishlist: wishlistData?.length || 0,
        totalValue,
        recentlyAdded: recentlyAddedCount,
      });

      setRecentFunkos(recentData?.map(item => item.funkos).filter(Boolean) || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleFunkoPress = (funko: any) => {
    (navigation as any).navigate('Collection', {
      screen: 'FunkoDetail',
      params: { funko }
    });
  };

  const StatCard = ({ title, value, icon, onPress, color = theme.colors.primary }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.statCard}>
      <Card style={styles.statCardInner}>
        <View style={styles.statHeader}>
          <View style={[styles.statIconContainer, { backgroundColor: color + '22' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </Card>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, onPress, color = theme.colors.primary }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.quickAction}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showLogo />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your collection...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header showLogo />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.welcomeSubtext}>Here's your collection overview</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Collection Size"
            value={stats.totalCollection}
            icon="library"
            onPress={() => (navigation as any).navigate('Collection')}
          />
          <StatCard
            title="Wishlist Items"
            value={stats.totalWishlist}
            icon="heart"
            onPress={() => (navigation as any).navigate('Discover', { screen: 'Wishlist' })}
            color={theme.colors.error}
          />
          <StatCard
            title="Collection Value"
            value={`$${stats.totalValue.toFixed(2)}`}
            icon="trending-up"
            onPress={() => (navigation as any).navigate('Collection', { screen: 'Analytics' })}
            color={theme.colors.success}
          />
          <StatCard
            title="Recently Added"
            value={stats.recentlyAdded}
            icon="add-circle"
            onPress={() => (navigation as any).navigate('Collection')}
            color={theme.colors.warning}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Scan Funko"
              icon="scan"
              onPress={() => (navigation as any).navigate('Scanner')}
            />
            <QuickAction
              title="Browse Directory"
              icon="search"
              onPress={() => (navigation as any).navigate('Discover')}
              color={theme.colors.info}
            />
            <QuickAction
              title="Create List"
              icon="list"
              onPress={() => (navigation as any).navigate('Collection', { screen: 'CreateList' })}
              color={theme.colors.success}
            />
            <QuickAction
              title="View Analytics"
              icon="analytics"
              onPress={() => (navigation as any).navigate('Collection', { screen: 'Analytics' })}
              color={theme.colors.warning}
            />
          </View>
        </View>

        {/* Recent Additions */}
        {recentFunkos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Additions</Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Collection')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.recentFunkos}>
                {recentFunkos.map((funko: any, index) => (
                  <View key={index} style={styles.recentFunkoCard}>
                    <FunkoCard
                      funko={funko}
                      onPress={() => handleFunkoPress(funko)}
                      layout="grid"
                      showActions={false}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
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
    paddingHorizontal: theme.spacing.md,
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
  welcomeSection: {
    paddingVertical: theme.spacing.lg,
  },
  welcomeText: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtext: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    width: (width - 40 - theme.spacing.sm) / 2,
  },
  statCardInner: {
    padding: theme.spacing.md,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  statTitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  quickAction: {
    width: (width - 40 - theme.spacing.sm) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  recentFunkos: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  recentFunkoCard: {
    width: 160,
  },
}); 