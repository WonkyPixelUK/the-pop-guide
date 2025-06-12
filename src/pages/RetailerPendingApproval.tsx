import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { Clock, CheckCircle, XCircle, Mail, Phone, MessageSquare } from 'lucide-react';

const RetailerPendingApproval = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'approved' | 'declined'>('pending');

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user is already approved
    if (user.user_metadata?.retailer_subscription_status === 'active') {
      navigate('/retailer-dashboard');
      return;
    }
  }, [user, navigate]);

  const timelineSteps = [
    {
      step: 1,
      title: "Application Submitted",
      description: "Your retailer application has been received",
      status: "completed",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />
    },
    {
      step: 2,
      title: "Under Review",
      description: "Our team is reviewing your application",
      status: status === 'pending' ? "current" : status === 'approved' ? "completed" : "failed",
      icon: status === 'pending' ? <Clock className="h-5 w-5 text-blue-500 animate-pulse" /> : 
             status === 'approved' ? <CheckCircle className="h-5 w-5 text-green-500" /> : 
             <XCircle className="h-5 w-5 text-red-500" />
    },
    {
      step: 3,
      title: "Decision Made",
      description: status === 'approved' ? "Application approved!" : 
                  status === 'declined' ? "Application declined" : "Awaiting decision",
      status: status === 'approved' ? "completed" : status === 'declined' ? "failed" : "pending",
      icon: status === 'approved' ? <CheckCircle className="h-5 w-5 text-green-500" /> :
             status === 'declined' ? <XCircle className="h-5 w-5 text-red-500" /> :
             <Clock className="h-5 w-5 text-gray-400" />
    },
    {
      step: 4,
      title: "Get Started",
      description: "Access your retailer dashboard and start selling",
      status: status === 'approved' ? "current" : "pending",
      icon: status === 'approved' ? <CheckCircle className="h-5 w-5 text-green-500" /> :
           <Clock className="h-5 w-5 text-gray-400" />
    }
  ];

  const renderPendingContent = () => (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-500 animate-pulse" />
            <div>
              <CardTitle className="text-blue-900">Application Under Review</CardTitle>
              <CardDescription className="text-blue-700">
                Your retailer application is being processed by our team
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="space-y-2 text-blue-800">
                <li>• Our team will verify your business information</li>
                <li>• We may contact you for additional documentation</li>
                <li>• You'll receive an email within 24-48 hours</li>
                <li>• If approved, you'll get instant access to your retailer dashboard</li>
              </ul>
            </div>
            
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Need to update your application?</h4>
              <p className="text-blue-800 mb-3">
                If you need to provide additional information or update your application, please contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = 'mailto:support@popguide.co.uk?subject=Retailer Application Update'}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/contact')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Form
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApprovedContent = () => (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <CardTitle className="text-green-900">🎉 Congratulations!</CardTitle>
              <CardDescription className="text-green-700">
                Your retailer application has been approved
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Welcome to the POPGuide Retailer Network!</h4>
              <p className="text-green-800 mb-3">
                You now have access to all retailer features including unlimited product listings, 
                analytics dashboard, and direct connections with collectors.
              </p>
              <Button 
                onClick={() => navigate('/retailer-dashboard')}
                className="bg-green-600 hover:bg-green-700"
              >
                Access Retailer Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDeclinedContent = () => (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <CardTitle className="text-red-900">Application Declined</CardTitle>
              <CardDescription className="text-red-700">
                Unfortunately, your retailer application was not approved
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white/50 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Next Steps</h4>
              <ul className="space-y-2 text-red-800 mb-4">
                <li>• Review the feedback provided in the email</li>
                <li>• Address any concerns or requirements</li>
                <li>• Reapply when you meet the criteria</li>
                <li>• Contact support if you have questions</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/retailers/signup')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Reapply
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:support@popguide.co.uk?subject=Retailer Application Question'}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <>
      <Helmet>
        <title>Retailer Application Status - Pop Universe Tracker</title>
        <meta name="description" content="Check your retailer application status and next steps." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Retailer Application Status</h1>
              <p className="text-gray-600">Track your application progress and next steps</p>
            </div>

            {/* Timeline */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Application Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timelineSteps.map((step, index) => (
                    <div key={step.step} className="flex items-start gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        step.status === 'completed' ? 'bg-green-100 border-green-500' :
                        step.status === 'current' ? 'bg-blue-100 border-blue-500' :
                        step.status === 'failed' ? 'bg-red-100 border-red-500' :
                        'bg-gray-100 border-gray-300'
                      }`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          step.status === 'completed' ? 'text-green-900' :
                          step.status === 'current' ? 'text-blue-900' :
                          step.status === 'failed' ? 'text-red-900' :
                          'text-gray-600'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm ${
                          step.status === 'completed' ? 'text-green-700' :
                          step.status === 'current' ? 'text-blue-700' :
                          step.status === 'failed' ? 'text-red-700' :
                          'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                      {index < timelineSteps.length - 1 && (
                        <div className={`w-px h-8 mt-10 ${
                          step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status-specific content */}
            {status === 'pending' && renderPendingContent()}
            {status === 'approved' && renderApprovedContent()}
            {status === 'declined' && renderDeclinedContent()}

            {/* Support section */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Email Support</h4>
                    <p className="text-sm text-gray-600 mb-3">Get help via email</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = 'mailto:support@popguide.co.uk'}
                    >
                      Email Us
                    </Button>
                  </div>
                  <div className="text-center">
                    <Phone className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Phone Support</h4>
                    <p className="text-sm text-gray-600 mb-3">Speak to our team</p>
                    <Button variant="outline" size="sm">
                      Call Us
                    </Button>
                  </div>
                  <div className="text-center">
                    <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Live Chat</h4>
                    <p className="text-sm text-gray-600 mb-3">Chat with support</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/contact')}
                    >
                      Start Chat
                    </Button>
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

export default RetailerPendingApproval; 