import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { testConnection } from '../services/supabase';
import { getFunkoPops } from '../services/funko';
import { theme } from '../styles/theme';

export const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [stats, setStats] = useState<{
    totalPops: number;
    connectionTime: number;
    poolMode: string;
  } | null>(null);

  const testDatabaseConnection = async () => {
    setConnectionStatus('checking');
    const startTime = Date.now();
    
    try {
      // Test basic connection
      const isConnected = await testConnection();
      
      if (!isConnected) {
        setConnectionStatus('error');
        return;
      }

      // Get some stats to verify transaction pooler performance
      const { count } = await getFunkoPops(1, 0);
      const connectionTime = Date.now() - startTime;
      
      setStats({
        totalPops: count,
        connectionTime,
        poolMode: 'transaction' // From our configuration
      });
      
      setConnectionStatus('connected');
      
      Alert.alert(
        '✅ Connection Successful',
        `Connected to PopGuide database!\n\n` +
        `• Total Funko Pops: ${count.toLocaleString()}\n` +
        `• Connection Time: ${connectionTime}ms\n` +
        `• Pool Mode: Transaction Pooler\n` +
        `• Optimized for mobile performance`
      );
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      
      Alert.alert(
        '❌ Connection Failed',
        `Unable to connect to database:\n\n${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return theme.colors.success;
      case 'error': return theme.colors.error;
      default: return theme.colors.warning;
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return 'checkmark-circle';
      case 'error': return 'close-circle';
      default: return 'time';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'error': return 'Connection Failed';
      default: return 'Checking Connection...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Ionicons 
          name={getStatusIcon()}
          size={24} 
          color={getStatusColor()} 
        />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Database Statistics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Funko Pops:</Text>
            <Text style={styles.statValue}>{stats.totalPops.toLocaleString()}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Connection Time:</Text>
            <Text style={styles.statValue}>{stats.connectionTime}ms</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pool Mode:</Text>
            <Text style={styles.statValue}>{stats.poolMode}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={styles.retryButton}
        onPress={testDatabaseConnection}
      >
        <Ionicons name="refresh" size={16} color="white" />
        <Text style={styles.retryText}>Test Connection</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  statsContainer: {
    marginBottom: theme.spacing.md,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
}); 