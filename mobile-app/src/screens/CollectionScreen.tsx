import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';

type Funko = {
  id: string;
  name: string;
  series: string;
  image_url: string;
  barcode: string;
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
        .from('funkos')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) setCollection(data);
    } catch (error) {
      console.error('Error fetching collection:', error);
      alert('Error loading collection');
    }
  };

  const renderItem = ({ item }: { item: Funko }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('Details', { funko: item })}>
      <Card.Cover source={{ uri: item.image_url }} />
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.series}</Paragraph>
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
}); 