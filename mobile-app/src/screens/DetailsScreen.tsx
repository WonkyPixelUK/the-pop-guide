import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Switch, Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

type Funko = {
  id: string;
  name: string;
  series: string;
  image_url: string;
  barcode: string;
  description?: string;
  release_date?: string;
  price?: number;
  is_wishlist?: boolean;
  is_trade?: boolean;
};

export const DetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { funko } = route.params as { funko: Funko };
  const [isWishlist, setIsWishlist] = React.useState(!!funko.is_wishlist);
  const [isTrade, setIsTrade] = React.useState(!!funko.is_trade);

  const updateListItem = async (updates: { is_wishlist?: boolean; is_trade?: boolean }) => {
    await supabase
      .from('list_items')
      .update(updates)
      .eq('id', funko.id);
  };

  const handleWishlistToggle = async (checked: boolean) => {
    setIsWishlist(checked);
    await updateListItem({ is_wishlist: checked });
  };
  const handleTradeToggle = async (checked: boolean) => {
    setIsTrade(checked);
    await updateListItem({ is_trade: checked });
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Cover source={{ uri: funko.image_url }} />
        <Card.Content>
          <Title>{funko.name}</Title>
          <Paragraph>Series: {funko.series}</Paragraph>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            {isWishlist && (
              <View style={styles.badge}><MaterialCommunityIcons name="heart" color="#e11d48" size={16} /><Text style={styles.badgeText}>Wishlist</Text></View>
            )}
            {isTrade && (
              <View style={styles.badge}><MaterialCommunityIcons name="swap-horizontal" color="#2563eb" size={16} /><Text style={styles.badgeText}>Trade</Text></View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Text style={{ marginRight: 8 }}>Wishlist</Text>
            <Switch value={isWishlist} onValueChange={handleWishlistToggle} />
            <Text style={{ marginHorizontal: 8 }}>Trade</Text>
            <Switch value={isTrade} onValueChange={handleTradeToggle} />
          </View>
          {funko.description && (
            <Paragraph style={styles.description}>{funko.description}</Paragraph>
          )}
          {funko.release_date && (
            <Paragraph>Release Date: {funko.release_date}</Paragraph>
          )}
          {funko.price && (
            <Paragraph>Price: ${funko.price.toFixed(2)}</Paragraph>
          )}
          <Paragraph>Barcode: {funko.barcode}</Paragraph>
        </Card.Content>
      </Card>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => (navigation as any).navigate('Scanner')}
          style={styles.button}
        >
          Scan Another
        </Button>
        <Button
          mode="outlined"
          onPress={() => (navigation as any).navigate('Collection')}
          style={styles.button}
        >
          Back to Collection
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272a',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
}); 