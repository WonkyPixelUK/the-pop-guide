import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Card, Text, Button, Avatar, Divider } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface ContributionSummary {
  total_submissions: number;
  approved_submissions: number;
  pending_submissions: number;
  contribution_score: number;
  rewards_earned: number;
  next_milestone: number;
  progress_to_next_milestone: number;
}

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  const [contributionStats, setContributionStats] = useState<ContributionSummary | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      loadContributionStats();
    }
  }, [user]);

  const loadContributionStats = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .rpc('get_user_contribution_summary', { check_user_id: user.id });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setContributionStats(data[0]);
      }
    } catch (error) {
      console.error('Error loading contribution stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Text 
              size={80} 
              label={user?.email ? getInitials(user.email) : 'U'} 
              style={styles.avatar}
              theme={{ colors: { primary: '#e46c1b' } }}
            />
            <Text style={styles.emailText}>{user?.email}</Text>
            <Text style={styles.memberSince}>
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Contribution Stats Card */}
      {contributionStats && (
        <Card style={styles.contributionCard}>
          <Card.Content>
            <Text style={styles.contributionTitle}>🏆 Your Contributions</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{contributionStats.approved_submissions}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{contributionStats.pending_submissions}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{contributionStats.contribution_score}</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{contributionStats.rewards_earned}</Text>
                <Text style={styles.statLabel}>Rewards</Text>
              </View>
            </View>

            {contributionStats.next_milestone > contributionStats.approved_submissions && (
              <View style={styles.milestoneSection}>
                <Text style={styles.milestoneText}>
                  Next milestone: {contributionStats.next_milestone} submissions
                  {contributionStats.next_milestone === 50 && ' (Free Month!) 🎉'}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${contributionStats.progress_to_next_milestone}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {contributionStats.progress_to_next_milestone.toFixed(1)}% complete
                </Text>
              </View>
            )}

            {contributionStats.approved_submissions >= 50 && (
              <View style={styles.rewardNotice}>
                <Text style={styles.rewardText}>
                  🎉 Congratulations! You've earned a free month for contributing 50+ Funko Pops!
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.optionsCard}>
        <Card.Content>
          <View style={styles.option}>
            <Text style={styles.optionText}>Email Verified</Text>
            <Text style={styles.optionValue}>
              {user?.email_confirmed_at ? '✅ Yes' : '❌ No'}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.option}>
            <Text style={styles.optionText}>Account ID</Text>
            <Text style={styles.optionValue}>{user?.id?.substring(0, 8)}...</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => Alert.alert('Feature Coming Soon', 'Edit profile functionality will be available soon!')}
            style={styles.actionButton}
            buttonColor="#e46c1b"
          >
            Edit Profile
          </Button>

          <Button
            mode="contained"
            onPress={() => (navigation as any).navigate('Subscription')}
            style={styles.actionButton}
            buttonColor="#e46c1b"
          >
            Manage Subscription
          </Button>

          <Button
            mode="contained"
            onPress={() => (navigation as any).navigate('MySubmissions')}
            style={styles.actionButton}
            buttonColor="#e46c1b"
          >
            My Submissions
          </Button>

          <Button
            mode="contained"
            onPress={() => Alert.alert('Feature Coming Soon', 'Export data functionality will be available soon!')}
            style={styles.actionButton}
            buttonColor="#666"
          >
            Export Data
          </Button>

          <Button
            mode="contained"
            onPress={handleSignOut}
            style={[styles.actionButton, styles.signOutButton]}
            buttonColor="#dc2626"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
    borderRadius: 12,
  },
  cardContent: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#e46c1b',
    marginBottom: 16,
  },
  emailText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#999',
  },
  optionsCard: {
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
    borderRadius: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  optionValue: {
    fontSize: 16,
    color: '#999',
  },
  divider: {
    backgroundColor: '#444',
  },
  actionsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
  },
  actionButton: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  signOutButton: {
    marginBottom: 0,
  },
  contributionCard: {
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
    borderRadius: 12,
  },
  contributionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
  },
  milestoneSection: {
    marginBottom: 16,
  },
  milestoneText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#444',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e46c1b',
  },
  progressText: {
    fontSize: 14,
    color: '#999',
  },
  rewardNotice: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  rewardText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
}); 