import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { theme } from '../styles/theme';

export const ScannerScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned || scanning || result.data === lastScannedCode) return;
    
    setScanned(true);
    setScanning(true);
    setLastScannedCode(result.data);
    
    // Vibrate on successful scan
    Vibration.vibrate(100);

    try {
      console.log('Scanning barcode:', result.data);

      // Query Supabase for the Funko using the EAN/barcode
      const { data: funkos, error } = await supabase
        .from('funko_pops')
        .select('*')
        .eq('ean', result.data)
        .limit(1);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (funkos && funkos.length > 0) {
        const funko = funkos[0];
        console.log('Found Funko:', funko.name);
        
        // Navigate to Funko detail screen
        (navigation as any).navigate('FunkoDetail', { funko });
        
        // Reset scanner state
        setTimeout(() => {
          setScanned(false);
          setScanning(false);
        }, 1000);
      } else {
        // Funko not found in database
        console.log('Funko not found for barcode:', result.data);
        handleFunkoNotFound(result.data);
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      setScanning(false);
      Alert.alert(
        'Scan Error',
        'Failed to scan barcode. Please try again.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const handleFunkoNotFound = (barcode: string) => {
    setScanning(false);
    
    if (!user) {
      Alert.alert(
        'Funko Not Found',
        `This barcode (${barcode}) isn't in our database yet. Please sign in to help us add missing Funko Pops!`,
        [
          { text: 'Cancel', onPress: () => setScanned(false) },
          { 
            text: 'Sign In', 
            onPress: () => {
              setScanned(false);
              (navigation as any).navigate('Auth');
            }
          }
        ]
      );
      return;
    }

    Alert.alert(
      'Help Us Expand Our Database! 📦',
      `This barcode (${barcode}) isn't in our database yet. Would you like to help other collectors by adding this Funko Pop?`,
      [
        { text: 'Not Now', style: 'cancel', onPress: () => setScanned(false) },
        { 
          text: 'Add Funko Pop', 
          onPress: () => {
            setScanned(false);
            (navigation as any).navigate('AddFunko', { scannedBarcode: barcode });
          }
        }
      ]
    );
  };

  const requestCameraPermission = async () => {
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert(
        'Camera Permission Required',
        'PopGuide needs camera access to scan Funko Pop barcodes. Please enable camera permissions in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Scanner" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Scanner" />
        <View style={styles.permissionContainer}>
          <Card style={styles.permissionCard}>
            <Ionicons name="camera-outline" size={64} color={theme.colors.textMuted} />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              PopGuide needs camera access to scan Funko Pop barcodes and help you quickly add items to your collection.
            </Text>
            <Button
              title="Grant Camera Permission"
              onPress={requestCameraPermission}
              style={styles.permissionButton}
              icon="camera"
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Scan Barcode" />
      
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr", "pdf417", "aztec", "ean13", "ean8", 
              "upc_e", "code128", "code39", "code93", 
              "codabar", "itf14", "upc_a"
            ],
          }}
        />

        {/* Scanning Overlay */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}>
            <View style={styles.topOverlay} />
            <View style={styles.middleContainer}>
              <View style={styles.leftOverlay} />
              <View style={styles.focusedContainer}>
                <View style={styles.scanningFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>
              <View style={styles.rightOverlay} />
            </View>
            <View style={styles.bottomOverlay} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Card style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>
                {scanning ? 'Processing...' : 'Scan Funko Barcode'}
              </Text>
              <Text style={styles.instructionsText}>
                {scanning 
                  ? 'Looking up Funko Pop in database...' 
                  : 'Position the barcode within the frame to scan'
                }
              </Text>
            </Card>
          </View>
        </View>

        {/* Scan Again Button */}
        {scanned && !scanning && (
          <View style={styles.scanAgainContainer}>
            <Button
              title="Scan Another"
              onPress={() => {
                setScanned(false);
                setLastScannedCode('');
              }}
              style={styles.scanAgainButton}
              icon="scan"
            />
          </View>
        )}

        {/* Manual Entry Option */}
        <View style={styles.manualEntryContainer}>
          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={() => (navigation as any).navigate('Search')}
          >
            <Ionicons name="search" size={20} color={theme.colors.textOnPrimary} />
            <Text style={styles.manualEntryText}>Search Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  permissionCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  permissionButton: {
    minWidth: 200,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleContainer: {
    flexDirection: 'row',
    height: 250,
  },
  leftOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  focusedContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanningFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 100,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  instructionsCard: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface + 'DD',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanAgainContainer: {
    position: 'absolute',
    bottom: 120,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  scanAgainButton: {
    backgroundColor: theme.colors.primary,
  },
  manualEntryContainer: {
    position: 'absolute',
    bottom: 60,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface + 'DD',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  manualEntryText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
}); 