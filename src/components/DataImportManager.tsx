
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDataImport } from '@/hooks/useDataImport';
import { useFunkoPops } from '@/hooks/useFunkoPops';
import { Database, Import, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const DataImportManager = () => {
  const { data: funkoPops } = useFunkoPops();
  const dataImport = useDataImport();
  const [lastImportResult, setLastImportResult] = useState<any>(null);

  const handleImport = async () => {
    try {
      const result = await dataImport.mutateAsync();
      setLastImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const currentCount = funkoPops?.length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Funko Pop Database Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentCount}</div>
              <div className="text-sm text-gray-600">Current Database Size</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">~15,000+</div>
              <div className="text-sm text-gray-600">Available Records</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">2017-2021</div>
              <div className="text-sm text-gray-600">Data Coverage</div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Import className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Import Features</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Smart Duplicate Detection:</strong> Avoids importing existing records</li>
              <li>• <strong>Sticker Detection:</strong> Automatically identifies exclusive stickers and multipliers</li>
              <li>• <strong>Batch Processing:</strong> Efficient bulk import with progress tracking</li>
              <li>• <strong>Auto Scraping Setup:</strong> Creates pricing jobs for all new records</li>
              <li>• <strong>Data Validation:</strong> Ensures data quality and proper formatting</li>
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Source: kennymkchan/funko-pop-data (GitHub)
            </div>
            <Button 
              onClick={handleImport}
              disabled={dataImport.isPending}
              className="flex items-center gap-2"
              size="lg"
            >
              {dataImport.isPending ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Import className="w-4 h-4" />
                  Start Import
                </>
              )}
            </Button>
          </div>

          {dataImport.isPending && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <Clock className="w-4 h-4 animate-spin" />
                <span className="font-medium">Import in Progress</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                This may take a few minutes as we process thousands of records...
              </p>
            </div>
          )}

          {lastImportResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {lastImportResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {lastImportResult.totalFetched || 0}
                    </div>
                    <div className="text-xs text-gray-600">Total Fetched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {lastImportResult.imported || 0}
                    </div>
                    <div className="text-xs text-gray-600">Imported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {lastImportResult.duplicatesSkipped || 0}
                    </div>
                    <div className="text-xs text-gray-600">Duplicates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {lastImportResult.errors || 0}
                    </div>
                    <div className="text-xs text-gray-600">Errors</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 rounded-lg border">
                  <Badge 
                    className={lastImportResult.success ? 
                      'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }
                  >
                    {lastImportResult.success ? 'Success' : 'Failed'}
                  </Badge>
                  <p className="text-sm mt-2">{lastImportResult.message}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Data Source:</strong> This import uses a community-maintained dataset that covers Funko Pops released between 2017-2021.</p>
            <p><strong>Automatic Setup:</strong> After import, scraping jobs will be automatically created for all new records to begin price tracking.</p>
            <p><strong>Sticker Detection:</strong> The system will automatically detect exclusive stickers (SDCC, NYCC, Chase, etc.) and apply appropriate pricing multipliers.</p>
            <p><strong>Performance:</strong> Large imports may take several minutes to complete. The system processes data in batches for optimal performance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImportManager;
