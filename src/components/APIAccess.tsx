import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Code, Key, Activity, FileText, Copy, Eye, EyeOff, Plus, Trash2, BarChart3, Globe, Shield, Zap } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used?: string;
  requests_count: number;
  is_active: boolean;
  permissions: string[];
}

interface APIUsage {
  date: string;
  requests: number;
  errors: number;
  response_time: number;
}

const APIAccess = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [usage, setUsage] = useState<APIUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('keys');
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read']);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    loadAPIKeys();
    loadUsageData();
  }, [user]);

  const loadAPIKeys = async () => {
    // Simulate API call - in real implementation, this would fetch from your API
    const mockKeys: APIKey[] = [
      {
        id: '1',
        name: 'Production App',
        key_prefix: 'pk_live_123...',
        created_at: '2025-01-15T10:00:00Z',
        last_used: '2025-06-01T14:30:00Z',
        requests_count: 15420,
        is_active: true,
        permissions: ['read', 'write']
      },
      {
        id: '2',
        name: 'Development Testing',
        key_prefix: 'pk_test_456...',
        created_at: '2025-02-01T15:00:00Z',
        last_used: '2025-05-30T09:15:00Z',
        requests_count: 892,
        is_active: true,
        permissions: ['read']
      }
    ];
    setApiKeys(mockKeys);
    setLoading(false);
  };

  const loadUsageData = async () => {
    // Mock usage data for the last 30 days
    const mockUsage: APIUsage[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        requests: Math.floor(Math.random() * 500) + 100,
        errors: Math.floor(Math.random() * 10),
        response_time: Math.floor(Math.random() * 200) + 50
      };
    });
    setUsage(mockUsage);
  };

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your API key",
        variant: "destructive",
      });
      return;
    }

    // Generate a mock API key
    const newKey = `pk_${selectedPermissions.includes('write') ? 'live' : 'test'}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    const apiKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key_prefix: newKey.substring(0, 12) + '...',
      created_at: new Date().toISOString(),
      requests_count: 0,
      is_active: true,
      permissions: selectedPermissions
    };

    setApiKeys(prev => [apiKey, ...prev]);
    setGeneratedKey(newKey);
    setNewKeyName('');
    setSelectedPermissions(['read']);
    
    toast({
      title: "API Key Created",
      description: "Your new API key has been generated successfully",
    });
  };

  const revokeAPIKey = async (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
    toast({
      title: "API Key Revoked",
      description: "The API key has been permanently revoked",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const endpoints = [
    {
      method: 'GET',
      endpoint: '/api/v1/funkos',
      description: 'Get all Funko Pops with optional filters',
      parameters: ['limit', 'offset', 'series', 'category'],
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.popguide.co.uk/v1/funkos?limit=10'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/funkos/{id}',
      description: 'Get a specific Funko Pop by ID',
      parameters: ['id'],
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.popguide.co.uk/v1/funkos/123'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/collection/{user_id}',
      description: 'Get a user\'s collection (requires read permission)',
      parameters: ['user_id', 'include_private'],
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.popguide.co.uk/v1/collection/user123'
    },
    {
      method: 'POST',
      endpoint: '/api/v1/collection',
      description: 'Add items to collection (requires write permission)',
      parameters: ['funko_id', 'condition', 'purchase_price'],
      example: 'curl -X POST -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d \'{"funko_id": 123, "condition": "mint"}\' https://api.popguide.co.uk/v1/collection'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/prices/{id}/history',
      description: 'Get price history for a Funko Pop',
      parameters: ['id', 'days', 'source'],
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.popguide.co.uk/v1/prices/123/history?days=30'
    },
    {
      method: 'GET',
      endpoint: '/api/v1/analytics/trends',
      description: 'Get market trends and analytics',
      parameters: ['timeframe', 'category'],
      example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.popguide.co.uk/v1/analytics/trends?timeframe=7d'
    }
  ];

  const codeExamples = {
    javascript: `
// Initialize PopGuide API client
const apiKey = 'YOUR_API_KEY';
const baseURL = 'https://api.popguide.co.uk/v1';

