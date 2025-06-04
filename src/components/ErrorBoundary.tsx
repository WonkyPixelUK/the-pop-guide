import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, RefreshCw, AlertTriangle } from 'lucide-react';
import { systemErrorLogger } from '@/utils/systemErrorLogger';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to our system error logger
    systemErrorLogger.logError({
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      errorType: 'runtime',
      component: errorInfo.componentStack,
      severity: 'high'
    });

    // Submit to bug tracker automatically
    systemErrorLogger.submitErrorToBugTracker({
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      errorType: 'runtime',
      component: errorInfo.componentStack,
      severity: 'high'
    }).then((bugReport) => {
      if (bugReport) {
        this.setState({ errorId: bugReport.reference_number });
      }
    });

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private handleRefresh = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  private handleReportBug = () => {
    window.open('/bug-tracker', '_blank');
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full bg-gray-900/60 border-red-500/30">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Bug className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white mb-2">
                Something went wrong
              </CardTitle>
              <p className="text-gray-300">
                An unexpected error occurred in the PopGuide application.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Info */}
              <Alert className="border-orange-500/30 bg-orange-500/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-orange-200">
                  <strong>Error:</strong> {this.state.error?.message}
                  {this.state.errorId && (
                    <div className="mt-2">
                      <strong>Bug Report ID:</strong> {this.state.errorId}
                      <br />
                      <span className="text-sm">This error has been automatically reported to our development team.</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRefresh}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button 
                  variant="outline"
                  onClick={this.handleReportBug}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>
              </div>

              {/* Technical Details (Collapsible) */}
              <details className="mt-4">
                <summary className="cursor-pointer text-gray-400 hover:text-white transition-colors">
                  Technical Details
                </summary>
                <div className="mt-2 p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    <div className="mb-2">
                      <strong>Error Message:</strong>
                      <div className="mt-1 text-red-300">{this.state.error?.message}</div>
                    </div>
                    
                    {this.state.error?.stack && (
                      <div className="mb-2">
                        <strong>Stack Trace:</strong>
                        <div className="mt-1 text-gray-400 text-xs overflow-x-auto">
                          {this.state.error.stack}
                        </div>
                      </div>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <div className="mt-1 text-gray-400 text-xs overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </details>

              {/* User Guidance */}
              <div className="text-center text-sm text-gray-400">
                <p>You can try refreshing the page or report this bug to help us fix it.</p>
                <p className="mt-1">Your data is safe and this error has been logged for investigation.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 