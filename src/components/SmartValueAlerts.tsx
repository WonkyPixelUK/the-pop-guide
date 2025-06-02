import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, BellRing, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Settings, Plus, Trash2, Eye, Target } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Alert {
  id: string;
  user_id: string;
  funko_pop_id: string;
  alert_type: 'price_threshold' | 'price_drop' | 'price_increase' | 'market_trend';
  threshold_value?: number;
  percentage_change?: number;
  is_active: boolean;
  created_at: string;
  last_triggered?: string;
  funko_pops?: {
    name: string;
    series: string;
    number: string;
    image_url?: string;
    estimated_value?: number;
  };
}

interface SmartValueAlertsProps {
  userCollection: any[];
  wishlist: any[];
}

const SmartValueAlerts = ({ userCollection, wishlist }: SmartValueAlertsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAlert, setNewAlert] = useState({
    funko_pop_id: '',
    alert_type: 'price_threshold' as const,
    threshold_value: 0,
    percentage_change: 10,
  });

  // Load user alerts
  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select(`
          *,
          funko_pops (
            name,
            series,
            number,
            image_url,
            estimated_value
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: user?.id,
          ...newAlert,
          is_active: true,
        })
        .select(`
          *,
          funko_pops (
            name,
            series,
            number,
            image_url,
            estimated_value
          )
        `)
        .single();

      if (error) throw error;

      setAlerts(prev => [data, ...prev]);
      setShowCreateDialog(false);
      setNewAlert({
        funko_pop_id: '',
        alert_type: 'price_threshold',
        threshold_value: 0,
        percentage_change: 10,
      });

      toast({
        title: "Alert Created",
        description: "Your price alert has been set up successfully",
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive",
      });
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, is_active: isActive } : alert
        )
      );

      toast({
        title: isActive ? "Alert Activated" : "Alert Paused",
        description: `Alert has been ${isActive ? 'activated' : 'paused'}`,
      });
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast({
        title: "Alert Deleted",
        description: "Alert has been removed",
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_threshold':
        return <Target className="w-4 h-4" />;
      case 'price_drop':
        return <TrendingDown className="w-4 h-4" />;
      case 'price_increase':
        return <TrendingUp className="w-4 h-4" />;
      case 'market_trend':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'price_threshold':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'price_drop':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'price_increase':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'market_trend':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatAlertDescription = (alert: Alert) => {
    switch (alert.alert_type) {
      case 'price_threshold':
        return `Alert when price reaches $${alert.threshold_value}`;
      case 'price_drop':
        return `Alert when price drops by ${alert.percentage_change}%`;
      case 'price_increase':
        return `Alert when price increases by ${alert.percentage_change}%`;
      case 'market_trend':
        return `Alert on significant market movements`;
      default:
        return 'Price alert';
    }
  };

  const activeAlerts = alerts.filter(alert => alert.is_active);
  const inactiveAlerts = alerts.filter(alert => !alert.is_active);

  // Simulate market trends and recommendations
  const marketTrends = [
    {
      id: 1,
      title: "Chase Variants Trending Up",
      description: "Chase variants in your collection have increased 15% this week",
      trend: "up",
      impact: "positive",
      affectedItems: 3
    },
    {
      id: 2,
      title: "Disney Series Market Activity",
      description: "High trading volume detected in Disney series",
      trend: "neutral",
      impact: "watch",
      affectedItems: 8
    },
    {
      id: 3,
      title: "Rare Exclusives Cooling Down",
      description: "Some exclusive items showing price stability",
      trend: "down",
      impact: "neutral",
      affectedItems: 2
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <BellRing className="w-8 h-8 mr-3 text-orange-500" />
          Smart Value Alerts
        </h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Create Price Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Select Funko Pop
                </label>
                <Select value={newAlert.funko_pop_id} onValueChange={(value) => setNewAlert(prev => ({ ...prev, funko_pop_id: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose a Funko Pop" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {[...userCollection, ...wishlist].map((item) => (
                      <SelectItem 
                        key={item.funko_pops?.id || item.funko_pop_id} 
                        value={item.funko_pops?.id || item.funko_pop_id}
                      >
                        {item.funko_pops?.name} - {item.funko_pops?.series}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Alert Type
                </label>
                <Select value={newAlert.alert_type} onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, alert_type: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="price_threshold">Price Threshold</SelectItem>
                    <SelectItem value="price_drop">Price Drop %</SelectItem>
                    <SelectItem value="price_increase">Price Increase %</SelectItem>
                    <SelectItem value="market_trend">Market Trend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newAlert.alert_type === 'price_threshold') && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Target Price ($)
                  </label>
                  <Input
                    type="number"
                    value={newAlert.threshold_value}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, threshold_value: Number(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter target price"
                  />
                </div>
              )}

              {(newAlert.alert_type === 'price_drop' || newAlert.alert_type === 'price_increase') && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Percentage Change (%)
                  </label>
                  <Input
                    type="number"
                    value={newAlert.percentage_change}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, percentage_change: Number(e.target.value) }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter percentage"
                  />
                </div>
              )}

              <Button
                onClick={createAlert}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!newAlert.funko_pop_id}
              >
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Active Alerts</p>
                <p className="text-3xl font-bold text-white">{activeAlerts.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Triggered Today</p>
                <p className="text-3xl font-bold text-white">2</p>
              </div>
              <BellRing className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-200 text-sm font-medium">Monitored Items</p>
                <p className="text-3xl font-bold text-white">{new Set(alerts.map(a => a.funko_pop_id)).size}</p>
              </div>
              <Eye className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Avg Response</p>
                <p className="text-3xl font-bold text-white">2.3m</p>
              </div>
              <Settings className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
          <TabsTrigger value="active" className="text-white">Active Alerts</TabsTrigger>
          <TabsTrigger value="market" className="text-white">Market Trends</TabsTrigger>
          <TabsTrigger value="history" className="text-white">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAlerts.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
                <p className="text-gray-400 mb-4">
                  Create your first price alert to get notified when your favorite Funkos hit target prices.
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Create Your First Alert
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAlerts.map((alert) => (
                <Card key={alert.id} className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden">
                          <img 
                            src={alert.funko_pops?.image_url || '/placeholder.png'} 
                            alt={alert.funko_pops?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">{alert.funko_pops?.name}</h4>
                          <p className="text-gray-400 text-xs">{alert.funko_pops?.series}</p>
                        </div>
                      </div>
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Badge className={`text-xs ${getAlertColor(alert.alert_type)}`}>
                        {getAlertIcon(alert.alert_type)}
                        <span className="ml-1">{alert.alert_type.replace('_', ' ').toUpperCase()}</span>
                      </Badge>
                      
                      <p className="text-gray-300 text-sm">
                        {formatAlertDescription(alert)}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-400">
                          Current: ${alert.funko_pops?.estimated_value?.toFixed(2) || '0.00'}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Market Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketTrends.map((trend) => (
                  <div key={trend.id} className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          trend.trend === 'up' ? 'bg-green-500/20' :
                          trend.trend === 'down' ? 'bg-red-500/20' :
                          'bg-yellow-500/20'
                        }`}>
                          {trend.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : trend.trend === 'down' ? (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{trend.title}</h4>
                          <p className="text-gray-400 text-sm">{trend.description}</p>
                        </div>
                      </div>
                      <Badge className={`text-xs ${
                        trend.impact === 'positive' ? 'bg-green-500/20 text-green-300' :
                        trend.impact === 'watch' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {trend.affectedItems} items
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Alert Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inactiveAlerts.slice(0, 10).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg overflow-hidden">
                        <img 
                          src={alert.funko_pops?.image_url || '/placeholder.png'} 
                          alt={alert.funko_pops?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">{alert.funko_pops?.name}</h4>
                        <p className="text-gray-400 text-xs">{formatAlertDescription(alert)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="text-xs bg-gray-500/20 text-gray-300">
                        Inactive
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartValueAlerts; 