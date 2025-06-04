import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { BarCodeScanner } from 'expo-barcode-scanner';

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

// Simple Home Screen with Scanner
const HomeScreen = () => {
  const [scannerVisible, setScannerVisible] = useState(false);

  const handleScan = (barcode: string) => {
    // For now, just show the scanned barcode
    Alert.alert(
      'Barcode Scanned! 📦', 
      `Barcode: ${barcode}\n\nSearching database for this Funko Pop...`,
      [
        { text: 'Scan Another', onPress: () => setScannerVisible(true) },
        { text: 'OK' }
      ]
    );
  };

  return (
    <View style={styles.container}>
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
      >
        <Text style={styles.buttonText}>📱 Scan Barcode</Text>
        <Text style={styles.buttonSubtext}>Tap to start scanning</Text>
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

      {/* Scanner Modal */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleScan}
      />
    </View>
  );
};

// Simple Collection Screen
const CollectionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Collection</Text>
      <Text style={styles.subtitle}>Your Funko Pop collection will appear here</Text>
    </View>
  );
};

// Simple Discover Screen
const DiscoverScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>Browse and discover new Funko Pops</Text>
    </View>
  );
};

// Simple Profile Screen
const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your profile and settings</Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
          }}
        />
        <Tab.Screen 
          name="Collection" 
          component={CollectionScreen}
          options={{
            tabBarLabel: 'Collection',
          }}
        />
        <Tab.Screen 
          name="Discover" 
          component={DiscoverScreen}
          options={{
            tabBarLabel: 'Discover',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
          }}
        />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#86868b',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6C7B7F',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginVertical: 10,
    minWidth: 250,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    paddingTop: 5,
    paddingBottom: 20,
    height: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
  },
  buttonSubtext: {
    color: 'white',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  scannerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scannerFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  scannerInstructions: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    position: 'absolute',
    top: 20,
    right: 20,
  },
  closeButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
  },
}); 