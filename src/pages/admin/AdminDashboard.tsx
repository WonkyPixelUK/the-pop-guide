import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Package, Store, Mail, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalSubscriptions: number;
  totalFunkoPops: number;
  totalRetailers: number;
  totalMembers: number;
  totalEmailTemplates: number;
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSubscriptions: 0,
    totalFunkoPops: 0,
    totalRetailers: 0,
    totalMembers: 0,
    totalEmailTemplates: 0,
    recentActivity: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch counts from various tables
      const [
        { count: usersCount },
        { count: subscriptionsCount },
        { count: funkoPopsCount },
        { count: retailersCount },
        { count: membersCount },
        { count: emailTemplatesCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
        supabase.from('funko_pops').select('*', { count: 'exact', head: true }),
        supabase.from('retailers').select('*', { count: 'exact', head: true }),
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('email_templates').select('*', { count: 'exact', head: true }),
      ]);

      // Fetch recent activity (last 5 actions)
      const { data: recentActivity } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersCount || 0,
        totalSubscriptions: subscriptionsCount || 0,
        totalFunkoPops: funkoPopsCount || 0,
        totalRetailers: retailersCount || 0,
        totalMembers: membersCount || 0,
        totalEmailTemplates: emailTemplatesCount || 0,
        recentActivity: recentActivity || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-400',
    },
    {
      title: 'Active Subscriptions',
      value: stats.totalSubscriptions,
      icon: CreditCard,
      color: 'text-green-400',
    },
    {
      title: 'Funko Pops',
      value: stats.totalFunkoPops,
      icon: Package,
      color: 'text-orange-400',
    },
    {
      title: 'Retailers',
      value: stats.totalRetailers,
      icon: Store,
      color: 'text-purple-400',
    },
    {
      title: 'Members',
      value: stats.totalMembers,
      icon: Users,
      color: 'text-yellow-400',
    },
    {
      title: 'Email Templates',
      value: stats.totalEmailTemplates,
      icon: Mail,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to the admin dashboard. Here's an overview of your system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {activity.type === 'alert' ? (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 