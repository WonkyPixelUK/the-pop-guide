import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, Switch, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Funko = {
  id: string;
  name: string;
  series: string;
  image_url: string;
  barcode: string;
  is_wishlist?: boolean;
  is_trade?: boolean;
};

export const CollectionScreen = () => {
  const [collection, setCollection] = useState<Funko[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCollection();
  }, []);

  const fetchCollection = async () => {
    try {
      const { data, error } = await supabase
        .from('list_items')
        .select(`
          id,
          is_wishlist,
          is_trade,
          funko_pops (
            id,
            name,
            series,
            image_url,
            barcode
          )
        `)
        // .eq('user_id', user.id) // Uncomment and use user id if available
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Flatten funko_pops fields into each item for easier rendering
        setCollection(
          data.map((item: any) => ({
            ...item.funko_pops,
            id: item.id, // Use list_item id for toggling
            is_wishlist: item.is_wishlist,
            is_trade: item.is_trade,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      alert('Error loading collection');
    }
  };

  const updateListItem = async (itemId: string, updates: { is_wishlist?: boolean; is_trade?: boolean }) => {
    await supabase
      .from('list_items')
      .update(updates)
      .eq('id', itemId);
    fetchCollection();
  };

  const renderItem = ({ item }: { item: Funko }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('Details', { funko: item })}>
      <Card.Cover source={{ uri: item.image_url }} />
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.series}</Paragraph>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          {item.is_wishlist && (
            <View style={styles.badge}><MaterialCommunityIcons name="heart" color="#e11d48" size={16} /><Text style={styles.badgeText}>Wishlist</Text></View>
          )}
          {item.is_trade && (
            <View style={styles.badge}><MaterialCommunityIcons name="swap-horizontal" color="#2563eb" size={16} /><Text style={styles.badgeText}>Trade</Text></View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={{ marginRight: 8 }}>Wishlist</Text>
          <Switch value={!!item.is_wishlist} onValueChange={(checked: boolean) => updateListItem(item.id, { is_wishlist: checked })} />
          <Text style={{ marginHorizontal: 8 }}>Trade</Text>
          <Switch value={!!item.is_trade} onValueChange={(checked: boolean) => updateListItem(item.id, { is_trade: checked })} />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={collection}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Scanner')}
        style={styles.scanButton}
      >
        Scan New Funko
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  scanButton: {
    margin: 16,
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