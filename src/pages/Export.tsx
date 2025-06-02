import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useFunkoPops, useUserCollection } from '@/hooks/useFunkoPops';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Filter, 
  FileText, 
  Table, 
  Database,
  ArrowLeft,
  CheckCircle,
  Circle,
  Calendar,
  DollarSign,
  Package,
  Star,
  TrendingUp
} from 'lucide-react';

// Filter options (you may want to import these from a shared constants file)
const FILTERS = {
  category: ['Pop!', 'Pop! Rides', 'Pop! Deluxe', 'Pop! Supersized', 'Pop! Albums', 'Pop! Moments', 'Pop! Town'],
  fandom: ['Marvel', 'DC Comics', 'Star Wars', 'Disney', 'Harry Potter', 'Anime', 'TV Shows', 'Movies', 'Games'],
  genre: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Sci-Fi', 'Thriller'],
  edition: ['Standard', 'Exclusive', 'Chase', 'Limited Edition', 'Convention Exclusive'],
  character: ['Batman', 'Spider-Man', 'Iron Man', 'Superman', 'Wonder Woman', 'Deadpool', 'Wolverine'],
  series: ['Marvel Heroes', 'DC Heroes', 'Star Wars', 'Disney Classics', 'Harry Potter', 'Anime Legends'],
  condition: ['Mint', 'Near Mint', 'Very Fine', 'Fine', 'Good', 'Poor'],
  rarity: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Ultra Rare', 'Chase', 'Grail']
};

const EXPORT_FORMATS = [
  { id: 'csv', name: 'CSV (Excel Compatible)', icon: Table, description: 'Comma-separated values for spreadsheet applications' },
  { id: 'json', name: 'JSON', icon: Database, description: 'JavaScript Object Notation for developers' },
  { id: 'pdf', name: 'PDF Report', icon: FileText, description: 'Formatted document with collection summary' }
];

const EXPORT_FIELDS = [
  { id: 'name', name: 'Name', required: true },
  { id: 'series', name: 'Series', required: true },
  { id: 'number', name: 'Number', required: false },
  { id: 'category', name: 'Category', required: false },
  { id: 'fandom', name: 'Fandom', required: false },
  { id: 'condition', name: 'Condition', required: false },
  { id: 'purchase_price', name: 'Purchase Price', required: false },
  { id: 'estimated_value', name: 'Estimated Value', required: false },
  { id: 'purchase_date', name: 'Purchase Date', required: false },
  { id: 'retailer', name: 'Retailer', required: false },
  { id: 'notes', name: 'Notes', required: false },
  { id: 'image_url', name: 'Image URL', required: false },
  { id: 'is_chase', name: 'Is Chase', required: false },
  { id: 'is_exclusive', name: 'Is Exclusive', required: false },
  { id: 'is_vaulted', name: 'Is Vaulted', required: false },
  { id: 'created_at', name: 'Date Added', required: false }
];

