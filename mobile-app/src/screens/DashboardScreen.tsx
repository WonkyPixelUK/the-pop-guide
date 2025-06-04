import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalValue: number;
  totalItems: number;
  recentlyAdded: number;
  mostValuable: any;
}

export const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats>({
    totalValue: 0,
    totalItems: 0,
    recentlyAdded: 0,
    mostValuable: null
  });
  const [recentFunkos, setRecentFunkos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch collection data with basic error handling
      const { data: collectionData } = await supabase
        .from('user_collections')
        .select(`
          *,
          funko_pops (
            id, name, series, number, estimated_value, image_url
          )
        `)
        .eq('user_id', user?.id);

      if (collectionData) {
        const totalItems = collectionData.length;
        const totalValue = collectionData.reduce((sum: number, item: any) => {
          const funko = item.funko_pops;
          return sum + (funko?.estimated_value || 0);
        }, 0);

        setStats({
          totalValue,
          totalItems,
          recentlyAdded: 0, // Simplified for now
          mostValuable: null
        });

        // Set recent funkos
        setRecentFunkos(collectionData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        totalValue: 0,
        totalItems: 0,
        recentlyAdded: 0,
        mostValuable: null
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <Text style={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : '0'}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subtitle}>Here's your collection overview</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Collection Size"
          value={stats.totalItems}
          icon="library"
          onPress={() => (navigation as any).navigate('Collection')}
        />
        <StatCard
          title="Total Value"
          value={`$${stats.totalValue.toFixed(2)}`}
          icon="trending-up"
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Additions</Text>
        {recentFunkos.length > 0 ? (
          recentFunkos.map((item: any, index: number) => (
            <View key={index} style={styles.funkoItem}>
              <Text style={styles.funkoName}>
                {item.funko_pops?.name || 'Unknown Funko'}
              </Text>
              <Text style={styles.funkoSeries}>
                {item.funko_pops?.series || 'Unknown Series'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No items in collection yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  funkoItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  funkoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  funkoSeries: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
}); 