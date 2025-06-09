import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DebugList = () => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      const testResults = [];
      const listId = id || 'e7d945c8-2611-4bc7-99f2-c28a2e2b299e';

      // Test 1: Basic connection
      try {
        console.log('🔍 Test 1: Basic Supabase connection...');
        const { data: testData, error: testError } = await supabase
          .from('funko_pops')
          .select('id')
          .limit(1);
        
        testResults.push({
          test: 'Basic Connection',
          status: testError ? 'FAILED' : 'PASSED',
          data: testData,
          error: testError
        });
      } catch (error) {
        testResults.push({
          test: 'Basic Connection',
          status: 'FAILED',
          error: error
        });
      }

      // Test 2: Check if any custom_lists exist
      try {
        console.log('🔍 Test 2: Check custom_lists table...');
        const { data: listsData, error: listsError } = await supabase
          .from('custom_lists')
          .select('id, name, is_public')
          .limit(5);
        
        testResults.push({
          test: 'Custom Lists Table',
          status: listsError ? 'FAILED' : 'PASSED',
          data: listsData,
          error: listsError,
          count: listsData?.length || 0
        });
      } catch (error) {
        testResults.push({
          test: 'Custom Lists Table',
          status: 'FAILED',
          error: error
        });
      }

      // Test 3: Check specific list ID
      try {
        console.log('🔍 Test 3: Check specific list:', listId);
        const { data: specificList, error: specificError } = await supabase
          .from('custom_lists')
          .select('*')
          .eq('id', listId)
          .single();
        
        testResults.push({
          test: `Specific List (${listId})`,
          status: specificError ? 'FAILED' : 'PASSED',
          data: specificList,
          error: specificError
        });
      } catch (error) {
        testResults.push({
          test: `Specific List (${listId})`,
          status: 'FAILED',
          error: error
        });
      }

      // Test 4: Check all public lists
      try {
        console.log('🔍 Test 4: Check all public lists...');
        const { data: publicLists, error: publicError } = await supabase
          .from('custom_lists')
          .select('id, name, is_public, created_at')
          .eq('is_public', true)
          .limit(10);
        
        testResults.push({
          test: 'Public Lists',
          status: publicError ? 'FAILED' : 'PASSED',
          data: publicLists,
          error: publicError,
          count: publicLists?.length || 0
        });
      } catch (error) {
        testResults.push({
          test: 'Public Lists',
          status: 'FAILED',
          error: error
        });
      }

      // Test 5: Create a test list to verify write permissions
      try {
        console.log('🔍 Test 5: Test write permissions...');
        const { data: authData } = await supabase.auth.getUser();
        
        if (authData.user) {
          const { data: newList, error: createError } = await supabase
            .from('custom_lists')
            .insert({
              name: 'Debug Test List',
              description: 'Temporary test list',
              is_public: true,
              user_id: authData.user.id
            })
            .select()
            .single();

          if (!createError && newList) {
            // Clean up - delete the test list
            await supabase
              .from('custom_lists')
              .delete()
              .eq('id', newList.id);
          }

          testResults.push({
            test: 'Write Permissions',
            status: createError ? 'FAILED' : 'PASSED',
            data: newList,
            error: createError
          });
        } else {
          testResults.push({
            test: 'Write Permissions',
            status: 'SKIPPED',
            message: 'User not authenticated'
          });
        }
      } catch (error) {
        testResults.push({
          test: 'Write Permissions',
          status: 'FAILED',
          error: error
        });
      }

      setResults(testResults);
      setLoading(false);
    };

    runTests();
  }, [id]);

  const createTestList = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        alert('Please log in first');
        return;
      }

      const { data: newList, error } = await supabase
        .from('custom_lists')
        .insert({
          name: 'Test Shareable List',
          description: 'This is a test list for sharing functionality',
          is_public: true,
          user_id: authData.user.id
        })
        .select()
        .single();

      if (error) {
        alert('Error creating test list: ' + error.message);
      } else {
        alert(`Test list created! ID: ${newList.id}`);
        window.open(`/lists/${newList.id}`, '_blank');
      }
    } catch (error) {
      alert('Error: ' + error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
        <div className="text-white text-center">Running database tests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Database Debug Results</h1>
        
        <div className="grid gap-4 mb-8">
          {results.map((result, index) => (
            <Card key={index} className={`border-2 ${
              result.status === 'PASSED' ? 'border-green-500' : 
              result.status === 'FAILED' ? 'border-red-500' : 
              'border-yellow-500'
            }`}>
              <CardHeader>
                <CardTitle className={`text-lg ${
                  result.status === 'PASSED' ? 'text-green-400' : 
                  result.status === 'FAILED' ? 'text-red-400' : 
                  'text-yellow-400'
                }`}>
                  {result.status} - {result.test}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.count !== undefined && (
                    <div className="text-gray-300">
                      <strong>Count:</strong> {result.count}
                    </div>
                  )}
                  {result.message && (
                    <div className="text-gray-300">
                      <strong>Message:</strong> {result.message}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-red-300">
                      <strong>Error:</strong> {result.error.message || JSON.stringify(result.error)}
                    </div>
                  )}
                  {result.data && (
                    <details className="text-gray-400">
                      <summary className="cursor-pointer text-gray-300">Data</summary>
                      <pre className="text-xs mt-2 overflow-auto max-h-40 bg-gray-800 p-2 rounded">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button onClick={createTestList} className="bg-green-600 hover:bg-green-700">
            Create Test List
          </Button>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Refresh Tests
          </Button>
          <Button onClick={() => window.history.back()} className="bg-gray-600 hover:bg-gray-700">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DebugList; 