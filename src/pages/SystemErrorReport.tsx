import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardHeader from '@/components/DashboardHeader';
import Footer from '@/components/Footer';
import { systemErrorLogger } from '@/utils/systemErrorLogger';
import { Bug, Upload, CheckCircle, AlertTriangle, Info, Loader } from 'lucide-react';

const SystemErrorReport = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const handleSubmitKnownErrors = async () => {
    setSubmitting(true);
    setError(null);
    setResults([]);
    
    try {
      console.log('📋 Submitting known system errors to bug tracker...');
      
      // Get error summary before submission
      const summary = systemErrorLogger.getErrorSummary();
      console.log('Current error summary:', summary);
      
      // Submit known errors
      await systemErrorLogger.submitKnownErrors();
      
      setSubmitted(true);
      setResults([
        { type: 'success', message: 'ProfileEditor syntax error submitted' },
        { type: 'success', message: 'Mobile navigation missing items submitted' },
        { type: 'success', message: 'Database schema missing columns submitted' }
      ]);
      
    } catch (err: any) {
      setError(`Failed to submit errors: ${err.message}`);
      console.error('Error submitting known errors:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const knownErrors = [
    {
      title: "ProfileEditor Syntax Error",
      description: "SyntaxError: This experimental syntax requires enabling the parser plugin: 'optionalChainingAssign'",
      severity: "high",
      component: "ProfileEditor.tsx",
      line: 430,
      status: "Identified - needs fixing"
    },
    {
      title: "Mobile Navigation Missing Items",
      description: "Bug tracker and roadmap links missing from mobile navigation support section",
      severity: "medium", 
      component: "MobileBottomNav.tsx",
      line: null,
      status: "Fixed in this session"
    },
    {
      title: "Database Schema Missing Columns",
      description: "Could not find the 'amazon_asin' column of 'funko_pops' in the schema cache",
      severity: "high",
      component: "Database Migration",
      line: null,
      status: "Migration needed"
    },
    {
      title: "Enhanced Collection Missing from Mobile DB",
      description: "Enhanced Collection test page not accessible from mobile database menu",
      severity: "medium",
      component: "MobileBottomNav.tsx", 
      line: null,
      status: "Fixed in this session"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <DashboardHeader showSearch={false} />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Bug className="w-10 h-10 text-orange-400" />
              System Error Report
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Development tool for submitting identified system errors to the bug tracker. 
              This page helps track and resolve known issues in the PopGuide platform.
            </p>
          </div>

          {/* Submit Known Errors */}
          <Card className="bg-gray-900/60 border-gray-600/50 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-orange-400" />
                Submit Known Errors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Click the button below to automatically submit all identified system errors to the bug tracker.
                This will create bug reports for issues that have been detected in this development session.
              </p>
              
              <Button
                onClick={handleSubmitKnownErrors}
                disabled={submitting || submitted}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Errors...
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Errors Submitted
                  </>
                ) : (
                  <>
                    <Bug className="w-4 h-4 mr-2" />
                    Submit Known Errors to Bug Tracker
                  </>
                )}
              </Button>

              {error && (
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {submitted && (
                <Alert className="border-green-500/30 bg-green-500/10">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-300">
                    Successfully submitted known errors to the bug tracker. Check the Bug Tracker page to see the reports.
                  </AlertDescription>
                </Alert>
              )}

              {results.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white font-semibold mb-2">Submission Results:</h4>
                  <ul className="space-y-1">
                    {results.map((result, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">{result.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Known Errors List */}
          <Card className="bg-gray-900/60 border-gray-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Known System Errors ({knownErrors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {knownErrors.map((error, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{error.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          error.severity === 'high' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {error.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          error.status.includes('Fixed')
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : error.status.includes('needed')
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {error.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-2">{error.description}</p>
                    
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Component:</span> {error.component}
                      {error.line && (
                        <>
                          {' • '}
                          <span className="font-medium">Line:</span> {error.line}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Next Steps</h4>
                    <ul className="text-sm text-blue-200 space-y-1">
                      <li>1. Run the database migration script: <code className="bg-gray-800 px-2 py-1 rounded">MANUAL_SQL_SETUP.sql</code></li>
                      <li>2. Create storage buckets in Supabase Dashboard</li>
                      <li>3. Fix ProfileEditor syntax error (optional chaining assignment)</li>
                      <li>4. Test enhanced collection functionality</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => window.open('/bug-tracker', '_blank')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              View Bug Tracker
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/test-enhanced-collection', '_blank')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Test Enhanced Collection
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SystemErrorReport; 