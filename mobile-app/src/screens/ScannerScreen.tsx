import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';

export const ScannerScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    setScanned(true);
    try {
      // Query Supabase for the Funko using the barcode
      const { data: funko, error } = await supabase
        .from('funkos')
        .select('*')
        .eq('barcode', result.data)
        .single();

      if (error) throw error;

      if (funko) {
        // Navigate to details screen with the Funko data
        (navigation as any).navigate('Details', { funko });
      } else {
        // Handle case where Funko is not found
        alert('Funko not found in database');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      alert('Error scanning barcode');
    }
  };

  if (!permission) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417", "aztec", "ean13", "ean8", "upc_e", "code128", "code39", "code93", "codabar", "itf14", "upc_a"],
        }}
      />
      {scanned && (
        <View style={styles.scanAgainContainer}>
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  permissionText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#e46c1b',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  permissionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanAgainContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  scanAgainButton: {
    backgroundColor: '#e46c1b',
    padding: 15,
    borderRadius: 8,
  },
  scanAgainText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 