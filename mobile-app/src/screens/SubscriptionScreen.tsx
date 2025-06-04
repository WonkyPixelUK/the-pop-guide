import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
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

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    stripePriceId: '',
    features: [
      'Track up to 100 Funko Pops',
      'Basic collection management',
      'Price alerts for owned items',
      'Community access',
      'Mobile app access'
    ]
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 3.99,
    interval: 'month',
    stripePriceId: 'price_1OpGuideProMonthly123', // Replace with actual Stripe price ID
    popular: true,
    features: [
      'Unlimited Funko Pop tracking',
      'Advanced analytics & insights',
      'Price history tracking & alerts',
      'Custom categories & lists',
      'Bulk actions (add/edit/remove)',
      'CSV import & export',
      'New releases tracking',
      'Currency support (£/$/€)',
      'Social features & friends',
      'Collection sharing',
      'Advanced search & filtering',
      'Priority support',
      'API access',
      'AI price predictions',
      'Wish tracker & drop alerts',
      'Gamification & achievements',
      'Personalized recommendations',
      'Virtual shelf showcase',
      'Email notifications',
      'Premium badge system',
      'Barcode scanning',
      'Mobile app access',
      'Dark mode support'
    ]
  },
  {
    id: 'retailer_yearly',
    name: 'Retailer',
    price: 25,
    interval: 'year',
    stripePriceId: 'price_1OpGuideRetailerYearly123', // Replace with actual Stripe price ID
    features: [
      'Directory listing',
      'Retailer badge',
      'Analytics dashboard',
      'Deal alerts',
      'Unlimited product listings',
      'Whatnot show promotion',
      'Business insights',
      'Priority listing placement'
    ]
  }
];

export const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, subscription, refreshSubscription } = useAuth();
  
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('pro_monthly');
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      setCurrentSubscription(subData);

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

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe');
      return;
    }

    if (plan.id === 'free') {
      Alert.alert('Free Plan', 'You are already on the free plan!');
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.stripePriceId,
          userId: user.id,
          userEmail: user.email,
          successUrl: 'com.popguide.app://payment-success',
          cancelUrl: 'com.popguide.app://payment-cancel'
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // In a real app, you'd open this URL in a webview or browser
        Alert.alert(
          '🚀 Ready to Subscribe!',
          `Selected: ${plan.name} - $${plan.price}/${plan.interval}\n\n${plan.id === 'pro_monthly' ? 'Start your 3-day free trial, then ' : ''}$${plan.price}/${plan.interval}\n\nIn a production app, this would open Stripe Checkout.\n\nFor demo purposes, we'll simulate a successful payment.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Simulate Payment', 
              onPress: () => simulateSuccessfulPayment(plan)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Subscription Error', 'Unable to start subscription process');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateSuccessfulPayment = async (plan: Plan) => {
    try {
      setIsLoading(true);

      // Simulate creating subscription in database
      const expiresAt = new Date();
      if (plan.interval === 'month') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user!.id,
          subscription_type: plan.id === 'retailer_yearly' ? 'retailer' : 'pro',
          stripe_subscription_id: `sim_${Date.now()}`,
          stripe_customer_id: `cus_${Date.now()}`,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: expiresAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          plan_name: plan.name,
          plan_price: plan.price,
          plan_interval: plan.interval
        });

      if (error) throw error;

      // Update user profile
      await supabase
        .from('user_profiles')
        .update({ subscription_type: plan.id === 'retailer_yearly' ? 'retailer' : 'pro' })
        .eq('user_id', user!.id);

      await refreshSubscription();
      await loadSubscriptionData();

      Alert.alert(
        '🎉 Welcome to Pro!',
        `You've successfully subscribed to ${plan.name}!\n\n${plan.id === 'pro_monthly' ? 'Your 3-day free trial has started. ' : ''}Your premium features are now active.`,
        [{ text: 'Awesome!', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Simulation error:', error);
      Alert.alert('Error', 'Failed to process subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your Pro subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive',
          onPress: confirmCancelSubscription
        }
      ]
    );
  };

  const confirmCancelSubscription = async () => {
    try {
      setIsLoading(true);

      // In production, you'd call Stripe API to cancel
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('user_id', user!.id)
        .eq('status', 'active');

      if (error) throw error;

      await refreshSubscription();
      await loadSubscriptionData();

      Alert.alert(
        'Subscription Canceled',
        'Your subscription has been canceled. You\'ll continue to have Pro access until the end of your billing period.'
      );
    } catch (error) {
      console.error('Cancellation error:', error);
      Alert.alert('Error', 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
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

  const PlanCard = ({ plan }: { plan: Plan }) => (
    <View style={[styles.planCard, plan.popular && styles.popularPlan]}>
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceSymbol}>$</Text>
          <Text style={styles.price}>{plan.price}</Text>
          <Text style={styles.priceInterval}>/{plan.interval}</Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {plan.id !== 'free' && (
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            plan.popular && styles.popularButton,
            subscription === 'pro' && styles.currentPlanButton
          ]}
          onPress={() => handleSubscribe(plan)}
          disabled={isLoading || subscription === 'pro'}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.subscribeButtonText}>
              {subscription === 'pro' ? 'Current Plan' : 
               plan.id === 'retailer_yearly' ? 'Become a Retailer' : 
               'Start 3-Day Pro Trial'}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

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

  if (!currentSubscription) {
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
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={subscription === 'pro' ? "star" : "person"} 
              size={24} 
              color={subscription === 'pro' ? "#FFD700" : "#86868b"} 
            />
            <Text style={styles.statusTitle}>
              Current Plan: {subscription === 'pro' ? 'Pro' : 'Free'}
            </Text>
          </View>
          {currentSubscription && (
            <Text style={styles.statusSubtitle}>
              Renews on {new Date(currentSubscription.current_period_end).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>Simple, Transparent Pricing</Text>
          <Text style={styles.sectionSubtitle}>
            Start free and upgrade as your collection grows. No hidden fees, cancel anytime.
          </Text>

          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>

        {/* Cancel Subscription */}
        {subscription === 'pro' && currentSubscription && (
          <View style={styles.cancelContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </TouchableOpacity>
            <Text style={styles.cancelNote}>
              You can cancel anytime. Your access will continue until the end of your billing period.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All subscriptions are processed securely through Stripe. 
            Cancel anytime from your account settings.
          </Text>
        </View>
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
  statusContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginLeft: 12,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#86868b',
    marginLeft: 36,
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#86868b',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceSymbol: {
    fontSize: 20,
    color: '#1d1d1f',
    fontWeight: '500',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  priceInterval: {
    fontSize: 16,
    color: '#86868b',
    marginLeft: 4,
  },
  savings: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1d1d1f',
    marginLeft: 12,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  currentPlanButton: {
    backgroundColor: '#86868b',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelNote: {
    fontSize: 14,
    color: '#86868b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#86868b',
    textAlign: 'center',
    lineHeight: 16,
  },
}); 