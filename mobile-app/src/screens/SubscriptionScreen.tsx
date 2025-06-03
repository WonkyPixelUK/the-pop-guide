import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

interface Subscription {
  id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'trial' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
}

interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  description: string;
}

export const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      if (!user) return;

      // Load current subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setSubscription(subData);

      // Load billing history
      const { data: billingData } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setBillingHistory(billingData || []);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your POP Guide subscription? You\'ll continue to have access until the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setCanceling(true);
            try {
              // Call backend to cancel Stripe subscription
              const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cancel-subscription`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({
                  subscription_id: subscription?.stripe_subscription_id
                })
              });

              if (!response.ok) throw new Error('Failed to cancel subscription');

              // Update local subscription status
              const { error } = await supabase
                .from('user_subscriptions')
                .update({ 
                  cancel_at_period_end: true,
                  status: 'canceled'
                })
                .eq('id', subscription?.id);

              if (error) throw error;

              Alert.alert(
                'Subscription Canceled',
                'Your subscription has been canceled. You\'ll continue to have access until the end of your current billing period.',
                [{ text: 'OK', onPress: () => loadSubscriptionData() }]
              );
            } catch (error: any) {
              Alert.alert('Error', 'Failed to cancel subscription. Please contact support.');
            } finally {
              setCanceling(false);
            }
          }
        }
      ]
    );
  };

  const handleReactivateSubscription = async () => {
    Alert.alert(
      'Reactivate Subscription',
      'Would you like to reactivate your POP Guide subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Reactivate',
          onPress: async () => {
            try {
              // Call backend to reactivate Stripe subscription
              const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reactivate-subscription`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({
                  subscription_id: subscription?.stripe_subscription_id
                })
              });

              if (!response.ok) throw new Error('Failed to reactivate subscription');

              // Update local subscription status
              const { error } = await supabase
                .from('user_subscriptions')
                .update({ 
                  cancel_at_period_end: false,
                  status: 'active'
                })
                .eq('id', subscription?.id);

              if (error) throw error;

              Alert.alert('Subscription Reactivated', 'Your subscription is now active again!');
              loadSubscriptionData();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to reactivate subscription. Please contact support.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'trial': return theme.colors.info;
      case 'canceled': return theme.colors.error;
      case 'past_due': return theme.colors.warning;
      default: return theme.colors.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'trial': return 'Free Trial';
      case 'canceled': return 'Canceled';
      case 'past_due': return 'Past Due';
      default: return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Subscription" showBack />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading subscription details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!subscription) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Subscription" showBack />
        <View style={styles.noSubscriptionContainer}>
          <Ionicons name="card-outline" size={64} color={theme.colors.textMuted} />
          <Text style={styles.noSubscriptionTitle}>No Active Subscription</Text>
          <Text style={styles.noSubscriptionText}>
            You don't have an active subscription. Start your free trial to access all features!
          </Text>
          <Button
            title="Start Free Trial"
            onPress={() => (navigation as any).navigate('Payment')}
            style={styles.startTrialButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Subscription" showBack />
      
      <ScrollView style={styles.content}>
        {/* Current Subscription */}
        <Card style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionTitle}>Current Plan</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) + '22' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
                {getStatusText(subscription.status)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.planName}>Monthly Subscription</Text>
          <Text style={styles.planPrice}>$3.99/month</Text>
          
          <View style={styles.subscriptionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Period</Text>
              <Text style={styles.detailValue}>
                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Billing Date</Text>
              <Text style={styles.detailValue}>
                {subscription.cancel_at_period_end ? 'Subscription ends' : 'Renews'} on {formatDate(subscription.current_period_end)}
              </Text>
            </View>
          </View>

          {subscription.cancel_at_period_end && (
            <View style={styles.cancelNotice}>
              <Ionicons name="information-circle" size={20} color={theme.colors.warning} />
              <Text style={styles.cancelNoticeText}>
                Your subscription is set to cancel at the end of the current period
              </Text>
            </View>
          )}
        </Card>

        {/* Subscription Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Manage Subscription</Text>
          
          {subscription.status === 'active' && !subscription.cancel_at_period_end ? (
            <Button
              title="Cancel Subscription"
              variant="outline"
              onPress={handleCancelSubscription}
              loading={canceling}
              style={styles.actionButton}
              icon="close-circle-outline"
            />
          ) : subscription.cancel_at_period_end ? (
            <Button
              title="Reactivate Subscription"
              onPress={handleReactivateSubscription}
              style={styles.actionButton}
              icon="refresh"
            />
          ) : (
            <Button
              title="Update Payment Method"
              onPress={() => (navigation as any).navigate('Payment')}
              style={styles.actionButton}
              icon="card-outline"
            />
          )}
          
          <Button
            title="Contact Support"
            variant="ghost"
            onPress={() => {
              Alert.alert('Contact Support', 'Email us at support@popguide.co.uk for assistance');
            }}
            style={styles.supportButton}
            icon="help-circle-outline"
          />
        </Card>

        {/* Billing History */}
        {billingHistory.length > 0 && (
          <Card style={styles.billingCard}>
            <Text style={styles.billingTitle}>Billing History</Text>
            
            {billingHistory.map((bill, index) => (
              <View key={bill.id} style={styles.billingItem}>
                <View style={styles.billingInfo}>
                  <Text style={styles.billingDescription}>{bill.description}</Text>
                  <Text style={styles.billingDate}>{formatDate(bill.created_at)}</Text>
                </View>
                <View style={styles.billingAmount}>
                  <Text style={styles.billingPrice}>{formatPrice(bill.amount)}</Text>
                  <Text style={[
                    styles.billingStatus,
                    { color: bill.status === 'paid' ? theme.colors.success : theme.colors.error }
                  ]}>
                    {bill.status}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Features Included */}
        <Card style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>What's Included</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.featureText}>Unlimited Funko tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.featureText}>Real-time price updates</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.featureText}>Collection analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.featureText}>Wishlist management</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.featureText}>Barcode scanning</Text>
            </View>
          </View>
        </Card>
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
  noSubscriptionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  noSubscriptionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  noSubscriptionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  startTrialButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  subscriptionCard: {
    padding: theme.spacing.xl,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  subscriptionDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  cancelNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.warning + '22',
    borderRadius: theme.borderRadius.md,
  },
  cancelNoticeText: {
    fontSize: 14,
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  actionsCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    marginBottom: theme.spacing.md,
  },
  supportButton: {
    marginTop: theme.spacing.sm,
  },
  billingCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  billingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  billingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  billingInfo: {
    flex: 1,
  },
  billingDescription: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  billingDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  billingAmount: {
    alignItems: 'flex-end',
  },
  billingPrice: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  billingStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  featuresCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  featuresList: {
    // No additional styles needed
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
}); 