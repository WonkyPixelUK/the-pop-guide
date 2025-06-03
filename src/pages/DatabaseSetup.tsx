import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createBugTrackingTables, createBugAttachmentsBucket, downloadSQL, checkDatabaseTables, getSQLStatements } from '@/utils/createBugTables';
import { Database, CheckCircle, AlertTriangle, Loader, Play, Download, Search, Copy } from 'lucide-react';

const DatabaseSetup = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<{ successCount: number; errorCount: number } | null>(null);
  const [tableStatus, setTableStatus] = useState<{ existingTables: string[]; missingTables: string[]; allTablesExist: boolean } | null>(null);
  const [showSQL, setShowSQL] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const handleCreateTables = async () => {
    setIsCreating(true);
    setLogs([]);
    setResult(null);

    // Override console.log to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      addLog(args.join(' '));
      originalLog(...args);
    };
    
    console.error = (...args) => {
      addLog(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };

    try {
      addLog('Starting database setup via MCP...');
      
      // Create tables
      const tableResult = await createBugTrackingTables();
      setResult(tableResult);
      
      // Create storage bucket
      addLog('Creating storage bucket...');
      await createBugAttachmentsBucket();
      
      addLog('Database setup completed!');
      
    } catch (error: any) {
      addLog(`FATAL ERROR: ${error.message}`);
    } finally {
      // Restore console functions
      console.log = originalLog;
      console.error = originalError;
      setIsCreating(false);
    }
  };

  const handleCheckTables = async () => {
    setIsChecking(true);
    setLogs([]);
    
    // Override console.log to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      addLog(args.join(' '));
      originalLog(...args);
    };
    
    console.error = (...args) => {
      addLog(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };

    try {
      addLog('Checking database tables...');
      const status = await checkDatabaseTables();
      setTableStatus(status);
      addLog('Table check completed!');
    } catch (error: any) {
      addLog(`ERROR: ${error.message}`);
    } finally {
      // Restore console functions
      console.log = originalLog;
      console.error = originalError;
      setIsChecking(false);
    }
  };

  const handleDownloadSQL = () => {
    downloadSQL();
    addLog('SQL file downloaded successfully!');
  };

  const copySQL = () => {
    const statements = getSQLStatements();
    const sqlContent = statements.join('\n\n');
    navigator.clipboard.writeText(sqlContent);
    addLog('SQL statements copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-900/60 border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-orange-400">
              <Database className="w-8 h-8" />
              Bug Tracking Database Setup
            </CardTitle>
            <p className="text-gray-300">
              Create all necessary tables and storage buckets for the bug tracking system via MCP.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button
                onClick={handleCreateTables}
                disabled={isCreating}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                {isCreating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Create System
                  </>
                )}
              </Button>

              <Button
                onClick={handleCheckTables}
                disabled={isChecking}
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
              >
                {isChecking ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Check Tables
                  </>
                )}
              </Button>

              <Button
                onClick={handleDownloadSQL}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download SQL
              </Button>

              <Button
                onClick={copySQL}
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy SQL
              </Button>

              <Button
                onClick={() => setShowSQL(!showSQL)}
                variant="outline"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white"
              >
                <Database className="w-4 h-4 mr-2" />
                {showSQL ? 'Hide' : 'Show'} SQL
              </Button>
            </div>

            {/* Table Status */}
            {tableStatus && (
              <Alert className={`${tableStatus.allTablesExist ? 'bg-green-900/50 border-green-500/50' : 'bg-yellow-900/50 border-yellow-500/50'}`}>
                {tableStatus.allTablesExist ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                )}
                <AlertDescription className={tableStatus.allTablesExist ? 'text-green-200' : 'text-yellow-200'}>
                  {tableStatus.allTablesExist 
                    ? '✅ All bug tracking tables exist! System is ready to use.' 
                    : `❌ Missing tables: ${tableStatus.missingTables.join(', ')}`
                  }
                  {tableStatus.existingTables.length > 0 && (
                    <div className="mt-2 text-sm">
                      Existing tables: {tableStatus.existingTables.join(', ')}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* SQL Display */}
            {showSQL && (
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-200">SQL Statements</CardTitle>
                  <p className="text-sm text-gray-400">These statements will be executed via MCP</p>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {getSQLStatements().map((statement, index) => (
                        <div key={index} className="mb-4">
                          <div className="text-orange-400 text-xs mb-1">-- Statement {index + 1}:</div>
                          <div className="text-green-300">{statement}</div>
                        </div>
                      ))}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Result Summary */}
            {result && (
              <Alert className={`${result.errorCount === 0 ? 'bg-green-900/50 border-green-500/50' : 'bg-yellow-900/50 border-yellow-500/50'}`}>
                {result.errorCount === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                )}
                <AlertDescription className={result.errorCount === 0 ? 'text-green-200' : 'text-yellow-200'}>
                  Setup completed! {result.successCount} successful operations, {result.errorCount} errors.
                  {result.errorCount === 0 && ' Bug tracking system is ready to use!'}
                </AlertDescription>
              </Alert>
            )}

            {/* Live Logs */}
            {logs.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-200">Setup Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="font-mono text-sm space-y-1">
                      {logs.map((log, index) => (
                        <div
                          key={index}
                          className={`${
                            log.includes('ERROR') 
                              ? 'text-red-400' 
                              : log.includes('✅') 
                              ? 'text-green-400'
                              : log.includes('❌')
                              ? 'text-red-400'
                              : 'text-gray-300'
                          }`}
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="bg-gray-800/30 border-gray-600/50">
              <CardHeader>
                <CardTitle className="text-lg text-gray-200">Setup Instructions:</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-orange-400 mb-2">Step 1: Create Tables</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Click "Create System" to execute all SQL via MCP</li>
                      <li>Tables, indexes, and policies will be created automatically</li>
                      <li>Storage bucket will also be created</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-400 mb-2">Step 2: Verify Setup</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Click "Check Tables" to verify creation</li>
                      <li>Review the setup logs for any errors</li>
                      <li>All tables should show as existing</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-400 mb-2">Step 3: Test System</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Navigate to <code>/bug-tracker</code></li>
                      <li>Try submitting a test bug report</li>
                      <li>Verify voting and filtering works</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-orange-400 mb-2">What will be created:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Tables:</strong> bugs, bug_votes, bug_comments, bug_attachments, bug_notifications, bug_subscriptions
                    </div>
                    <div>
                      <strong>Features:</strong> RLS policies, indexes, triggers, enums, storage bucket
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Alert className="bg-blue-900/50 border-blue-500/50">
              <Database className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                <strong>MCP Database:</strong> This will execute SQL statements directly via your MCP database connection. 
                Make sure you have the necessary permissions and that these tables don't already exist.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseSetup; 