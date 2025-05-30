// Polyfills for Node.js modules
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { theme } from './src/styles/theme';

// Auth Screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';

// Main Screens
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { WishlistScreen } from './src/screens/WishlistScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { DirectoryScreen } from './src/screens/DirectoryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

// Detail Screens
import { FunkoDetailScreen } from './src/screens/FunkoDetailScreen';
import { ListDetailScreen } from './src/screens/ListDetailScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { CreateListScreen } from './src/screens/CreateListScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const CollectionStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CollectionMain" component={CollectionScreen} />
    <Stack.Screen name="FunkoDetail" component={FunkoDetailScreen} />
    <Stack.Screen name="ListDetail" component={ListDetailScreen} />
    <Stack.Screen name="CreateList" component={CreateListScreen} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
  </Stack.Navigator>
);

const DiscoverStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DirectoryMain" component={DirectoryScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="FunkoDetail" component={FunkoDetailScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
  </Stack.Navigator>
);

const ScannerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ScannerMain" component={ScannerScreen} />
    <Stack.Screen name="FunkoDetail" component={FunkoDetailScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Friends" component={FriendsScreen} />
    <Stack.Screen name="Messages" component={MessagesScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Analytics" component={AnalyticsScreen} />
  </Stack.Navigator>
);

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        paddingTop: 8,
        paddingBottom: 8,
        height: 70,
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textMuted,
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Collection':
            iconName = focused ? 'library' : 'library-outline';
            break;
          case 'Discover':
            iconName = focused ? 'search' : 'search-outline';
            break;
          case 'Scanner':
            iconName = focused ? 'scan' : 'scan-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'circle';
        }

        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen 
      name="Collection" 
      component={CollectionStack}
      options={{ tabBarLabel: 'Collection' }}
    />
    <Tab.Screen 
      name="Discover" 
      component={DiscoverStack}
      options={{ tabBarLabel: 'Discover' }}
    />
    <Tab.Screen 
      name="Scanner" 
      component={ScannerStack}
      options={{ tabBarLabel: 'Scan' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStack}
      options={{ tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user } = useAuth();
  
  return user ? <MainTabNavigator /> : <AuthNavigator />;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.primary,
          },
        }}
      >
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
} 