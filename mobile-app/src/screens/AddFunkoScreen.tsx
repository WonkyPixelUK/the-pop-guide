import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles/theme';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

interface NewFunkoData {
  name: string;
  series: string;
  number: string;
  description: string;
  release_date: string;
  exclusive_to: string;
  variant: string;
  is_exclusive: boolean;
  is_vaulted: boolean;
  is_chase: boolean;
  rarity: string;
  ean: string;
  image_uri?: string;
}

export const AddFunkoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { searchQuery, scannedBarcode } = route.params as { searchQuery?: string; scannedBarcode?: string };
  
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [funkoData, setFunkoData] = useState<NewFunkoData>({
    name: searchQuery || '',
    series: '',
    number: '',
    description: '',
    release_date: '',
    exclusive_to: '',
    variant: '',
    is_exclusive: false,
    is_vaulted: false,
    is_chase: false,
    rarity: 'Common',
    ean: scannedBarcode || '',
    image_uri: undefined,
  });

  const rarityOptions = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Chase'];

  const updateField = (field: keyof NewFunkoData, value: any) => {
    setFunkoData(prev => ({ ...prev, [field]: value }));
  };

  const toggleBoolean = (field: 'is_exclusive' | 'is_vaulted' | 'is_chase') => {
    setFunkoData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const pickImage = async () => {
    try {
      setImageLoading(true);
      
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please allow access to your photo library to upload Funko images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('image_uri', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setImageLoading(true);
      
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'Please allow camera access to take Funko photos.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('image_uri', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Funko Image',
      'Choose how you want to add a photo of your Funko Pop',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!funkoData.name.trim()) {
      Alert.alert('Validation Error', 'Funko name is required');
      return false;
    }
    if (!funkoData.series.trim()) {
      Alert.alert('Validation Error', 'Series is required');
      return false;
    }
    if (!funkoData.number.trim()) {
      Alert.alert('Validation Error', 'Funko number is required');
      return false;
    }
    return true;
  };

  const submitFunko = async () => {
    if (!validateForm()) return;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add Funko Pops');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image if provided
      if (funkoData.image_uri) {
        const formData = new FormData();
        formData.append('image', {
          uri: funkoData.image_uri,
          type: 'image/jpeg',
          name: 'funko-image.jpg',
        } as any);

        const uploadResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload-funko-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.imageUrl;
        }
      }

      // Submit Funko data
      const submission = {
        ...funkoData,
        image_url: imageUrl,
        submitted_by: user.id,
        status: 'pending_review',
      };

      const { error } = await supabase
        .from('user_submitted_funkos')
        .insert(submission);

      if (error) throw error;

      // Trigger price scraping
      try {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/trigger-price-scraping`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            funko_name: funkoData.name,
            series: funkoData.series,
            number: funkoData.number,
          }),
        });
      } catch (scrapeError) {
        console.warn('Price scraping trigger failed:', scrapeError);
        // Don't fail the submission if scraping fails
      }

      Alert.alert(
        'Submission Successful! 🎉',
        'Thank you for contributing to our database! Your Funko Pop will be reviewed and added soon. We\'ll automatically start scraping price data for it.',
        [
          {
            text: 'View Submissions',
            onPress: () => (navigation as any).navigate('MySubmissions')
          },
          {
            text: 'Add Another',
            onPress: () => {
              setFunkoData({
                name: '',
                series: '',
                number: '',
                description: '',
                release_date: '',
                exclusive_to: '',
                variant: '',
                is_exclusive: false,
                is_vaulted: false,
                is_chase: false,
                rarity: 'Common',
                ean: '',
                image_uri: undefined,
              });
            }
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error submitting Funko:', error);
      Alert.alert('Submission Failed', 'Failed to submit Funko Pop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Add New Funko Pop" showBack />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={theme.colors.info} />
            <Text style={styles.infoTitle}>Help Expand Our Database</Text>
          </View>
          <Text style={styles.infoText}>
            Can't find a Funko Pop in our database? Help other collectors by adding it! We'll review your submission and automatically start tracking prices.
          </Text>
        </Card>

        {/* Scanned Barcode Info */}
        {scannedBarcode && (
          <Card style={styles.scannedCard}>
            <View style={styles.scannedHeader}>
              <Ionicons name="scan" size={24} color={theme.colors.success} />
              <Text style={styles.scannedTitle}>Barcode Scanned Successfully!</Text>
            </View>
            <Text style={styles.scannedText}>
              We've pre-filled the barcode field with: {scannedBarcode}
            </Text>
            <Text style={styles.scannedSubtext}>
              Please fill in the other details to help us add this Funko Pop to our database.
            </Text>
          </Card>
        )}

        {/* Image Upload */}
        <Card style={styles.imageCard}>
          <Text style={styles.sectionTitle}>Funko Image (Optional)</Text>
          
          {funkoData.image_uri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: funkoData.image_uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.changeImageButton} onPress={showImageOptions}>
                <Ionicons name="camera" size={20} color={theme.colors.primary} />
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={showImageOptions} disabled={imageLoading}>
              <Ionicons name="camera" size={48} color={theme.colors.textMuted} />
              <Text style={styles.uploadText}>
                {imageLoading ? 'Loading...' : 'Add Funko Photo'}
              </Text>
              <Text style={styles.uploadSubtext}>
                Tap to take a photo or choose from library
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Basic Information */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={funkoData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholder="e.g., Batman, Pikachu, Iron Man"
              placeholderTextColor={theme.colors.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Series *</Text>
            <TextInput
              style={styles.input}
              value={funkoData.series}
              onChangeText={(text) => updateField('series', text)}
              placeholder="e.g., DC Comics, Pokemon, Marvel"
              placeholderTextColor={theme.colors.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number *</Text>
            <TextInput
              style={styles.input}
              value={funkoData.number}
              onChangeText={(text) => updateField('number', text)}
              placeholder="e.g., 123, 456"
              placeholderTextColor={theme.colors.inputPlaceholder}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Variant (Optional)</Text>
            <TextInput
              style={styles.input}
              value={funkoData.variant}
              onChangeText={(text) => updateField('variant', text)}
              placeholder="e.g., Glow in the Dark, Metallic"
              placeholderTextColor={theme.colors.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={funkoData.description}
              onChangeText={(text) => updateField('description', text)}
              placeholder="Brief description of the Funko Pop"
              placeholderTextColor={theme.colors.inputPlaceholder}
              multiline
              numberOfLines={3}
            />
          </View>
        </Card>

        {/* Properties */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Properties</Text>
          
          <View style={styles.toggleGroup}>
            <TouchableOpacity style={styles.toggleRow} onPress={() => toggleBoolean('is_exclusive')}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Exclusive</Text>
                <Text style={styles.toggleDescription}>Store or event exclusive</Text>
              </View>
              <View style={[styles.toggle, funkoData.is_exclusive && styles.toggleActive]}>
                {funkoData.is_exclusive && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.textOnPrimary} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleRow} onPress={() => toggleBoolean('is_vaulted')}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Vaulted</Text>
                <Text style={styles.toggleDescription}>No longer in production</Text>
              </View>
              <View style={[styles.toggle, funkoData.is_vaulted && styles.toggleActive]}>
                {funkoData.is_vaulted && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.textOnPrimary} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleRow} onPress={() => toggleBoolean('is_chase')}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Chase</Text>
                <Text style={styles.toggleDescription}>Limited chase variant</Text>
              </View>
              <View style={[styles.toggle, funkoData.is_chase && styles.toggleActive]}>
                {funkoData.is_chase && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.textOnPrimary} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rarity</Text>
            <View style={styles.rarityOptions}>
              {rarityOptions.map((rarity) => (
                <TouchableOpacity
                  key={rarity}
                  style={[
                    styles.rarityOption,
                    funkoData.rarity === rarity && styles.rarityOptionActive
                  ]}
                  onPress={() => updateField('rarity', rarity)}
                >
                  <Text style={[
                    styles.rarityOptionText,
                    funkoData.rarity === rarity && styles.rarityOptionTextActive
                  ]}>
                    {rarity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Additional Details */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Release Date</Text>
            <TextInput
              style={styles.input}
              value={funkoData.release_date}
              onChangeText={(text) => updateField('release_date', text)}
              placeholder="YYYY-MM-DD or Month Year"
              placeholderTextColor={theme.colors.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exclusive To</Text>
            <TextInput
              style={styles.input}
              value={funkoData.exclusive_to}
              onChangeText={(text) => updateField('exclusive_to', text)}
              placeholder="e.g., Hot Topic, GameStop, SDCC"
              placeholderTextColor={theme.colors.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EAN/Barcode</Text>
            <TextInput
              style={styles.input}
              value={funkoData.ean}
              onChangeText={(text) => updateField('ean', text)}
              placeholder="Product barcode if available"
              placeholderTextColor={theme.colors.inputPlaceholder}
              keyboardType="numeric"
            />
          </View>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            title="Submit Funko Pop"
            onPress={submitFunko}
            loading={loading}
            style={styles.submitButton}
            icon="checkmark-circle"
          />
          
          <Text style={styles.submitNote}>
            * Required fields. Your submission will be reviewed before being added to the database.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  infoCard: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  scannedCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  scannedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  scannedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  scannedText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  scannedSubtext: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  imageCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  changeImageText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    minHeight: 120,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  uploadSubtext: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  formCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  toggleGroup: {
    marginBottom: theme.spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  toggleDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rarityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  rarityOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
  },
  rarityOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rarityOptionText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  rarityOptionTextActive: {
    color: theme.colors.textOnPrimary,
  },
  submitContainer: {
    paddingVertical: theme.spacing.xl,
  },
  submitButton: {
    marginBottom: theme.spacing.md,
  },
  submitNote: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
}); 