import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Alert,
  Dimensions,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { theme } from '../styles/theme';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface FunkoPop {
  id: string;
  name: string;
  series: string;
  number: string;
  variant?: string;
  image_url?: string;
  estimated_value?: number;
  is_exclusive: boolean;
  is_vaulted: boolean;
  is_chase: boolean;
  rarity?: string;
  release_date?: string;
  description?: string;
  exclusive_to?: string;
  sticker_type?: string;
  ean?: string;
}

interface PriceHistory {
  id: string;
  price: number;
  source: string;
  date_scraped: string;
  condition: string;
}

interface CollectionStatus {
  inCollection: boolean;
  inWishlist: boolean;
  collectionItem?: {
    id: string;
    condition: string;
    purchase_price?: number;
    purchase_date?: string;
    personal_notes?: string;
  };
  wishlistItem?: {
    id: string;
    max_price?: number;
  };
}

export const FunkoDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { funko } = route.params as { funko: FunkoPop };
  
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [collectionStatus, setCollectionStatus] = useState<CollectionStatus>({
    inCollection: false,
    inWishlist: false,
  });

  useEffect(() => {
    loadFunkoDetails();
  }, [funko.id, user]);

  const loadFunkoDetails = async () => {
    try {
      // Load price history
      const { data: priceData } = await supabase
        .from('price_history')
        .select('*')
        .eq('funko_pop_id', funko.id)
        .order('date_scraped', { ascending: false })
        .limit(10);

      setPriceHistory(priceData || []);

      if (user) {
        // Check collection status
        const [collectionResult, wishlistResult] = await Promise.all([
          supabase
            .from('user_collections')
            .select('*')
            .eq('user_id', user.id)
            .eq('funko_pop_id', funko.id)
            .single(),
          supabase
            .from('wishlists')
            .select('*')
            .eq('user_id', user.id)
            .eq('funko_pop_id', funko.id)
            .single()
        ]);

        setCollectionStatus({
          inCollection: !collectionResult.error,
          inWishlist: !wishlistResult.error,
          collectionItem: collectionResult.data || undefined,
          wishlistItem: wishlistResult.data || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading funko details:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCollection = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_collections')
        .insert({
          user_id: user.id,
          funko_pop_id: funko.id,
          condition: 'mint',
        });

      if (error) throw error;

      setCollectionStatus(prev => ({ ...prev, inCollection: true }));
      Alert.alert('Success', 'Added to your collection!');
    } catch (error) {
      console.error('Error adding to collection:', error);
      Alert.alert('Error', 'Failed to add to collection');
    }
  };

  const removeFromCollection = async () => {
    if (!user || !collectionStatus.collectionItem) return;

    Alert.alert(
      'Remove from Collection',
      'Are you sure you want to remove this Funko from your collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_collections')
                .delete()
                .eq('id', collectionStatus.collectionItem!.id);

              if (error) throw error;

              setCollectionStatus(prev => ({ 
                ...prev, 
                inCollection: false, 
                collectionItem: undefined 
              }));
              Alert.alert('Success', 'Removed from collection');
            } catch (error) {
              console.error('Error removing from collection:', error);
              Alert.alert('Error', 'Failed to remove from collection');
            }
          }
        }
      ]
    );
  };

  const addToWishlist = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          funko_pop_id: funko.id,
        });

      if (error) throw error;

      setCollectionStatus(prev => ({ ...prev, inWishlist: true }));
      Alert.alert('Success', 'Added to your wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert('Error', 'Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async () => {
    if (!user || !collectionStatus.wishlistItem) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', collectionStatus.wishlistItem.id);

      if (error) throw error;

      setCollectionStatus(prev => ({ 
        ...prev, 
        inWishlist: false, 
        wishlistItem: undefined 
      }));
      Alert.alert('Success', 'Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Alert.alert('Error', 'Failed to remove from wishlist');
    }
  };

  const shareFunko = async () => {
    try {
      await Share.share({
        message: `Check out this Funko Pop: ${funko.name} from ${funko.series}`,
        title: funko.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return theme.colors.success;
      case 'uncommon': return theme.colors.warning;
      case 'rare': return theme.colors.error;
      case 'legendary': return '#9333ea';
      default: return theme.colors.textMuted;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const InfoRow = ({ label, value, icon }: any) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <Ionicons name={icon} size={16} color={theme.colors.textMuted} />
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const Badge = ({ label, color = theme.colors.primary }: any) => (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={funko.name} 
        showBack 
        rightComponent={
          <TouchableOpacity onPress={shareFunko}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: funko.image_url || 'https://via.placeholder.com/300x300?text=No+Image' 
            }}
            style={styles.funkoImage}
            resizeMode="contain"
          />
          
          {/* Status Badges */}
          <View style={styles.statusBadges}>
            {funko.is_exclusive && (
              <Badge label="Exclusive" color={theme.colors.warning} />
            )}
            {funko.is_vaulted && (
              <Badge label="Vaulted" color={theme.colors.error} />
            )}
            {funko.is_chase && (
              <Badge label="Chase" color="#9333ea" />
            )}
            {funko.rarity && (
              <Badge label={funko.rarity} color={getRarityColor(funko.rarity)} />
            )}
          </View>
        </View>

        {/* Basic Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.funkoName}>{funko.name}</Text>
          <Text style={styles.funkoSeries}>{funko.series}</Text>
          
          {funko.number && (
            <Text style={styles.funkoNumber}>#{funko.number}</Text>
          )}
          
          {funko.variant && (
            <Text style={styles.funkoVariant}>{funko.variant}</Text>
          )}

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Estimated Value</Text>
            <Text style={styles.priceValue}>{formatPrice(funko.estimated_value)}</Text>
          </View>
        </Card>

        {/* Action Buttons */}
        {user && (
          <Card style={styles.actionsCard}>
            <View style={styles.actionButtons}>
              {collectionStatus.inCollection ? (
                <Button
                  title="Remove from Collection"
                  variant="outline"
                  onPress={removeFromCollection}
                  style={styles.actionButton}
                  icon="checkmark-circle"
                />
              ) : (
                <Button
                  title="Add to Collection"
                  onPress={addToCollection}
                  style={styles.actionButton}
                  icon="add-circle"
                />
              )}
              
              {collectionStatus.inWishlist ? (
                <Button
                  title="Remove from Wishlist"
                  variant="outline"
                  onPress={removeFromWishlist}
                  style={styles.actionButton}
                  icon="heart"
                />
              ) : (
                <Button
                  title="Add to Wishlist"
                  variant="secondary"
                  onPress={addToWishlist}
                  style={styles.actionButton}
                  icon="heart-outline"
                />
              )}
            </View>
          </Card>
        )}

        {/* Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <InfoRow 
            label="Release Date" 
            value={formatDate(funko.release_date)} 
            icon="calendar-outline" 
          />
          
          {funko.exclusive_to && (
            <InfoRow 
              label="Exclusive To" 
              value={funko.exclusive_to} 
              icon="star-outline" 
            />
          )}
          
          {funko.sticker_type && (
            <InfoRow 
              label="Sticker Type" 
              value={funko.sticker_type} 
              icon="pricetag-outline" 
            />
          )}
          
          {funko.ean && (
            <InfoRow 
              label="EAN" 
              value={funko.ean} 
              icon="barcode-outline" 
            />
          )}
          
          {funko.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{funko.description}</Text>
            </View>
          )}
        </Card>

        {/* Price History */}
        {priceHistory.length > 0 && (
          <Card style={styles.priceHistoryCard}>
            <Text style={styles.sectionTitle}>Recent Price History</Text>
            
            {priceHistory.slice(0, 5).map((price, index) => (
              <View key={price.id} style={styles.priceHistoryItem}>
                <View style={styles.priceHistoryInfo}>
                  <Text style={styles.priceHistorySource}>{price.source}</Text>
                  <Text style={styles.priceHistoryDate}>
                    {formatDate(price.date_scraped)}
                  </Text>
                </View>
                <View style={styles.priceHistoryValue}>
                  <Text style={styles.priceHistoryPrice}>
                    {formatPrice(price.price)}
                  </Text>
                  <Text style={styles.priceHistoryCondition}>
                    {price.condition}
                  </Text>
                </View>
              </View>
            ))}
            
            {priceHistory.length > 5 && (
              <TouchableOpacity style={styles.viewMoreButton}>
                <Text style={styles.viewMoreText}>View Full Price History</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Collection Info */}
        {collectionStatus.inCollection && collectionStatus.collectionItem && (
          <Card style={styles.collectionInfoCard}>
            <Text style={styles.sectionTitle}>Your Collection Info</Text>
            
            <InfoRow 
              label="Condition" 
              value={collectionStatus.collectionItem.condition || 'Not specified'} 
              icon="shield-checkmark-outline" 
            />
            
            {collectionStatus.collectionItem.purchase_price && (
              <InfoRow 
                label="Purchase Price" 
                value={formatPrice(collectionStatus.collectionItem.purchase_price)} 
                icon="cash-outline" 
              />
            )}
            
            {collectionStatus.collectionItem.purchase_date && (
              <InfoRow 
                label="Purchase Date" 
                value={formatDate(collectionStatus.collectionItem.purchase_date)} 
                icon="calendar-outline" 
              />
            )}
            
            {collectionStatus.collectionItem.personal_notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Personal Notes</Text>
                <Text style={styles.notesText}>
                  {collectionStatus.collectionItem.personal_notes}
                </Text>
              </View>
            )}
            
            <Button
              title="Edit Collection Info"
              variant="outline"
              size="small"
              style={styles.editButton}
              icon="create-outline"
            />
          </Card>
        )}
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
  },
  imageContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  funkoImage: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 300,
    maxHeight: 300,
  },
  statusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  funkoName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  funkoSeries: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  funkoNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  funkoVariant: {
    fontSize: 14,
    fontStyle: 'italic',
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  priceContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  priceLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.success,
  },
  actionsCard: {
    margin: theme.spacing.md,
    marginTop: 0,
    padding: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  detailsCard: {
    margin: theme.spacing.md,
    marginTop: 0,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabelText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'right',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: theme.spacing.md,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  priceHistoryCard: {
    margin: theme.spacing.md,
    marginTop: 0,
    padding: theme.spacing.lg,
  },
  priceHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  priceHistoryInfo: {
    flex: 1,
  },
  priceHistorySource: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  priceHistoryDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  priceHistoryValue: {
    alignItems: 'flex-end',
  },
  priceHistoryPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.success,
  },
  priceHistoryCondition: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  viewMoreText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginRight: theme.spacing.xs,
  },
  collectionInfoCard: {
    margin: theme.spacing.md,
    marginTop: 0,
    padding: theme.spacing.lg,
  },
  notesContainer: {
    marginTop: theme.spacing.md,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  editButton: {
    marginTop: theme.spacing.md,
  },
}); 