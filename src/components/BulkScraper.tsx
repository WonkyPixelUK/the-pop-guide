import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { Zap, Play, Pause, BarChart3 } from 'lucide-react';

interface BulkProgress {
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  currentBatch: number;
  totalBatches: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  startedAt?: string;
  estimatedCompletion?: string;
  lastError?: string;
  currentItem?: string;
  pricesCollected: number;
  averageTimePerItem: number;
}

export default function BulkScraper() {
  const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null);
  const [isBulkScraping, setIsBulkScraping] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({
    batchSize: 50,
    maxItems: 2000
  });
  const { toast } = useToast();

  // Poll for bulk scraping progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBulkScraping) {
      interval = setInterval(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('bulk-ebay-scraper', {
            body: { action: 'status' }
          });

          if (error) throw error;

          setBulkProgress(data);
          
          // Stop polling if completed or error
          if (data.status === 'completed' || data.status === 'error') {
            setIsBulkScraping(false);
            
            if (data.status === 'completed') {
              toast({
                title: "Bulk Scraping Completed!",
                description: `Successfully processed ${data.successfulItems}/${data.totalItems} items. Collected ${data.pricesCollected} prices.`
              });
            } else if (data.status === 'error') {
              toast({
                title: "Bulk Scraping Failed",
                description: data.lastError || "Unknown error occurred",
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error('Error checking bulk progress:', error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBulkScraping, toast]);

  const startBulkScraping = async () => {
    if (isBulkScraping) {
      toast({
        title: "Warning",
        description: "Bulk scraping is already in progress",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsBulkScraping(true);
      setBulkProgress(null);

      const { data, error } = await supabase.functions.invoke('bulk-ebay-scraper', {
        body: {
          action: 'start',
          batchSize: bulkConfig.batchSize,
          maxItems: bulkConfig.maxItems
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Bulk Scraping Started",
        description: `Processing ${bulkConfig.maxItems} Funko Pops in batches of ${bulkConfig.batchSize}`
      });

      setBulkProgress(data.progress);
    } catch (error: any) {
      console.error('Error starting bulk scraping:', error);
      setIsBulkScraping(false);
      toast({
        title: "Error",
        description: error.message || "Failed to start bulk scraping",
        variant: "destructive"
      });
    }
  };

  const stopBulkScraping = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-ebay-scraper', {
        body: { action: 'stop' }
      });

      if (error) throw error;

      setIsBulkScraping(false);
      setBulkProgress(data.progress);
      
      toast({
        title: "Bulk Scraping Stopped",
        description: "The scraping process has been paused"
      });
    } catch (error: any) {
      console.error('Error stopping bulk scraping:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to stop bulk scraping",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Bulk Scraping Configuration */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Bulk eBay UK Scraper Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Batch Size (items per batch)
              </label>
              <input
                type="number"
                value={bulkConfig.batchSize}
                onChange={(e) => setBulkConfig({...bulkConfig, batchSize: parseInt(e.target.value)})}
                disabled={isBulkScraping}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                min="1"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 20-50 for eBay</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Maximum Items to Process
              </label>
              <input
                type="number"
                value={bulkConfig.maxItems}
                onChange={(e) => setBulkConfig({...bulkConfig, maxItems: parseInt(e.target.value)})}
                disabled={isBulkScraping}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10000"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum: 10,000 items</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={startBulkScraping}
              disabled={isBulkScraping}
              className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              {isBulkScraping ? 'Scraping...' : 'Start Bulk Scraping'}
            </button>
            
            {isBulkScraping && (
              <button
                onClick={stopBulkScraping}
                className="flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <Pause className="w-4 h-4 mr-2" />
                Stop Scraping
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Scraping Progress */}
      {bulkProgress && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Bulk Scraping Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Overall Progress</span>
                  <span className="text-sm text-white">
                    {bulkProgress.processedItems} / {bulkProgress.totalItems}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${bulkProgress.totalItems > 0 ? (bulkProgress.processedItems / bulkProgress.totalItems) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 p-3 rounded-md">
                  <div className="text-lg font-bold text-green-400">{bulkProgress.successfulItems}</div>
                  <div className="text-xs text-gray-400">Successful</div>
                </div>
                <div className="bg-gray-700 p-3 rounded-md">
                  <div className="text-lg font-bold text-red-400">{bulkProgress.failedItems}</div>
                  <div className="text-xs text-gray-400">Failed</div>
                </div>
                <div className="bg-gray-700 p-3 rounded-md">
                  <div className="text-lg font-bold text-blue-400">{bulkProgress.pricesCollected}</div>
                  <div className="text-xs text-gray-400">Prices Collected</div>
                </div>
                <div className="bg-gray-700 p-3 rounded-md">
                  <div className="text-lg font-bold text-purple-400">
                    {bulkProgress.currentBatch}/{bulkProgress.totalBatches}
                  </div>
                  <div className="text-xs text-gray-400">Batch Progress</div>
                </div>
              </div>

              {/* Current Item & Status */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bulkProgress.status === 'running' ? 'bg-green-600 text-white' :
                    bulkProgress.status === 'completed' ? 'bg-blue-600 text-white' :
                    bulkProgress.status === 'error' ? 'bg-red-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {bulkProgress.status.charAt(0).toUpperCase() + bulkProgress.status.slice(1)}
                  </span>
                </div>
                
                {bulkProgress.currentItem && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Current Item:</span>
                    <span className="text-sm text-white">{bulkProgress.currentItem}</span>
                  </div>
                )}
                
                {bulkProgress.estimatedCompletion && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Estimated Completion:</span>
                    <span className="text-sm text-white">
                      {new Date(bulkProgress.estimatedCompletion).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                {bulkProgress.lastError && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-red-400">Last Error:</span>
                    <span className="text-sm text-red-300">{bulkProgress.lastError}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 