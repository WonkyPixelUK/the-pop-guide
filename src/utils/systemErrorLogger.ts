import { supabase } from '@/integrations/supabase/client';
import { BugSeverity, BugType, BugPlatform } from '@/types/supabase';

interface SystemError {
  message: string;
  stack?: string;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: Date;
  userAgent: string;
  userId?: string;
  errorType: 'javascript' | 'network' | 'syntax' | 'runtime' | 'compilation';
  component?: string;
  severity: BugSeverity;
}

class SystemErrorLogger {
  private errors: SystemError[] = [];
  private userId: string | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    this.userId = session?.user?.id || null;

    // Set up global error handlers
    this.setupErrorHandlers();
    this.isInitialized = true;
  }

  private setupErrorHandlers() {
    // JavaScript runtime errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        errorType: 'runtime',
        severity: this.determineSeverity(event.message)
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        errorType: 'runtime',
        severity: 'medium'
      });
    });

    // React error boundary integration
    this.setupReactErrorHandler();
  }

  private setupReactErrorHandler() {
    // This would be called from a React Error Boundary
    (window as any).__logReactError = (error: Error, errorInfo: any) => {
      this.logError({
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        errorType: 'runtime',
        component: errorInfo.componentStack,
        severity: 'high'
      });
    };
  }

  private determineSeverity(message: string): BugSeverity {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('critical') || 
        lowerMessage.includes('crash') ||
        lowerMessage.includes('cannot read') ||
        lowerMessage.includes('network error')) {
      return 'high';
    }
    
    if (lowerMessage.includes('warning') ||
        lowerMessage.includes('deprecated')) {
      return 'low';
    }
    
    return 'medium';
  }

  public logError(error: SystemError) {
    console.error('🐛 System Error Logged:', error);
    this.errors.push(error);
    
    // Auto-submit critical errors
    if (error.severity === 'critical') {
      this.submitErrorToBugTracker(error);
    }
  }

  public async submitErrorToBugTracker(error: SystemError) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const referenceNumber = this.generateReferenceNumber();
      
      const bugData = {
        reference_number: referenceNumber,
        title: `System Error: ${error.message.substring(0, 100)}`,
        description: this.formatErrorDescription(error),
        severity: error.severity,
        bug_type: this.getBugType(error.errorType),
        platform: 'web_app' as BugPlatform,
        status: 'new' as const,
        priority: error.severity === 'critical' ? 'urgent' : 
                 error.severity === 'high' ? 'high' : 'normal',
        created_by: this.userId,
        environment_data: {
          browser: navigator.userAgent,
          url: error.url || window.location.href,
          timestamp: error.timestamp.toISOString(),
          user_type: 'system',
          error_details: {
            stack: error.stack,
            lineNumber: error.lineNumber,
            columnNumber: error.columnNumber,
            component: error.component,
            errorType: error.errorType
          }
        },
        reproduction_steps: 'System-generated error - automatic detection',
        expected_behavior: 'No errors should occur during normal operation',
        actual_behavior: error.message
      };

      const { data, error: submitError } = await supabase
        .from('bugs')
        .insert(bugData)
        .select()
        .single();

      if (submitError) {
        console.error('Failed to submit error to bug tracker:', submitError);
        return null;
      }

      console.log(`✅ Error automatically submitted to bug tracker: ${referenceNumber}`);
      return data;

    } catch (err) {
      console.error('Error submitting to bug tracker:', err);
      return null;
    }
  }

  private formatErrorDescription(error: SystemError): string {
    return `
**Automatically detected system error**

**Error Message:** ${error.message}

**Timestamp:** ${error.timestamp.toISOString()}

**URL:** ${error.url || window.location.href}

**User Agent:** ${error.userAgent}

**Error Type:** ${error.errorType}

${error.stack ? `**Stack Trace:**\n\`\`\`\n${error.stack}\n\`\`\`` : ''}

${error.component ? `**Component:** ${error.component}` : ''}

**Location:** ${error.lineNumber ? `Line ${error.lineNumber}` : 'Unknown'}${error.columnNumber ? `, Column ${error.columnNumber}` : ''}
    `.trim();
  }

  private getBugType(errorType: string): BugType {
    switch (errorType) {
      case 'syntax': return 'functionality';
      case 'network': return 'performance';
      case 'compilation': return 'functionality';
      default: return 'functionality';
    }
  }

  private generateReferenceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SYS-${year}-${random}`;
  }

  public async submitKnownErrors() {
    // Submit known errors that we've identified
    const knownErrors = [
      {
        message: "ProfileEditor: SyntaxError: optionalChainingAssign parser plugin required",
        stack: "at TypeScriptParserMixin.expectPlugin (babel/parser)",
        url: "/src/components/ProfileEditor.tsx",
        lineNumber: 430,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        errorType: 'syntax' as const,
        component: 'ProfileEditor',
        severity: 'high' as BugSeverity
      },
      {
        message: "Mobile Navigation: Missing Bug Tracker and Roadmap links",
        stack: "Navigation structure incomplete",
        url: "/src/components/MobileBottomNav.tsx",
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        errorType: 'functionality' as const,
        component: 'MobileBottomNav',
        severity: 'medium' as BugSeverity
      },
      {
        message: "Database Migration: amazon_asin column not found in schema cache",
        stack: "Column missing from funko_pops table",
        url: "/src/components/EnhancedAddItemDialog.tsx",
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        errorType: 'functionality' as const,
        component: 'Database Schema',
        severity: 'high' as BugSeverity
      }
    ];

    for (const error of knownErrors) {
      await this.submitErrorToBugTracker(error);
      // Wait a bit between submissions to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  public getErrorSummary() {
    return {
      total: this.errors.length,
      bySeverity: {
        critical: this.errors.filter(e => e.severity === 'critical').length,
        high: this.errors.filter(e => e.severity === 'high').length,
        medium: this.errors.filter(e => e.severity === 'medium').length,
        low: this.errors.filter(e => e.severity === 'low').length
      },
      byType: {
        javascript: this.errors.filter(e => e.errorType === 'javascript').length,
        network: this.errors.filter(e => e.errorType === 'network').length,
        syntax: this.errors.filter(e => e.errorType === 'syntax').length,
        runtime: this.errors.filter(e => e.errorType === 'runtime').length,
        compilation: this.errors.filter(e => e.errorType === 'compilation').length
      }
    };
  }
}

// Create global instance
export const systemErrorLogger = new SystemErrorLogger();

// Export convenience function
export const logSystemError = (error: Partial<SystemError>) => {
  systemErrorLogger.logError({
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    severity: 'medium',
    errorType: 'runtime',
    ...error
  } as SystemError);
};

export default SystemErrorLogger; 