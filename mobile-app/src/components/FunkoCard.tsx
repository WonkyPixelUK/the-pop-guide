import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Card } from './UI/Card';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with spacing

interface Funko {
  id: string;
  name: string;
  series: string;
  number: string;
  variant?: string;
  image_url?: string;
  image_urls?: string[];
  release_date?: string;
  category?: string;
  rarity?: string;
  estimated_value?: number;
  is_exclusive?: boolean;
  is_vaulted?: boolean;
  is_chase?: boolean;
  in_collection?: boolean;
  in_wishlist?: boolean;
}

interface WishlistItem {
  id: string;
  max_price?: number;
  created_at: string;
  funko_pop?: Funko;
}

interface FunkoCardProps {
  funko: Funko;
  onPress: () => void;
  onToggleCollection?: () => void;
  onToggleWishlist?: () => void;
  onWishlistPress?: () => void;
  onCollectionPress?: () => void;
  onUpdateMaxPrice?: (price: number) => void;
  showActions?: boolean;
  layout?: 'grid' | 'list';
  wishlistItem?: WishlistItem;
}

export const FunkoCard: React.FC<FunkoCardProps> = ({
  funko,
  onPress,
  onToggleCollection,
  onToggleWishlist,
  onWishlistPress,
  onCollectionPress,
  onUpdateMaxPrice,
  showActions = true,
  layout = 'grid',
  wishlistItem,
}) => {
  const isGridLayout = layout === 'grid';
  
  // Helper function to get the primary image URL (handles both old and new storage methods)
  const getPrimaryImageUrl = (pop: Funko) => {
    // If there are user-uploaded images in image_urls array, use the first one
    if (pop.image_urls && Array.isArray(pop.image_urls) && pop.image_urls.length > 0) {
      return pop.image_urls[0];
    }
    // Fall back to the original scraped/imported image_url
    return pop.image_url;
  };
  
  const renderRarityBadge = () => {
    if (!funko.rarity) return null;
    
    const getRarityColor = (rarity: string) => {
      switch (rarity.toLowerCase()) {
        case 'common': return '#10b981';
        case 'uncommon': return '#3b82f6';
        case 'rare': return '#8b5cf6';
        case 'epic': return '#f59e0b';
        case 'legendary': return '#ef4444';
        default: return theme.colors.textMuted;
      }
    };

    return (
      <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(funko.rarity) }]}>
        <Text style={styles.rarityText}>{funko.rarity}</Text>
      </View>
    );
  };

  const renderStatusBadges = () => {
    const badges = [];
    
    if (funko.is_exclusive) {
      badges.push(
        <View key="exclusive" style={[styles.statusBadge, { backgroundColor: theme.colors.warning + 'CC' }]}>
          <Text style={styles.statusBadgeText}>EX</Text>
        </View>
      );
    }
    
    if (funko.is_vaulted) {
      badges.push(
        <View key="vaulted" style={[styles.statusBadge, { backgroundColor: theme.colors.error + 'CC' }]}>
          <Text style={styles.statusBadgeText}>V</Text>
        </View>
      );
    }
    
    if (funko.is_chase) {
      badges.push(
        <View key="chase" style={[styles.statusBadge, { backgroundColor: '#9333ea' + 'CC' }]}>
          <Text style={styles.statusBadgeText}>C</Text>
        </View>
      );
    }

    if (badges.length === 0) return null;

    return (
      <View style={styles.statusBadges}>
        {badges}
      </View>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <View style={styles.actions}>
        {(onToggleCollection || onCollectionPress) && (
          <TouchableOpacity
            style={[styles.actionButton, funko.in_collection && styles.actionButtonActive]}
            onPress={onToggleCollection || onCollectionPress}
          >
            <Ionicons
              name={funko.in_collection ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={20}
              color={funko.in_collection ? theme.colors.textOnPrimary : theme.colors.text}
            />
          </TouchableOpacity>
        )}
        
        {(onToggleWishlist || onWishlistPress) && (
          <TouchableOpacity
            style={[styles.actionButton, (funko.in_wishlist || wishlistItem) && styles.wishlistActive]}
            onPress={onToggleWishlist || onWishlistPress}
          >
            <Ionicons
              name={(funko.in_wishlist || wishlistItem) ? 'heart' : 'heart-outline'}
              size={20}
              color={(funko.in_wishlist || wishlistItem) ? '#ef4444' : theme.colors.text}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isGridLayout) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.gridCard, { width: cardWidth }]}>
        <Card style={styles.cardContainer}>
          <View style={styles.imageContainer}>
            {getPrimaryImageUrl(funko) ? (
              <Image source={{ uri: getPrimaryImageUrl(funko) }} style={styles.image} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={32} color={theme.colors.textMuted} />
              </View>
            )}
            {renderRarityBadge()}
            {renderStatusBadges()}
            {renderActions()}
          </View>
          
          <View style={styles.content}>
            <Text style={styles.number}>#{funko.number}</Text>
            <Text style={styles.name} numberOfLines={2}>{funko.name}</Text>
            {funko.variant && (
              <Text style={styles.variant} numberOfLines={1}>{funko.variant}</Text>
            )}
            <Text style={styles.series} numberOfLines={1}>{funko.series}</Text>
            
            {funko.estimated_value && (
              <Text style={styles.value}>
                ${funko.estimated_value.toFixed(2)}
              </Text>
            )}

            {wishlistItem?.max_price && (
              <Text style={styles.maxPrice}>
                Max: ${wishlistItem.max_price.toFixed(2)}
              </Text>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  // List layout
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.listCard}>
        <View style={styles.listContent}>
          <View style={styles.listImageContainer}>
            {getPrimaryImageUrl(funko) ? (
              <Image source={{ uri: getPrimaryImageUrl(funko) }} style={styles.listImage} />
            ) : (
              <View style={styles.listPlaceholderImage}>
                <Ionicons name="image-outline" size={24} color={theme.colors.textMuted} />
              </View>
            )}
            {renderRarityBadge()}
            {renderStatusBadges()}
          </View>
          
          <View style={styles.listInfo}>
            <View style={styles.listHeader}>
              <Text style={styles.listNumber}>#{funko.number}</Text>
              {funko.estimated_value && (
                <Text style={styles.listValue}>
                  ${funko.estimated_value.toFixed(2)}
                </Text>
              )}
            </View>
            <Text style={styles.listName} numberOfLines={1}>{funko.name}</Text>
            {funko.variant && (
              <Text style={styles.listVariant} numberOfLines={1}>{funko.variant}</Text>
            )}
            <Text style={styles.listSeries} numberOfLines={1}>{funko.series}</Text>
            
            {wishlistItem?.max_price && (
              <Text style={styles.listMaxPrice}>
                Max: ${wishlistItem.max_price.toFixed(2)}
              </Text>
            )}
          </View>
          
          {renderActions()}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    marginBottom: theme.spacing.md,
  },
  listCard: {
    marginBottom: theme.spacing.sm,
  },
  cardContainer: {
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 150,
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSecondary,
  },
  rarityBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  rarityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadges: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    flexDirection: 'row',
    gap: 2,
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
  actions: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  wishlistActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  content: {
    padding: theme.spacing.sm,
  },
  number: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  name: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  variant: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  series: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: theme.spacing.xs,
  },
  value: {
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  maxPrice: {
    color: theme.colors.warning,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  
  // List layout styles
  listContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  listImageContainer: {
    position: 'relative',
    marginRight: theme.spacing.sm,
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    resizeMode: 'cover',
  },
  listPlaceholderImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  listNumber: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  listValue: {
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  listName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  listVariant: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  listSeries: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  listMaxPrice: {
    color: theme.colors.warning,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
}); 