const Export = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: funkoPops = [] } = useFunkoPops();
  const { data: userCollection = [] } = useUserCollection(user?.id);

  const [filters, setFilters] = useState({
    category: [],
    fandom: [],
    genre: [],
    edition: [],
    character: [],
    series: [],
    condition: [],
    rarity: [],
    dateRange: { start: '', end: '' },
    valueRange: { min: '', max: '' }
  });

  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState(
    EXPORT_FIELDS.filter(f => f.required).map(f => f.id)
  );
  const [exporting, setExporting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Apply filters to collection
  const filteredCollection = userCollection.filter(item => {
    const pop = item.funko_pops;
    if (!pop) return false;

    // Category filter
    if (filters.category.length > 0 && !filters.category.includes(pop.category)) return false;
    
    // Fandom filter
    if (filters.fandom.length > 0 && !filters.fandom.includes(pop.fandom)) return false;
    
    // Series filter
    if (filters.series.length > 0 && !filters.series.includes(pop.series)) return false;
    
    // Condition filter
    if (filters.condition.length > 0 && !filters.condition.includes(item.condition)) return false;
    
    // Date range filter
    if (filters.dateRange.start && new Date(item.created_at) < new Date(filters.dateRange.start)) return false;
    if (filters.dateRange.end && new Date(item.created_at) > new Date(filters.dateRange.end)) return false;
    
    // Value range filter
    if (filters.valueRange.min && (pop.estimated_value || 0) < parseFloat(filters.valueRange.min)) return false;
    if (filters.valueRange.max && (pop.estimated_value || 0) > parseFloat(filters.valueRange.max)) return false;

    return true;
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
  };

  const handleFieldToggle = (fieldId) => {
    const field = EXPORT_FIELDS.find(f => f.id === fieldId);
    if (field.required) return; // Can't toggle required fields

    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const generateExport = async () => {
    if (filteredCollection.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Your filtered collection is empty. Please adjust your filters.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);

    try {
      // Prepare data based on selected fields
      const exportData = filteredCollection.map(item => {
        const pop = item.funko_pops;
        const record = {};
        
        selectedFields.forEach(fieldId => {
          switch (fieldId) {
            case 'name':
              record['Name'] = pop?.name || '';
              break;
            case 'series':
              record['Series'] = pop?.series || '';
              break;
            case 'number':
              record['Number'] = pop?.number || '';
              break;
            case 'category':
              record['Category'] = pop?.category || '';
              break;
            case 'fandom':
              record['Fandom'] = pop?.fandom || '';
              break;
            case 'condition':
              record['Condition'] = item.condition || '';
              break;
            case 'purchase_price':
              record['Purchase Price'] = item.purchase_price || '';
              break;
            case 'estimated_value':
              record['Estimated Value'] = pop?.estimated_value || '';
              break;
            case 'purchase_date':
              record['Purchase Date'] = item.purchase_date || '';
              break;
            case 'retailer':
              record['Retailer'] = item.retailer || '';
              break;
            case 'notes':
              record['Notes'] = item.notes || '';
              break;
            case 'image_url':
              record['Image URL'] = pop?.image_url || '';
              break;
            case 'is_chase':
              record['Is Chase'] = pop?.is_chase ? 'Yes' : 'No';
              break;
            case 'is_exclusive':
              record['Is Exclusive'] = pop?.is_exclusive ? 'Yes' : 'No';
              break;
            case 'is_vaulted':
              record['Is Vaulted'] = pop?.is_vaulted ? 'Yes' : 'No';
              break;
            case 'created_at':
              record['Date Added'] = new Date(item.created_at).toLocaleDateString();
              break;
          }
        });
        
        return record;
      });

      // Generate file based on format
      let blob, filename;
      
      if (exportFormat === 'csv') {
        const headers = Object.keys(exportData[0] || {});
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => 
            headers.map(header => 
              typeof row[header] === 'string' && row[header].includes(',') 
                ? `"${row[header]}"` 
                : row[header]
            ).join(',')
          )
        ].join('\n');
        
        blob = new Blob([csvContent], { type: 'text/csv' });
        filename = `collection-export-${new Date().toISOString().split('T')[0]}.csv`;
      } else if (exportFormat === 'json') {
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        filename = `collection-export-${new Date().toISOString().split('T')[0]}.json`;
      } else if (exportFormat === 'pdf') {
        // For PDF, we'll create a simple text format for now
        // In a real implementation, you'd use a PDF library like jsPDF
        const pdfContent = `
FUNKO POP COLLECTION EXPORT
Generated: ${new Date().toLocaleDateString()}
Total Items: ${exportData.length}

${exportData.map((item, index) => 
  `${index + 1}. ${item.Name || 'Unknown'} (${item.Series || 'Unknown Series'})`
).join('\n')}
        `;
        blob = new Blob([pdfContent], { type: 'text/plain' });
        filename = `collection-export-${new Date().toISOString().split('T')[0]}.txt`;
      }

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful! 🎉",
        description: `Downloaded ${exportData.length} items as ${exportFormat.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while generating your export.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      category: [],
      fandom: [],
      genre: [],
      edition: [],
      character: [],
      series: [],
      condition: [],
      rarity: [],
      dateRange: { start: '', end: '' },
      valueRange: { min: '', max: '' }
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Redirecting...</div>;
  }

  const totalFilterCount = Object.values(filters).reduce((acc, f) => 
    acc + (Array.isArray(f) ? f.length : 0), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation />
      
      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Export Collection</h1>
              <p className="text-gray-400">
                Export {userCollection.length} items from your collection with custom filters and formats
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Items</p>
                    <p className="text-2xl font-bold text-white">{userCollection.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Filtered Items</p>
                    <p className="text-2xl font-bold text-orange-400">{filteredCollection.length}</p>
                  </div>
                  <Filter className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Est. Value</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${filteredCollection.reduce((sum, item) => sum + (item.funko_pops?.estimated_value || 0), 0).toFixed(0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Filters</p>
                    <p className="text-2xl font-bold text-purple-400">{totalFilterCount}</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Filters Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-orange-500" />
                      Filter Options
                    </span>
                    {totalFilterCount > 0 && (
                      <Button
                        onClick={clearAllFilters}
                        variant="ghost"
                        size="sm"
                        className="text-orange-400 hover:text-orange-300"
                      >
                        Clear All ({totalFilterCount})
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Filters */}
                  {Object.entries(FILTERS).slice(0, 6).map(([filterType, options]) => (
                    <div key={filterType} className="space-y-3">
                      <h4 className="font-medium text-white capitalize flex items-center gap-2">
                        {filterType}
                        {filters[filterType].length > 0 && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            {filters[filterType].length}
                          </Badge>
                        )}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {options.map(option => (
                          <label
                            key={option}
                            className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-700/50 rounded p-2"
                          >
                            <input
                              type="checkbox"
                              checked={filters[filterType].includes(option)}
                              onChange={() => handleFilterChange(filterType, option)}
                              className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                            />
                            <span className="text-[#232837]">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Date Range Filter */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date Range
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">From</label>
                        <Input
                          type="date"
                          value={filters.dateRange.start}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, start: e.target.value }
                          }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">To</label>
                        <Input
                          type="date"
                          value={filters.dateRange.end}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, end: e.target.value }
                          }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Value Range Filter */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Value Range
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Min ($)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.valueRange.min}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            valueRange: { ...prev.valueRange, min: e.target.value }
                          }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Max ($)</label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={filters.valueRange.max}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            valueRange: { ...prev.valueRange, max: e.target.value }
                          }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Configuration */}
            <div className="space-y-6">
              {/* Format Selection */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Export Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {EXPORT_FORMATS.map(format => {
                    const Icon = format.icon;
                    return (
                      <label
                        key={format.id}
                        className="flex items-start space-x-3 cursor-pointer hover:bg-gray-700/50 rounded p-3"
                      >
                        <input
                          type="radio"
                          name="format"
                          value={format.id}
                          checked={exportFormat === format.id}
                          onChange={(e) => setExportFormat(e.target.value)}
                          className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-orange-400" />
                            <span className="font-medium text-white">{format.name}</span>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{format.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Field Selection */}
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Export Fields</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                  {EXPORT_FIELDS.map(field => (
                    <label
                      key={field.id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700/50 rounded p-2"
                    >
                      {field.required ? (
                        <CheckCircle className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Circle
                          className={`w-4 h-4 ${
                            selectedFields.includes(field.id) ? 'text-orange-500' : 'text-gray-500'
                          }`}
                          onClick={() => handleFieldToggle(field.id)}
                        />
                      )}
                      <span className={`text-sm ${field.required ? 'text-orange-300' : 'text-gray-300'}`}>
                        {field.name}
                        {field.required && <span className="text-orange-500 ml-1">*</span>}
                      </span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Export Button */}
              <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <Button
                    onClick={generateExport}
                    disabled={exporting || filteredCollection.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4"
                  >
                    {exporting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating Export...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Export {filteredCollection.length} Items
                      </div>
                    )}
                  </Button>
                  
                  {filteredCollection.length === 0 && (
                    <p className="text-center text-gray-400 text-sm mt-2">
                      No items match your current filters
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Export; 