import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CardField, useStripe, isPlatformPaySupported, confirmPlatformPayPayment, PlatformPay } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  cryptoPrice: number;
  description: string;
  features: string[];
}

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { confirmPayment, initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const [loading, setLoading] = useState(false);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>({
    id: 'monthly',
    name: 'Monthly Subscription',
    price: 3.99,
    cryptoPrice: 3.49,
    description: '3-day free trial, then $3.99/month',
    features: [
      'Unlimited Funko tracking',
      'Real-time price updates',
      'Collection analytics',
      'Wishlist management',
      'Barcode scanning'
    ]
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'google'>('card');

  useEffect(() => {
    checkPlatformPaySupport();
  }, []);

  const checkPlatformPaySupport = async () => {
    const supported = await isPlatformPaySupported();
    setIsApplePaySupported(supported);
    setIsGooglePaySupported(supported); // Platform pay covers both Apple Pay and Google Pay
  };

  // Initialize payment sheet
  const initializePaymentSheet = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          amount: Math.round(selectedPlan.price * 100), // Convert to cents
          currency: 'usd',
          customerId: user?.id
        })
      });

      const { paymentIntent, ephemeralKey, customer } = await response.json();

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'POP Guide',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: user?.email || '',
        },
        returnURL: 'popguide://payment-success',
      });

      if (!error) {
        return true;
      } else {
        Alert.alert('Payment Setup Error', error.message);
        return false;
      }
    } catch (error: any) {
      Alert.alert('Payment Setup Error', error.message);
      return false;
    }
  };

  // Handle card payment
  const handleCardPayment = async () => {
    setLoading(true);
    try {
      const initialized = await initializePaymentSheet();
      if (!initialized) {
        setLoading(false);
        return;
      }

      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Payment failed: ${error.code}`, error.message);
      } else {
        // Payment succeeded
        await handlePaymentSuccess();
      }
    } catch (error: any) {
      Alert.alert('Payment Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Apple Pay
  const handleApplePay = async () => {
    if (!isApplePaySupported) {
      Alert.alert('Apple Pay not supported', 'Apple Pay is not supported on this device');
      return;
    }

    setLoading(true);
    try {
      // Create payment intent first
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          amount: Math.round(selectedPlan.price * 100),
          currency: 'usd',
          customerId: user?.id
        })
      });

      const { client_secret } = await response.json();

      const { error } = await confirmPlatformPayPayment(client_secret, {
        applePay: {
          cartItems: [{
            label: selectedPlan.name,
            amount: selectedPlan.price.toString(),
            paymentType: PlatformPay.PaymentType.Immediate,
          }],
          merchantCountryCode: 'US',
          currencyCode: 'USD',
        },
      });

      if (error) {
        Alert.alert('Apple Pay Error', error.message);
      } else {
        await handlePaymentSuccess();
      }
    } catch (error: any) {
      Alert.alert('Apple Pay Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Pay
  const handleGooglePay = async () => {
    if (!isGooglePaySupported) {
      Alert.alert('Google Pay not supported', 'Google Pay is not supported on this device');
      return;
    }

    setLoading(true);
    try {
      // Create payment intent first
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          amount: Math.round(selectedPlan.price * 100),
          currency: 'usd',
          customerId: user?.id
        })
      });

      const { client_secret } = await response.json();

      const { error } = await confirmPlatformPayPayment(client_secret, {
        googlePay: {
          testEnv: __DEV__,
          merchantName: 'POP Guide',
          merchantCountryCode: 'US',
          currencyCode: 'USD',
          billingAddressConfig: {
            format: PlatformPay.BillingAddressFormat.Full,
            isRequired: true,
          },
        },
      });

      if (error) {
        Alert.alert('Google Pay Error', error.message);
      } else {
        await handlePaymentSuccess();
      }
    } catch (error: any) {
      Alert.alert('Google Pay Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async () => {
    try {
      // Update user subscription status in Supabase
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user?.id,
          plan_id: selectedPlan.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });

      if (error) throw error;

      Alert.alert(
        'Payment Successful! 🎉',
        'Welcome to POP Guide Premium! Your 3-day free trial has started.',
        [
          {
            text: 'Start Exploring',
            onPress: () => (navigation as any).navigate('Dashboard')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Subscription Error', 'Payment was successful but there was an issue activating your subscription. Please contact support.');
    }
  };

  const PaymentMethodCard = ({ method, title, icon, description, onPress, disabled = false }: any) => (
    <Card style={StyleSheet.flatten([
      styles.paymentMethodCard,
      paymentMethod === method && styles.selectedPaymentMethod,
      disabled && styles.disabledPaymentMethod
    ])}>
      <TouchableOpacity
        onPress={onPress}
        style={styles.paymentMethodButton}
        disabled={disabled}
      >
        <View style={styles.paymentMethodContent}>
          <View style={styles.paymentMethodHeader}>
            <Ionicons name={icon} size={24} color={disabled ? theme.colors.textMuted : theme.colors.primary} />
            <Text style={[styles.paymentMethodTitle, disabled && styles.disabledText]}>{title}</Text>
          </View>
          <Text style={[styles.paymentMethodDescription, disabled && styles.disabledText]}>{description}</Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Subscription</Text>
          <Text style={styles.subtitle}>Start your 3-day free trial</Text>
        </View>

        {/* Plan Details */}
        <Card style={styles.planCard}>
          <Text style={styles.planName}>{selectedPlan.name}</Text>
          <Text style={styles.planPrice}>${selectedPlan.price}/month</Text>
          <Text style={styles.planDescription}>{selectedPlan.description}</Text>
          
          <View style={styles.featuresContainer}>
            {selectedPlan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsContainer}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          
          <PaymentMethodCard
            method="card"
            title="Credit/Debit Card"
            icon="card"
            description="Pay with your credit or debit card"
            onPress={() => setPaymentMethod('card')}
          />

          <PaymentMethodCard
            method="apple"
            title="Apple Pay"
            icon="logo-apple"
            description="Pay with Touch ID or Face ID"
            onPress={() => setPaymentMethod('apple')}
            disabled={!isApplePaySupported}
          />

          <PaymentMethodCard
            method="google"
            title="Google Pay"
            icon="logo-google"
            description="Pay with Google Pay"
            onPress={() => setPaymentMethod('google')}
            disabled={!isGooglePaySupported}
          />
        </View>

        {/* Card Input Field (only show for card payments) */}
        {paymentMethod === 'card' && (
          <Card style={styles.cardInputContainer}>
            <Text style={styles.inputLabel}>Card Details</Text>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: theme.colors.inputBackground,
                textColor: theme.colors.text,
                borderColor: theme.colors.inputBorder,
                borderWidth: 1,
                borderRadius: theme.borderRadius.md,
              }}
              style={styles.cardField}
            />
          </Card>
        )}

        {/* Payment Button */}
        <View style={styles.paymentButtonContainer}>
          <Button
            title={`Start Free Trial with ${paymentMethod === 'card' ? 'Card' : paymentMethod === 'apple' ? 'Apple Pay' : 'Google Pay'}`}
            onPress={
              paymentMethod === 'card' ? handleCardPayment :
              paymentMethod === 'apple' ? handleApplePay :
              handleGooglePay
            }
            loading={loading}
            style={styles.paymentButton}
          />
          
          <Text style={styles.trialInfo}>
            You won't be charged until your 3-day free trial ends. Cancel anytime.
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
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  planCard: {
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  planDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  featuresContainer: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  paymentMethodsContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  paymentMethodCard: {
    marginBottom: theme.spacing.md,
    padding: 0,
  },
  selectedPaymentMethod: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  disabledPaymentMethod: {
    opacity: 0.5,
  },
  paymentMethodButton: {
    backgroundColor: 'transparent',
    padding: theme.spacing.lg,
  },
  paymentMethodContent: {
    width: '100%',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
  cardInputContainer: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  cardField: {
    height: 50,
  },
  paymentButtonContainer: {
    paddingBottom: theme.spacing.xl,
  },
  paymentButton: {
    marginBottom: theme.spacing.md,
  },
  trialInfo: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
}); 