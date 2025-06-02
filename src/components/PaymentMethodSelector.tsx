import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Bitcoin, Zap, Shield, Percent, Clock, Globe } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'traditional' | 'crypto';
  icon: React.ReactNode;
  fee: string;
  processingTime: string;
  discount?: number;
  price: number;
  originalPrice?: number;
  benefits: string[];
  supportedCurrencies?: string[];
  description: string;
}

interface PaymentMethodSelectorProps {
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  loading: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onPaymentMethodSelect,
  loading
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'traditional',
      icon: <CreditCard className="w-6 h-6" />,
      fee: '2.9% + 30¢',
      processingTime: 'Instant',
      price: 3.99,
      description: 'Pay with your credit or debit card through Stripe',
      benefits: [
        'Instant activation',
        'Easy refunds',
        'Familiar checkout',
        'Chargeback protection',
        'Auto-renewal'
      ]
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      type: 'crypto',
      icon: <Bitcoin className="w-6 h-6" />,
      fee: '1% network fee',
      processingTime: '10-60 minutes',
      discount: 5,
      price: 3.49,
      originalPrice: 3.99,
      description: 'Pay with Bitcoin, Ethereum, Litecoin, or other supported cryptocurrencies',
      supportedCurrencies: ['BTC', 'ETH', 'LTC', 'BCH', 'USDC'],
      benefits: [
        '5% discount applied',
        'No chargebacks',
        'Global payments',
        'Privacy focused',
        'No bank fees'
      ]
    }
  ];

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedMethod)!;

  const handleSelect = (method: PaymentMethod) => {
    setSelectedMethod(method.id);
  };

  const handleContinue = () => {
    onPaymentMethodSelect(selectedPaymentMethod);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Choose Payment Method</h2>
        <p className="text-gray-400 text-lg">Select how you'd like to pay for PopGuide Pro</p>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {paymentMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${
              selectedMethod === method.id 
                ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500 shadow-lg shadow-orange-500/25' 
                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
            }`}
            onClick={() => handleSelect(method)}
          >
            {/* Discount Badge */}
            {method.discount && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-green-500 text-white font-bold px-3 py-1">
                  -{method.discount}% OFF
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center">
                <div className="flex items-center">
                  {method.icon}
                  <span className="ml-3">{method.name}</span>
                </div>
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">{method.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Pricing */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {method.originalPrice && (
                    <span className="text-gray-500 line-through text-lg">
                      ${method.originalPrice}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-orange-500">
                    ${method.price}
                  </span>
                </div>
                <div className="text-gray-400 text-sm mt-1">per month</div>
                {method.discount && (
                  <div className="text-green-400 text-sm font-medium mt-1">
                    Save ${(method.originalPrice! - method.price).toFixed(2)} every month
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Percent className="w-4 h-4 mr-2" />
                    Fee:
                  </span>
                  <span className="text-white font-medium">{method.fee}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Processing:
                  </span>
                  <span className="text-white font-medium">{method.processingTime}</span>
                </div>
              </div>

              {/* Supported Currencies (for crypto) */}
              {method.supportedCurrencies && (
                <div>
                  <div className="text-gray-400 text-sm mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Supported Currencies:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {method.supportedCurrencies.map((currency) => (
                      <Badge key={currency} variant="outline" className="text-xs">
                        {currency}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="pt-3 border-t border-gray-700">
                <div className="text-gray-400 text-sm mb-3">Benefits:</div>
                <ul className="space-y-2">
                  {method.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-center">
                      <Shield className="w-4 h-4 text-orange-500 mr-3 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Method Summary */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-white">
                {selectedPaymentMethod.icon}
                <span className="ml-3 font-semibold">{selectedPaymentMethod.name}</span>
              </div>
              <div className="text-gray-400">•</div>
              <div className="text-2xl font-bold text-orange-500">
                ${selectedPaymentMethod.price}/month
              </div>
              {selectedPaymentMethod.discount && (
                <Badge className="bg-green-500 text-white">
                  {selectedPaymentMethod.discount}% off
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="text-center">
        <Button 
          onClick={handleContinue}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg"
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Processing...
            </div>
          ) : (
            `Continue with ${selectedPaymentMethod.name}`
          )}
        </Button>
        
        {selectedPaymentMethod.type === 'crypto' && (
          <p className="text-gray-400 text-sm mt-3">
            You'll be redirected to Coinbase Commerce to complete your crypto payment
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSelector; 