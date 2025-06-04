import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { BarCodeScanner } from 'expo-barcode-scanner';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';

// Auth Provider
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { SubscriptionScreen } from './src/screens/SubscriptionScreen';

// 🎯 SUPABASE CONFIGURATION WITH TRANSACTION POOLER
const supabaseUrl = 'https://pafgjwmgueerxdxtneyg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZmdqd21ndWVlcnhkeHRuZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1OTA5MzMsImV4cCI6MjA0NzE2NjkzM30.ToHsNSuYgfKkJVcjL1xXTGlQm3MIfIjI1YaQUJOdIDY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: { 
      'x-client-info': 'react-native-popguide',
      'x-connection-type': 'transaction-pooler',
      'x-app-version': '1.0.0'
    },
  },
  realtime: {
    // Optimize for transaction pooler
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 🔍 DATABASE CONNECTION TEST
const testDatabaseConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    const startTime = Date.now();
    
    const { data, error, count } = await supabase
      .from('funko_pops')
      .select('id', { count: 'exact' })
      .limit(1);
    
    const connectionTime = Date.now() - startTime;
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`✅ Database connected successfully!`);
    console.log(`📊 Total Funko Pops: ${count?.toLocaleString()}`);
    console.log(`⚡ Connection time: ${connectionTime}ms`);
    console.log(`🔗 Pool mode: Transaction Pooler`);
    
    return { 
      success: true, 
      stats: { 
        totalPops: count || 0, 
        connectionTime,
        poolMode: 'transaction' 
      }
    };
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 📦 BARCODE SEARCH FUNCTION
const searchByBarcode = async (barcode: string) => {
  try {
    console.log(`🔍 Searching for barcode: ${barcode}`);
    
    const { data, error } = await supabase
      .from('funko_pops')
      .select('*')
      .or(`upc.eq.${barcode},upc_a.eq.${barcode},ean_13.eq.${barcode}`)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('📭 No Funko Pop found for this barcode');
        return { found: false, message: 'No Funko Pop found for this barcode' };
      }
      throw error;
    }

    console.log(`✅ Found Funko Pop:`, data.name);
    return { found: true, funko: data };
  } catch (error) {
    console.error('❌ Barcode search error:', error);
    return { found: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Scanner Component
const BarcodeScanner = ({ visible, onClose, onScan }: any) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: any) => {
    onScan(data);
    onClose();
  };

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.scannerContainer}>
          <Text style={styles.scannerText}>Requesting camera permission...</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.scannerContainer}>
          <Text style={styles.scannerText}>Camera permission not granted</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.scannerOverlay}>
          <Text style={styles.scannerTitle}>Scan Funko Pop Barcode</Text>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerInstructions}>
            Position the barcode within the frame
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close Scanner</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Home Screen with Scanner
const HomeScreen = ({ navigation }: any) => {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbStats, setDbStats] = useState<any>(null);
  const { user, subscription } = useAuth();

  // Test database connection on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      const result = await testDatabaseConnection();
      if (result.success) {
        setConnectionStatus('connected');
        setDbStats(result.stats);
      } else {
        setConnectionStatus('error');
        Alert.alert(
          '❌ Database Connection Error',
          `Unable to connect to PopGuide database:\n\n${result.error}\n\nPlease check your internet connection.`,
          [
            { text: 'Retry', onPress: initializeDatabase },
            { text: 'Continue Anyway' }
          ]
        );
      }
    };

    initializeDatabase();
  }, []);

  const handleScan = async (barcode: string) => {
    // Show loading state
    Alert.alert('🔍 Searching...', 'Looking up Funko Pop in database...');
    
    try {
      const result = await searchByBarcode(barcode);
      
      if (result.found && result.funko) {
        const funko = result.funko;
        Alert.alert(
          '✅ Funko Pop Found!',
          `📦 ${funko.name}\n` +
          `📚 Series: ${funko.series}\n` +
          `🔢 Number: ${funko.number}\n` +
          `💰 Estimated Value: $${funko.estimated_value || 'N/A'}\n` +
          `${funko.is_exclusive ? '⭐ Exclusive' : ''}\n` +
          `${funko.is_vaulted ? '🏛️ Vaulted' : ''}`,
          [
            { text: 'Add to Collection', onPress: () => Alert.alert('Coming Soon', 'Collection features coming soon!') },
            { text: 'Add to Wishlist', onPress: () => Alert.alert('Coming Soon', 'Wishlist features coming soon!') },
            { text: 'Scan Another', onPress: () => setScannerVisible(true) },
            { text: 'Done' }
          ]
        );
      } else {
        Alert.alert(
          '📭 Not Found',
          result.message || 'This barcode was not found in our database.',
          [
            { text: 'Try Again', onPress: () => setScannerVisible(true) },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Search Error',
        'Unable to search the database. Please try again.',
        [
          { text: 'Retry', onPress: () => handleScan(barcode) },
          { text: 'OK' }
        ]
      );
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '🔄';
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected': return `Connected • ${dbStats?.totalPops?.toLocaleString()} Funkos`;
      case 'error': return 'Connection Failed';
      default: return 'Connecting...';
    }
  };

  return (
    <View style={styles.container}>
      {/* User Status */}
      {user && (
        <View style={styles.userStatusContainer}>
          <Text style={styles.userWelcome}>
            Welcome back, {user.user_metadata?.first_name || 'PopCollector'}!
          </Text>
          <View style={styles.subscriptionBadge}>
            <Ionicons 
              name={subscription === 'pro' ? "star" : "person"} 
              size={16} 
              color={subscription === 'pro' ? "#FFD700" : "#86868b"} 
            />
            <Text style={[styles.subscriptionText, subscription === 'pro' && styles.proText]}>
              {subscription === 'pro' ? 'Pro Member' : 'Free Plan'}
            </Text>
          </View>
        </View>
      )}

      {/* Database Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {getConnectionIcon()} {getConnectionText()}
        </Text>
        {connectionStatus === 'connected' && dbStats && (
          <Text style={styles.statusSubtext}>
            ⚡ {dbStats.connectionTime}ms • 🔗 Transaction Pooler
          </Text>
        )}
      </View>

      {/* Logo Area */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🎯</Text>
        <Text style={styles.title}>POP Guide</Text>
        <Text style={styles.subtitle}>Your Ultimate Funko Pop Tracker</Text>
      </View>
      
      {/* Main Scanner Button */}
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]}
        onPress={() => setScannerVisible(true)}
        disabled={connectionStatus !== 'connected'}
      >
        <Text style={styles.buttonText}>📱 Scan Barcode</Text>
        <Text style={styles.buttonSubtext}>
          {connectionStatus === 'connected' 
            ? 'Tap to start scanning' 
            : 'Database connection required'
          }
        </Text>
      </TouchableOpacity>
      
      {/* Other Features */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => Alert.alert('Coming Soon', 'Collection features coming soon!')}
      >
        <Text style={styles.buttonText}>📚 My Collection</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => Alert.alert('Coming Soon', 'Wishlist features coming soon!')}
      >
        <Text style={styles.buttonText}>❤️ Wishlist</Text>
      </TouchableOpacity>

      {/* Connection Test Button */}
      {connectionStatus === 'error' && (
        <TouchableOpacity 
          style={[styles.button, styles.retryButton]}
          onPress={async () => {
            setConnectionStatus('checking');
            const result = await testDatabaseConnection();
            setConnectionStatus(result.success ? 'connected' : 'error');
            if (result.success) setDbStats(result.stats);
          }}
        >
          <Text style={styles.buttonText}>🔄 Retry Connection</Text>
        </TouchableOpacity>
      )}

      {/* Scanner Modal */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleScan}
      />
    </View>
  );
};