// Fetch all Funkos
async function getFunkos() {
  const response = await fetch(\`\${baseURL}/funkos\`, {
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Add to collection
async function addToCollection(funkoId, condition = 'mint') {
  const response = await fetch(\`\${baseURL}/collection\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      funko_id: funkoId,
      condition: condition
    })
  });
  return response.json();
}`,
    python: `
import requests

# PopGuide API client
class PopGuideAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.popguide.co.uk/v1'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_funkos(self, limit=50, series=None):
        params = {'limit': limit}
        if series:
            params['series'] = series
        
        response = requests.get(
            f'{self.base_url}/funkos',
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def add_to_collection(self, funko_id, condition='mint'):
        data = {
            'funko_id': funko_id,
            'condition': condition
        }
        response = requests.post(
            f'{self.base_url}/collection',
            headers=self.headers,
            json=data
        )
        return response.json()

# Usage
api = PopGuideAPI('YOUR_API_KEY')
funkos = api.get_funkos(limit=10, series='Marvel')`,
    curl: `
# Get all Funkos
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     "https://api.popguide.co.uk/v1/funkos?limit=10"

# Get specific Funko
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     "https://api.popguide.co.uk/v1/funkos/123"

# Add to collection
curl -X POST \\
     -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{"funko_id": 123, "condition": "mint"}' \\
     "https://api.popguide.co.uk/v1/collection"

# Get price history
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     "https://api.popguide.co.uk/v1/prices/123/history?days=30"`
  };

  const totalRequests = usage.reduce((sum, day) => sum + day.requests, 0);
  const totalErrors = usage.reduce((sum, day) => sum + day.errors, 0);
  const avgResponseTime = usage.reduce((sum, day) => sum + day.response_time, 0) / usage.length;
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Code className="w-8 h-8 mr-3 text-orange-500" />
          API Access
        </h2>
        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
          Pro Feature
        </Badge>
      </div>

      {/* API Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-white">{totalRequests.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-white">{(100 - errorRate).toFixed(1)}%</p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">Avg Response</p>
                <p className="text-3xl font-bold text-white">{avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Zap className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Active Keys</p>
                <p className="text-3xl font-bold text-white">{apiKeys.filter(k => k.is_active).length}</p>
              </div>
              <Key className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="keys" className="text-white">API Keys</TabsTrigger>
          <TabsTrigger value="docs" className="text-white">Documentation</TabsTrigger>
          <TabsTrigger value="examples" className="text-white">Code Examples</TabsTrigger>
          <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Your API Keys</h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Create API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Key Name
                    </label>
                    <Input
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production App, Development Testing"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Permissions
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes('read')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions(prev => [...prev, 'read']);
                            } else {
                              setSelectedPermissions(prev => prev.filter(p => p !== 'read'));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-white">Read Access (view data)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes('write')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions(prev => [...prev, 'write']);
                            } else {
                              setSelectedPermissions(prev => prev.filter(p => p !== 'write'));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-white">Write Access (modify data)</span>
                      </label>
                    </div>
                  </div>
                  <Button
                    onClick={createAPIKey}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={!newKeyName.trim() || selectedPermissions.length === 0}
                  >
                    Generate API Key
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {generatedKey && (
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">New API Key Generated</span>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  Copy this key now - you won't be able to see it again!
                </p>
                <div className="flex items-center gap-2 bg-gray-700 p-3 rounded border">
                  <code className="flex-1 text-white font-mono text-sm">{generatedKey}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedKey)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => setGeneratedKey(null)}
                  variant="ghost"
                  className="mt-2 text-gray-400 hover:text-white"
                >
                  I've copied the key
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="text-white font-medium">{apiKey.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-gray-400 text-sm font-mono">{apiKey.key_prefix}</code>
                          <Badge className={`text-xs ${
                            apiKey.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                          }`}>
                            {apiKey.is_active ? 'Active' : 'Revoked'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-white font-medium">{apiKey.requests_count.toLocaleString()}</div>
                        <div className="text-gray-400 text-xs">requests</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => revokeAPIKey(apiKey.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                    {apiKey.last_used && (
                      <span>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                    )}
                    <div className="flex gap-1">
                      {apiKey.permissions.map(permission => (
                        <Badge key={permission} variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">API Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Authentication</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Include your API key in the Authorization header:
                  </p>
                  <div className="bg-gray-700 p-3 rounded border">
                    <code className="text-white">Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Rate Limiting</h3>
                  <p className="text-gray-300 text-sm">
                    API requests are limited to 1000 requests per hour per API key. Rate limit headers are included in responses.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Available Endpoints</h3>
                  <div className="space-y-4">
                    {endpoints.map((endpoint, index) => (
                      <div key={index} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${
                            endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-300' :
                            endpoint.method === 'POST' ? 'bg-green-500/20 text-green-300' :
                            'bg-orange-500/20 text-orange-300'
                          }`}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-white font-mono">{endpoint.endpoint}</code>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{endpoint.description}</p>
                        {endpoint.parameters.length > 0 && (
                          <div className="mb-3">
                            <span className="text-gray-400 text-xs">Parameters: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {endpoint.parameters.map(param => (
                                <code key={param} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                                  {param}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="bg-gray-700 p-3 rounded">
                          <code className="text-green-400 text-xs">{endpoint.example}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Code Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>
                {Object.entries(codeExamples).map(([language, code]) => (
                  <TabsContent key={language} value={language}>
                    <div className="relative">
                      <pre className="bg-gray-900 p-4 rounded border overflow-x-auto">
                        <code className="text-gray-300 text-sm">{code}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2 border-gray-600"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">API Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-white">{totalRequests.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Total Requests (30 days)</div>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-500">{avgResponseTime.toFixed(0)}ms</div>
                    <div className="text-sm text-gray-400">Average Response Time</div>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-500">{(100 - errorRate).toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Success Rate</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-4">Recent Activity</h4>
                  <div className="space-y-2">
                    {usage.slice(-7).map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                        <span className="text-gray-300">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-400">{day.requests} requests</span>
                          <span className="text-red-400">{day.errors} errors</span>
                          <span className="text-orange-400">{day.response_time}ms avg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIAccess; 