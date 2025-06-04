import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

interface SubmittedFunko {
  id: string;
  name: string;
  series: string;
  number: string;
  variant?: string;
  image_url?: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'needs_changes';
  created_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  is_price_tracking: boolean;
}

export const MySubmissionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [submissions, setSubmissions] = useState<SubmittedFunko[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [user]);

  const loadSubmissions = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_submitted_funkos')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSubmissions();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      case 'needs_changes': return theme.colors.warning;
      case 'pending_review': return theme.colors.info;
      default: return theme.colors.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'needs_changes': return 'Needs Changes';
      case 'pending_review': return 'Pending Review';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'needs_changes': return 'alert-circle';
      case 'pending_review': return 'time';
      default: return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const SubmissionCard = ({ submission }: { submission: SubmittedFunko }) => (
    <Card style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <View style={styles.submissionInfo}>
          {submission.image_url && (
            <Image source={{ uri: submission.image_url }} style={styles.submissionImage} />
          )}
          <View style={styles.submissionDetails}>
            <Text style={styles.submissionName}>{submission.name}</Text>
            <Text style={styles.submissionSeries}>{submission.series} #{submission.number}</Text>
            {submission.variant && (
              <Text style={styles.submissionVariant}>{submission.variant}</Text>
            )}
            <Text style={styles.submissionDate}>
              Submitted {formatDate(submission.created_at)}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(submission.status) + '22' }]}>
            <Ionicons 
              name={getStatusIcon(submission.status)} 
              size={16} 
              color={getStatusColor(submission.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(submission.status) }]}>
              {getStatusText(submission.status)}
            </Text>
          </View>
          
          {submission.is_price_tracking && (
            <View style={styles.trackingBadge}>
              <Ionicons name="trending-up" size={12} color={theme.colors.success} />
              <Text style={styles.trackingText}>Price Tracking</Text>
            </View>
          )}
        </View>
      </View>

      {submission.reviewer_notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Reviewer Notes:</Text>
          <Text style={styles.notesText}>{submission.reviewer_notes}</Text>
        </View>
      )}

      <View style={styles.submissionActions}>
        {submission.status === 'approved' && (
          <Button
            title="View in Database"
            variant="outline"
            size="small"
            onPress={() => {
              // Navigate to the approved Funko in the main database
              console.log('Navigate to approved Funko');
            }}
            icon="open-outline"
          />
        )}
        
        {(submission.status === 'needs_changes' || submission.status === 'pending_review') && (
          <Button
            title="Edit Submission"
            variant="outline"
            size="small"
            onPress={() => (navigation as any).navigate('EditSubmission', { submission })}
            icon="create-outline"
          />
        )}
        
        {submission.status === 'rejected' && (
          <Button
            title="Resubmit"
            variant="outline"
            size="small"
            onPress={() => (navigation as any).navigate('AddFunko', { 
              editData: submission 
            })}
            icon="refresh"
          />
        )}
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="My Submissions" showBack />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your submissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="My Submissions" showBack />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {submissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No Submissions Yet</Text>
            <Text style={styles.emptyText}>
              You haven't submitted any Funko Pops to our database yet. Help expand our collection!
            </Text>
            <Button
              title="Add Your First Funko"
              onPress={() => (navigation as any).navigate('AddFunko')}
              style={styles.addFirstButton}
              icon="add-circle"
            />
          </View>
        ) : (
          <>
            {/* Stats Header */}
            <Card style={styles.statsCard}>
              <Text style={styles.statsTitle}>Submission Summary</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {submissions.filter(s => s.status === 'approved').length}
                  </Text>
                  <Text style={styles.statLabel}>Approved</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {submissions.filter(s => s.status === 'pending_review').length}
                  </Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {submissions.filter(s => s.is_price_tracking).length}
                  </Text>
                  <Text style={styles.statLabel}>Tracking Prices</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{submissions.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </Card>

            {/* Submissions List */}
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}

            {/* Add More Button */}
            <Button
              title="Submit Another Funko"
              onPress={() => (navigation as any).navigate('AddFunko')}
              style={styles.addMoreButton}
              icon="add-circle"
            />
          </>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  addFirstButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  statsCard: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  submissionCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  submissionInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  submissionImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  submissionDetails: {
    flex: 1,
  },
  submissionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  submissionSeries: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  submissionVariant: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
  },
  submissionDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '22',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  trackingText: {
    fontSize: 10,
    color: theme.colors.success,
    marginLeft: 2,
  },
  notesContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  submissionActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  addMoreButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
}); 