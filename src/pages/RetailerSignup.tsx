import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { Store, Crown, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const RetailerSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Personal Details
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Pricing Plan
    selectedPlan: 'free', // 'free' or 'professional'
    
    // Business Details
    businessName: '',
    businessType: 'retail_store',
    businessDescription: '',
    website: '',
    
    // Address
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    country: 'United Kingdom',
    postalCode: '',
    
    // Business Info
    taxId: '',
    businessEmail: '',
    yearsInBusiness: '',
    estimatedMonthlyVolume: '',
    specialties: [] as string[],
    
    // Agreements
    agreeTerms: false,
    agreeMarketing: false,
    agreeDataProcessing: false,
  });

  const businessTypes = [
    { value: 'retail_store', label: 'Physical Retail Store' },
    { value: 'online_store', label: 'Online Store' },
    { value: 'marketplace', label: 'Marketplace Seller' },
    { value: 'distributor', label: 'Distributor/Wholesaler' },
    { value: 'convention_vendor', label: 'Convention Vendor' },
  ];

  const countries = [
    'United Kingdom', 'United States', 'Canada', 'Australia', 
    'Ireland', 'Germany', 'France', 'Netherlands', 'Other'
  ];

  const specialtyOptions = [
    'Funko Pop Exclusives', 'Chase Variants', 'Grail Hunting',
    'Pre-orders', 'International Shipping', 'Bulk Orders',
    'Custom Orders', 'Vintage Pops', 'Convention Exclusives'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const validateStep1 = () => {
    const required = ['email', 'password', 'firstName', 'lastName'];
    return required.every(field => formData[field as keyof typeof formData]);
  };

  const validateStep2 = () => {
    return formData.selectedPlan !== '';
  };

  const validateStep3 = () => {
    const required = ['businessName', 'businessDescription', 'businessEmail'];
    return required.every(field => formData[field as keyof typeof formData]);
  };

  const validateStep4 = () => {
    const required = ['addressLine1', 'city', 'country', 'postalCode'];
    return required.every(field => formData[field as keyof typeof formData]);
  };

  const validateStep5 = () => {
    return formData.agreeTerms && formData.agreeDataProcessing;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (step === 2 && !validateStep2()) {
      toast({ title: 'Please select a plan', variant: 'destructive' });
      return;
    }
    if (step === 3 && !validateStep3()) {
      toast({ title: 'Please fill in all business details', variant: 'destructive' });
      return;
    }
    if (step === 4 && !validateStep4()) {
      toast({ title: 'Please fill in all address details', variant: 'destructive' });
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep5()) {
      toast({ title: 'Please accept the required terms', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Create Supabase user account with retailer metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            is_retailer: true,
            business_name: formData.businessName,
            retailer_subscription_status: 'pending_approval',
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Store additional retailer data
        const retailerData = {
          user_id: authData.user.id,
          business_name: formData.businessName,
          business_type: formData.businessType,
          business_description: formData.businessDescription,
          website_url: formData.website,
          business_email: formData.businessEmail,
          phone: formData.phone,
          address_line_1: formData.addressLine1,
          address_line_2: formData.addressLine2,
          city: formData.city,
          state_province: formData.stateProvince,
          country: formData.country,
          postal_code: formData.postalCode,
          tax_id: formData.taxId,
          years_in_business: parseInt(formData.yearsInBusiness) || null,
          estimated_monthly_volume: formData.estimatedMonthlyVolume,
          specialties: formData.specialties,
          status: 'pending_approval',
          subscription_status: formData.selectedPlan === 'professional' ? 'professional' : 'free',
          selected_plan: formData.selectedPlan,
          agree_marketing: formData.agreeMarketing,
        };

        // TODO: Send retailer data to backend for processing
        console.log('Retailer application data:', retailerData);
        
        toast({
          title: '🎉 Application Submitted!',
          description: 'Your retailer application has been submitted for review. You\'ll receive an email within 24-48 hours.',
        });
        
        // Redirect to pending approval page
        navigate('/retailer/pending-approval');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup Failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Crown className="h-12 w-12 text-orange-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
        <p className="text-gray-400">Let's start with your personal details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-white">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-white">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email" className="text-white">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="password" className="text-white">Password *</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phone" className="text-white">Phone Number</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Crown className="h-12 w-12 text-orange-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-gray-400">Select the plan that best fits your business needs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card 
          className={`cursor-pointer transition-all duration-200 ${
            formData.selectedPlan === 'free' 
              ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/50' 
              : 'bg-gray-800 border-gray-700 hover:border-gray-600'
          }`}
          onClick={() => handleInputChange('selectedPlan', 'free')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Free Plan</CardTitle>
              <div className="text-2xl font-bold text-white">£0</div>
            </div>
            <CardDescription className="text-gray-400">Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">5 product listings</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Basic retailer profile</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Customer messaging</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Basic analytics</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Plan */}
        <Card 
          className={`cursor-pointer transition-all duration-200 relative ${
            formData.selectedPlan === 'professional' 
              ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/50' 
              : 'bg-gray-800 border-gray-700 hover:border-gray-600'
          }`}
          onClick={() => handleInputChange('selectedPlan', 'professional')}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              RECOMMENDED
            </span>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Professional</CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">£30</div>
                <div className="text-sm text-gray-400">/year</div>
              </div>
            </div>
            <CardDescription className="text-gray-400">Everything you need to grow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold">Unlimited product listings</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Verified retailer badge</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold">Wishlist notifications</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold">New stock alerts</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Priority search placement</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Enhanced customer messaging</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-400">
          All plans include access to our retailer dashboard and customer support
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Store className="h-12 w-12 text-blue-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">Business Information</h2>
        <p className="text-gray-400">Tell us about your business</p>
      </div>
      
      <div>
        <Label htmlFor="businessName" className="text-white">Business Name *</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => handleInputChange('businessName', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="businessType" className="text-white">Business Type *</Label>
        <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="businessDescription" className="text-white">Business Description *</Label>
        <Textarea
          id="businessDescription"
          value={formData.businessDescription}
          onChange={(e) => handleInputChange('businessDescription', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          rows={3}
          placeholder="Describe your business, what you sell, and your target market..."
          required
        />
      </div>
      
      <div>
        <Label htmlFor="website" className="text-white">Website URL</Label>
        <Input
          id="website"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="https://yourstore.com"
        />
      </div>
      
      <div>
        <Label htmlFor="businessEmail" className="text-white">Business Email *</Label>
        <Input
          id="businessEmail"
          type="email"
          value={formData.businessEmail}
          onChange={(e) => handleInputChange('businessEmail', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="yearsInBusiness" className="text-white">Years in Business</Label>
          <Input
            id="yearsInBusiness"
            value={formData.yearsInBusiness}
            onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            placeholder="e.g., 5"
          />
        </div>
        <div>
          <Label htmlFor="estimatedMonthlyVolume" className="text-white">Est. Monthly Sales Volume</Label>
          <Select value={formData.estimatedMonthlyVolume} onValueChange={(value) => handleInputChange('estimatedMonthlyVolume', value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-1k">Under £1,000</SelectItem>
              <SelectItem value="1k-5k">£1,000 - £5,000</SelectItem>
              <SelectItem value="5k-10k">£5,000 - £10,000</SelectItem>
              <SelectItem value="10k-25k">£10,000 - £25,000</SelectItem>
              <SelectItem value="25k-50k">£25,000 - £50,000</SelectItem>
              <SelectItem value="50k-plus">£50,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Business Address</h2>
        <p className="text-gray-400">Where is your business located?</p>
      </div>
      
      <div>
        <Label htmlFor="addressLine1" className="text-white">Address Line 1 *</Label>
        <Input
          id="addressLine1"
          value={formData.addressLine1}
          onChange={(e) => handleInputChange('addressLine1', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="addressLine2" className="text-white">Address Line 2</Label>
        <Input
          id="addressLine2"
          value={formData.addressLine2}
          onChange={(e) => handleInputChange('addressLine2', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-white">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="stateProvince" className="text-white">State/Province</Label>
          <Input
            id="stateProvince"
            value={formData.stateProvince}
            onChange={(e) => handleInputChange('stateProvince', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country" className="text-white">Country *</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="postalCode" className="text-white">Postal Code *</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="taxId" className="text-white">Tax ID / VAT Number</Label>
        <Input
          id="taxId"
          value={formData.taxId}
          onChange={(e) => handleInputChange('taxId', e.target.value)}
          className="bg-gray-800 border-gray-600 text-white"
          placeholder="Optional but recommended for verification"
        />
      </div>

      <div>
        <Label className="text-white mb-3 block">Specialties (Select all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {specialtyOptions.map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2">
              <Checkbox
                id={specialty}
                checked={formData.specialties.includes(specialty)}
                onCheckedChange={() => handleSpecialtyToggle(specialty)}
              />
              <Label htmlFor={specialty} className="text-sm text-gray-300 cursor-pointer">
                {specialty}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">Final Step</h2>
        <p className="text-gray-400">Review and agree to our terms</p>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-300">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
            <p>Your application will be reviewed by our team within 24-48 hours</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
            <p>You'll receive an approval or decline email with next steps</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
            <p>If approved, you'll get <strong>free POPGuide FOC access</strong> and onboarding support</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
            <p>Start adding unlimited product listings and connect with collectors!</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeTerms"
            checked={formData.agreeTerms}
            onCheckedChange={(checked) => handleInputChange('agreeTerms', checked)}
          />
          <Label htmlFor="agreeTerms" className="text-sm text-gray-300 cursor-pointer">
            I agree to the <a href="/legal" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a> *
          </Label>
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeDataProcessing"
            checked={formData.agreeDataProcessing}
            onCheckedChange={(checked) => handleInputChange('agreeDataProcessing', checked)}
          />
          <Label htmlFor="agreeDataProcessing" className="text-sm text-gray-300 cursor-pointer">
            I consent to the processing of my business data for retailer verification and platform services *
          </Label>
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeMarketing"
            checked={formData.agreeMarketing}
            onCheckedChange={(checked) => handleInputChange('agreeMarketing', checked)}
          />
          <Label htmlFor="agreeMarketing" className="text-sm text-gray-300 cursor-pointer">
            I'd like to receive marketing updates about new features and opportunities (optional)
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Retailer Signup - Pop Universe Tracker</title>
        <meta name="description" content="Join our retailer network and connect with millions of Funko Pop collectors. Free POPGuide FOC access included." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                {[1, 2, 3, 4, 5].map((stepNum) => (
                  <div key={stepNum} className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    stepNum <= step ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {stepNum}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
                
                <div className="flex justify-between mt-8">
                  {step > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                  )}
                  
                  <div className="ml-auto">
                    {step < 5 ? (
                      <Button
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Next Step
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Application'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default RetailerSignup; 