// Collection Screen
const CollectionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Collection</Text>
      <Text style={styles.subtitle}>Your Funko Pop collection will appear here</Text>
    </View>
  );
};

// Discover Screen
const DiscoverScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>Browse and discover new Funko Pops</Text>
    </View>
  );
};

// Profile Screen
const ProfileScreen = ({ navigation }: any) => {
  const { user, signOut, subscription } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Please sign in to view your profile</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.user_metadata?.first_name?.[0] || user.email?.[0] || 'U'}
          </Text>
        </View>
        <Text style={styles.profileName}>
          {user.user_metadata?.full_name || user.email}
        </Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
        
        <View style={styles.subscriptionStatus}>
          <Ionicons 
            name={subscription === 'pro' ? "star" : "person"} 
            size={20} 
            color={subscription === 'pro' ? "#FFD700" : "#86868b"} 
          />
          <Text style={[styles.subscriptionText, subscription === 'pro' && styles.proText]}>
            {subscription === 'pro' ? 'Pro Member' : 'Free Plan'}
          </Text>
        </View>
      </View>

      <View style={styles.profileActions}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Subscription')}
        >
          <Ionicons name="star-outline" size={20} color="#007AFF" />
          <Text style={styles.profileButtonText}>
            {subscription === 'pro' ? 'Manage Subscription' : 'Upgrade to Pro'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#86868b" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="settings-outline" size={20} color="#007AFF" />
          <Text style={styles.profileButtonText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#86868b" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.profileButtonText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#86868b" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.profileButton, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={[styles.profileButtonText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Tab Navigator
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#f2f2f7' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Collection" 
        component={CollectionScreen}
        options={{
          tabBarLabel: 'Collection',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const RootStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        presentation: 'modal'
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{
          presentation: 'card'
        }}
      />
    </Stack.Navigator>
  );
};

// App Content with Auth Check
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <RootStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Main App Component
export default function App() {
  return (
    <>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#86868b',
  },
  userStatusContainer: {
    alignSelf: 'stretch',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userWelcome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionText: {
    fontSize: 14,
    color: '#86868b',
    marginLeft: 6,
  },
  proText: {
    color: '#FFD700',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    textAlign: 'center',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 4,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#86868b',
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
    marginVertical: 8,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#86868b',
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#86868b',
    marginBottom: 16,
  },
  subscriptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
  },
  profileActions: {
    alignSelf: 'stretch',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1d1d1f',
    marginLeft: 12,
  },
  signOutButton: {
    marginTop: 20,
  },
  signOutText: {
    color: '#FF3B30',
  },
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    paddingBottom: 8,
    height: 84,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  scannerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
  },
  scannerInstructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  scannerText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 